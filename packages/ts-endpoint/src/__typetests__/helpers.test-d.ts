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
    // @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
    null as unknown as TypeOfEndpointInstance<typeof endpointWithParam>;
    // @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
    null as unknown as TypeOfEndpointInstance<typeof endpointWithParam>['Errors'];
    // @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
    null as unknown as TypeOfEndpointInstance<typeof endpointWithParam>['Input'];
    // @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
    null as unknown as TypeOfEndpointInstance<typeof endpointWithParam>['Output'];
    // @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
    null as unknown as TypeOfEndpointInstance<typeof endpointWithParam>['getPath'];
    // @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
    null as unknown as TypeOfEndpointInstance<typeof endpointWithParam>['getStaticPath'];
    // @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
    null as unknown as RequiredKeys<TypeOfEndpointInstance<typeof endpointWithParam>>;
    // @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
    null as unknown as RequiredKeys<TypeOfEndpointInstance<typeof endpointWithParam>['Input']>;

    // @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
    null as unknown as TypeOfEndpointInstance<typeof endpointWithoutParam>['Errors'];
    // @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
    null as unknown as TypeOfEndpointInstance<typeof endpointWithoutParam>['Input'];
    // @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
    null as unknown as TypeOfEndpointInstance<typeof endpointWithoutParam>['Output'];
    // @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
    null as unknown as TypeOfEndpointInstance<typeof endpointWithoutParam>['getPath'];
    // @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
    null as unknown as TypeOfEndpointInstance<typeof endpointWithoutParam>['getStaticPath'];
    // @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
    null as unknown as RequiredKeys<TypeOfEndpointInstance<typeof endpointWithoutParam>>;
    // @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
    null as unknown as RequiredKeys<TypeOfEndpointInstance<typeof endpointWithoutParam>['Input']>;

    // @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
    null as unknown as TypeOfEndpointInstance<typeof endpointWithoutInput>['Errors'];
    // @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
    null as unknown as TypeOfEndpointInstance<typeof endpointWithoutInput>['Input'];
    // @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
    null as unknown as TypeOfEndpointInstance<typeof endpointWithoutInput>['Output'];
    // @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
    null as unknown as TypeOfEndpointInstance<typeof endpointWithoutInput>['getPath'];
    // @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
    null as unknown as TypeOfEndpointInstance<typeof endpointWithoutInput>['getStaticPath'];
    // @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
    null as unknown as RequiredKeys<TypeOfEndpointInstance<typeof endpointWithoutInput>>;
    // @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
    null as unknown as RequiredKeys<TypeOfEndpointInstance<typeof endpointWithoutInput>['Input']>;

    // @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
    null as unknown as TypeOfEndpointInstance<typeof endpointWithBody>['Errors'];
    // @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
    null as unknown as TypeOfEndpointInstance<typeof endpointWithBody>['Input'];
    // @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
    null as unknown as TypeOfEndpointInstance<typeof endpointWithBody>['Output'];
    // @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
    null as unknown as TypeOfEndpointInstance<typeof endpointWithBody>['getPath'];
    // @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
    null as unknown as TypeOfEndpointInstance<typeof endpointWithBody>['getStaticPath'];
    // @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
    null as unknown as RequiredKeys<TypeOfEndpointInstance<typeof endpointWithBody>>;
    // @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
    null as unknown as RequiredKeys<TypeOfEndpointInstance<typeof endpointWithBody>['Input']>;

    assertType<TypeOfEndpointInstance<typeof endpointWithErrors>['Errors']>({
      // @ts-expect-error
      401: undefined,
      404: { message: '' },
      500: { foo: 1 },
    });
    // @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
    null as unknown as TypeOfEndpointInstance<typeof endpointWithErrors>['Input'];
    // @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
    null as unknown as TypeOfEndpointInstance<typeof endpointWithErrors>['Output'];
    // @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
    // @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
    null as unknown as TypeOfEndpointInstance<typeof endpointWithErrors>['getPath'];
    // @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
    null as unknown as TypeOfEndpointInstance<typeof endpointWithErrors>['getStaticPath'];
    // @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
    null as unknown as RequiredKeys<TypeOfEndpointInstance<typeof endpointWithErrors>>;
    // @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
    null as unknown as RequiredKeys<TypeOfEndpointInstance<typeof endpointWithErrors>['Input']>;
  });
});
