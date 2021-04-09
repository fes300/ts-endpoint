import { Endpoint } from '..';
import * as t from 'io-ts';
import { MinimalEndpoint, MinimalEndpointInstance, TypeOfEndpointInstance } from '../helpers';
import { RequiredKeys } from 'typelevel-ts';

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

// @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
null as TypeOfEndpointInstance<typeof endpointWithParam>['Errors'];
// @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
null as TypeOfEndpointInstance<typeof endpointWithParam>['Input'];
// @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
null as TypeOfEndpointInstance<typeof endpointWithParam>['Output'];
// @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
null as TypeOfEndpointInstance<typeof endpointWithParam>['getPath'];
// @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
null as TypeOfEndpointInstance<typeof endpointWithParam>['getStaticPath'];
// @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
null as RequiredKeys<TypeOfEndpointInstance<typeof endpointWithParam>>;
// @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
null as RequiredKeys<TypeOfEndpointInstance<typeof endpointWithParam>['Input']>;

// @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
null as TypeOfEndpointInstance<typeof endpointWithoutParam>['Errors'];
// @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
null as TypeOfEndpointInstance<typeof endpointWithoutParam>['Input'];
// @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
null as TypeOfEndpointInstance<typeof endpointWithoutParam>['Output'];
// @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
null as TypeOfEndpointInstance<typeof endpointWithoutParam>['getPath'];
// @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
null as TypeOfEndpointInstance<typeof endpointWithoutParam>['getStaticPath'];
// @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
null as RequiredKeys<TypeOfEndpointInstance<typeof endpointWithoutParam>>;
// @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
null as RequiredKeys<TypeOfEndpointInstance<typeof endpointWithoutParam>['Input']>;

// @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
null as TypeOfEndpointInstance<typeof endpointWithoutInput>['Errors'];
// @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
null as TypeOfEndpointInstance<typeof endpointWithoutInput>['Input'];
// @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
null as TypeOfEndpointInstance<typeof endpointWithoutInput>['Output'];
// @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
null as TypeOfEndpointInstance<typeof endpointWithoutInput>['getPath'];
// @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
null as TypeOfEndpointInstance<typeof endpointWithoutInput>['getStaticPath'];
// @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
null as RequiredKeys<TypeOfEndpointInstance<typeof endpointWithoutInput>>;
// @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
null as RequiredKeys<TypeOfEndpointInstance<typeof endpointWithoutInput>['Input']>;

// @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
null as TypeOfEndpointInstance<typeof endpointWithBody>['Errors'];
// @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
null as TypeOfEndpointInstance<typeof endpointWithBody>['Input'];
// @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
null as TypeOfEndpointInstance<typeof endpointWithBody>['Output'];
// @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
null as TypeOfEndpointInstance<typeof endpointWithBody>['getPath'];
// @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
null as TypeOfEndpointInstance<typeof endpointWithBody>['getStaticPath'];
// @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
null as RequiredKeys<TypeOfEndpointInstance<typeof endpointWithBody>>;
// @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
null as RequiredKeys<TypeOfEndpointInstance<typeof endpointWithBody>['Input']>;

// @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
null as TypeOfEndpointInstance<typeof endpointWithErrors>['Errors'];
// @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
null as TypeOfEndpointInstance<typeof endpointWithErrors>['Input'];
// @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
null as TypeOfEndpointInstance<typeof endpointWithErrors>['Output'];
// @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
null as TypeOfEndpointInstance<typeof endpointWithErrors>['getPath'];
// @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
null as TypeOfEndpointInstance<typeof endpointWithErrors>['getStaticPath'];
// @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
null as RequiredKeys<TypeOfEndpointInstance<typeof endpointWithErrors>>;
// @dts-jest:pass:snap resulting TypeOfEndpointInstance typings are correct
null as RequiredKeys<TypeOfEndpointInstance<typeof endpointWithErrors>['Input']>;
