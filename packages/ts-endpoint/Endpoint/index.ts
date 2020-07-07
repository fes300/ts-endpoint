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
  Method: HTTPMethod;
  // `Path` is a function that accept `Input.Params` when is defined or no argument when is not defined
  Path: P extends Record<any, any> ? (args: Record<keyof P, string>) => string : () => string;
  Opts: O;
  Input: {
    Headers?: t.ExactType<t.Type<H, unknown>>;
    Params?: t.ExactType<t.Type<P, unknown>>;
    Query?: t.Type<Q, unknown>;
    Body?: t.Type<B, unknown>;
  };
  Output: t.Type<R, unknown> | t.ArrayType<t.Type<R>>;
}

/**
 * Constructor function for an endpoint
 *
 * @param Method The [HTTPMethod] used
 * @param Path The absolute path the enpoint can be reached at
 * @param Input A dictionary of `io-ts` codecs representing the type of the expected input
 * @param Output An `io-ts` codec representing the type of the expected output
 */
export function Endpoint<O extends EndpointOptions, P, H, Q, B, R>(
  e: Endpoint<O, P, H, Q, B, R>
): Endpoint<O, P, H, Q, B, R> {
  return {
    Opts: e.Opts,
    Method: e.Method,
    Path: e.Path,
    Input: e.Input,
    Output: e.Output,
  };
}
