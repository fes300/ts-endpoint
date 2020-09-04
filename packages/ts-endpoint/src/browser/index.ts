import { EndpointInstance, TypeOfEndpointInstance } from '../Endpoint';
import { HTTPClientConfig, StaticHTTPClientConfig } from './config';
import { TaskEither } from 'fp-ts/lib/TaskEither';
import { Either } from 'fp-ts/lib/Either';
import * as t from 'io-ts';

type FunctionOutput<F> = F extends (args: any) => infer O ? O : never;
type ExtractEither<TA> = TA extends TaskEither<infer E, infer R> ? Either<E, R> : never;

export type InferFetchResult<FC extends FetchClient<any, any>> = ExtractEither<FunctionOutput<FC>>;

export type FetchClient<E extends EndpointInstance<any>, W> = (
  i: TypeOfEndpointInstance<E>['Input']
) => TaskEither<W, t.TypeOf<E['Output']>>;

export type HTTPClient<A extends Record<string, EndpointInstance<any>>, W> = {
  [K in keyof A]: FetchClient<A[K], W>;
};

export const GetHTTPClient = <A extends { [key: string]: EndpointInstance<any> }, W>(
  c: HTTPClientConfig | StaticHTTPClientConfig,
  endpoints: A,
  getFetchClient: <E extends EndpointInstance<any>>(
    baseURL: string,
    e: E,
    defaultHeaders?: { [key: string]: string }
  ) => FetchClient<E, W>,
  defaultHeaders?: { [key: string]: string }
): HTTPClient<A, W> => {
  const config = HTTPClientConfig.is(c) ? HTTPClientConfig.encode(c) : c;
  const baseURL = `${config.protocol}://${config.host}${
    config.port !== undefined ? `:${config.port.toString()}` : ''
  }`;

  const clientWithMethods = Object.entries(endpoints).reduce(
    (acc, [k, v]) => ({
      ...acc,
      [k]: getFetchClient(baseURL, v, defaultHeaders),
    }),
    {} as HTTPClient<A, W>
  );

  return clientWithMethods;
};
