import { EndpointInstance } from 'ts-endpoint/lib/Endpoint';
import { TypeOfEndpointInstance } from 'ts-endpoint/lib/Endpoint/helpers';
import { HTTPClientConfig, StaticHTTPClientConfig } from './config';
import { TaskEither } from 'fp-ts/lib/TaskEither';
import { Either } from 'fp-ts/lib/Either';
import * as t from 'io-ts';
import { ReaderTaskEither } from 'fp-ts/lib/ReaderTaskEither';

type FunctionOutput<F> = F extends (args: any) => infer O ? O : never;
type ExtractEither<TA> = TA extends TaskEither<infer E, infer R> ? Either<E, R> : never;

export type InferFetchResult<FC extends FetchClient<any, any>> = ExtractEither<FunctionOutput<FC>>;

export type FetchClient<E extends EndpointInstance<any>, W> = ReaderTaskEither<
  TypeOfEndpointInstance<E>['Input'],
  W,
  t.TypeOf<E['Output']>
>;

export type HTTPClient<A extends Record<string, EndpointInstance<any>>, W> = {
  [K in keyof A]: FetchClient<A[K], W>;
};

export type GetHTTPClientOptions<W> = {
  defaultHeaders?: { [key: string]: string };
  /**
   * Used to perform side effect on api Errors,
   * like logging on external services, or to manipulate errors before
   * individually handling them.
   *
   */
  handleError?: (err: W, e: EndpointInstance<any>) => W;
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

export const GetHTTPClient = <A extends { [key: string]: EndpointInstance<any> }, W>(
  c: HTTPClientConfig | StaticHTTPClientConfig,
  endpoints: A,
  getFetchClient: <E extends EndpointInstance<any>>(
    baseURL: string,
    error: E,
    options?: GetHTTPClientOptions<W>
  ) => FetchClient<E, W>,
  options?: GetHTTPClientOptions<W>
): HTTPClient<A, W> => {
  const config = HTTPClientConfig.is(c) ? HTTPClientConfig.encode(c) : c;
  const baseURL = `${config.protocol}://${config.host}${
    config.port !== undefined ? `:${config.port.toString()}` : ''
  }`;

  const clientWithMethods = Object.entries(endpoints).reduce(
    (acc, [k, v]) => ({
      ...acc,
      [k]: getFetchClient(baseURL, v, options),
    }),
    {} as HTTPClient<A, W>
  );

  return clientWithMethods;
};
