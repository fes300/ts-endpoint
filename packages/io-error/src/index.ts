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

type RecordValues<T extends Record<any, any>> = T extends Record<infer K, infer V>
  ? K extends never
    ? never
    : V
  : never;

export type IOErrorDetails<KE extends Record<string, t.Type<any, any>> = never> = [KE] extends [
  never
]
  ?
      | { kind: DecodingError; errors: t.Errors }
      | { kind: CommunicationError; meta?: unknown; status: string }
  :
      | { kind: DecodingError; errors: t.Errors }
      | { kind: CommunicationError; meta?: unknown; status: string }
      | RecordValues<
          {
            [K in keyof KE]: KE[K] extends t.Type<any, any>
              ? { kind: KnownError; status: K; body: t.TypeOf<KE[K]> }
              : never;
          }
        >;

export const NetworkErrorStatus = '99';

export const DecodeErrorStatus = '600';

const getDetailsStatus = (d: IOErrorDetails<Record<string, t.Type<any, any>>>): string => {
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

export class IOError<
  KE extends Record<string, t.Type<any, any>> | never = never
> extends BaseError {
  details: IOErrorDetails<KE>;

  constructor(message: string, details: IOErrorDetails<KE>) {
    const status = getDetailsStatus(details as IOErrorDetails<Record<string, t.Type<any, any>>>);

    super(parseInt(status), message);

    this.details = { ...(details as any), status } as IOErrorDetails<KE>;

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(this.message).stack;
    }
  }
}
