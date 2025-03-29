import { Schema } from 'effect';
import { assertType, expectTypeOf, test } from 'vitest';
import { Endpoint, EndpointInstanceEncodedParams } from '../Endpoint';

const endpointInstance = Endpoint({
  Input: {
    Query: Schema.Struct({ color: Schema.String }),
    Params: Schema.Struct({ id: Schema.String }),
  },
  Method: 'GET',
  getPath: ({ id }) => `users/${id}/crayons`,
  Output: Schema.Struct({ crayons: Schema.Array(Schema.String) }),
});

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
    Query: Schema.Struct({
      color: Schema.String,
      status: Schema.OptionFromNullishOr(Schema.String, null),
    }),
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

test('Should match the types', () => {
  expectTypeOf(endpointInstance.Input.Params.fields.id).toEqualTypeOf<typeof Schema.String>();

  expectTypeOf(endpointInstance.Input.Query.fields.color).toEqualTypeOf<typeof Schema.String>();

  expectTypeOf(endpointWithoutParam.getPath).toEqualTypeOf<(args?: undefined) => string>();
  expectTypeOf(endpointInstance.Input.Body).toEqualTypeOf<undefined>();

  // @dts-jest:pass:snap resulting EndpointInstances typings are correct
  expectTypeOf(endpointInstance.Output.fields.crayons).toEqualTypeOf<
    Schema.Array$<typeof Schema.String>
  >();

  // assertType<
  //   {
  //     401: typeof Schema.Undefined;
  //     404: typeof Schema.Struct<{ message: typeof Schema.String }>;
  //     500: typeof Schema.Struct<{ foo: typeof Schema.Number }>;
  //   }
  // >(endpointWithErrors.Errors);

  expectTypeOf(endpointWithParam.getPath).not.toEqualTypeOf<(i?: undefined) => string>();

  expectTypeOf(endpointWithParam.getPath).not.toEqualTypeOf<(i?: {}) => string>();

  expectTypeOf(endpointWithParam.getStaticPath).not.toEqualTypeOf<() => string>();

  // @dts-jest:pass:snap getStaticPath requires a mapping function if some Params are defined in the endpoint
  expectTypeOf(endpointWithParam.getStaticPath((param) => `:${param}`)).toEqualTypeOf<string>();

  expectTypeOf(endpointWithoutParam.getStaticPath()).toEqualTypeOf<string>();

  expectTypeOf(endpointWithoutParam.getPath()).toEqualTypeOf<string>();

  expectTypeOf(endpointWithoutInput.getPath).toEqualTypeOf<(i?: undefined) => string>();

  expectTypeOf(endpointWithErrors.Errors).toEqualTypeOf<{
    401: typeof Schema.Undefined;
    404: Schema.Struct<{ message: typeof Schema.String }>;
    500: Schema.Struct<{ foo: typeof Schema.Number }>;
  }>();

  expectTypeOf(endpointWithBody.Input.Body).toEqualTypeOf<
    Schema.Struct<{ id: typeof Schema.Number }>
  >();

  assertType<EndpointInstanceEncodedParams<typeof endpointWithBody>["Input"]['Body']>({
    id: 1,
  });
});
