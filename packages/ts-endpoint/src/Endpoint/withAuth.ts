import * as t from 'io-ts';
import { BearerToken } from '../shared/BearerToken';
import { EndpointInstance } from '.';
import { Endpoint } from './Endpoint';

export const AuthHeader = {
  authorization: BearerToken,
};

type DefaultEmpty<A> = A extends undefined ? {} : A;

type WithAuth<E> = E extends EndpointInstance<Endpoint<infer M, infer H, infer Q, infer B, infer P>>
  ? EndpointInstance<Endpoint<M, DefaultEmpty<H> & typeof AuthHeader, Q, B, P>>
  : never;

export function withAuth<E extends EndpointInstance<any>>(e: E): WithAuth<E> {
  const originalHeadersProps: t.Props = e.Input.Headers?.type.props ?? {};
  const newHeaders = { ...originalHeadersProps, ...AuthHeader };

  return ({
    ...e,
    Input: {
      ...e.Input,
      Headers: t.strict(newHeaders),
    },
  } as unknown) as WithAuth<E>;
}
