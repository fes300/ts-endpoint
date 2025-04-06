

type HTTPProtocol = "http";
type HTTPSProtocol = "https";

export type HTTPClientProtocol = HTTPProtocol | HTTPSProtocol;

export type HTTPClientConfig = {
  protocol: HTTPClientProtocol;
  host: string;
  port?: number | undefined;
};
