import { Endpoint } from '../Endpoint';
import { HTTPClientConfig, StaticHTTPClientConfig } from './config';
import { TaskEither } from 'fp-ts/lib/TaskEither';
import * as t from 'io-ts';

export type FetchInput<E> = E extends Endpoint<infer P, infer H, infer Q, infer B, any, any>
  ? (E extends object ? { Params: P } : { Params?: never }) &
      (H extends object ? { Headers: H } : { Headers?: never }) &
      (Q extends object ? { Query: Q } : { Query?: never }) &
      (B extends object ? { Body: B } : { Body?: never })
  : never;

export type FetchClient<E extends Endpoint<any, any, any, any, any, any>, W> = (
  i: FetchInput<E>
) => TaskEither<W, t.TypeOf<E['Output']>>;

export type HTTPClient<A extends Record<string, Endpoint<any, any, any, any, any, any>>, W> = {
  [K in keyof A]: FetchClient<A[K], W>;
};

export const GetHTTPClient = <
  A extends { [key: string]: Endpoint<any, any, any, any, any, any> },
  W
>(
  c: HTTPClientConfig | StaticHTTPClientConfig,
  endpoints: A,
  getFetchClient: <E extends Endpoint<any, any, any, any, any, any>>(
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
