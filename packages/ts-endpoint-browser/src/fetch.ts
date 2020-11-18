import {
  EndpointInstance,
  TypeOfEndpointInstance,
  Endpoint,
  HTTPMethod,
} from 'ts-endpoint/src/Endpoint';
import { HTTPClientConfig, StaticHTTPClientConfig } from './config';
import { pipe } from 'fp-ts/lib/pipeable';
import { PathReporter } from 'io-ts/lib/PathReporter';
import * as TA from 'fp-ts/lib/TaskEither';
import * as t from 'io-ts';
import qs from 'qs';
import { IOError, DecodeErrorStatus, NetworkErrorStatus } from 'ts-shared/lib/errors';
import { HTTPClient, GetHTTPClient, FetchClient } from '.';
import { left } from 'fp-ts/lib/Either';

export const GetFetchHTTPClient = <A extends { [key: string]: EndpointInstance<any> }>(
  config: HTTPClientConfig | StaticHTTPClientConfig,
  endpoints: A,
  defaultHeaders?: { [key: string]: string }
): HTTPClient<A, IOError> => GetHTTPClient(config, endpoints, useBrowserFetch, defaultHeaders);

const getResponseJson = (r: Response) => {
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
  defaultHeaders?: { [key: string]: string }
): FetchClient<EndpointInstance<Endpoint<M, O, H, Q, B, P>>, IOError> => {
  return (i: TypeOfEndpointInstance<EndpointInstance<Endpoint<M, O, H, Q, B, P>>>['Input']) => {
    const path = `${baseURL}${e.getPath(i?.Params ?? {})}${
      i.Query ? `?${qs.stringify(i.Query)}` : ''
    }`;
    const body = e.Opts?.stringifyBody ? qs.stringify(i.Body) : i.Body;
    const headers = { ...i.Headers, ...defaultHeaders };

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
          () => r.json(),
          () =>
            new IOError(r.status, r.statusText, {
              kind: 'ServerError',
              meta: { message: 'response is not a json.' },
            })
        );

        if (!r.ok) {
          if (r.status >= 400 && r.status <= 451) {
            return pipe(
              getResponseJson(r),
              TA.chain((meta) =>
                TA.left(new IOError(r.status, r.statusText, { kind: 'ClientError', meta }))
              )
            );
          } else {
            return pipe(
              getResponseJson(r),
              TA.chain((meta) =>
                TA.left(new IOError(r.status, r.statusText, { kind: 'ServerError', meta }))
              )
            );
          }
        }

        e.Output;

        const res = pipe(
          responseJson,
          TA.chain((json) =>
            pipe(
              TA.fromEither(e.Output.decode(json)),
              TA.mapLeft(
                (errors) =>
                  new IOError(
                    DecodeErrorStatus,
                    `Error decoding server response: ${PathReporter.report(left(errors))}`,
                    {
                      kind: 'DecodingError',
                      errors,
                    }
                  )
              )
            )
          )
        );

        return res;
      })
    );

    return response;
  };
};
