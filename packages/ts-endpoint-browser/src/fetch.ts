import {
  errorIso,
  EndpointInstance,
  Endpoint,
  HTTPMethod,
  EndpointError,
} from 'ts-endpoint/lib/Endpoint';
import { HTTPClientConfig, StaticHTTPClientConfig } from './config';
import { pipe } from 'fp-ts/pipeable';
import { PathReporter } from 'io-ts/PathReporter';
import * as TA from 'fp-ts/TaskEither';
import * as O from 'fp-ts/Option';
import * as t from 'io-ts';
import qs from 'qs';
import { IOError, DecodeErrorStatus, NetworkErrorStatus } from 'ts-shared/lib/errors';
import { GetHTTPClient, FetchClient, GetHTTPClientOptions } from '.';
import * as E from 'fp-ts/Either';
import { TypeOfEndpointInstance } from 'ts-endpoint/lib/Endpoint/helpers';
import { findFirst } from 'fp-ts/Array';

export const GetFetchHTTPClient = <A extends { [key: string]: EndpointInstance<any> }>(
  config: HTTPClientConfig | StaticHTTPClientConfig,
  endpoints: A,
  options?: GetHTTPClientOptions
) => GetHTTPClient(config, endpoints, useBrowserFetch as any, options);

const getResponseJson = (r: Response, ignoreNonJSONResponse: boolean) => {
  if (r.body === null) {
    TA.left(undefined);
  }
  const jsonResponse = TA.tryCatch(
    () => r.json(),
    () =>
      new IOError(r.status, r.statusText, {
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

export const useBrowserFetch = <
  M extends HTTPMethod,
  O extends t.Type<any, any, any>,
  H extends { [k: string]: t.Type<any, any, any> } | undefined = undefined,
  Q extends { [k: string]: t.Type<any, any, any> } | undefined = undefined,
  B extends t.Type<any, any, any> | undefined = undefined,
  P extends { [k: string]: t.Type<any, any, any> } | undefined = undefined,
  E extends Array<EndpointError<any, any>> | undefined = undefined
>(
  baseURL: string,
  e: EndpointInstance<Endpoint<M, O, H, Q, B, P, E>>,
  options?: GetHTTPClientOptions
): FetchClient<EndpointInstance<Endpoint<M, O, H, Q, B, P, E>>> => {
  return ((i: TypeOfEndpointInstance<EndpointInstance<Endpoint<M, O, H, Q, B, P>>>['Input']) => {
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
              e.Errors as NonNullable<E>,
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
                      (errors) => {
                        return TA.left(
                          new IOError(
                            DecodeErrorStatus,
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
                          new IOError(parsedError[0], r.statusText, {
                            kind: 'KnownError',
                            error: { status: parsedError[0], body: parsedError[1] },
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
                return TA.left(new IOError(r.status, r.statusText, { kind: 'ClientError', meta }));
              })
            );
          } else {
            return pipe(
              getResponseJson(r, options?.ignoreNonJSONResponse ?? false),
              TA.chain((meta) => {
                return TA.left(new IOError(r.status, r.statusText, { kind: 'ServerError', meta }));
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
                  DecodeErrorStatus,
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
          return options.handleError(err, e as EndpointInstance<any>);
        }
        return err;
      })
    );

    return response;
  }) as FetchClient<EndpointInstance<Endpoint<M, O, H, Q, B, P, E>>>;
};
