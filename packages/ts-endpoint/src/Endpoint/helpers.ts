import * as t from 'io-ts';
import { EndpointInstance } from '.';
import { RequiredKeys } from 'typelevel-ts';

export const addSlash = (s: string) => (s.substr(0, 1) === '/' ? s : `/${s}`);

export type TypeOfEndpointInstance<E extends EndpointInstance<any>> = {
  getPath: E['getPath'];
  getStaticPath: E['getStaticPath'];
  Method: E['Method'];
  Output: t.TypeOf<E['Output']>;
  Errors: {
    [k in keyof E['Errors']]: E['Errors'][k][1] extends t.Type<any, any, any>
      ? t.TypeOf<E['Errors'][k][1]>
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

export type DecodedInput<E extends EndpointInstance<any>> = DecodedPropsType<E['Input']>;
export type EncodedInput<E extends EndpointInstance<any>> = EncodedPropsType<E['Input']>;
export type DecodedOutput<E extends EndpointInstance<any>> = t.TypeOf<E['Output']>;
export type EncodedOutput<E extends EndpointInstance<any>> = t.TypeOf<E['Output']>;
