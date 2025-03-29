import { Codec, RecordCodec, runtimeType } from 'ts-io-error';
import { RequiredKeys } from 'typelevel-ts';
import { Endpoint, EndpointErrors, EndpointInstance, HTTPMethod } from './Endpoint';

export const addSlash = (s: string) => (s.substr(0, 1) === '/' ? s : `/${s}`);

export type MinimalEndpoint = Omit<
  Endpoint<
    HTTPMethod,
    Codec<any, any, any>,
    RecordCodec<any, any>,
    RecordCodec<any, any>,
    Codec<any, any, any>,
    RecordCodec<any, any>,
    EndpointErrors<never, Codec<any, any, any>>
  >,
  'getPath'
> & { getPath: (i?: any) => string };

export type MinimalEndpointInstance = MinimalEndpoint & {
  getStaticPath: (f: (i?: any) => string) => string;
};

export type TypeOfEndpointInstance<E extends MinimalEndpointInstance> = {
  getPath: E['getPath'];
  getStaticPath: E['getStaticPath'];
  Method: E['Method'];
  Output: runtimeType<E['Output']>;
  Errors: {
    [k in keyof NonNullable<E['Errors']>]: NonNullable<E['Errors']>[k] extends Codec<any, any, any>
      ? runtimeType<NonNullable<E['Errors']>[k]>
      : never;
  };
  Input: [RequiredKeys<E['Input']>] extends [never]
    ? void
    : {
        [k in keyof NonNullable<E['Input']>]: NonNullable<E['Input']>[k] extends Codec<
          any,
          any,
          any
        >
          ? runtimeType<NonNullable<E['Input']>[k]>
          : never;
      };
};

export type DecodedPropsType<P> = P extends {}
  ? { [k in RequiredKeys<P>]: runtimeType<P[k]> }
  : never;

export type KnownErrorStatus<W> = undefined extends W
  ? undefined
  : W extends Record<infer K, any>
  ? K
  : undefined;

export type KnownErrorBody<W> = undefined extends W
  ? undefined
  : W extends Record<any, infer V>
  ? V
  : undefined;

export type InferEndpointParams<E> = E extends Endpoint<
  infer M,
  infer O,
  infer H,
  infer Q,
  infer B,
  infer P,
  infer E
>
  ? { method: M; output: O; headers: H; query: Q; body: B; params: P; errors: E }
  : never;

export type InferEndpointInstanceParams<EI> = EI extends EndpointInstance<infer E>
  ? InferEndpointParams<E>
  : never;
