import { Endpoint } from '..';
import * as t from 'io-ts';

describe('Endpoint types behave accordingly', () => {
  // accessing non defined Params in getPath is not allowed
  Endpoint({
    Input: {
      Query: { color: t.string },
      Params: { id: t.string },
    },
    Method: 'GET',
    // @ts-expect-error
    getPath: ({ foo }) => `users/${foo}/crayons`,
    Output: { crayons: t.array(t.string) },
    Opts: { stringifyBody: true },
  });

  // accessing defined Params in getPath is allowed
  Endpoint({
    Input: {
      Query: { color: t.string },
      Params: { id: t.string },
    },
    Method: 'GET',
    getPath: ({ id }) => `users/${id}/crayons`,
    Output: { crayons: t.array(t.string) },
    Opts: { stringifyBody: true },
  });

  // Body is not allowed with method !== POST | PUT | PATCH
  Endpoint({
    Input: {
      Query: { color: t.string },
      Params: { id: t.string },
      // @ts-expect-error
      Body: { foo: t.string },
    },
    Method: 'GET',
    getPath: ({ id }) => `users/${id}/crayons`,
    Output: { crayons: t.array(t.string) },
    Opts: { stringifyBody: true },
  });

  // Body is allowed with POST
  Endpoint({
    Input: {
      Query: { color: t.string },
      Params: { id: t.string },
      Body: { foo: t.string },
    },
    Method: 'POST',
    getPath: ({ id }) => `users/${id}/crayons`,
    Output: { crayons: t.array(t.string) },
    Opts: { stringifyBody: true },
  });

  // Body is allowed with PUT
  Endpoint({
    Input: {
      Query: { color: t.string },
      Params: { id: t.string },
      Body: { foo: t.string },
    },
    Method: 'PUT',
    getPath: ({ id }) => `users/${id}/crayons`,
    Output: { crayons: t.array(t.string) },
    Opts: { stringifyBody: true },
  });

  // Body is allowed with PATCH
  Endpoint({
    Input: {
      Query: { color: t.string },
      Params: { id: t.string },
      Body: { foo: t.string },
    },
    Method: 'PATCH',
    getPath: ({ id }) => `users/${id}/crayons`,
    Output: { crayons: t.array(t.string) },
    Opts: { stringifyBody: true },
  });

  it("wrong input won't compile", () => {
    expect(true).toBeTruthy();
  });
});
