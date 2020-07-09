import { Endpoint } from '..';
import * as t from 'io-ts';

describe('Endpoint types behave accordingly', () => {
  try {
    // accessing non defined Params in getPath is not allowed
    Endpoint({
      Input: {
        Query: t.strict({ color: t.string }),
        Params: t.strict({ id: t.string }),
      },
      Method: 'GET',
      // @ts-expect-error
      getPath: ({ foo }) => `users/${foo}/crayons`,
      Output: t.strict({ crayons: t.array(t.string) }),
      Opts: { stringifyBody: true },
    });

    // accessing defined Params in getPath is allowed
    Endpoint({
      Input: {
        Query: t.strict({ color: t.string }),
        Params: t.strict({ id: t.string }),
      },
      Method: 'GET',
      getPath: ({ id }) => `users/${id}/crayons`,
      Output: t.strict({ crayons: t.array(t.string) }),
      Opts: { stringifyBody: true },
    });

    // Body is not allowed with method !== POST | PUT | PATCH
    Endpoint({
      Input: {
        Query: t.strict({ color: t.string }),
        Params: t.strict({ id: t.string }),
        // @ts-expect-error
        Body: t.strict({ foo: t.string }),
      },
      Method: 'GET',
      getPath: ({ id }) => `users/${id}/crayons`,
      Output: t.strict({ crayons: t.array(t.string) }),
      Opts: { stringifyBody: true },
    });

    // Body is allowed with POST
    Endpoint({
      Input: {
        Query: t.strict({ color: t.string }),
        Params: t.strict({ id: t.string }),
        Body: t.strict({ foo: t.string }),
      },
      Method: 'POST',
      getPath: ({ id }) => `users/${id}/crayons`,
      Output: t.strict({ crayons: t.array(t.string) }),
      Opts: { stringifyBody: true },
    });

    // Body is allowed with PUT
    Endpoint({
      Input: {
        Query: t.strict({ color: t.string }),
        Params: t.strict({ id: t.string }),
        Body: t.strict({ foo: t.string }),
      },
      Method: 'PUT',
      getPath: ({ id }) => `users/${id}/crayons`,
      Output: t.strict({ crayons: t.array(t.string) }),
      Opts: { stringifyBody: true },
    });

    // Body is allowed with PATCH
    Endpoint({
      Input: {
        Query: t.strict({ color: t.string }),
        Params: t.strict({ id: t.string }),
        Body: t.strict({ foo: t.string }),
      },
      Method: 'PATCH',
      getPath: ({ id }) => `users/${id}/crayons`,
      Output: t.strict({ crayons: t.array(t.string) }),
      Opts: { stringifyBody: true },
    });
  } catch (error) {}

  it("wrong input won't compile", () => {
    expect(true).toBeTruthy();
  });
});
