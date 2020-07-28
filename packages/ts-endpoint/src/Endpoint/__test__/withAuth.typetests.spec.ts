import * as t from 'io-ts';
import { Endpoint } from '..';
import { withAuth } from '../withAuth';

const endpoint = Endpoint({
  Input: {
    Params: { id: t.string },
    Headers: { id: t.string },
  },
  Method: 'GET',
  getPath: ({ id }) => `users/${id}/crayons`,
  Output: t.type({ crayons: t.array(t.string) }),
  Opts: { stringifyBody: true },
});

const noHeaderEndpoint = Endpoint({
  Input: {
    Params: { id: t.string },
  },
  Method: 'GET',
  getPath: ({ id }) => `users/${id}/crayons`,
  Output: t.type({ crayons: t.array(t.string) }),
  Opts: { stringifyBody: true },
});

describe('withAuth types behave accordingly', () => {
  // when endpoint is wrapped header is present
  const authenticatedEndpoint = withAuth(endpoint);

  authenticatedEndpoint.Input.Headers.type.props.id;
  authenticatedEndpoint.Input.Headers.type.props.authorization;
  // @ts-expect-error
  authenticatedEndpoint.Input.Headers.fakeHeader;

  const authenticatedNoHeaderEndpoint = withAuth(noHeaderEndpoint);
  authenticatedNoHeaderEndpoint.Input.Headers.type.props.authorization;
  // @ts-expect-error
  authenticatedNoHeaderEndpoint.Input.Headers.type.props.fakeHeader;

  // when endpoint is not wrapped you must not pass the header
  // @ts-expect-error
  noHeaderEndpoint.Input.Headers?.authorization;

  it("wrong input won't compile", () => {
    expect(true).toBeTruthy();
  });
});
