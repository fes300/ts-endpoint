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
 */
export interface Endpoint<
  M extends HTTPMethod,
  O extends t.Props,
  H extends { [k: string]: t.Type<any, any, any> } | undefined = undefined,
  Q extends { [k: string]: t.Type<any, any, any> } | undefined = undefined,
  B extends { [k: string]: t.Type<any, any, any> } | undefined = undefined,
  P extends { [k: string]: t.Type<any, any, any> } | undefined = undefined
> {
  /* utils to get the full path given a set of query params */
  getPath: P extends undefined
    ? () => string
    : (args: { [k in keyof P]: P[k] extends t.Any ? t.TypeOf<P[k]> : never }) => string;
  Method: M;
  Opts?: EndpointOptions;
  Input: {
    Headers?: H;
    Params?: P;
    Query?: Q;
    Body?: M extends 'POST' | 'PUT' | 'PATCH' ? B : never;
  };
  Output: O;
}

export type EndpointInstance<E extends Endpoint<any, any, any, any, any, any>> = {
  getPath: E['getPath'];
  Method: E['Method'];
  Output: t.ExactC<t.TypeC<E['Output']>>;
  Opts: EndpointOptions;
  Input: (E['Input']['Params'] extends undefined
    ? { Params?: never }
    : { Params: t.ExactC<t.TypeC<NonNullable<E['Input']['Params']>>> }) &
    (E['Input']['Headers'] extends undefined
      ? { Headers?: never }
      : { Headers: t.ExactC<t.TypeC<NonNullable<E['Input']['Headers']>>> }) &
    (E['Input']['Query'] extends undefined
      ? { Query?: never }
      : { Query: t.ExactC<t.TypeC<NonNullable<E['Input']['Query']>>> }) &
    (E['Input']['Body'] extends undefined
      ? { Body?: never }
      : { Body: t.ExactC<t.TypeC<NonNullable<E['Input']['Body']>>> });
};

export type TypeOfEndpointInstance<E extends EndpointInstance<any>> = {
  [k in keyof E['Input']]: E['Input'][k] extends t.Type<any, any, any>
    ? t.TypeOf<E['Input'][k]>
    : string;
};

/**
 * Constructor function for an endpoint
 */
export function Endpoint<
  M extends HTTPMethod,
  O extends t.Props,
  H extends { [k: string]: t.Type<any, any, any> } | undefined = undefined,
  Q extends { [k: string]: t.Type<any, any, any> } | undefined = undefined,
  B extends { [k: string]: t.Type<any, any, any> } | undefined = undefined,
  P extends { [k: string]: t.Type<any, any, any> } | undefined = undefined
>(e: Endpoint<M, O, H, Q, B, P>): EndpointInstance<Endpoint<M, O, H, Q, B, P>> {
  return ({
    ...e,
    Output: t.strict(e.Output),
    Input: {
      ...(e.Input.Body !== undefined ? { Body: t.strict(e.Input.Body as any) } : {}),
      ...(e.Input.Headers !== undefined ? { Headers: t.strict(e.Input.Headers as any) } : {}),
      ...(e.Input.Params !== undefined ? { Params: t.strict(e.Input.Params as any) } : {}),
      ...(e.Input.Query !== undefined ? { Query: t.strict(e.Input.Query as any) } : {}),
    },
    Opts: e.Opts ?? defaultOps,
  } as unknown) as EndpointInstance<Endpoint<M, O, H, Q, B, P>>;
}
