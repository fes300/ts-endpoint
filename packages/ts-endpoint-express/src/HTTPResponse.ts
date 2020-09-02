export type HTTPResponse<T> = {
  body: T;
  statusCode: number;
  headers?: Record<string, string>;
};
