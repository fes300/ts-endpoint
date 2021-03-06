import { Endpoint } from '..';
import * as t from 'io-ts';
import { TypeOfEndpointInstance } from '../helpers';

const endpointInstance = Endpoint({
  Input: {
    Query: t.type({ color: t.string }),
    Params: t.type({ id: t.string }),
  },
  Method: 'GET',
  getPath: ({ id }) => `users/${id}/crayons`,
  Output: t.type({ crayons: t.array(t.string) }),
});

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

// @dts-jest:pass:snap resulting EndpointInstances typings are correct
endpointInstance.Input.Params.props.id;
// @dts-jest:pass:snap resulting EndpointInstances typings are correct
endpointInstance.Input.Query.props.color;
// @dts-jest:pass:snap getPath can be called with no args if no Params are defined in the endpoint
endpointWithoutParam.getPath();
// @dts-jest:fail:snap resulting EndpointInstances typings are correct
endpointInstance.Input.Body?.prova;
// @dts-jest:fail:snap resulting EndpointInstances typings are correct
endpointInstance.Output.props.fakeOutput;
// @dts-jest:pass:snap resulting EndpointInstances typings are correct
endpointInstance.Output.props.crayons;

// @dts-jest:pass:snap Errors are well formatted
endpointWithErrors.Errors;

// @dts-jest:pass:snap endpointWithoutInput is well formatted
endpointWithoutInput;

// @dts-jest:fail:snap getPath cannot be called with no args if there are params defined in the endpoint
endpointWithParam.getPath();
// @dts-jest:fail:snap getPath cannot be called with empty object if there are Params defined in the endpoint
endpointWithParam.getPath({});
// @dts-jest:fail:snap getPath cannot be called with args different from the Params defined in the endpoint
endpointWithParam.getPath({ foo: '' });
// @dts-jest:fail:snap getPath args must have the same type as the Params defined in the endpoint
endpointWithParam.getPath({ id: '' });

// @dts-jest:fail:snap getStaticPath requires a mapping function if some Params are defined in the endpoint
endpointWithParam.getStaticPath();

// @dts-jest:pass:snap getStaticPath requires a mapping function if some Params are defined in the endpoint
endpointWithParam.getStaticPath((param) => `:${param}`);

// @dts-jest:pass:snap getStaticPath requires no args if no Params are defined
endpointWithoutParam.getStaticPath();

// @dts-jest:pass:snap getPath can be called with no args if no Params are defined in the endpoint
endpointWithoutParam.getPath();

// @dts-jest:pass:snap
type EndpointErrorType = TypeOfEndpointInstance<typeof endpointWithErrors>;

// @dts-jest:pass:snap
type EndpointBodyType = TypeOfEndpointInstance<typeof endpointWithBody>;
