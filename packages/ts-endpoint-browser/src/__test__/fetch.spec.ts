import 'isomorphic-fetch';
import { GetFetchHTTPClient } from '../fetch';
import { Endpoint } from 'ts-endpoint';
import { StaticHTTPClientConfig } from '../config';
import * as t from 'io-ts';
import { isLeft } from 'fp-ts/lib/Either';
import { DecodeErrorStatus, NetworkErrorStatus } from 'ts-shared/lib/errors';

const options: StaticHTTPClientConfig = {
  protocol: 'http',
  host: 'test',
  port: 2020,
};

const noPortOptions: StaticHTTPClientConfig = {
  protocol: 'http',
  host: 'test',
};

const endpoints = {
  getEndpoint: Endpoint({
    Input: {
      Query: { color: t.string },
      Params: { id: t.string },
    },
    Method: 'GET',
    getPath: ({ id }) => `users/${id}/crayons`,
    Output: t.type({ crayons: t.array(t.string) }),
  }),
  getEndpointWithLargeQuery: Endpoint({
    Input: {
      Query: { foo: t.string, bar: t.number, baz: t.string },
      Params: { id: t.number, crayonSet: t.number },
    },
    Method: 'GET',
    getPath: ({ id, crayonSet }) => `users/${id}/crayons/${crayonSet}`,
    Output: t.type({ crayons: t.array(t.string) }),
  }),
  postEndpoint: Endpoint({
    Input: {
      Params: { id: t.string },
      Body: {
        name: t.string,
        surname: t.string,
        age: t.number,
      },
    },
    Method: 'POST',
    getPath: () => 'users',
    Output: t.type({ id: t.string }),
  }),
  putEndpoint: Endpoint({
    Input: {
      Params: { id: t.string },
      Body: {
        name: t.string,
        surname: t.string,
        age: t.number,
      },
    },
    Method: 'PUT',
    getPath: ({ id }) => `users/${id}`,
    Output: t.type({ userId: t.string }),
  }),
  deleteEndpoint: Endpoint({
    Input: {
      Params: { id: t.string },
    },
    Method: 'DELETE',
    getPath: ({ id }) => `users/${id}`,
    Output: t.type({ id: t.string }),
  }),
  patchEndpoint: Endpoint({
    Input: {
      Params: { id: t.string },
      Body: {
        name: t.string,
      },
    },
    Method: 'PATCH',
    getPath: ({ id }) => `users/${id}`,
    Output: t.type({ id: t.string }),
  }),
};
const fetchClient = GetFetchHTTPClient(options, endpoints, { 'Content-type': 'application/json' });
const noPortFetchClient = GetFetchHTTPClient(noPortOptions, endpoints, {
  'Content-type': 'application/json',
});

const lazySuccesfullQueryRequest = () =>
  Promise.resolve(new Response(JSON.stringify({ crayons: ['lightBrown'] })));
const lazySuccesfullCommandRequest = () =>
  Promise.resolve(new Response(JSON.stringify({ crayons: ['lightBrown'] })));
const lazyWrongBodyRequest = () => Promise.resolve(new Response(JSON.stringify({ foo: 'baz' })));
const lazyServerErrorRequest = () =>
  Promise.resolve(
    new Response(JSON.stringify({ foo: 'baz' }), { status: 500, statusText: 'server error' })
  );
const lazyBlobResponse = () =>
  Promise.resolve(new Response(new Blob([], { type: 'application/json' })));
const lazyClientErrorRequest = () =>
  Promise.resolve(
    new Response(JSON.stringify({ foo: 'baz' }), { status: 404, statusText: 'client error' })
  );
const lazyNetworkErrorRequest = () => Promise.reject('fail');

