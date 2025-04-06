import { Schema } from 'effect';
import { RequiredKeys } from 'typelevel-ts';
import { assertType, describe, it } from 'vitest';
import { Endpoint, TypeOfEndpointInstance } from '../Endpoint';

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

const endpointWithErrors = Endpoint({
  Input: {
    Query: Schema.Struct({ color: Schema.String }),
    Params: Schema.Struct({ id: Schema.Number }),
  },
  Method: 'GET',
  getPath: ({ id }) => `users/${id.toString()}/crayons`,
  Output: Schema.Struct({ crayons: Schema.Array(Schema.String) }),
  Errors: {
    401: Schema.Undefined,
    404: Schema.Struct({ message: Schema.String }),
    500: Schema.Struct({ foo: Schema.Number }),
  },
});

const endpointWithoutInput = Endpoint({
  Method: 'GET',
  getPath: () => `users/crayons`,
  Output: Schema.Struct({ crayons: Schema.Array(Schema.String) }),
});

const endpointWithBody = Endpoint({
  Method: 'POST',
  getPath: () => `users/crayons`,
  Output: Schema.Struct({ crayons: Schema.Array(Schema.String) }),
  Input: { Body: Schema.Struct({ id: Schema.Number }) },
});

describe('helpers', () => {
  it('Should match the snapshot', () => {
    assertType<TypeOfEndpointInstance<typeof endpointWithParam>['Errors']>({});

    assertType<TypeOfEndpointInstance<typeof endpointWithParam>['Input']>({
      Params: { id: 1 },
      Query: { color: 'blue' },
    });

    assertType<TypeOfEndpointInstance<typeof endpointWithParam>['Output']>({
      crayons: ['red', 'blue'],
    });

    assertType<TypeOfEndpointInstance<typeof endpointWithParam>['getPath']>(
      ({ id }) => `/users/${id.toString()}/crayons`
    );

    assertType<TypeOfEndpointInstance<typeof endpointWithParam>['getStaticPath']>(
      (paramName) => `${paramName}`
    );

    assertType<RequiredKeys<TypeOfEndpointInstance<typeof endpointWithParam>>>('Errors');
    assertType<RequiredKeys<TypeOfEndpointInstance<typeof endpointWithParam>['Input']>>('Params');
    assertType<RequiredKeys<TypeOfEndpointInstance<typeof endpointWithParam>['Input']>>('Query');

    assertType<TypeOfEndpointInstance<typeof endpointWithoutParam>['Errors']>({});

    assertType<TypeOfEndpointInstance<typeof endpointWithoutParam>['Input']>({
      Params: undefined,
      Query: { color: 'blue' },
    });

    assertType<TypeOfEndpointInstance<typeof endpointWithoutParam>['Output']>({
      crayons: ['red', 'blue'],
    });

    // assertType<TypeOfEndpointInstance<typeof endpointWithoutParam>['getPath']>(() => `/users/${params.id.toString()}/crayons`);

    // assertType<TypeOfEndpointInstance<typeof endpointWithoutParam>['getStaticPath']>();

    assertType<RequiredKeys<TypeOfEndpointInstance<typeof endpointWithoutParam>>>('Errors');

    assertType<RequiredKeys<TypeOfEndpointInstance<typeof endpointWithoutParam>['Input']>>('Query');

    assertType<TypeOfEndpointInstance<typeof endpointWithoutInput>['Errors']>({});

    assertType<TypeOfEndpointInstance<typeof endpointWithoutInput>['Input']>(undefined);

    assertType<TypeOfEndpointInstance<typeof endpointWithoutInput>['Output']>({
      crayons: ['red', 'blue'],
    });

    assertType<RequiredKeys<TypeOfEndpointInstance<typeof endpointWithoutInput>>>('Input');

    assertType<RequiredKeys<TypeOfEndpointInstance<typeof endpointWithoutInput>['Input']>>(
      undefined as never
    );

    assertType<TypeOfEndpointInstance<typeof endpointWithBody>['Errors']>({
      401: undefined,
      404: { message: 'Not found' },
      500: { foo: 42 },
    });

    assertType<TypeOfEndpointInstance<typeof endpointWithBody>['Input']>({
      Body: { id: 1 },
      Params: undefined,
      Query: undefined,
    });

    assertType<TypeOfEndpointInstance<typeof endpointWithBody>['Output']>({
      crayons: ['red', 'blue'],
    });

    assertType<RequiredKeys<TypeOfEndpointInstance<typeof endpointWithBody>>>('Output');

    assertType<RequiredKeys<TypeOfEndpointInstance<typeof endpointWithBody>['Input']>>('Body');

    assertType<TypeOfEndpointInstance<typeof endpointWithErrors>['Errors']>({
      401: undefined,
      404: { message: 'Not found' },
      500: { foo: 42 },
    });

    assertType<TypeOfEndpointInstance<typeof endpointWithErrors>['Input']>({
      Params: { id: 1 },
      Query: { color: 'blue' },
      Body: undefined,
    });

    assertType<TypeOfEndpointInstance<typeof endpointWithErrors>['Output']>({
      crayons: ['red', 'blue'],
    });

    assertType<TypeOfEndpointInstance<typeof endpointWithErrors>['getPath']>(
      ({ id }) => `/users/${id.toString()}/crayons`
    );

    assertType<TypeOfEndpointInstance<typeof endpointWithErrors>['getStaticPath']>((fn) =>
      fn('id')
    );

    assertType<RequiredKeys<TypeOfEndpointInstance<typeof endpointWithErrors>>>('Errors');
    // @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
    assertType<RequiredKeys<TypeOfEndpointInstance<typeof endpointWithErrors>['Input']>>('Params');
  });
});
