import * as t from 'io-ts';
import { RequiredKeys } from 'typelevel-ts';
import { assertType, test } from 'vitest';
import { Endpoint, TypeOfEndpointInstance } from '../Endpoint';

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

const endpointWithErrors = Endpoint({
  Input: {
    Query: t.type({ color: t.string }),
    Params: t.type({ id: t.number }),
  },
  Method: 'GET',
  getPath: ({ id }) => `users/${id.toString()}/crayons`,
  Output: t.type({ crayons: t.array(t.string) }),
  Errors: {
    401: t.undefined,
    404: t.type({ message: t.string }),
    500: t.type({ foo: t.number }),
  },
});

const endpointWithoutInput = Endpoint({
  Method: 'GET',
  getPath: () => `users/crayons`,
  Output: t.type({ crayons: t.array(t.string) }),
});

const endpointWithBody = Endpoint({
  Method: 'POST',
  getPath: () => `users/crayons`,
  Output: t.type({ crayons: t.array(t.string) }),
  Input: { Body: t.type({ id: t.number }) },
});

test('Endpoint helpers typings', () => {
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

  assertType<TypeOfEndpointInstance<typeof endpointWithErrors>['getStaticPath']>((fn) => fn('id'));

  assertType<RequiredKeys<TypeOfEndpointInstance<typeof endpointWithErrors>>>("Errors");

  assertType<RequiredKeys<TypeOfEndpointInstance<typeof endpointWithErrors>['Input']>>('Params');

  assertType<RequiredKeys<TypeOfEndpointInstance<typeof endpointWithErrors>['Input']>>('Query');
});

