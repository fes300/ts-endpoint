import { Endpoint } from '..';
import * as t from 'io-ts';

describe('getStaticPath works as intended', () => {
  const endpointWithParam = Endpoint({
    Input: {
      Query: { color: t.string },
      Params: { id: t.number },
    },
    Method: 'GET',
    getPath: ({ id }) => `users/${id.toString()}/crayons`,
    Output: t.type({ crayons: t.array(t.string) }),
    Opts: { stringifyBody: true },
  });

  const endpointWithoutParam = Endpoint({
    Input: {
      Query: { color: t.string },
    },
    Method: 'GET',
    getPath: () => `users/crayons`,
    Output: t.type({ crayons: t.array(t.string) }),
    Opts: { stringifyBody: true },
  });

  it('adds the params correctly', () => {
    expect(endpointWithParam.getPath({ id: 3 })).toEqual('/users/3/crayons');
    expect(endpointWithoutParam.getPath()).toEqual('/users/crayons');
  });

  it('adds the params correctly', () => {
    expect(endpointWithParam.getStaticPath((param) => `:${param}`)).toEqual('/users/:id/crayons');
    expect(endpointWithoutParam.getStaticPath()).toEqual('/users/crayons');
  });
});
