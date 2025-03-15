import { Schema } from 'effect';

export const HTTPProtocol = Schema.Union(Schema.Literal("http"), Schema.Literal("https")).annotations({
  title: 'HTTPProtocol',
});
export type HTTPProtocol = typeof HTTPProtocol.Type;

export const HTTPClientConfig = Schema.extend(
  Schema.Struct({
    protocol: HTTPProtocol,
    host: Schema.String,
  }),
  Schema.partial(Schema.Struct({ port: Schema.Union(Schema.Number, Schema.Undefined) }))
).annotations({
  title: 'HTTPClientConfig',
});

export type HTTPClientConfig = typeof HTTPClientConfig.Type;
export type StaticHTTPClientConfig = typeof HTTPClientConfig.Encoded;
