import { Endpoint } from '..';
import * as t from 'io-ts';

describe('Endpoint types behave accordingly', () => {
  // accessing non defined Params in getPath is not allowed
  Endpoint({
    Input: {
      Query: { color: t.string },
      Params: { id: t.string },
    },
    Method: 'GET',
    // @ts-expect-error
    getPath: ({ foo }) => `users/${foo}/crayons`,
    Output: t.type({ crayons: t.array(t.string) }),
    Opts: { stringifyBody: true },
  });

  // accessing defined Params in getPath is allowed
  Endpoint({
    Input: {
      Query: { color: t.string },
      Params: { id: t.string },
    },
    Method: 'GET',
    getPath: ({ id }) => `users/${id}/crayons`,
    Output: t.type({ crayons: t.array(t.string) }),
    Opts: { stringifyBody: true },
  });

  // Body is not allowed with method !== POST | PUT | PATCH
  Endpoint({
    Input: {
      Query: { color: t.string },
      Params: { id: t.string },
      // @ts-expect-error
      Body: { foo: t.string },
    },
    Method: 'GET',
    getPath: ({ id }) => `users/${id}/crayons`,
    Output: t.type({ crayons: t.array(t.string) }),
    Opts: { stringifyBody: true },
  });

  // Body is allowed with POST
  Endpoint({
    Input: {
      Query: { color: t.string },
      Params: { id: t.string },
      Body: { foo: t.string },
    },
    Method: 'POST',
    getPath: ({ id }) => `users/${id}/crayons`,
    Output: t.type({ crayons: t.array(t.string) }),
    Opts: { stringifyBody: true },
  });

  // Body is allowed with PUT
  Endpoint({
    Input: {
      Query: { color: t.string },
      Params: { id: t.string },
      Body: { foo: t.string },
    },
    Method: 'PUT',
    getPath: ({ id }) => `users/${id}/crayons`,
    Output: t.type({ crayons: t.array(t.string) }),
    Opts: { stringifyBody: true },
  });

  // Body is allowed with PATCH
  Endpoint({
    Input: {
      Query: { color: t.string },
      Params: { id: t.string },
      Body: { foo: t.string },
    },
    Method: 'PATCH',
    getPath: ({ id }) => `users/${id}/crayons`,
    Output: t.type({ crayons: t.array(t.string) }),
    Opts: { stringifyBody: true },
  });

  it("wrong input won't compile", () => {
    expect(true).toBeTruthy();
  });
});

describe('EndpointInstances typings are correct', () => {
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

  endpointInstance.Input.Params.props.id;
  endpointInstance.Input.Query.props.color;
  endpointInstance.getStaticPath;
  endpointInstance.getStaticPath;
  // @ts-expect-error
  endpointInstance.Input.Body?.prova;
  // @ts-expect-error
  endpointInstance.Output.props.fakeOutput;
  endpointInstance.Output.props.crayons;

  it("wrong input won't compile", () => {
    expect(true).toBeTruthy();
  });
});

describe('getPath works as intended', () => {
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

  it('adds the params correctly', () => {
    expect(endpointWithParam.getPath({ id: 3 })).toEqual('/users/3/crayons');
    expect(endpointWithoutParam.getPath()).toEqual('/users/crayons');
  });
  it('does not allow to pass incorrect params', () => {
    // @ts-expect-error
    () => endpointWithParam.getPath();
    // @ts-expect-error
    () => endpointWithParam.getPath({});
    // @ts-expect-error
    () => endpointWithParam.getPath({ foo: '' });
    // @ts-expect-error
    () => endpointWithParam.getPath({ id: '' });

    expect(true).toBeTruthy();
  });
  it('does not allow to pass params if none is defined', () => {
    // @ts-expect-error
    () => endpointWithoutParam.getPath({});
    // @ts-expect-error
    () => endpointWithoutParam.getPath({ id: 2 });

    expect(true).toBeTruthy();
  });
});

describe('getStaticPath works as intended', () => {
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

  it('adds the params correctly', () => {
    expect(endpointWithParam.getStaticPath((param) => `:${param}`)).toEqual('users/:id/crayons');
    expect(endpointWithoutParam.getStaticPath()).toEqual('users/crayons');
  });
  it('does not allow to pass incorrect params', () => {
    // @ts-expect-error
    () => endpointWithParam.getStaticPath();

    expect(true).toBeTruthy();
  });
  it('does not allow to pass params if none is defined', () => {
    // @ts-expect-error
    () => endpointWithoutParam.getStaticPath((param) => `:${param}`);

    expect(true).toBeTruthy();
  });
});
