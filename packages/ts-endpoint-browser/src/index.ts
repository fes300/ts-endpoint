import { MinimalEndpointInstance, TypeOfEndpointInstance } from 'ts-endpoint/lib';
import { HTTPClientConfig, StaticHTTPClientConfig } from './config';
import { TaskEither } from 'fp-ts/TaskEither';
import { Either } from 'fp-ts/Either';
import * as R from 'fp-ts/Record';
import { ReaderTaskEither } from 'fp-ts/ReaderTaskEither';
import { IOError } from 'ts-io-error/lib';
import { pipe } from 'fp-ts/function';
import { Codec, runtimeType } from 'ts-io-error/lib/Codec';

type FunctionOutput<F> = F extends (args: any) => infer O ? O : never;

type ExtractEither<TA> = TA extends TaskEither<infer E, infer R> ? Either<E, R> : never;

export type InferFetchResult<FC> = ExtractEither<FunctionOutput<FC>>;

type FetchClientError<E> = E extends Record<number, Codec<any, any, any>> ? IOError<E> : IOError;

export type FetchClient<E extends MinimalEndpointInstance> = ReaderTaskEither<
  TypeOfEndpointInstance<E>['Input'],
  E['Errors'] extends undefined ? IOError : FetchClientError<E['Errors']>,
  runtimeType<E['Output']>
>;

export type HTTPClient<A extends Record<string, MinimalEndpointInstance>> = {
  [K in keyof A]: FetchClient<A[K]>;
};

export type GetHTTPClientOptions = {
  defaultHeaders?: { [key: string]: string };
  /**
   * Used to perform side effect on api Errors,
   * like logging on external services, or to manipulate errors before
   * individually handling them.
   *
   */
  handleError?: (err: IOError<any>, e: MinimalEndpointInstance) => any;
  /**
   * If true a non-JSON response will be treated like
   * a JSON response returning undefined. Defaults to false.
   */
  ignoreNonJSONResponse?: boolean;
  /**
   * Used to map the response JSON before parsing it with the Endpoint codecs.
   * N.B. This is a last resource and you should avoid it since it holds no static guarantee
   */
  mapInput?: (a: any) => any;
};

export const GetHTTPClient = <A extends { [key: string]: MinimalEndpointInstance }>(
  c: HTTPClientConfig | StaticHTTPClientConfig,
  endpoints: A,
  getFetchClient: <E extends MinimalEndpointInstance>(
    baseURL: string,
    endpoint: E,
    options?: GetHTTPClientOptions
  ) => FetchClient<E>,
  options?: GetHTTPClientOptions
): HTTPClient<A> => {
  const headersWithWhiteSpaces = pipe(
    options?.defaultHeaders ?? {},
    R.filterWithIndex((k: string) => k.indexOf(' ') !== -1),
    R.keys
  );

  if (headersWithWhiteSpaces.length > 0) {
    console.error('white spaces are not allowed in defaultHeaders names:', headersWithWhiteSpaces);
  }

  const config = HTTPClientConfig.is(c) ? HTTPClientConfig.encode(c) : c;
  const baseURL = `${config.protocol}://${config.host}${
    config.port !== undefined ? `:${config.port.toString()}` : ''
  }`;

  const clientWithMethods = Object.entries(endpoints).reduce(
    (acc, [k, v]) => ({
      ...acc,
      [k]: getFetchClient(baseURL, v, options),
    }),
    {} as HTTPClient<A>
  );

  return clientWithMethods;
};
