import { Schema } from 'effect';
import { isLeft } from 'fp-ts/Either';
import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import 'isomorphic-fetch';
import { Endpoint } from 'ts-endpoint';
import { Codec, DecodeErrorStatus, IOError, NetworkErrorStatus } from 'ts-io-error';
import { describe, expect, it, vi } from 'vitest';
import { StaticHTTPClientConfig } from '../config';
import { GetFetchHTTPClient } from '../fetch';

const errorMock = vi.spyOn(globalThis.console, 'error').mockImplementation(() => {});

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
  noInputEndpoint: Endpoint({
    Method: 'GET',
    getPath: () => `users/crayons`,
    Output: Schema.Struct({ crayons: Schema.Array(Schema.String) }),
  }),
  getEndpoint: Endpoint({
    Input: {
      Query: Schema.Struct({ color: Schema.String }),
      Params: Schema.Struct({ id: Schema.String }),
    },
    Method: 'GET',
    getPath: ({ id }) => `users/${id}/crayons`,
    Output: Schema.Struct({ crayons: Schema.Array(Schema.String) }),
  }),
  getEndpointNoParams: Endpoint({
    Input: {
      Query: Schema.Struct({ color: Schema.String }),
    },
    Method: 'GET',
    getPath: () => `users/crayons`,
    Output: Schema.Struct({ crayons: Schema.Array(Schema.String) }),
  }),
  getEndpointWithLargeQuery: Endpoint({
    Input: {
      Query: Schema.Struct({ foo: Schema.String, bar: Schema.Number, baz: Schema.String }),
      Params: Schema.Struct({ id: Schema.Number, crayonSet: Schema.Number }),
    },
    Method: 'GET',
    getPath: ({ id, crayonSet }) => `users/${id}/crayons/${crayonSet}`,
    Output: Schema.Struct({ crayons: Schema.Array(Schema.String) }),
  }),
  postEndpoint: Endpoint({
    Input: {
      Params: Schema.Struct({ id: Schema.String }),
      Body: Schema.Struct({
        name: Schema.String,
        surname: Schema.String,
        age: Schema.Number,
      }),
    },
    Method: 'POST',
    getPath: () => 'users',
    Output: Schema.Struct({ id: Schema.String }),
  }),
  postReturningUndefined: Endpoint({
    Input: {
      Params: Schema.Struct({ id: Schema.String }),
      Body: Schema.Struct({ foo: Schema.String }),
    },
    Method: 'POST',
    getPath: () => 'users',
    Output: Schema.Undefined,
  }),
  postReturningNull: Endpoint({
    Input: {
      Params: Schema.Struct({ id: Schema.String }),
      Body: Schema.Struct({ foo: Schema.String }),
    },
    Method: 'POST',
    getPath: () => 'users',
    Output: Schema.Null,
  }),
  putEndpoint: Endpoint({
    Input: {
      Params: Schema.Struct({ id: Schema.String }),
      Body: Schema.Struct({
        name: Schema.String,
        surname: Schema.String,
        age: Schema.Number,
      }),
    },
    Method: 'PUT',
    getPath: ({ id }) => `users/${id}`,
    Output: Schema.Struct({ userId: Schema.String }),
  }),
  deleteEndpoint: Endpoint({
    Input: {
      Params: Schema.Struct({ id: Schema.String }),
    },
    Method: 'DELETE',
    getPath: ({ id }) => `users/${id}`,
    Output: Schema.Struct({ id: Schema.String }),
  }),
  patchEndpoint: Endpoint({
    Input: {
      Params: Schema.Struct({ id: Schema.String }),
      Body: Schema.Struct({
        name: Schema.String,
      }),
    },
    Method: 'PATCH',
    getPath: ({ id }) => `users/${id}`,
    Output: Schema.Struct({ id: Schema.String }),
  }),
  knownErrorEndpoint: Endpoint({
    Input: {
      Query: Schema.Struct({ color: Schema.String }),
      Params: Schema.Struct({ id: Schema.String }),
    },
    Errors: {
      401: Schema.Struct({ foo: Schema.String }),
      404: Schema.Struct({ baz: Schema.String }),
    },
    Method: 'GET',
    getPath: ({ id }) => `users/${id}/crayons`,
    Output: Schema.Struct({ crayons: Schema.Array(Schema.String) }),
  }),
};