describe('GetFetchHTTPClient', () => {
  it('implements all the endpoint definitions', () => {
    expect(Object.keys(fetchClient)).toEqual([
      'getEndpoint',
      'getEndpointWithLargeQuery',
      'postEndpoint',
      'putEndpoint',
      'deleteEndpoint',
      'patchEndpoint',
    ]);
  });

  it('calls global.fetch with the correct params', async () => {
    global.fetch = jest.fn().mockReturnValueOnce(lazySuccesfullQueryRequest());

    await fetchClient.getEndpoint({
      Params: { id: 'id' },
      Query: { color: 'brown' },
    })();

    expect(fetch).toBeCalledWith('http://test:2020/users/id/crayons?color=brown', {
      headers: { 'Content-type': 'application/json' },
      method: 'GET',
    });
  });
  it('builds the path correctly when Params and Query are defined', async () => {
    global.fetch = jest.fn().mockReturnValueOnce(lazySuccesfullQueryRequest());
    await fetchClient.getEndpointWithLargeQuery({
      Params: { id: 12, crayonSet: 4 },
      Query: { foo: 'fooImpl', bar: 4, baz: 'bazImpl' },
    })();

    expect(fetch).toBeCalledWith(
      'http://test:2020/users/12/crayons/4?foo=fooImpl&bar=4&baz=bazImpl',
      {
        headers: { 'Content-type': 'application/json' },
        method: 'GET',
      }
    );
  });
  it('builds the path correctly when no port is given', async () => {
    global.fetch = jest.fn().mockReturnValueOnce(lazySuccesfullQueryRequest());
    await noPortFetchClient.getEndpointWithLargeQuery({
      Params: { id: 12, crayonSet: 4 },
      Query: { foo: 'fooImpl', bar: 4, baz: 'bazImpl' },
    })();

    expect(fetch).toBeCalledWith('http://test/users/12/crayons/4?foo=fooImpl&bar=4&baz=bazImpl', {
      headers: { 'Content-type': 'application/json' },
      method: 'GET',
    });
  });
  it('adds the body correctly when Body is defined', async () => {
    global.fetch = jest.fn().mockReturnValueOnce(lazySuccesfullCommandRequest());
    const body = { name: 'John', surname: 'Doe', age: 24 };

    await noPortFetchClient.postEndpoint({
      Params: { id: '1' },
      Body: body,
    })();

    expect(fetch).toBeCalledWith('http://test/users', {
      headers: { 'Content-type': 'application/json' },
      method: 'POST',
      body: JSON.stringify(body),
    });

    global.fetch = jest.fn().mockReturnValueOnce(lazySuccesfullCommandRequest());
    await noPortFetchClient.putEndpoint({
      Params: { id: '1' },
      Body: { ...body },
    })();

    expect(fetch).toBeCalledWith('http://test/users/1', {
      headers: { 'Content-type': 'application/json' },
      method: 'PUT',
      body: JSON.stringify(body),
    });

    global.fetch = jest.fn().mockReturnValueOnce(lazySuccesfullCommandRequest());
    await noPortFetchClient.deleteEndpoint({
      Params: { id: '1' },
    })();

    expect(fetch).toBeCalledWith('http://test/users/1', {
      headers: { 'Content-type': 'application/json' },
      method: 'DELETE',
    });

    global.fetch = jest.fn().mockReturnValueOnce(lazySuccesfullCommandRequest());
    await noPortFetchClient.patchEndpoint({
      Params: { id: '1' },
      Body: { name: 'John' },
    })();

    expect(fetch).toBeCalledWith('http://test/users/1', {
      headers: { 'Content-type': 'application/json' },
      method: 'PATCH',
      body: JSON.stringify({ name: 'John' }),
    });
  });
  it('returns the correct IOError when decoding the server payload results in error', async () => {
    global.fetch = jest.fn().mockReturnValueOnce(lazyWrongBodyRequest());
    const patchResponse = await noPortFetchClient.patchEndpoint({
      Params: { id: '1' },
      Body: { name: 'John' },
    })();

    expect(isLeft(patchResponse)).toBe(true);
    expect((patchResponse as any).left.details.kind).toBe('DecodingError');
    expect((patchResponse as any).left.status).toBe(DecodeErrorStatus);

    global.fetch = jest.fn().mockReturnValueOnce(lazyWrongBodyRequest());
    const getResponse = await noPortFetchClient.getEndpoint({
      Params: { id: '1' },
      Query: { color: 'blue' },
    })();

    expect(isLeft(getResponse)).toBe(true);
    expect((getResponse as any).left.details.kind).toBe('DecodingError');
    expect((getResponse as any).left.status).toBe(DecodeErrorStatus);
  });
  it('returns the correct IOError when there is a server error', async () => {
    global.fetch = jest.fn().mockReturnValueOnce(lazyServerErrorRequest());
    const patchResponse = await noPortFetchClient.patchEndpoint({
      Params: { id: '1' },
      Body: { name: 'John' },
    })();

    expect(isLeft(patchResponse)).toBe(true);
    expect((patchResponse as any).left.details.kind).toBe('ServerError');
    expect((patchResponse as any).left.status).toBe(500);

    global.fetch = jest.fn().mockReturnValueOnce(lazyServerErrorRequest());
    const getResponse = await noPortFetchClient.getEndpoint({
      Params: { id: '1' },
      Query: { color: 'blue' },
    })();

    expect(isLeft(getResponse)).toBe(true);
    expect((getResponse as any).left.details.kind).toBe('ServerError');
    expect((getResponse as any).left.status).toBe(500);
  });
  it('returns the correct IOError when there is a client error', async () => {
    global.fetch = jest.fn().mockReturnValueOnce(lazyClientErrorRequest());
    const getResponse = await noPortFetchClient.getEndpoint({
      Params: { id: '1' },
      Query: { color: 'blue' },
    })();

    expect(isLeft(getResponse)).toBe(true);
    expect((getResponse as any).left.details.kind).toBe('ClientError');
    expect((getResponse as any).left.status).toBe(404);
  });
  it('returns the correct IOError when there is a network error', async () => {
    global.fetch = jest.fn().mockReturnValueOnce(lazyNetworkErrorRequest());
    const getResponse = await noPortFetchClient.getEndpoint({
      Params: { id: '1' },
      Query: { color: 'blue' },
    })();

    expect(isLeft(getResponse)).toBe(true);
    expect((getResponse as any).left.details.kind).toBe('NetworkError');
    expect((getResponse as any).left.status).toBe(NetworkErrorStatus);
  });
  it('returns the response body in the ClientError meta', async () => {
    global.fetch = jest.fn().mockReturnValueOnce(lazyClientErrorRequest());
    const getResponse = await noPortFetchClient.getEndpoint({
      Params: { id: '1' },
      Query: { color: 'blue' },
    })();

    expect((getResponse as any).left.details.meta).toEqual({ foo: 'baz' });
  });
  it('returns the response body in the ServerError meta', async () => {
    global.fetch = jest.fn().mockReturnValueOnce(lazyServerErrorRequest());
    const getResponse = await noPortFetchClient.getEndpoint({
      Params: { id: '1' },
      Query: { color: 'blue' },
    })();

    expect((getResponse as any).left.details.meta).toEqual({ foo: 'baz' });
  });
  it('returns a ServerError when the response is not a json', async () => {
    global.fetch = jest.fn().mockReturnValueOnce(lazyBlobResponse());
    const getResponse = await noPortFetchClient.getEndpoint({
      Params: { id: '1' },
      Query: { color: 'blue' },
    })();

    expect((getResponse as any).left.details.meta).toEqual({ message: 'response is not a json.' });
  });
});
