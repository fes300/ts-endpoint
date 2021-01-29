import * as t from 'io-ts';
import { EndpointInstance } from '.';

export type TypeOfEndpointInstance<E extends EndpointInstance<any>> = {
  getPath: E['getPath'];
  getStaticPath: E['getStaticPath'];
  Opts: E['Opts'];
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
