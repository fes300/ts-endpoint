import * as t from 'io-ts';
import { EndpointInstance, HTTPMethod } from '.';
import { RequiredKeys } from 'typelevel-ts';
import { Endpoint } from './Endpoint';
import { Codec, runtimeType } from './Codec';

export const addSlash = (s: string) => (s.substr(0, 1) === '/' ? s : `/${s}`);

export type MinimalEndpoint = Omit<
  Endpoint<HTTPMethod, Codec<any, any, any>, any, any, any, any, any>,
  'getPath'
> & { getPath: (i?: any) => string };

export type MinimalEndpointInstance = Omit<
  EndpointInstance<MinimalEndpoint>,
  'getPath' | 'getStaticPath'
> & { getPath: (i?: any) => string; getStaticPath: (f: (i?: any) => string) => string };

export type TypeOfEndpointInstance<E extends MinimalEndpointInstance> = {
  getPath: E['getPath'];
  getStaticPath: E['getStaticPath'];
  Method: E['Method'];
  Output: runtimeType<E['Output']>;
  Errors: {
    [k in keyof NonNullable<E['Errors']>]: NonNullable<E['Errors']>[k] extends t.Type<any, any>
      ? runtimeType<NonNullable<E['Errors']>[k]>
      : never;
  };
  Input: {
    [k in keyof NonNullable<E['Input']>]: NonNullable<E['Input']>[k] extends t.Type<any, any, any>
      ? runtimeType<NonNullable<E['Input']>[k]>
      : never;
  };
};

export type DecodedPropsType<P> = P extends {}
  ? { [k in RequiredKeys<P>]: runtimeType<P[k]> }
  : never;
export type EncodedPropsType<P> = P extends {}
  ? { [k in RequiredKeys<P>]: t.OutputOf<P[k]> }
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

export type DecodedInput<E extends MinimalEndpointInstance> = DecodedPropsType<E['Input']>;
export type EncodedInput<E extends MinimalEndpointInstance> = EncodedPropsType<E['Input']>;
export type DecodedOutput<E extends MinimalEndpointInstance> = runtimeType<E['Output']>;
export type EncodedOutput<E extends MinimalEndpointInstance> = runtimeType<E['Output']>;

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
