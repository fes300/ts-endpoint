import { Endpoint, EndpointError } from '..';
import * as t from 'io-ts';
import { TypeOfEndpointInstance } from '../helpers';

const endpointInstance = Endpoint({
  Input: {
    Query: { color: t.string },
    Params: { id: t.string },
  },
  Method: 'GET',
  getPath: ({ id }) => `users/${id}/crayons`,
  Output: t.type({ crayons: t.array(t.string) }),
});

const endpointWithParam = Endpoint({
  Input: {
    Query: { color: t.string },
    Params: { id: t.number },
  },
  Method: 'GET',
  getPath: ({ id }) => `users/${id.toString()}/crayons`,
  Output: t.type({ crayons: t.array(t.string) }),
});

const endpointWithoutParam = Endpoint({
  Input: {
    Query: { color: t.string },
  },
  Method: 'GET',
  getPath: () => `users/crayons`,
  Output: t.type({ crayons: t.array(t.string) }),
});

const endpointWithErrors = Endpoint({
  Input: {
    Query: { color: t.string },
    Params: { id: t.number },
  },
  Method: 'GET',
  getPath: ({ id }) => `users/${id.toString()}/crayons`,
  Output: t.type({ crayons: t.array(t.string) }),
  Errors: [
    EndpointError(401, t.undefined),
    EndpointError(404, t.type({ message: t.string })),
    EndpointError(500, t.type({ foo: t.number })),
  ],
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

// @dts-jest:pass:snap Errors are well formatted
endpointWithErrors.Errors;

endpointWithErrors.Errors.map((e) => {
  // @dts-jest:fail:snap You cannot access potentially non existing values
  e._A.types[1].props.message;
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

// @dts-jest:pass:snap
type EndpointType = TypeOfEndpointInstance<typeof endpointWithErrors>;
// @dts-jest:pass:snap
type ErrorStatuses = EndpointType['Errors'][number][0];
// @dts-jest:pass:snap
type ErrorBodies = EndpointType['Errors'][number][1];
