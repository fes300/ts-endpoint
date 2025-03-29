import * as t from 'io-ts';
import { describe, expect, it } from 'vitest';
import { Endpoint } from '../Endpoint';

describe('Endpoint', () => {
  const endpointWithParam = Endpoint({
    Input: {
      Query: t.type({ color: t.string }),
      Params: t.type({ id: t.number }),
    },
    Method: 'GET',
    getPath: ({ id }) => `users/${id.toString()}/crayons`,
    Output: t.type({ crayons: t.array(t.string) }),
  });

  const endpointWithoutParam = Endpoint({
    Input: {
      Query: t.type({ color: t.string }),
    },
    Method: 'GET',
    getPath: () => `users/crayons`,
    Output: t.type({ crayons: t.array(t.string) }),
  });

  it('adds the params correctly', () => {
    expect(endpointWithParam.getStaticPath((param) => `:${param}`)).toEqual('/users/:id/crayons');
    expect(endpointWithoutParam.getStaticPath()).toEqual('/users/crayons');
  });

  it('getPath adds the params correctly', () => {
    expect(endpointWithParam.getPath({ id: 3 })).toEqual('/users/3/crayons');
    expect(endpointWithoutParam.getPath()).toEqual('/users/crayons');
  });

  it('Endpoint logs an error when defining headers with spaces', () => {
    Endpoint({
      Input: {
        Query: t.type({ color: t.string }),
        Headers: t.type({ 'Content type': t.string }),
      },
      Method: 'GET',
      getPath: () => `users/crayons`,
      Output: t.type({ crayons: t.array(t.string) }),
    });
  });
});
