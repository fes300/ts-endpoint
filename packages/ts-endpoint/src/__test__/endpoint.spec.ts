import { Schema } from 'effect';
import { describe, expect, it } from 'vitest';
import { Endpoint } from '../Endpoint';

describe('Endpoint', () => {
  const endpointWithParam = Endpoint({
    Input: {
      Query: Schema.Struct({ color: Schema.String }),
      Params: Schema.Struct({ id: Schema.Number }),
    },
    Method: 'GET',
    getPath: ({ id }) => `users/${id.toString()}/crayons`,
    Output: Schema.Struct({ crayons: Schema.Array(Schema.String) }),
  });

  const endpointWithoutParam = Endpoint({
    Input: {
      Query: Schema.Struct({ color: Schema.String }),
    },
    Method: 'GET',
    getPath: () => `users/crayons`,
    Output: Schema.Struct({ crayons: Schema.Array(Schema.String) }),
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
        Query: Schema.Struct({ color: Schema.String }),
        Headers: Schema.Struct({ 'Content type': Schema.String }),
      },
      Method: 'GET',
      getPath: () => `users/crayons`,
      Output: Schema.Struct({ crayons: Schema.Array(Schema.String) }),
    });
  });
});
