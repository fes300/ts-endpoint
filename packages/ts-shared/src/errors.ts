import * as t from 'io-ts';

export class BaseError extends Error {
  status: number;
  name: string;
  details?: any;
  stack?: string | undefined;

  constructor(status: number, message: string, details?: any) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.details = details;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(this.message).stack;
    }
  }
}

export type DecodingError = 'DecodingError';

export type KnownError = 'KnownError';

export type CommunicationError = 'ClientError' | 'ServerError' | 'NetworkError';

export type IOErrorDetails<KE> =
  | { kind: KnownError; error: KE }
  | { kind: DecodingError; errors: t.Errors }
  | { kind: CommunicationError; meta?: unknown };

export const NetworkErrorStatus = 99;

export const DecodeErrorStatus = 600;

export class IOError<KE = never> extends BaseError {
  details: IOErrorDetails<KE>;

  constructor(status: number, message: string, details: IOErrorDetails<KE>) {
    super(status, message);
    this.details = details;

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(this.message).stack;
    }
  }
}
