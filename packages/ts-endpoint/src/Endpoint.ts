import { pipe } from 'fp-ts/function';
import * as R from 'fp-ts/Record';
import { Codec, RecordCodec, runtimeType } from 'ts-io-error/lib/Codec';
import { MinimalEndpoint } from '.';
import { addSlash, InferEndpointParams } from './helpers';

export type HTTPMethod = 'OPTIONS' | 'HEAD' | 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Represents an HTTP endpoint of our API
 */
export interface Endpoint<
  M extends HTTPMethod,
  O extends Codec<any, any, any>,
  H extends RecordCodec<any, any> | undefined = undefined,
  Q extends RecordCodec<any, any> | undefined = undefined,
  B extends Codec<any, any, any> | undefined = undefined,
  P extends RecordCodec<any, any> | undefined = undefined,
  E extends EndpointErrors<never, Codec<any, any, any>> | undefined = undefined
> {
  /* utils to get the full path given a set of query params */
  getPath: [P] extends [undefined] ? (i?: {}) => string : (args: runtimeType<P>) => string;
  Method: M;
  Errors?: E;
  Input?: [H, P, Q, B] extends [undefined, undefined, undefined, undefined]
    ? never
    : {
        Headers?: H;
        Params?: P;
        Query?: Q;
        Body?: M extends 'POST' | 'PUT' | 'PATCH' | 'DELETE' ? B : never;
      };
  Output: O;
}

/**
 * Data type representing an endpoint instance.
 **/
export type EndpointInstance<E extends MinimalEndpoint> = {
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
  getStaticPath: [E['Input']] extends [undefined]
    ? (i?: {}) => string
    : [InferEndpointParams<E>['params']] extends [undefined]
    ? (i?: {}) => string
    : (f: (paramName: keyof runtimeType<InferEndpointParams<E>['params']>) => string) => string;
  Method: E['Method'];
  Output: E['Output'];
} & (E['Input'] extends undefined
  ? {
      Input?: never;
    }
  : {
      Input: (InferEndpointParams<E>['params'] extends undefined
        ? { Params?: never }
        : { Params: NonNullable<InferEndpointParams<E>['params']> }) &
        (InferEndpointParams<E>['headers'] extends undefined
          ? { Headers?: never }
          : { Headers: NonNullable<InferEndpointParams<E>['headers']> }) &
        (InferEndpointParams<E>['query'] extends undefined
          ? { Query?: never }
          : { Query: NonNullable<InferEndpointParams<E>['query']> }) &
        (InferEndpointParams<E>['body'] extends undefined
          ? { Body?: never }
          : { Body: NonNullable<InferEndpointParams<E>['body']> });
    }) &
  (E['Errors'] extends undefined ? { Errors?: never } : { Errors: E['Errors'] });

export type EndpointErrors<S extends string, B extends Codec<any, any, any>> = Record<S, B>;

/**
 * Constructor function for an endpoint
 * @returns an EndpointInstance
 */
export function Endpoint<
  M extends HTTPMethod,
  O extends Codec<any, any, any>,
  H extends RecordCodec<any, any> | undefined = undefined,
  Q extends RecordCodec<any, any> | undefined = undefined,
  B extends Codec<any, any, any> | undefined = undefined,
  P extends RecordCodec<any, any> | undefined = undefined,
  E extends EndpointErrors<never, Codec<any, any, any>> | undefined = undefined
>(e: Endpoint<M, O, H, Q, B, P, E>): EndpointInstance<Endpoint<M, O, H, Q, B, P, E>> {
  // TODO: check if the headers are valid?
  // const headersWithWhiteSpaces = pipe(
  //   e.Input?.Headers?.props ?? {},
  //   R.filterWithIndex((k: string) => k.indexOf(' ') !== -1),
  //   R.keys
  // );

  // if (headersWithWhiteSpaces.length > 0) {
  //   console.error('white spaces are not allowed in Headers names:', headersWithWhiteSpaces);
  // }

  return ({
    ...e,
    getPath: ((i: any) => {
      const path = e.getPath(i);

      return addSlash(path);
    }) as typeof e.getPath,
    getStaticPath: (f: (paramName: any) => string) => {
      const params = e.Input?.Params;

      if (params === undefined) {
        return addSlash(e.getPath(undefined as any));
      }

      return pipe(
        params.props,
        R.mapWithIndex((k) => (f ? f(k) : k)),
        (v: any) => e.getPath(v),
        addSlash
      );
    },
    Output: e.Output,
    ...(e.Errors ? { Errors: e.Errors } : {}),
    Input: {
      ...(e.Input?.Body ? { Body: e.Input.Body } : {}),
      ...(e.Input?.Headers ? { Headers: e.Input.Headers } : {}),
      ...(e.Input?.Params ? { Params: e.Input.Params } : {}),
      ...(e.Input?.Query ? { Query: e.Input.Query } : {}),
    },
  } as unknown) as EndpointInstance<Endpoint<M, O, H, Q, B, P, E>>;
}
