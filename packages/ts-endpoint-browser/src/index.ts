import { Endpoint, EndpointError, EndpointInstance } from 'ts-endpoint/lib/Endpoint';
import {
  InferEndpointInstanceParams,
  TypeOfEndpointInstance,
} from 'ts-endpoint/lib/Endpoint/helpers';
import { HTTPClientConfig, StaticHTTPClientConfig } from './config';
import { TaskEither } from 'fp-ts/lib/TaskEither';
import { Either } from 'fp-ts/lib/Either';
import * as t from 'io-ts';
import { ReaderTaskEither } from 'fp-ts/lib/ReaderTaskEither';
import { IOError } from 'ts-shared/lib/errors';

type FunctionOutput<F> = F extends (args: any) => infer O ? O : never;
type ExtractEither<TA> = TA extends TaskEither<infer E, infer R> ? Either<E, R> : never;

export type InferFetchResult<FC extends FetchClient<any>> = ExtractEither<FunctionOutput<FC>>;

export type GenericInstance = Omit<
  EndpointInstance<
    Endpoint<any, any, any, any, any, any, Array<EndpointError<any, any>> | undefined>
  >,
  'Errors'
> & { Errors?: Array<EndpointError<any, any>> };

type ErrorBody<K> = K extends EndpointError<infer S, infer B>
  ? { status: S; body: t.TypeOf<B> }
  : never;

export type EndpointInstanceError<E extends GenericInstance> = IOError<
  ErrorBody<InferEndpointInstanceParams<E>['errors'][number]>
>;

export type FetchClient<E extends GenericInstance> = ReaderTaskEither<
  TypeOfEndpointInstance<E>['Input'],
  EndpointInstanceError<E>,
  t.TypeOf<E['Output']>
>;

export type HTTPClient<A extends Record<string, GenericInstance>> = {
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
  handleError?: (err: any, e: EndpointInstance<any>) => any;
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

export const GetHTTPClient = <A extends { [key: string]: GenericInstance }>(
  c: HTTPClientConfig | StaticHTTPClientConfig,
  endpoints: A,
  getFetchClient: <E extends EndpointInstance<any>>(
    baseURL: string,
    endpoint: E,
    options?: GetHTTPClientOptions
  ) => FetchClient<E>,
  options?: GetHTTPClientOptions
): HTTPClient<A> => {
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
