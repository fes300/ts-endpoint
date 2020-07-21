import 'isomorphic-fetch';
import { Endpoint } from '../../Endpoint';
import { renderHook } from '@testing-library/react-hooks';
import { StaticHTTPClientConfig } from '../config';
import * as t from 'io-ts';
import { DecodeErrorStatus, NetworkErrorStatus } from '../../shared/errors';
import { GetSWRHooks } from '../swr';
import { cache } from 'swr';

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
    Output: { crayons: t.array(t.string) },
  }),
  getEndpointWithLargeQuery: Endpoint({
    Input: {
      Query: { foo: t.string, bar: t.number, baz: t.string },
      Params: { id: t.number, crayonSet: t.number },
    },
    Method: 'GET',
    getPath: ({ id, crayonSet }) => `users/${id}/crayons/${crayonSet}`,
    Output: { crayons: t.array(t.string) },
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
    Output: { id: t.string },
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
    Output: { userId: t.string },
  }),
  deleteEndpoint: Endpoint({
    Input: {
      Params: { id: t.string },
    },
    Method: 'DELETE',
    getPath: ({ id }) => `users/${id}`,
    Output: { id: t.string },
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
    Output: { id: t.string },
  }),
};

const swrHooks = GetSWRHooks(options, endpoints, { 'Content-type': 'application/json' });
const noPortSwrHooks = GetSWRHooks(noPortOptions, endpoints, {
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
const lazyClientErrorRequest = () =>
  Promise.resolve(
    new Response(JSON.stringify({ foo: 'baz' }), { status: 404, statusText: 'client error' })
  );
const lazyNetworkErrorRequest = () => Promise.reject('fail');
const body = { name: 'John', surname: 'Doe', age: 24 };

afterEach(() => {
  cache.clear();
});

describe('GetSWRHooks', () => {
  it('implements all the endpoint definitions', () => {
    expect(Object.keys(swrHooks)).toEqual([
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

    renderHook(() =>
      swrHooks.getEndpoint({
        Params: { id: 'id' },
        Query: { color: 'brown' },
      })
    );

    expect(fetch).toBeCalledWith('http://test:2020/users/id/crayons?color=brown', {
      headers: { 'Content-type': 'application/json' },
      method: 'GET',
    });
  });
  it('builds the path correctly when Params and Query are defined', async () => {
    global.fetch = jest.fn().mockReturnValueOnce(lazySuccesfullQueryRequest());

    renderHook(() =>
      swrHooks.getEndpointWithLargeQuery({
        Params: { id: 12, crayonSet: 4 },
        Query: { foo: 'fooImpl', bar: 4, baz: 'bazImpl' },
      })
    );

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

    renderHook(() =>
      noPortSwrHooks.getEndpointWithLargeQuery({
        Params: { id: 12, crayonSet: 4 },
        Query: { foo: 'fooImpl', bar: 4, baz: 'bazImpl' },
      })
    );

    expect(fetch).toBeCalledWith('http://test/users/12/crayons/4?foo=fooImpl&bar=4&baz=bazImpl', {
      headers: { 'Content-type': 'application/json' },
      method: 'GET',
    });
  });
  it('POST request adds the body correctly when Body is defined', async () => {
    global.fetch = jest.fn().mockReturnValueOnce(lazySuccesfullQueryRequest());

    renderHook(() =>
      noPortSwrHooks.postEndpoint({
        Params: { id: '1' },
        Body: body,
      })
    );

    expect(fetch).toBeCalledWith('http://test/users', {
      headers: { 'Content-type': 'application/json' },
      method: 'POST',
      body: body,
    });
  });
  it('PUT request adds the body correctly when Body is defined', async () => {
    global.fetch = jest.fn().mockReturnValueOnce(lazySuccesfullCommandRequest());
    renderHook(() =>
      noPortSwrHooks.putEndpoint({
        Params: { id: '1' },
        Body: { ...body },
      })
    );

    expect(fetch).toBeCalledWith('http://test/users/1', {
      headers: { 'Content-type': 'application/json' },
      method: 'PUT',
      body: body,
    });
  });
  it('DELETE request adds the body correctly when Body is defined', async () => {
    global.fetch = jest.fn().mockReturnValueOnce(lazySuccesfullCommandRequest());
    renderHook(() =>
      noPortSwrHooks.deleteEndpoint({
        Params: { id: '1' },
      })
    );

    expect(fetch).toBeCalledWith('http://test/users/1', {
      headers: { 'Content-type': 'application/json' },
      method: 'DELETE',
    });
  });
  it('PATCH request adds the body correctly when Body is defined', async () => {
    global.fetch = jest.fn().mockReturnValueOnce(lazySuccesfullCommandRequest());
    renderHook(() =>
      noPortSwrHooks.patchEndpoint({
        Params: { id: '1' },
        Body: { name: 'John' },
      })
    );

    expect(fetch).toBeCalledWith('http://test/users/1', {
      headers: { 'Content-type': 'application/json' },
      method: 'PATCH',
      body: { name: 'John' },
    });
  });
  it('PATCH returns the correct IOError when decoding the server payload results in error', async () => {
    global.fetch = jest.fn().mockReturnValueOnce(lazyWrongBodyRequest());
    cache.clear();
    const { result, waitForValueToChange } = renderHook(() =>
      noPortSwrHooks.patchEndpoint({
        Params: { id: '1' },
        Body: { name: 'John' },
      })
    );

    await waitForValueToChange(() => result.current.error !== undefined);

    expect(result.current.error?.details.kind).toBe('DecodingError');
    expect(result.current.error?.status).toBe(DecodeErrorStatus);
  });
  it('GET returns the correct IOError when decoding the server payload results in error', async () => {
    global.fetch = jest.fn().mockReturnValueOnce(lazyWrongBodyRequest());
    const { result, waitForValueToChange } = renderHook(() =>
      noPortSwrHooks.getEndpoint({
        Params: { id: '1' },
        Query: { color: 'blue' },
      })
    );

    await waitForValueToChange(() => result.current.error !== undefined);

    expect(result.current.error?.details.kind).toBe('DecodingError');
    expect(result.current.error?.status).toBe(DecodeErrorStatus);
  });
  it('PATCH returns the correct IOError when there is a server error', async () => {
    global.fetch = jest.fn().mockReturnValueOnce(lazyServerErrorRequest());
    const { result, waitForValueToChange } = renderHook(() =>
      noPortSwrHooks.patchEndpoint({
        Params: { id: '1' },
        Body: { name: 'John' },
      })
    );

    await waitForValueToChange(() => result.current.error !== undefined);

    expect(result.current.error?.details.kind).toBe('ServerError');
    expect(result.current.error?.status).toBe(500);
  });
  it('GET returns the correct IOError when there is a server error', async () => {
    global.fetch = jest.fn().mockReturnValueOnce(lazyServerErrorRequest());
    const { result, waitForValueToChange } = renderHook(() =>
      noPortSwrHooks.getEndpoint({
        Params: { id: '1' },
        Query: { color: 'blue' },
      })
    );

    await waitForValueToChange(() => result.current.error !== undefined);

    expect(result.current.error?.details.kind).toBe('ServerError');
    expect(result.current.error?.status).toBe(500);
  });
  it('returns the correct IOError when there is a client error', async () => {
    global.fetch = jest.fn().mockReturnValueOnce(lazyClientErrorRequest());
    const { result, waitForValueToChange } = renderHook(() =>
      noPortSwrHooks.getEndpoint({
        Params: { id: '1' },
        Query: { color: 'blue' },
      })
    );

    await waitForValueToChange(() => result.current.error !== undefined);

    expect(result.current.error?.details.kind).toBe('ClientError');
    expect(result.current.error?.status).toBe(404);
  });
  it('returns the correct IOError when there is a network error', async () => {
    global.fetch = jest.fn().mockReturnValueOnce(lazyNetworkErrorRequest());
    const { result, waitForValueToChange } = renderHook(() =>
      noPortSwrHooks.getEndpoint({
        Params: { id: '1' },
        Query: { color: 'blue' },
      })
    );

    await waitForValueToChange(() => result.current.error !== undefined);

    expect(result.current.error?.details.kind).toBe('NetworkError');
    expect(result.current.error?.status).toBe(NetworkErrorStatus);
  });
});