const decode =
  <A, I, C = never>(s: Codec<A, I, C>) =>
  (input: unknown): E.Either<IOError, any> => {
    return pipe(
      input,
      Schema.decodeUnknownEither(s as Schema.Schema<any>),
      E.mapLeft(
        (err) => {
         return new IOError('Parse error', {
            kind: 'DecodingError',
            errors: [err],
          })
        }
      )
    );
  };

const HandledError = new IOError('this is a handled error', { status: '112', kind: 'ClientError' });
const fetchClient = GetFetchHTTPClient(options, endpoints, {
  defaultHeaders: { 'Content-type': 'application/json' },
  decode,
});
const fetchClientIgnoreNonJSONResponse = GetFetchHTTPClient(options, endpoints, {
  defaultHeaders: { 'Content-type': 'application/json' },
  ignoreNonJSONResponse: true,
  decode,
});
const handleErrorClient = GetFetchHTTPClient(options, endpoints, {
  defaultHeaders: { 'Content-type': 'application/json' },
  handleError: () => {
    return HandledError;
  },
  decode,
});
const noPortFetchClient = GetFetchHTTPClient(noPortOptions, endpoints, {
  defaultHeaders: { 'Content-type': 'application/json' },
  decode,
});

const lazySuccesfullQueryResponse = () =>
  Promise.resolve(new Response(JSON.stringify({ crayons: ['lightBrown'] })));
const lazySuccesfullCommandResponse = () =>
  Promise.resolve(new Response(JSON.stringify({ crayons: ['lightBrown'] })));
const lazySuccesfullUndefinedResponse = () =>
  Promise.resolve(new Response(JSON.stringify(undefined)));
const lazySuccesfullNullResponse = () => Promise.resolve(new Response(JSON.stringify(null)));
const lazySuccesfullNonJSONResponse = () =>
  Promise.resolve(
    new Response(new Blob(), {
      headers: {
        'content-type': 'image/png',
        link: '<https://www.gravatar.com/avatar/d0638b61ec94e9bf48e38117ce1a1290?d=404>; rel="canonical"',
      },
    })
  );
const lazyWrongBodyResponse = () => Promise.resolve(new Response(JSON.stringify({ foo: 'baz' })));
const lazyCorrectKnownErrorResponse = () =>
  Promise.resolve(
    new Response(JSON.stringify({ foo: 'baz' }), { status: 401, statusText: 'foo baz bar' })
  );
const lazyWrongKnownErrorResponse = () =>
  Promise.resolve(
    new Response(JSON.stringify({ bar: 'baz' }), { status: 401, statusText: 'server error' })
  );
const lazyServerErrorResponse = () =>
  Promise.resolve(
    new Response(JSON.stringify({ foo: 'baz' }), { status: 500, statusText: 'server error' })
  );
const lazyBlobResponse = () =>
  Promise.resolve(new Response(new Blob([], { type: 'application/json' })));
const lazyClientErrorResponse = () =>
  Promise.resolve(
    new Response(JSON.stringify({ foo: 'baz' }), { status: 404, statusText: 'client error' })
  );
const lazyNetworkErrorRequest = () => Promise.reject('fail');

