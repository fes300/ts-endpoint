import { EndpointInstance, Endpoint, HTTPMethod } from 'ts-endpoint/lib/Endpoint';
import { HTTPClientConfig, StaticHTTPClientConfig } from './config';
import { pipe } from 'fp-ts/lib/pipeable';
import { PathReporter } from 'io-ts/lib/PathReporter';
import * as TA from 'fp-ts/lib/TaskEither';
import * as t from 'io-ts';
import qs from 'qs';
import { IOError, DecodeErrorStatus, NetworkErrorStatus } from 'ts-shared/lib/errors';
import { HTTPClient, GetHTTPClient, FetchClient, GetHTTPClientOptions } from '.';
import { left } from 'fp-ts/lib/Either';
import { TypeOfEndpointInstance } from 'ts-endpoint/lib/Endpoint/helpers';

export const GetFetchHTTPClient = <A extends { [key: string]: EndpointInstance<any> }>(
  config: HTTPClientConfig | StaticHTTPClientConfig,
  endpoints: A,
  options?: GetHTTPClientOptions<IOError>
): HTTPClient<A, IOError> => GetHTTPClient(config, endpoints, useBrowserFetch, options);

const getResponseJson = (r: Response) => {
  if (r.body === null) {
    TA.left(undefined);
  }
  return TA.tryCatch(
    () => r.json(),
    () =>
      new IOError(r.status, r.statusText, {
        kind: 'ServerError',
        meta: { message: 'response is not a json.' },
      })
  );
};

export const useBrowserFetch = <
  M extends HTTPMethod,
  O extends t.Type<any, any, any>,
  H extends { [k: string]: t.Type<any, any, any> } | undefined = undefined,
  Q extends { [k: string]: t.Type<any, any, any> } | undefined = undefined,
  B extends t.Type<any, any, any> | undefined = undefined,
  P extends { [k: string]: t.Type<any, any, any> } | undefined = undefined
>(
  baseURL: string,
  e: EndpointInstance<Endpoint<M, O, H, Q, B, P>>,
  options?: GetHTTPClientOptions<IOError>
): FetchClient<EndpointInstance<Endpoint<M, O, H, Q, B, P>>, IOError> => {
  return (i: TypeOfEndpointInstance<EndpointInstance<Endpoint<M, O, H, Q, B, P>>>['Input']) => {
    const path = `${baseURL}${e.getPath(i?.Params ?? {})}${
      i.Query ? `?${qs.stringify(i.Query)}` : ''
    }`;
    const body = i.Body;
    const headers = { ...i.Headers, ...options?.defaultHeaders };

    const response = pipe(
      TA.tryCatch(
        () =>
          fetch(path, {
            ...{
              headers,
              method: e.Method,
            },
            ...(i.Body !== undefined ? { body: JSON.stringify(body) } : {}),
          }),
        () => new IOError(NetworkErrorStatus, 'Network Error', { kind: 'NetworkError' })
      ),
      TA.chain((r: Response) => {
        const responseJson: TA.TaskEither<any, any> = TA.tryCatch(
          () => (r.body === null ? Promise.resolve(undefined) : r.json()),
          () => {
            return new IOError(r.status, r.statusText, {
              kind: 'ServerError',
              meta: { message: 'response is not a json.' },
            });
          }
        );

        if (!r.ok) {
          if (r.status >= 400 && r.status <= 451) {
            return pipe(
              getResponseJson(r),
              TA.chain((meta) => {
                return TA.left(new IOError(r.status, r.statusText, { kind: 'ClientError', meta }));
              })
            );
          } else {
            return pipe(
              getResponseJson(r),
              TA.chain((meta) => {
                return TA.left(new IOError(r.status, r.statusText, { kind: 'ServerError', meta }));
              })
            );
          }
        }

        const res = pipe(
          responseJson,
          TA.chain((json) => {
            return pipe(
              options?.mapInput ? options.mapInput(json) : json,
              e.Output.decode,
              TA.fromEither,
              TA.mapLeft((errors) => {
                return new IOError(
                  DecodeErrorStatus,
                  `Error decoding server response: ${PathReporter.report(left(errors))}`,
                  {
                    kind: 'DecodingError',
                    errors,
                  }
                );
              })
            );
          })
        );

        return res;
      }),
      TA.mapLeft((err) => {
        if (options?.handleError !== undefined) {
          return options.handleError(err, e);
        }
        return err;
      })
    );

    return response;
  };
};
