import { Schema } from 'effect';
import * as O from 'effect/Option';
import { assertType, describe, expectTypeOf, it } from 'vitest';
import { Endpoint, EndpointInstanceEncodedInputs } from '../Endpoint';

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
    Params: Schema.Struct({ id: Schema.Number }),
    Query: Schema.Struct({
      color: Schema.String,
      status: Schema.OptionFromNullishOr(Schema.String, null),
    }),
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

describe('EndpointInstance', () => {
  it('Should match the types', () => {
    expectTypeOf(endpointInstance.Input.Params.fields.id).toEqualTypeOf<typeof Schema.String>();
    expectTypeOf(endpointInstance.Input.Query.fields.color).toEqualTypeOf<typeof Schema.String>();

    // @dts-jest:pass:snap resulting EndpointInstances typings are correct
    endpointInstance.getStaticPath;

    expectTypeOf(endpointInstance.Input.Body).not.toMatchObjectType<{ prova: true }>();

    expectTypeOf(endpointInstance.Output.fields).not.toMatchObjectType<{ fakeOutput: any }>;

    assertType<readonly string[]>(endpointInstance.Output.fields.crayons.Type);

    // @dts-jest:pass:snap Errors are well formatted
    endpointWithErrors.Errors;

    // @ts-expect-error my error
    endpointWithParam.getPath();

    expectTypeOf(endpointWithParam.getPath).not.toEqualTypeOf(({}));

    // @ts-expect-error my error
    expectTypeOf(endpointWithParam.getPath).not.toMatchObjectType({ foo: '' });

    expectTypeOf(endpointWithParam.getPath).not.toEqualTypeOf({ id: '' });
    // @dts-jest:pass:snap getPath args must have the same type as the Params defined in the endpoint
    endpointWithParam.getPath({ id: 2 });

    expectTypeOf(endpointWithParam.getStaticPath).not.toEqualTypeOf<() => string>();

    // @dts-jest:pass:snap getStaticPath requires a mapping function if some Params are defined in the endpoint
    endpointWithParam.getStaticPath((param) => `:${param}`);

    // @dts-jest:pass:snap getStaticPath requires no args if no Params are defined
    endpointWithoutParam.getStaticPath();

    // @dts-jest:pass:snap getPath can be called with no args if no Params are defined in the endpoint
    expectTypeOf(endpointWithoutParam.getPath).toEqualTypeOf<(i?: undefined) => string>();
    expectTypeOf(endpointWithoutParam.getPath()).toEqualTypeOf<string>();

    expectTypeOf(endpointWithParam.Input.Query).not.toMatchObjectType<any>();
    expectTypeOf(endpointWithParam.Input.Query).not.toEqualTypeOf<{
      color: string;
      status?: string;
    }>();

    assertType<EndpointInstanceEncodedInputs<typeof endpointWithParam>['Query']>({
      color: 'red',
      status: O.none<string>()
    });
  });
});
