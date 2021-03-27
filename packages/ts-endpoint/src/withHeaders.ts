import * as t from 'io-ts';
import { BearerToken } from 'ts-shared/lib/BearerToken';
import { EndpointInstance, MinimalEndpoint } from '.';
import { Endpoint } from './Endpoint';

type DefaultEmpty<A> = A extends undefined ? {} : A;

type Headers<H extends string, V extends t.Type<any, any, any>> = Record<H, V>;

type WithHeaders<E, DH extends Headers<any, any>> = E extends EndpointInstance<
  Endpoint<infer M, infer O, infer H, infer Q, infer B, infer P>
>
  ? EndpointInstance<Endpoint<M, O, DefaultEmpty<H> & DH, Q, B, P>>
  : never;

export const withHeaders = <DH extends Headers<any, any>>(dh: DH) => <E extends MinimalEndpoint>(
  e: E
): WithHeaders<E, DH> => {
  const originalHeadersProps: t.Props = e.Input?.Headers?.props ?? {};
  const newHeaders = { ...originalHeadersProps, ...dh };

  return ({
    ...e,
    Input: {
      ...e.Input,
      Headers: t.type(newHeaders, 'Headers'),
    },
  } as unknown) as WithHeaders<E, DH>;
};

export const AuthHeader = {
  authorization: BearerToken,
};

export const withAuth = withHeaders(AuthHeader);
