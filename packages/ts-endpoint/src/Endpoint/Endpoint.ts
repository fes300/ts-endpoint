import * as t from 'io-ts';
import { identity } from 'fp-ts/lib/function';
import { RequiredKeys } from 'typelevel-ts';

export type DecodedPropsType<P> = P extends {} ? { [k in RequiredKeys<P>]: t.TypeOf<P[k]> } : never;
export type EncodedPropsType<P> = P extends {}
  ? { [k in RequiredKeys<P>]: t.OutputOf<P[k]> }
  : never;

export type DecodedInput<E extends EndpointInstance<any>> = DecodedPropsType<E['Input']>;
export type EncodedInput<E extends EndpointInstance<any>> = EncodedPropsType<E['Input']>;
export type DecodedOutput<E extends EndpointInstance<any>> = t.TypeOf<E['Output']>;
export type EncodedOutput<E extends EndpointInstance<any>> = t.TypeOf<E['Output']>;

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
 */
export interface Endpoint<
  M extends HTTPMethod,
  O extends t.Type<any, any, any>,
  H extends { [k: string]: t.Type<any, any, any> } | undefined = undefined,
  Q extends { [k: string]: t.Type<any, any, any> } | undefined = undefined,
  B extends t.Type<any, any, any> | undefined = undefined,
  P extends { [k: string]: t.Type<any, any, any> } | undefined = undefined,
  E extends
    | Array<readonly [responseStatus: number, responseBody: t.Type<any, any, any>]>
    | undefined = undefined
> {
  /* utils to get the full path given a set of query params */
  getPath: P extends undefined
    ? () => string
    : (args: { [k in keyof P]: P[k] extends t.Any ? t.TypeOf<P[k]> : never }) => string;
  Method: M;
  Opts?: EndpointOptions;
  Errors?: E;
  Input: {
    Headers?: H;
    Params?: P;
    Query?: Q;
    Body?: M extends 'POST' | 'PUT' | 'PATCH' ? B : never;
  };
  Output: O;
}

/**
 * Data type representing an endpoint instance.
 * @public getStaticPath accepts a formatting function (param: string) -> string and returns
 **/
export type EndpointInstance<E extends Endpoint<any, any, any, any, any, any, any>> = {
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
  getStaticPath: E['Input']['Params'] extends undefined
    ? () => string
    : (f: (paramName: string) => string) => string;
  Method: E['Method'];
  Output: E['Output'];
  Opts: EndpointOptions;
  Input: (E['Input']['Params'] extends undefined
    ? { Params?: never }
    : { Params: t.TypeC<NonNullable<E['Input']['Params']>> }) &
    (E['Input']['Headers'] extends undefined
      ? { Headers?: never }
      : { Headers: t.TypeC<NonNullable<E['Input']['Headers']>> }) &
    (E['Input']['Query'] extends undefined
      ? { Query?: never }
      : { Query: t.TypeC<NonNullable<E['Input']['Query']>> }) &
    (E['Input']['Body'] extends undefined
      ? { Body?: never }
      : { Body: NonNullable<E['Input']['Body']> });
} & (E['Errors'] extends undefined ? { Errors?: never } : { Errors: E['Errors'] });

const addSlash = (s: string) => (s.substr(0, 1) === '/' ? s : `/${s}`);

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
  E extends
    | Array<readonly [responseStatus: number, responseBody: t.Type<any, any, any>]>
    | undefined = undefined
>(e: Endpoint<M, O, H, Q, B, P, E>): EndpointInstance<Endpoint<M, O, H, Q, B, P, E>> {
  return ({
    ...e,
    getPath: ((i) => {
      const path = e.getPath(i);
      return addSlash(path);
    }) as typeof e.getPath,
    getStaticPath: (f: P extends undefined ? undefined : (paramName: string) => string) => {
      const path = e.getPath(
        Object.keys(e.Input.Params ?? {}).reduce(
          (acc, k) => ({ ...acc, [k]: (f ?? identity)(k) }),
          {}
        )
      );
      return addSlash(path);
    },
    Output: e.Output,
    ...(e.Errors ? { Errors: e.Errors } : {}),
    Input: {
      ...(e.Input.Body !== undefined ? { Body: e.Input.Body } : {}),
      ...(e.Input.Headers !== undefined
        ? { Headers: t.type(e.Input.Headers as t.Props, 'Headers') }
        : {}),
      ...(e.Input.Params !== undefined
        ? { Params: t.type(e.Input.Params as t.Props, 'Params') }
        : {}),
      ...(e.Input.Query !== undefined ? { Query: t.type(e.Input.Query as t.Props, 'Query') } : {}),
    },
    Opts: e.Opts ?? defaultOps,
  } as unknown) as EndpointInstance<Endpoint<M, O, H, Q, B, P, E>>;
}
