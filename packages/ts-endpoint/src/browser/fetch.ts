import { Endpoint } from '../Endpoint';
import { HTTPClientConfig, StaticHTTPClientConfig } from './config';
import { pipe } from 'fp-ts/lib/pipeable';
import { PathReporter } from 'io-ts/lib/PathReporter';
import * as TA from 'fp-ts/lib/TaskEither';
import * as t from 'io-ts';
import qs from 'qs';
import { IOError, DecodeErrorStatus, NetworkErrorStatus } from './errors';
import { HTTPClient, GetHTTPClient, FetchClient, FetchInput } from '.';
import { Either, left } from 'fp-ts/lib/Either';

export const GetFetchHTTPClient = <
  A extends { [key: string]: Endpoint<any, any, any, any, any, any> }
>(
  config: HTTPClientConfig | StaticHTTPClientConfig,
  endpoints: A,
  defaultHeaders?: { [key: string]: string }
): HTTPClient<A, IOError> => GetHTTPClient(config, endpoints, useBrowserFetch, defaultHeaders);

const useBrowserFetch = <E extends Endpoint<any, any, any, any, any, any>>(
  baseURL: string,
  e: E,
  defaultHeaders?: { [key: string]: string }
): FetchClient<E, IOError> => {
  return (i: FetchInput<E>) => {
    // TODO: try to get rid of this
    const anyArgs: any = i;

    const path = `${baseURL}/${e.getPath(anyArgs?.Params ?? {})}${
      anyArgs.Query ? `?${qs.stringify(anyArgs.Query)}` : ''
    }`;
    const body = e.Opts?.stringifyBody ? qs.stringify(anyArgs.Body) : anyArgs.Body;
    const headers = { ...anyArgs.Headers, ...defaultHeaders };

    const response = pipe(
      TA.tryCatch(
        () =>
          fetch(path, {
            ...{
              headers,
              method: e.Method,
            },
            ...(anyArgs.Body !== undefined ? { body } : {}),
          }),
        () => new IOError(NetworkErrorStatus, 'Network Error', { kind: 'NetworkError' })
      ),
      TA.chain((r: Response) => {
        if (!r.ok) {
          if (r.status >= 400 && r.status <= 451) {
            return TA.left<IOError, t.TypeOf<E['Output']>>(
              new IOError(r.status, r.statusText, { kind: 'ClientError' })
            );
          }
          return TA.left<IOError, t.TypeOf<E['Output']>>(
            new IOError(r.status, r.statusText, { kind: 'ServerError' })
          );
        }

        const res = pipe(
          TA.taskEither.fromTask<t.Errors, any>(() => r.json()),
          TA.alt(() => TA.right({})),
          TA.chain((json) =>
            TA.fromEither(e.Output.decode(json) as Either<t.Errors, t.TypeOf<E['Output']>>)
          ),
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
        );

        return res;
      })
    );

    return response;
  };
};
