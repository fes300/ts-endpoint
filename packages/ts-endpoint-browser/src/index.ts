import { MinimalEndpoint, TypeOfEndpointInstance } from 'ts-endpoint/lib';
import { HTTPClientConfig, StaticHTTPClientConfig } from './config';
import { TaskEither } from 'fp-ts/TaskEither';
import { Either } from 'fp-ts/Either';
import * as R from 'fp-ts/Record';
import * as t from 'io-ts';
import { ReaderTaskEither } from 'fp-ts/ReaderTaskEither';
import { IOError } from 'ts-shared/lib/errors';
import { pipe } from 'fp-ts/function';

type FunctionOutput<F> = F extends (args: any) => infer O ? O : never;

type ExtractEither<TA> = TA extends TaskEither<infer E, infer R> ? Either<E, R> : never;

export type InferFetchResult<FC> = ExtractEither<FunctionOutput<FC>>;

type FetchClientError<E> = E extends Record<number, t.Type<any, any, unknown>>
  ? IOError<E>
  : IOError;

export type FetchClient<E extends MinimalEndpoint> = ReaderTaskEither<
  TypeOfEndpointInstance<E>['Input'],
  E['Errors'] extends undefined ? IOError : FetchClientError<E['Errors']>,
  t.TypeOf<E['Output']>
>;

export type HTTPClient<A extends Record<string, MinimalEndpoint>> = {
  [K in keyof A]: FetchClient<A[K]>;
};

type RecordValues<T extends Record<any, any>> = T extends Record<infer K, infer V>
  ? K extends never
    ? never
    : V
  : never;

export type GetHTTPClientOptions<A extends { [key: string]: MinimalEndpoint }> = {
  defaultHeaders?: { [key: string]: string };
  /**
   * Used to perform side effect on api Errors,
   * like logging on external services, or to manipulate errors before
   * individually handling them.
   *
   */
  handleError?: (
    err: RecordValues<{ [K in keyof A]: IOError<A[K]['Errors']> }>,
    e: RecordValues<A>
  ) => any;
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

export const GetHTTPClient = <A extends { [key: string]: MinimalEndpoint }>(
  c: HTTPClientConfig | StaticHTTPClientConfig,
  endpoints: A,
  getFetchClient: <E extends MinimalEndpoint>(
    baseURL: string,
    endpoint: E,
    options?: GetHTTPClientOptions<A>
  ) => FetchClient<E>,
  options?: GetHTTPClientOptions<A>
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
