import * as t from 'io-ts';

export const HTTPProtocol = t.keyof(
  {
    http: null,
    https: null,
  },
  'HTTPProtocol'
);
export type HTTPProtocol = t.TypeOf<typeof HTTPProtocol>;

export const HTTPClientConfig = t.exact(
  t.intersection([
    t.type({
      protocol: HTTPProtocol,
      host: t.string,
    }),
    t.partial({ port: t.union([t.number, t.undefined]) }),
  ]),
  'HTTPClientConfig'
);
export type HTTPClientConfig = t.TypeOf<typeof HTTPClientConfig>;
export type StaticHTTPClientConfig = t.OutputOf<typeof HTTPClientConfig>;
