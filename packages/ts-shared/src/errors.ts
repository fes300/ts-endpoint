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

type ArrayType<T extends Array<any>> = T extends (infer U)[] ? U : never;

export type IOErrorDetails<KE extends { body: any; status: number }[] = never> = [KE] extends [
  never
]
  ?
      | { kind: DecodingError; errors: t.Errors }
      | { kind: CommunicationError; meta?: unknown; status: number }
  :
      | { kind: DecodingError; errors: t.Errors }
      | { kind: CommunicationError; meta?: unknown; status: number }
      | ({ kind: KnownError } & ArrayType<KE>);

export const NetworkErrorStatus = 99;

export const DecodeErrorStatus = 600;

const getDetailsStatus = <D extends { body: any; status: number }>(
  d: IOErrorDetails<Array<D>>
): number => {
  switch (d.kind) {
    case 'ClientError':
    case 'ServerError':
    case 'NetworkError':
      return d.status;
    case 'DecodingError':
      return DecodeErrorStatus;
    case 'KnownError':
      return d.status;
  }
};
export class IOError<KE extends { body: any; status: number }[] | never = never> extends BaseError {
  details: IOErrorDetails<KE>;

  constructor(message: string, details: IOErrorDetails<KE>) {
    super(getDetailsStatus(details), message);

    this.details = details;

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(this.message).stack;
    }
  }
}
