import * as E from 'fp-ts/Either';
import { sequenceS } from 'fp-ts/lib/Apply';
import { pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';
import { InferEndpointInstanceParams, MinimalEndpointInstance } from 'ts-endpoint';
import { UndefinedOrRuntime } from 'ts-endpoint/lib/helpers';
import { Codec, runtimeType } from 'ts-io-error/lib/Codec';
import { URIS } from './HKT';

interface DecodeRequestError<E> {
  type: 'error';
  error: E;
}

export interface DecodeRequestSuccess<E extends MinimalEndpointInstance> {
  type: 'success';
  result: {
    params: UndefinedOrRuntime<InferEndpointInstanceParams<E>['params']>;
    query: UndefinedOrRuntime<InferEndpointInstanceParams<E>['query']>;
    headers: UndefinedOrRuntime<InferEndpointInstanceParams<E>['query']>;
    body: InferEndpointInstanceParams<E>['body'] extends undefined
    ? undefined
    : InferEndpointInstanceParams<E>['body'] extends Codec<any, any, any>
    ? runtimeType<InferEndpointInstanceParams<E>['body']>
    : undefined;
  };
}

type DecodeRequestResult<EI extends MinimalEndpointInstance, E = any> =
  | DecodeRequestError<E>
  | DecodeRequestSuccess<EI>;

export const decodeHeaders =
  <EI extends MinimalEndpointInstance>(e: EI) =>
  (headers: any): E.Either<t.Errors, DecodeRequestSuccess<EI>['result']['headers']> => {
    return pipe(headers, (e.Input?.Headers ?? t.unknown).decode);
  };

export const decodeParams =
  <EI extends MinimalEndpointInstance>(e: EI) =>
  (params: any): E.Either<t.Errors, DecodeRequestSuccess<EI>['result']['params']> => {
    return pipe(params, (e.Input?.Params ?? t.unknown).decode);
  };

export const decodeQuery =
  <EI extends MinimalEndpointInstance>(e: EI) =>
  (query: any): E.Either<t.Errors, DecodeRequestSuccess<EI>['result']['query']> => {
    return pipe(query, (e.Input?.Query ?? t.unknown).decode);
  };

export const decodeBody =
  <EI extends MinimalEndpointInstance>(e: EI) =>
  (body: any): E.Either<t.Errors, DecodeRequestSuccess<EI>['result']['body']> => {
    return pipe(body, (e.Input?.Body ?? t.unknown).decode);
  };

const decodeRequest =
  <EI extends MinimalEndpointInstance>(e: EI) =>
  (req: any): E.Either<t.Errors, DecodeRequestSuccess<EI>['result']> => {
    return pipe(
      sequenceS(E.Applicative)({
        headers: decodeHeaders(e)(req.headers),
        query: decodeQuery(e)(req.query),
        params: decodeParams(e)(req.params),
        body: decodeBody(e)(req.body),
      })
    );
  };

const foldToError = <EI extends MinimalEndpointInstance, ER extends URIS = 'IOError'>(
  result: E.Either<t.Errors, DecodeRequestSuccess<EI>['result']>,
  f: (err: any) => ER
): DecodeRequestResult<EI, ER> => {
  return pipe(
    result,
    E.fold(
      (e): DecodeRequestResult<EI, ER> => ({
        type: 'error',
        error: f(e),
      }),
      (result): DecodeRequestSuccess<EI> => ({ type: 'success', result })
    )
  );
};

const RequestDecoder = <EI extends MinimalEndpointInstance>(e: EI) => {
  return { decode: decodeRequest(e), foldToError };
};

export default RequestDecoder;
