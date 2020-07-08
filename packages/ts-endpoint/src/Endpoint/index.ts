import * as t from 'io-ts';

export const HTTP_METHODS = {
  OPTIONS: 'OPTIONS' as 'OPTIONS',
  HEAD: 'HEAD' as 'HEAD',
  GET: 'GET' as 'GET',
  POST: 'POST' as 'POST',
  PUT: 'PUT' as 'PUT',
  PATCH: 'PATCH' as 'PATCH',
  DELETE: 'DELETE' as 'DELETE',
};
export type HTTP_METHODS = typeof HTTP_METHODS;

export const HTTPMethod = t.keyof(
  {
    OPTIONS: null,
    HEAD: null,
    GET: null,
    POST: null,
    PUT: null,
    PATCH: null,
    DELETE: null,
  },
  'HTTPMethod'
);

export type HTTPMethod = t.TypeOf<typeof HTTPMethod>;
/**
 * Endpoint options type
 */
export interface EndpointOptions {
  stringifyBody?: boolean;
}

/**
 * Represents an endpoint of our API
 *
 * @typeparam O Endpoint options
 * @typeparam P Endpoint `Params` type
 * @typeparam H Endpoint `Headers` type
 * @typeparam Q Endpoint `Query` type
 * @typeparam B Endpoint `Body` type
 * @typeparam R Endpoint `Output` type
 */
export interface Endpoint<O extends EndpointOptions, P, H, Q, B, R> {
  /* utils to get the full path given a set of query params */
  getPath: P extends Record<any, any> ? (args: Record<keyof P, string>) => string : () => string;
  Method: HTTPMethod;
  Opts: O;
  Input: {
    Headers?: t.ExactType<t.Type<H, unknown>>;
    Params?: t.ExactType<t.Type<P, unknown>>;
    Query?: t.ExactType<t.Type<Q, unknown>>;
    // TODO: body should only be allowed when method === "POST"
    Body?: t.ExactType<t.Type<B, unknown>>;
  };
  Output: t.Type<R>;
}

/**
 * Constructor function for an endpoint
 */
export function Endpoint<O extends EndpointOptions, P, H, Q, B, R>(
  e: Endpoint<O, P, H, Q, B, R>
): Endpoint<O, P, H, Q, B, R> {
  return e;
}
