import 'isomorphic-fetch';
import { Endpoint } from 'ts-endpoint';
// import { renderHook } from '@testing-library/react-hooks';
import { StaticHTTPClientConfig } from '../config';
import * as t from 'io-ts';
import { DecodeErrorStatus } from 'ts-shared/lib/errors';
import { GetSWRImpl } from '../swr';
import { cache } from 'swr';
import { isLeft } from 'fp-ts/lib/Either';

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
  queries: {
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
  },
  commands: {
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
  },
};

const swrHooks = GetSWRImpl(options, endpoints, { 'Content-type': 'application/json' });
const noPortSwrHooks = GetSWRImpl(noPortOptions, endpoints, {
  'Content-type': 'application/json',
});

swrHooks.queries.getEndpoint;
swrHooks.commands.deleteEndpoint;

// const lazySuccesfullQueryRequest = () =>
//   Promise.resolve(new Response(JSON.stringify({ crayons: ['lightBrown'] })));
const lazyWrongBodyRequest = () => Promise.resolve(new Response(JSON.stringify({ foo: 'baz' })));
const lazySuccesfullCommandRequest = () =>
  Promise.resolve(new Response(JSON.stringify({ crayons: ['lightBrown'] })));
// const lazyServerErrorRequest = () =>
//   Promise.resolve(
//     new Response(JSON.stringify({ foo: 'baz' }), { status: 500, statusText: 'server error' })
//   );
// const lazyClientErrorRequest = () =>
//   Promise.resolve(
//     new Response(JSON.stringify({ foo: 'baz' }), { status: 404, statusText: 'client error' })
//   );
// const lazyNetworkErrorRequest = () => Promise.reject('fail');

afterEach(() => {
  cache.clear();
});

describe('GetSWRImpl', () => {
  it('implements all the endpoint queries definitions', () => {
    expect(Object.keys(swrHooks.queries)).toEqual(['getEndpoint', 'getEndpointWithLargeQuery']);
  });
  it('implements all the endpoint command definitions', () => {
    expect(Object.keys(swrHooks.commands)).toEqual([
      'postEndpoint',
      'putEndpoint',
      'deleteEndpoint',
      'patchEndpoint',
    ]);
  });
  // it('calls global.fetch with the correct params', async () => {
  //   global.fetch = jest.fn().mockReturnValueOnce(lazySuccesfullQueryRequest());

  //   renderHook(() =>
  //     swrHooks.queries.getEndpoint({
  //       Params: { id: 'id' },
  //       Query: { color: 'brown' },
  //     })
  //   );

  //   expect(fetch).toBeCalledWith('http://test:2020/users/id/crayons?color=brown', {
  //     headers: { 'Content-type': 'application/json' },
  //     method: 'GET',
  //   });
  // });
  // it('builds the path correctly when Params and Query are defined', async () => {
  //   global.fetch = jest.fn().mockReturnValueOnce(lazySuccesfullQueryRequest());

  //   renderHook(() =>
  //     swrHooks.queries.getEndpointWithLargeQuery({
  //       Params: { id: 12, crayonSet: 4 },
  //       Query: { foo: 'fooImpl', bar: 4, baz: 'bazImpl' },
  //     })
  //   );

  //   expect(fetch).toBeCalledWith(
  //     'http://test:2020/users/12/crayons/4?foo=fooImpl&bar=4&baz=bazImpl',
  //     {
  //       headers: { 'Content-type': 'application/json' },
  //       method: 'GET',
  //     }
  //   );
  // });
  // it('builds the path correctly when no port is given', async () => {
  //   global.fetch = jest.fn().mockReturnValueOnce(lazySuccesfullQueryRequest());

  //   renderHook(() =>
  //     noPortSwrHooks.queries.getEndpointWithLargeQuery({
  //       Params: { id: 12, crayonSet: 4 },
  //       Query: { foo: 'fooImpl', bar: 4, baz: 'bazImpl' },
  //     })
  //   );

  //   expect(fetch).toBeCalledWith('http://test/users/12/crayons/4?foo=fooImpl&bar=4&baz=bazImpl', {
  //     headers: { 'Content-type': 'application/json' },
  //     method: 'GET',
  //   });
  // });
  it('PATCH returns the correct IOError when decoding the server payload results in error', async () => {
    global.fetch = jest.fn().mockReturnValueOnce(lazyWrongBodyRequest());
    const patchResponse = await noPortSwrHooks.commands.patchEndpoint({
      Params: { id: '1' },
      Body: { name: 'John' },
    })();

    expect(isLeft(patchResponse)).toBe(true);
    expect((patchResponse as any).left.details.kind).toBe('DecodingError');
    expect((patchResponse as any).left.status).toBe(DecodeErrorStatus);
  });
  it('PATCH is called correctly', async () => {
    global.fetch = jest.fn().mockReturnValueOnce(lazySuccesfullCommandRequest());
    await noPortSwrHooks.commands.patchEndpoint({
      Params: { id: '1' },
      Body: { name: 'John' },
    })();

    expect(fetch).toBeCalledWith('http://test/users/1', {
      headers: { 'Content-type': 'application/json' },
      method: 'PATCH',
      body: JSON.stringify({ name: 'John' }),
    });
  });
  // it('GET returns the correct IOError when decoding the server payload results in error', async () => {
  //   global.fetch = jest.fn().mockReturnValueOnce(lazyWrongBodyRequest());
  //   const { result, waitForValueToChange } = renderHook(() =>
  //     noPortSwrHooks.queries.getEndpoint({
  //       Params: { id: '1' },
  //       Query: { color: 'blue' },
  //     })
  //   );

  //   await waitForValueToChange(() => result.current.error !== undefined);

  //   expect(result.current.error?.details.kind).toBe('DecodingError');
  //   expect(result.current.error?.status).toBe(DecodeErrorStatus);
  // });
  // it('GET returns the correct IOError when there is a server error', async () => {
  //   global.fetch = jest.fn().mockReturnValueOnce(lazyServerErrorRequest());
  //   const { result, waitForValueToChange } = renderHook(() =>
  //     noPortSwrHooks.queries.getEndpoint({
  //       Params: { id: '1' },
  //       Query: { color: 'blue' },
  //     })
  //   );

  //   await waitForValueToChange(() => result.current.error !== undefined);

  //   expect(result.current.error?.details.kind).toBe('ServerError');
  //   expect(result.current.error?.status).toBe(500);
  // });
  // it('returns the correct IOError when there is a client error', async () => {
  //   global.fetch = jest.fn().mockReturnValueOnce(lazyClientErrorRequest());
  //   const { result, waitForValueToChange } = renderHook(() =>
  //     noPortSwrHooks.queries.getEndpoint({
  //       Params: { id: '1' },
  //       Query: { color: 'blue' },
  //     })
  //   );

  //   await waitForValueToChange(() => result.current.error !== undefined);

  //   expect(result.current.error?.details.kind).toBe('ClientError');
  //   expect(result.current.error?.status).toBe(404);
  // });
  // it('returns the correct IOError when there is a network error', async () => {
  //   global.fetch = jest.fn().mockReturnValueOnce(lazyNetworkErrorRequest());
  //   const { result, waitForValueToChange } = renderHook(() =>
  //     noPortSwrHooks.queries.getEndpoint({
  //       Params: { id: '1' },
  //       Query: { color: 'blue' },
  //     })
  //   );

  //   await waitForValueToChange(() => result.current.error !== undefined);

  //   expect(result.current.error?.details.kind).toBe('NetworkError');
  //   expect(result.current.error?.status).toBe(NetworkErrorStatus);
  // });
});
