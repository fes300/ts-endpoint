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

const authenticatedEndpoint = withAuth(endpoint);

// @dts-jest:pass:snap when endpoint is wrapped other headers are still present
authenticatedEndpoint.Input.Headers.props.id;
// @dts-jest:pass:snap when endpoint is wrapped authorization header is present
authenticatedEndpoint.Input.Headers.props.authorization;

const authenticatedNoHeaderEndpoint = withAuth(noHeaderEndpoint);

// @dts-jest:pass:snap when endpoint with no previous headers is wrapped, authorization header is present
authenticatedNoHeaderEndpoint.Input.Headers.props.authorization;

// @dts-jest:fail:snap when endpoint is not wrapped you must not pass the header
noHeaderEndpoint.Input.Headers?.authorization;
