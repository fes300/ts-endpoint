import { Either } from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import { ReaderTaskEither } from 'fp-ts/ReaderTaskEither';
import * as R from 'fp-ts/Record';
import { TaskEither } from 'fp-ts/TaskEither';
import { MinimalEndpointInstance, TypeOfEndpointInstance } from 'ts-endpoint';
import { Codec, IOError, runtimeType } from 'ts-io-error';
import { HTTPClientConfig, StaticHTTPClientConfig } from './config';
import { Kind, URIS } from './HKT';

export declare type RequiredKeys<T> = {
  [K in keyof T]: {} extends Pick<T, K> ? never : K;
} extends {
  [_ in keyof T]: infer U;
}
  ? {} extends U
    ? never
    : U
  : never;

type FunctionOutput<F> = F extends (args: any) => infer O ? O : never;

type ExtractEither<TA> = TA extends TaskEither<infer E, infer R> ? Either<E, R> : never;

export type InferFetchResult<FC> = ExtractEither<FunctionOutput<FC>>;

type FetchClientError<E, M extends URIS> = E extends Record<number, Codec<any, any, any>>
  ? Kind<M, E>
  : Kind<M, never>;

export type FetchClient<E extends MinimalEndpointInstance, M extends URIS> = ReaderTaskEither<
  'Input' extends RequiredKeys<E> ? TypeOfEndpointInstance<E>['Input'] : void,
  E['Errors'] extends undefined ? IOError : FetchClientError<E['Errors'], M>,
  runtimeType<E['Output']>
>;

export type HTTPClient<A extends Record<string, MinimalEndpointInstance>, M extends URIS> = {
  [K in keyof A]: FetchClient<A[K], M>;
};

export type GetHTTPClientOptions = {
  defaultHeaders?: { [key: string]: string };
  /**
   * Used to perform side effect on api Errors,
   * like logging on external services, or to manipulate errors before
   * individually handling them.
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

  /**
   * Used to map the response JSON before parsing it with the Endpoint codecs.
   * N.B. This is a last resource and you should avoid it since it holds no static guarantee
   */
  decode: <A, I, C = never>(
    schema: Codec<A, I, C>,
  ) => (input: unknown) => Either<IOError, I>;
};

export const GetHTTPClient = <A extends { [key: string]: MinimalEndpointInstance }, M extends URIS>(
  config: HTTPClientConfig | StaticHTTPClientConfig,
  endpoints: A,
  getFetchClient: <E extends MinimalEndpointInstance>(
    baseURL: string,
    endpoint: E,
    options: GetHTTPClientOptions
  ) => FetchClient<E, M>,
  options: GetHTTPClientOptions
): HTTPClient<A, M> => {
  const headersWithWhiteSpaces = pipe(
    options?.defaultHeaders ?? {},
    R.filterWithIndex((k: string) => k.indexOf(' ') !== -1),
    R.keys
  );

  if (headersWithWhiteSpaces.length > 0) {
    console.error('white spaces are not allowed in defaultHeaders names:', headersWithWhiteSpaces);
  }
;
  const baseURL = `${config.protocol}://${config.host}${
    config.port !== undefined ? `:${config.port.toString()}` : ''
  }`;

  const clientWithMethods = Object.entries(endpoints).reduce(
    (acc, [k, v]) => ({
      ...acc,
      [k]: getFetchClient(baseURL, v, options),
    }),
    {} as HTTPClient<A, M>
  );

  return clientWithMethods;
};
