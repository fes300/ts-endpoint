import * as t from 'io-ts';
import { EndpointInstance, HTTPMethod } from '.';
import { RequiredKeys } from 'typelevel-ts';
import { AnyNewtype } from 'newtype-ts';
import { Endpoint, EndpointError } from './Endpoint';

export const addSlash = (s: string) => (s.substr(0, 1) === '/' ? s : `/${s}`);

export type MinimalEndpoint = Omit<
  EndpointInstance<Endpoint<HTTPMethod, t.Type<any, any, any>, any, any, any, any, any>>,
  'getPath' | 'getStaticPath'
> & { getPath: (i?: any) => string; getStaticPath: (f: (i?: any) => string) => string };

export type TypeOfEndpointInstance<E extends MinimalEndpoint> = {
  getPath: E['getPath'];
  getStaticPath: E['getStaticPath'];
  Method: E['Method'];
  Output: t.TypeOf<E['Output']>;
  Errors: E['Errors'] extends undefined
    ? undefined
    : {
        [k in keyof E['Errors']]: E['Errors'][k] extends AnyNewtype
          ? t.TypeOf<E['Errors'][k]['_A']>
          : never;
      };

  Input: {
    [k in keyof E['Input']]: E['Input'][k] extends t.Type<any, any, any>
      ? t.TypeOf<E['Input'][k]>
      : never;
  };
};

export type DecodedPropsType<P> = P extends {} ? { [k in RequiredKeys<P>]: t.TypeOf<P[k]> } : never;
export type EncodedPropsType<P> = P extends {}
  ? { [k in RequiredKeys<P>]: t.OutputOf<P[k]> }
  : never;

export type KnownErrorStatus<W> = undefined extends W
  ? undefined
  : W extends Array<infer EE>
  ? EE extends EndpointError<infer S, any>
    ? S
    : undefined
  : undefined;
export type KnownErrorBody<W> = undefined extends W
  ? undefined
  : W extends Array<infer EE>
  ? EE extends EndpointError<any, infer B>
    ? B
    : undefined
  : undefined;

export type DecodedInput<E extends MinimalEndpoint> = DecodedPropsType<E['Input']>;
export type EncodedInput<E extends MinimalEndpoint> = EncodedPropsType<E['Input']>;
export type DecodedOutput<E extends MinimalEndpoint> = t.TypeOf<E['Output']>;
export type EncodedOutput<E extends MinimalEndpoint> = t.TypeOf<E['Output']>;

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
