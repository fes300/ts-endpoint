import useSWR, { responseInterface } from 'swr';
import { PathReporter } from 'io-ts/lib/PathReporter';
import { EndpointInstance, EndpointInput, EndpointOutput } from '../Endpoint';
import { HTTPClientConfig, StaticHTTPClientConfig } from './config';
import { IOError, NetworkErrorStatus, DecodeErrorStatus } from '../shared/errors';
import { pipe } from 'fp-ts/lib/pipeable';
import * as TA from 'fp-ts/lib/TaskEither';
import * as t from 'io-ts';
import qs from 'qs';
import { Either, left } from 'fp-ts/lib/Either';

export const GetSWRHooks = <A extends { [key: string]: EndpointInstance<any> }>(
  c: HTTPClientConfig | StaticHTTPClientConfig,
  endpoints: A,
  defaultHeaders?: { [key: string]: string }
): SRWClient<A> => {
  const config = HTTPClientConfig.is(c) ? HTTPClientConfig.encode(c) : c;
  const baseURL = `${config.protocol}://${config.host}${
    config.port !== undefined ? `:${config.port.toString()}` : ''
  }`;

  const clientWithMethods = Object.entries(endpoints).reduce(
    (acc, [k, v]) => ({
      ...acc,
      [k]: getSRWHook(baseURL, v, defaultHeaders),
    }),
    {} as SRWClient<A>
  );

  return clientWithMethods;
};

type RSWHook<E extends EndpointInstance<any>> = (
  key: EndpointInput<E>
) => responseInterface<EndpointOutput<E>, IOError>;

export type SRWClient<A extends Record<string, EndpointInstance<any>>> = {
  [K in keyof A]: RSWHook<A[K]>;
};

const getSRWHook = <E extends EndpointInstance<any>>(
  baseURL: string,
  e: E,
  defaultHeaders?: { [key: string]: string }
): RSWHook<E> => {
  return (i: EndpointInput<E>) => {
    // TODO: try to get rid of this
    const anyArgs: any = i;

    const path = `${baseURL}/${e.getPath(anyArgs?.Params ?? {})}${
      anyArgs.Query ? `?${qs.stringify(anyArgs.Query)}` : ''
    }`;
    const body = e.Opts?.stringifyBody ? qs.stringify(anyArgs.Body) : anyArgs.Body;
    const headers = { ...anyArgs.Headers, ...defaultHeaders };

    const getResponse = () =>
      pipe(
        TA.tryCatch(
          () =>
            fetch(path, {
              ...{
                headers,
                method: e.Method,
              },
              ...(anyArgs.Body !== undefined ? { body } : {}),
            }),
          () =>
            new IOError(NetworkErrorStatus, 'Network Error', {
              kind: 'NetworkError',
            })
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

    return useSWR(path, () =>
      getResponse()().then((r) => {
        if (r._tag === 'Left') {
          throw r.left;
        }

        return r.right;
      })
    );
  };
};
