import * as t from 'io-ts';

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

export const defaultOps = {
  stringifyBody: false,
};

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
export interface Endpoint<P, H, Q, B, R, M extends HTTPMethod> {
  /* utils to get the full path given a set of query params */
  getPath: P extends Record<any, any> ? (args: Record<keyof P, string>) => string : () => string;
  Method: M;
  Opts?: EndpointOptions;
  Input: {
    Headers?: t.ExactType<t.Type<H>>;
    Params?: t.ExactType<t.Type<P>>;
    Query?: t.ExactType<t.Type<Q>>;
    // TODO: body should only be allowed when method === "POST"
    Body?: M extends 'POST' | 'PUT' | 'PATCH' ? t.ExactType<t.Type<B>> : never;
  };
  Output: t.Type<R>;
}

/**
 * Constructor function for an endpoint
 */
export function Endpoint<P, H, Q, B, R, M extends HTTPMethod>(
  e: Endpoint<P, H, Q, B, R, M>
): Endpoint<P, H, Q, B, R, M> {
  return {
    ...e,
    Opts: e.Opts ?? defaultOps,
  };
}
