import { errorIso, MinimalEndpoint, EndpointError } from 'ts-endpoint';
import { HTTPClientConfig, StaticHTTPClientConfig } from './config';
import { pipe } from 'fp-ts/pipeable';
import { PathReporter } from 'io-ts/PathReporter';
import * as TA from 'fp-ts/TaskEither';
import * as O from 'fp-ts/Option';
import qs from 'qs';
import { IOError, NetworkErrorStatus } from 'ts-shared/lib/errors';
import { GetHTTPClient, FetchClient, GetHTTPClientOptions } from '.';
import * as E from 'fp-ts/Either';
import { findFirst } from 'fp-ts/Array';
import * as t from 'io-ts';

export const GetFetchHTTPClient = <A extends { [key: string]: MinimalEndpoint }>(
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
        status: r.status,
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

export const useBrowserFetch = <E extends MinimalEndpoint>(
  baseURL: string,
  e: E,
  options?: GetHTTPClientOptions
): FetchClient<E> => {
  return ((i) => {
    const path = `${baseURL}${e.getPath(i?.Params)}${i.Query ? `?${qs.stringify(i.Query)}` : ''}`;

    const body = i.Body;
    const headers = { ...(i.Headers !== undefined ? i.Headers : {}), ...options?.defaultHeaders };

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
        () => new IOError('Network Error', { kind: 'NetworkError', status: NetworkErrorStatus })
      ),
      TA.chain((r: Response) => {
        const responseJson: TA.TaskEither<any, any> = TA.tryCatch(
          () => (r.body === null ? Promise.resolve(undefined) : r.json()),
          () => {
            return new IOError(r.statusText, {
              status: r.status,
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
              e.Errors as EndpointError<any, t.Type<any, any>>[],
              findFirst((knownErr) => {
                return (knownErr as any).types[0].value === r.status;
              }),
              O.map((v) => errorIso(v).unwrap(v))
            );

            if (O.isSome(actualKnownError)) {
              const parsedKnownError = pipe(
                responseJsonWithDefault,
                TA.map((body) => actualKnownError.value.decode([r.status, body])),
                TA.chain((validation) => {
                  return pipe(
                    TA.fromEither(validation),
                    TA.fold(
                      (errors: t.Errors) => {
                        return TA.left(
                          new IOError(
                            `Error decoding server KnownError response: ${PathReporter.report(
                              E.left(errors)
                            )}`,
                            {
                              kind: 'DecodingError',
                              errors,
                            }
                          )
                        );
                      },

                      (parsedError) => {
                        return TA.left(
                          new IOError<{ status: any; body: any }[]>(r.statusText, {
                            kind: 'KnownError',
                            status: parsedError[0],
                            body: parsedError[1],
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
                  new IOError(r.statusText, { kind: 'ClientError', meta, status: r.status })
                );
              })
            );
          } else {
            return pipe(
              getResponseJson(r, options?.ignoreNonJSONResponse ?? false),
              TA.chain((meta) => {
                return TA.left(
                  new IOError(r.statusText, { kind: 'ServerError', meta, status: r.status })
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
  }) as FetchClient<E>;
};