describe('GetFetchHTTPClient', () => {
  it('implements all the endpoint definitions', () => {
    expect(Object.keys(fetchClient)).toEqual([
      'noInputEndpoint',
      'getEndpoint',
      'getEndpointNoParams',
      'getEndpointWithLargeQuery',
      'postEndpoint',
      'postReturningUndefined',
      'postReturningNull',
      'putEndpoint',
      'deleteEndpoint',
      'patchEndpoint',
      'knownErrorEndpoint',
    ]);
  });

  it('calls globalThis.fetch with the correct params', async () => {
    globalThis.fetch = vi.fn().mockReturnValueOnce(lazySuccesfullQueryResponse());

    await fetchClient.noInputEndpoint()();

    expect(fetch).toBeCalledWith('http://test:2020/users/crayons', {
      headers: { 'Content-type': 'application/json' },
      method: 'GET',
    });
  });

  it('calls globalThis.fetch with the correct params', async () => {
    globalThis.fetch = vi.fn().mockReturnValueOnce(lazySuccesfullQueryResponse());

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
    globalThis.fetch = vi.fn().mockReturnValueOnce(lazySuccesfullQueryResponse());
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
    globalThis.fetch = vi.fn().mockReturnValueOnce(lazySuccesfullQueryResponse());
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
    globalThis.fetch = vi.fn().mockReturnValueOnce(lazySuccesfullCommandResponse());
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

    globalThis.fetch = vi.fn().mockReturnValueOnce(lazySuccesfullCommandResponse());
    await noPortFetchClient.putEndpoint({
      Params: { id: '1' },
      Body: { ...body },
    })();

    expect(fetch).toBeCalledWith('http://test/users/1', {
      headers: { 'Content-type': 'application/json' },
      method: 'PUT',
      body: JSON.stringify(body),
    });

    globalThis.fetch = vi.fn().mockReturnValueOnce(lazySuccesfullCommandResponse());
    await noPortFetchClient.deleteEndpoint({
      Params: { id: '1' },
    })();

    expect(fetch).toBeCalledWith('http://test/users/1', {
      headers: { 'Content-type': 'application/json' },
      method: 'DELETE',
    });

    globalThis.fetch = vi.fn().mockReturnValueOnce(lazySuccesfullCommandResponse());
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
    globalThis.fetch = vi.fn().mockReturnValueOnce(lazyWrongBodyResponse());
    const patchResponse = await noPortFetchClient.patchEndpoint({
      Params: { id: '1' },
      Body: { name: 'John' },
    })();

    expect(isLeft(patchResponse)).toBe(true);
    expect((patchResponse as any).left.details.kind).toBe('DecodingError');
    expect((patchResponse as any).left.status).toBe(parseInt(DecodeErrorStatus));
    expect((patchResponse as any).left.details.status).toBe(DecodeErrorStatus);

    globalThis.fetch = vi.fn().mockReturnValueOnce(lazyWrongBodyResponse());
    const getResponse = await noPortFetchClient.getEndpoint({
      Params: { id: '1' },
      Query: { color: 'blue' },
    })();

    expect(isLeft(getResponse)).toBe(true);
    expect((getResponse as any).left.details.kind).toBe('DecodingError');
    expect((getResponse as any).left.details.status).toBe(DecodeErrorStatus);
    expect((getResponse as any).left.status).toBe(parseInt(DecodeErrorStatus));
  });

  it('returns the correct IOError when decoding a server KnownError', async () => {
    globalThis.fetch = vi.fn().mockReturnValueOnce(lazyServerErrorResponse());
    const patchResponse = await noPortFetchClient.knownErrorEndpoint({
      Params: { id: '1' },
      Query: { color: 'blue' },
    })();

    expect(isLeft(patchResponse)).toBe(true);
    expect((patchResponse as any).left.details.kind).toBe('ServerError');
    expect((patchResponse as any).left.status).toBe(500);

    globalThis.fetch = vi.fn().mockReturnValueOnce(lazyWrongKnownErrorResponse());
    const wrongKnownErrorResponse = await noPortFetchClient.knownErrorEndpoint({
      Params: { id: '1' },
      Query: { color: 'blue' },
    })();

    expect(isLeft(wrongKnownErrorResponse)).toBe(true);
    expect((wrongKnownErrorResponse as any).left.details.kind).toBe('DecodingError');
    expect((wrongKnownErrorResponse as any).left.status).toBe(parseInt(DecodeErrorStatus));

    globalThis.fetch = vi.fn().mockReturnValueOnce(lazyCorrectKnownErrorResponse());
    const correctKnownErrorResponse = await noPortFetchClient.knownErrorEndpoint({
      Params: { id: '1' },
      Query: { color: 'blue' },
    })();

    expect(isLeft(correctKnownErrorResponse)).toBe(true);
    expect((correctKnownErrorResponse as any).left.status).toBe(401);
    expect((correctKnownErrorResponse as any).left.details).toEqual({
      kind: 'KnownError',
      status: '401',
      body: { foo: 'baz' },
    });
  });

  it('returns the correct IOError when there is a server error', async () => {
    globalThis.fetch = vi.fn().mockReturnValueOnce(lazyServerErrorResponse());
    const patchResponse = await noPortFetchClient.patchEndpoint({
      Params: { id: '1' },
      Body: { name: 'John' },
    })();

    expect(isLeft(patchResponse)).toBe(true);
    expect((patchResponse as any).left.details.kind).toBe('ServerError');
    expect((patchResponse as any).left.status).toBe(500);

    globalThis.fetch = vi.fn().mockReturnValueOnce(lazyServerErrorResponse());
    const getResponse = await noPortFetchClient.getEndpoint({
      Params: { id: '1' },
      Query: { color: 'blue' },
    })();

    expect(isLeft(getResponse)).toBe(true);
    expect((getResponse as any).left.details.kind).toBe('ServerError');
    expect((getResponse as any).left.status).toBe(500);
  });

  it('returns the correct IOError when there is a client error', async () => {
    globalThis.fetch = vi.fn().mockReturnValueOnce(lazyClientErrorResponse());
    const getResponse = await noPortFetchClient.getEndpoint({
      Params: { id: '1' },
      Query: { color: 'blue' },
    })();

    expect(isLeft(getResponse)).toBe(true);
    expect((getResponse as any).left.details.kind).toBe('ClientError');
    expect((getResponse as any).left.status).toBe(404);
  });
  it('returns the correct IOError when there is a network error', async () => {
    globalThis.fetch = vi.fn().mockReturnValueOnce(lazyNetworkErrorRequest());
    const getResponse = await noPortFetchClient.getEndpoint({
      Params: { id: '1' },
      Query: { color: 'blue' },
    })();

    expect(isLeft(getResponse)).toBe(true);
    expect((getResponse as any).left.details.kind).toBe('NetworkError');
    expect((getResponse as any).left.details.status).toBe(NetworkErrorStatus);
    expect((getResponse as any).left.status).toBe(parseInt(NetworkErrorStatus));
  });

  it('returns the response body in the ClientError meta', async () => {
    globalThis.fetch = vi.fn().mockReturnValueOnce(lazyClientErrorResponse());
    const getResponse = await noPortFetchClient.getEndpoint({
      Params: { id: '1' },
      Query: { color: 'blue' },
    })();

    expect((getResponse as any).left.details.meta).toEqual({ foo: 'baz' });
  });

  it('returns the response body in the ServerError meta', async () => {
    globalThis.fetch = vi.fn().mockReturnValueOnce(lazyServerErrorResponse());
    const getResponse = await noPortFetchClient.getEndpoint({
      Params: { id: '1' },
      Query: { color: 'blue' },
    })();

    expect((getResponse as any).left.details.meta).toEqual({ foo: 'baz' });
  });

  it('returns a ServerError when the response is not a json', async () => {
    globalThis.fetch = vi.fn().mockReturnValueOnce(lazyBlobResponse());
    const getResponse = await noPortFetchClient.getEndpoint({
      Params: { id: '1' },
      Query: { color: 'blue' },
    })();

    expect((getResponse as any).left.details.meta).toEqual({ message: 'response is not a json.' });
  });

  it('returns the modified error when using handleError', async () => {
    globalThis.fetch = vi.fn().mockReturnValueOnce(lazyServerErrorResponse());
    const getResponse = await handleErrorClient.getEndpoint({
      Params: { id: '1' },
      Query: { color: 'blue' },
    })();

    expect((getResponse as any).left).toEqual(HandledError);
  });

  it('POST calls returning undefined work as expected', async () => {
    globalThis.fetch = vi.fn().mockReturnValueOnce(lazySuccesfullUndefinedResponse());
    const getResponse = await fetchClient.postReturningUndefined({
      Params: { id: '1' },
      Body: { foo: 'baz' },
    })();

    expect(getResponse._tag).toEqual('Right');
  });

  it('POST calls returning null work as expected', async () => {
    globalThis.fetch = vi.fn().mockReturnValueOnce(lazySuccesfullNullResponse());
    const getResponse = await fetchClient.postReturningNull({
      Params: { id: '1' },
      Body: { foo: 'baz' },
    })();

    expect(getResponse._tag).toEqual('Right');
  });

  it('FAILS with non-JSON responses ', async () => {
    globalThis.fetch = vi.fn().mockReturnValueOnce(lazySuccesfullNonJSONResponse());
    const getResponse = await fetchClient.postReturningUndefined({
      Params: { id: '1' },
      Body: { foo: 'baz' },
    })();

    expect(getResponse._tag).toEqual('Left');
    expect((getResponse as any).left.details.kind).toEqual('ServerError');
  });

  it('DOES NOT FAIL with non-JSON responses and ignoreNonJSONResponse option', async () => {
    globalThis.fetch = vi.fn().mockReturnValueOnce(lazySuccesfullNonJSONResponse());
    const getResponse = await fetchClientIgnoreNonJSONResponse.postReturningUndefined({
      Params: { id: '1' },
      Body: { foo: 'baz' },
    })();

    expect(getResponse._tag).toEqual('Right');
  });

  it('logs an error when defining headers with spaces', () => {
    GetFetchHTTPClient(options, endpoints, {
      defaultHeaders: { 'Content type': 'application/json' },
      decode,
    });

    expect(errorMock.mock.calls[0][0]).toBe(
      'white spaces are not allowed in defaultHeaders names:'
    );
    expect(errorMock.mock.calls[0][1]).toEqual(['Content type']);

    errorMock.mockRestore();
  });
});
