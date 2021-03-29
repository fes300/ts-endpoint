import * as t from 'io-ts';
import { identity, pipe } from 'fp-ts/function';
import * as R from 'fp-ts/Record';
import { addSlash, InferEndpointParams } from './helpers';

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
 * Represents an endpoint of our API
 */
export interface Endpoint<
  M extends HTTPMethod,
  O extends t.Type<any, any, any>,
  H extends { [k: string]: t.Type<any, any, any> } | undefined = undefined,
  Q extends { [k: string]: t.Type<any, any, any> } | undefined = undefined,
  B extends t.Type<any, any, any> | undefined = undefined,
  P extends { [k: string]: t.Type<any, any, any> } | undefined = undefined,
  E extends EndpointErrors<string, t.Type<any, any, any>> | undefined = undefined
> {
  /* utils to get the full path given a set of query params */
  getPath: P extends undefined
    ? (i?: {}) => string
    : (args: { [k in keyof P]: P[k] extends t.Any ? t.TypeOf<P[k]> : never }) => string;
  Method: M;
  Errors?: E;
  Input?: {
    Headers?: H;
    Params?: P;
    Query?: Q;
    Body?: M extends 'POST' | 'PUT' | 'PATCH' ? B : never;
  };
  Output: O;
}

type GenericEndpoint = Endpoint<
  HTTPMethod,
  t.Type<any, any, any>,
  { [k: string]: t.Type<any, any, any> } | undefined,
  { [k: string]: t.Type<any, any, any> } | undefined,
  t.Type<any, any, any> | undefined,
  { [k: string]: t.Type<any, any, any> } | undefined,
  EndpointErrors<string, t.Type<any, any, any>> | undefined
>;

/**
 * Data type representing an endpoint instance.
 * @public getStaticPath accepts a formatting function (param: string) -> string and returns
 **/
export type EndpointInstance<E extends GenericEndpoint> = {
  /**
   * helper to get a path given a set of runtime params.
   *
   * @returns a string representation of a path instance
   * @example
   * ```
   * import { Endpoint } from '..';
   * import * as t from 'io-ts';
   *
   * const endpoint = Endpoint({
   *  Input: {
   *    Params: { id: t.number },
   *  },
   *  Method: 'GET',
   *  getPath: ({ id }) => `users/${id}/crayons`,
   *  Output: { crayons: t.array(t.string) },
   *});
   *
   * endpoint.getPath({ id: 3 })
   * // returns "users/3/crayons"
   * ```
   */
  getPath: E['getPath'];
  /**
   * helper to get a path version with static values in place of actual params.
   *
   * @returns a static representation of the path
   * @example
   * ```
   * import { Endpoint } from '..';
   * import * as t from 'io-ts';
   *
   * const endpoint = Endpoint({
   *  Input: {
   *    Params: { id: t.string },
   *  },
   *  Method: 'GET',
   *  getPath: ({ id }) => `users/${id}/crayons`,
   *  Output: { crayons: t.array(t.string) },
   *});
   *
   * endpoint.getStaticPath(param => `:${param}`) // returns "users/:id/crayons"
   * ```
   */
  getStaticPath: E['Input'] extends undefined
    ? (i?: {}) => string
    : InferEndpointParams<E>['params'] extends undefined
    ? (i?: {}) => string
    : (f: (paramName: keyof InferEndpointParams<E>['params']) => string) => string;
  Method: E['Method'];
  Output: E['Output'];
} & (E['Input'] extends undefined
  ? {
      Input?: never;
    }
  : {
      Input: (InferEndpointParams<E>['params'] extends undefined
        ? { Params?: never }
        : { Params: t.TypeC<NonNullable<InferEndpointParams<E>['params']>> }) &
        (InferEndpointParams<E>['headers'] extends undefined
          ? { Headers?: never }
          : { Headers: t.TypeC<NonNullable<InferEndpointParams<E>['headers']>> }) &
        (InferEndpointParams<E>['query'] extends undefined
          ? { Query?: never }
          : { Query: t.TypeC<NonNullable<InferEndpointParams<E>['query']>> }) &
        (InferEndpointParams<E>['body'] extends undefined
          ? { Body?: never }
          : { Body: NonNullable<InferEndpointParams<E>['body']> });
    }) &
  (E['Errors'] extends undefined ? { Errors?: never } : { Errors: E['Errors'] });

export type GenericEndpointInstance = EndpointInstance<GenericEndpoint>;

export type EndpointErrors<S extends string, B extends t.Type<any, any, any>> = Record<S, B>;

/**
 * Constructor function for an endpoint
 * @returns an EndpointInstance
 */
export function Endpoint<
  M extends HTTPMethod,
  O extends t.Type<any, any, any>,
  H extends { [k: string]: t.Type<any, any, any> } | undefined = undefined,
  Q extends { [k: string]: t.Type<any, any, any> } | undefined = undefined,
  B extends t.Type<any, any, any> | undefined = undefined,
  P extends { [k: string]: t.Type<any, any, any> } | undefined = undefined,
  E extends EndpointErrors<string, t.Type<any, any, any>> | undefined = undefined
>(e: Endpoint<M, O, H, Q, B, P, E>): EndpointInstance<Endpoint<M, O, H, Q, B, P, E>> {
  const headersWithWhiteSpaces = pipe(
    e.Input?.Headers ?? {},
    R.filterWithIndex((k: string) => k.indexOf(' ') !== -1),
    R.keys
  );

  if (headersWithWhiteSpaces.length > 0) {
    console.error('white spaces are not allowed in Headers names:', headersWithWhiteSpaces);
  }

  return ({
    ...e,
    getPath: ((i: never) => {
      const path = e.getPath(i);
      return addSlash(path);
    }) as typeof e.getPath,
    getStaticPath: (f: P extends undefined ? undefined : (paramName: keyof P) => string) => {
      const path = e.getPath(
        Object.keys(e.Input?.Params ?? {}).reduce(
          (acc, k) => ({ ...acc, [k]: (f ?? identity)(k) }),
          {}
        ) as never
      );
      return addSlash(path);
    },
    Output: e.Output,
    ...(e.Errors ? { Errors: e.Errors } : {}),
    Input: {
      ...(e.Input?.Body !== undefined ? { Body: e.Input.Body } : {}),
      ...(e.Input?.Headers !== undefined
        ? { Headers: t.type(e.Input.Headers as t.Props, 'Headers') }
        : {}),
      ...(e.Input?.Params !== undefined
        ? { Params: t.type(e.Input.Params as t.Props, 'Params') }
        : {}),
      ...(e.Input?.Query !== undefined ? { Query: t.type(e.Input.Query as t.Props, 'Query') } : {}),
    },
  } as unknown) as EndpointInstance<Endpoint<M, O, H, Q, B, P, E>>;
}
