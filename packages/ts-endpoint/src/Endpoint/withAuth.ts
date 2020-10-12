import * as t from 'io-ts';
import { BearerToken } from '../../../ts-shared/src/BearerToken';
import { EndpointInstance } from '.';
import { Endpoint } from './Endpoint';

export const AuthHeader = {
  authorization: BearerToken,
};

type DefaultEmpty<A> = A extends undefined ? {} : A;

type WithAuth<E> = E extends EndpointInstance<
  Endpoint<infer M, infer O, infer H, infer Q, infer B, infer P>
>
  ? EndpointInstance<Endpoint<M, O, DefaultEmpty<H> & typeof AuthHeader, Q, B, P>>
  : never;

export function withAuth<E extends EndpointInstance<any>>(e: E): WithAuth<E> {
  const originalHeadersProps: t.Props = e.Input.Headers?.props ?? {};
  const newHeaders = { ...originalHeadersProps, ...AuthHeader };

  return ({
    ...e,
    Input: {
      ...e.Input,
      Headers: t.type(newHeaders),
    },
  } as unknown) as WithAuth<E>;
}
