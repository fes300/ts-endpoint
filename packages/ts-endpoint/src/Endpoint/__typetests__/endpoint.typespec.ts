import { Endpoint } from '..';
import * as t from 'io-ts';

Endpoint({
  Input: {
    Query: { color: t.string },
    Params: { id: t.string },
  },
  Method: 'GET',
  // @dts-jest:fail:snap accessing non defined Params in getPath is not allowed
  getPath: ({ foo }) => `users/${foo}/crayons`,
  Output: t.type({ crayons: t.array(t.string) }),
  Opts: { stringifyBody: true },
});

Endpoint({
  Input: {
    Query: { color: t.string },
    Params: { id: t.string },
  },
  Method: 'GET',
  // @dts-jest:pass:snap accessing defined Params in getPath is allowed
  getPath: ({ id }) => `users/${id}/crayons`,
  Output: t.type({ crayons: t.array(t.string) }),
  Opts: { stringifyBody: true },
});

Endpoint({
  Input: {
    Query: { color: t.string },
    Params: { id: t.string },
    // @dts-jest:fail:snap Body is not allowed with method !== POST | PUT | PATCH
    Body: t.type({ foo: t.string }),
  },
  Method: 'GET',
  getPath: ({ id }) => `users/${id}/crayons`,
  Output: t.type({ crayons: t.array(t.string) }),
  Opts: { stringifyBody: true },
});

Endpoint({
  Input: {
    Query: { color: t.string },
    Params: { id: t.string },
    // @dts-jest:pass:snap  Body is allowed with POST
    Body: t.type({ foo: t.string }),
  },
  Method: 'POST',
  getPath: ({ id }) => `users/${id}/crayons`,
  Output: t.type({ crayons: t.array(t.string) }),
  Opts: { stringifyBody: true },
});

Endpoint({
  Input: {
    Query: { color: t.string },
    Params: { id: t.string },
    // @dts-jest:pass:snap Body is allowed with PUT
    Body: t.type({ foo: t.string }),
  },
  Method: 'PUT',
  getPath: ({ id }) => `users/${id}/crayons`,
  Output: t.type({ crayons: t.array(t.string) }),
  Opts: { stringifyBody: true },
});

Endpoint({
  Input: {
    Query: { color: t.string },
    Params: { id: t.string },
    // @dts-jest:pass:snap Body is allowed with PATCH
    Body: t.type({ foo: t.string }),
  },
  Method: 'PATCH',
  getPath: ({ id }) => `users/${id}/crayons`,
  Output: t.type({ crayons: t.array(t.string) }),
  Opts: { stringifyBody: true },
});

Endpoint({
  Input: {
    Query: { color: t.string },
    Params: { id: t.string },
    // @dts-jest:pass:snap Body is allowed with unions
    Body: t.union([t.type({ foo: t.string }), t.type({ baz: t.string })]),
  },
  Method: 'PATCH',
  getPath: ({ id }) => `users/${id}/crayons`,
  // @dts-jest:pass:snap Body is allowed with unions
  Output: t.union([t.type({ foo: t.string }), t.type({ baz: t.string })]),
  Opts: { stringifyBody: true },
});

Endpoint({
  Input: {
    Query: { color: t.string },
    Params: { id: t.string },
    // @dts-jest:pass:snap Body is allowed with intersections
    Body: t.intersection([t.type({ foo: t.string }), t.type({ baz: t.string })]),
  },
  Method: 'PATCH',
  getPath: ({ id }) => `users/${id}/crayons`,
  // @dts-jest:pass:snap Body is allowed with intersections
  Output: t.union([t.type({ foo: t.string }), t.type({ baz: t.string })]),
  Opts: { stringifyBody: true },
});

const endpointInstance = Endpoint({
  Input: {
    Query: { color: t.string },
    Params: { id: t.string },
  },
  Method: 'GET',
  getPath: ({ id }) => `users/${id}/crayons`,
  Output: t.type({ crayons: t.array(t.string) }),
  Opts: { stringifyBody: true },
});

// @dts-jest:pass:snap resulting EndpointInstances typings are correct
endpointInstance.Input.Params.props.id;
// @dts-jest:pass:snap resulting EndpointInstances typings are correct
endpointInstance.Input.Query.props.color;
// @dts-jest:pass:snap resulting EndpointInstances typings are correct
endpointInstance.getStaticPath;
// @dts-jest:fail:snap resulting EndpointInstances typings are correct
endpointInstance.Input.Body?.prova;
// @dts-jest:fail:snap resulting EndpointInstances typings are correct
endpointInstance.Output.props.fakeOutput;
// @dts-jest:pass:snap resulting EndpointInstances typings are correct
endpointInstance.Output.props.crayons;

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

const endpointWithErrors = Endpoint({
  Input: {
    Query: { color: t.string },
    Params: { id: t.number },
  },
  Method: 'GET',
  getPath: ({ id }) => `users/${id.toString()}/crayons`,
  Output: t.type({ crayons: t.array(t.string) }),
  Opts: { stringifyBody: true },
  Errors: [
    [404, t.type({ message: t.string })],
    [401, t.undefined],
  ],
});

// @dts-jest:fail:snap getPath cannot be called with no args if there are params defined in the endpoint
endpointWithParam.getPath();
// @dts-jest:fail:snap getPath cannot be called with empty object if there are Params defined in the endpoint
endpointWithParam.getPath({});
// @dts-jest:fail:snap getPath cannot be called with args different from the Params defined in the endpoint
endpointWithParam.getPath({ foo: '' });
// @dts-jest:fail:snap getPath args must have the same type as the Params defined in the endpoint
endpointWithParam.getPath({ id: '' });

// @dts-jest:pass:snap getPath can be called with no args if no Params are defined in the endpoint
endpointWithoutParam.getPath();
// @dts-jest:fail:snap getPath cannot be called with empty object if no Params are defined in the endpoint
endpointWithoutParam.getPath({});
// @dts-jest:fail:snap getPath cannot be called with any arg if no Params are defined in the endpoint
endpointWithoutParam.getPath({ id: 2 });

// @dts-jest:fail:snap getStaticPath requires a mapping function if some Params are defined in the endpoint
endpointWithParam.getStaticPath();
// @dts-jest:pass:snap getStaticPath requires a mapping function if some Params are defined in the endpoint
endpointWithParam.getStaticPath((param) => `:${param}`);

// @dts-jest:fail:snap getStaticPath requires no args if no Params are defined
endpointWithoutParam.getStaticPath((param) => `:${param}`);
// @dts-jest:pass:snap getStaticPath requires no args if no Params are defined
endpointWithoutParam.getStaticPath();
