import { findFirst } from 'fp-ts/Array';
import * as E from 'fp-ts/Either';
import { toArray } from 'fp-ts/lib/Record';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/pipeable';
import * as TA from 'fp-ts/TaskEither';
import { PathReporter } from 'io-ts/PathReporter';
import qs from 'qs';
import { EndpointErrors, MinimalEndpointInstance } from 'ts-endpoint';
import { Codec, IOError, NetworkErrorStatus } from 'ts-io-error';
import { HTTPClientConfig, StaticHTTPClientConfig } from './config';
import { FetchClient, GetHTTPClient, GetHTTPClientOptions } from './GetHTTPClient';

declare module './HKT' {
  interface URItoKind<A> {
    IOError: A extends Record<string, Codec<any, any, any>> ? IOError<A> : never;
  }
}

export const GetFetchHTTPClient = <A extends { [key: string]: MinimalEndpointInstance }>(
  config: HTTPClientConfig | StaticHTTPClientConfig,
  endpoints: A,
  options?: GetHTTPClientOptions
) => GetHTTPClient(config, endpoints, useBrowserFetch, options);

const getResponseJson = (r: Response, ignoreNonJSONResponse: boolean) => {
  if (r.body === null) {
    TA.left(undefined);
  }
  const jsonResponse = TA.tryCatch(
    () => r.json(),
    () =>
      new IOError(r.statusText, {
        status: r.status.toString(),
        kind: 'ServerError',
        meta: { message: 'response is not a json.' },
      })
  );

  return ignoreNonJSONResponse
    ? pipe(
        jsonResponse,
        TA.alt(() => TA.of(undefined))
      )
    : jsonResponse;
};

export const useBrowserFetch = <E extends MinimalEndpointInstance>(
  baseURL: string,
  e: E,
  options?: GetHTTPClientOptions
): FetchClient<E, 'IOError'> => {
  return (i: any) => {
    const path = `${baseURL}${e.getPath(i?.Params)}${i?.Query ? `?${qs.stringify(i?.Query)}` : ''}`;

    const body = i?.Body;
    const headers = { ...(i?.Headers ?? {}), ...options?.defaultHeaders };

    const response = pipe(
      TA.tryCatch(
        () =>
          fetch(path, {
            ...{
              headers,
              method: e.Method,
            },
            ...(i?.Body !== undefined ? { body: JSON.stringify(body) } : {}),
          }),
        () => new IOError('Network Error', { kind: 'NetworkError', status: NetworkErrorStatus })
      ),
      TA.chain((r: Response) => {
        const responseJson: TA.TaskEither<any, any> = TA.tryCatch(
          () => (r.body === null ? Promise.resolve(undefined) : r.json()),
          () => {
            return new IOError(r.statusText, {
              status: r.status.toString(),
              kind: 'ServerError',
              meta: { message: 'response is not a json.' },
            });
          }
        );

        const responseJsonWithDefault = options?.ignoreNonJSONResponse
          ? pipe(
              responseJson,
              TA.alt(() => {
                return TA.of(undefined);
              })
            )
          : responseJson;

        if (!r.ok) {
          if (e.Errors !== undefined) {
            const actualKnownError = pipe(
              e.Errors as EndpointErrors<string, Codec<any, any, any>>,
              toArray,
              findFirst(([status]) => {
                return status === r.status.toString();
              })
            );

            if (O.isSome(actualKnownError)) {
              const parsedKnownError = pipe(
                responseJsonWithDefault,
                TA.map((body) => actualKnownError.value[1].decode(body)),
                TA.chain((validation) => {
                  return pipe(
                    TA.fromEither(validation),
                    TA.fold(
                      (errors: unknown[]) => {
                        return TA.left(
                          new IOError(`Error decoding server KnownError response: ${errors}`, {
                            kind: 'DecodingError',
                            errors,
                          })
                        );
                      },

                      (parsedError) => {
                        return TA.left(
                          new IOError<any>(r.statusText, {
                            kind: 'KnownError',
                            status: r.status.toString(),
                            body: parsedError,
                          })
                        );
                      }
                    )
                  );
                })
              );

              return parsedKnownError;
            }
          }

          if (r.status >= 400 && r.status <= 451) {
            return pipe(
              getResponseJson(r, options?.ignoreNonJSONResponse ?? false),
              TA.chain((meta) => {
                return TA.left(
                  new IOError(r.statusText, {
                    kind: 'ClientError',
                    meta,
                    status: r.status.toString(),
                  })
                );
              })
            );
          } else {
            return pipe(
              getResponseJson(r, options?.ignoreNonJSONResponse ?? false),
              TA.chain((meta) => {
                return TA.left(
                  new IOError(r.statusText, {
                    kind: 'ServerError',
                    meta,
                    status: r.status.toString(),
                  })
                );
              })
            );
          }
        }

        const res = pipe(
          responseJsonWithDefault,
          TA.chain((json) => {
            return pipe(
              options?.mapInput ? options.mapInput(json) : json,
              e.Output.decode,
              TA.fromEither,
              TA.mapLeft((errors) => {
                return new IOError(
                  `Error decoding server response: ${PathReporter.report(E.left(errors))}`,
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
