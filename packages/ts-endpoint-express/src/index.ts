import * as express from 'express';
import { sequenceS } from 'fp-ts/Apply';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import * as TA from 'fp-ts/TaskEither';
import { InferEndpointInstanceParams, MinimalEndpoint, MinimalEndpointInstance } from 'ts-endpoint';
import {
  Codec,
  EncodedType,
  IOError,
  RecordCodec,
  runtimeType,
  serializedType
} from 'ts-io-error';
import { Controller } from './Controller';
import { Kind, URIS } from './HKT';

const getRouterMatcher = <E extends MinimalEndpoint>(
  router: express.Router,
  e: E
): express.IRouterMatcher<express.Router> => {
  switch (e.Method) {
    case 'POST':
      return router.post;
    case 'PATCH':
      return router.patch;
    case 'PUT':
      return router.put;
    case 'DELETE':
      return router.delete;
    case 'GET':
    default:
      return router.get;
  }
};

// export type UndefinedOrType<N> = N extends Codec<any, any>
//   ? serializedType<N>
//   : N extends RecordCodec<any>
//   ? RecordCodecType<N>
//   : N extends Record<string, Codec<any>>
//   ? RecordSchemaType<N>
//   : undefined;

export type UndefinedOrRuntime<N> = N extends undefined
  ? undefined
  : EncodedType<N>;

export type UndefinedOrType<N> = N extends RecordCodec<any>
  ? { [k in keyof N['fields']]: serializedType<N['fields'][k]> }
  : undefined;

export type ErrorMeta<E> = {
  message: string;
  errors?: E;
};

declare module './HKT' {
  interface URItoKind<A> {
    IOError: [A] extends [Record<string, Codec<any, any>>] ? IOError<A> : IOError<never>;
  }
}

type EndpointController<E extends MinimalEndpointInstance, M extends URIS = 'IOError'> = Controller<
  Kind<M, unknown>,
  UndefinedOrRuntime<InferEndpointInstanceParams<E>['params']>,
  UndefinedOrRuntime<InferEndpointInstanceParams<E>['headers']>,
  UndefinedOrRuntime<InferEndpointInstanceParams<E>['query']>,
  UndefinedOrRuntime<InferEndpointInstanceParams<E>['body']>,
  runtimeType<InferEndpointInstanceParams<E>['output']>
>;

export type AddEndpoint<M extends URIS = 'IOError'> = (
  router: express.Router,
  ...m: express.RequestHandler[]
) => <E extends MinimalEndpointInstance>(endpoint: E, controller: EndpointController<E, M>) => void;

export type AddEndpoint2<M extends URIS = 'IOError'> = (
  router: express.Router,
  ...m: express.RequestHandler[]
) => <E extends MinimalEndpointInstance>(
  endpoint: E
) => (controller: EndpointController<E, M>) => void;

export const buildIOError = (errors: unknown[]) => {
  return new IOError('error decoding args', {
    kind: 'DecodingError',
    errors,
  });
};

interface GetEndpointSubscriberOptions<M extends URIS = 'IOError'> {
  decode: <A, I, E = unknown>(
    c: Codec<A, I, E>,
    parseOptions?: any
  ) => (e: unknown, overrideOptions?: any) => E.Either<Kind<M, unknown>, I>;
  buildDecodeError: (e: unknown[]) => Kind<M, unknown>;
}

/**
 * Adds an endpoint to your router.
 */
export const GetEndpointSubscriber =
  <M extends URIS = 'IOError'>({
    buildDecodeError,
    decode,
  }: GetEndpointSubscriberOptions<M>): AddEndpoint<M> =>
  (router, ...m) =>
  <E extends MinimalEndpointInstance>(e: E, controller: EndpointController<E, M>): void => {
    const matcher = getRouterMatcher(router, e);
    const path = e.getStaticPath((param: string) => `:${param}`);

    matcher.bind(router)(path, ...(m ?? []), async (req, res, next) => {
      const args = sequenceS(E.Applicative)({
        params: !e.Input?.Params ? E.right(undefined) : decode(e.Input.Params)(req.params),
        headers: !e.Input?.Headers ? E.right(undefined) : decode(e.Input.Headers)(req.headers),
        query: !e.Input?.Query ? E.right(undefined) : decode(e.Input.Query)(req.query),
        body: !e.Input?.Body ? E.right(undefined) : decode(e.Input.Body)(req.body),
      });

      const taskRunner = pipe(
        args,
        E.mapLeft((error) => buildDecodeError([error])),
        TA.fromEither,
        TA.chain((args) => controller(args as any, req, res)),
        TA.bimap(
          (e) => {
            return next(e);
          },
          (httpResponse) => {
            if (httpResponse.headers !== undefined) {
              res.set(httpResponse.headers);
            }

            res.status(httpResponse.statusCode).send(httpResponse.body);
          }
        )
      );

      return taskRunner();
    });
  };

export const GetEndpointSubscriber2 =
  <M extends URIS = 'IOError'>({
    buildDecodeError,
    decode,
  }: GetEndpointSubscriberOptions<M>): AddEndpoint2<M> =>
  (router, ...m) =>
  <E extends MinimalEndpointInstance>(e: E) =>
  (controller: EndpointController<E, M>): void => {
    const matcher = getRouterMatcher(router, e);
    const path = e.getStaticPath((param: string) => `:${param}`);

    matcher.bind(router)(path, ...(m ?? []), async (req, res, next) => {
      const args = sequenceS(E.Applicative)({
        params: !e.Input?.Params ? E.right(undefined) : decode(e.Input.Params)(req.params),
        headers: !e.Input?.Headers ? E.right(undefined) : decode(e.Input.Headers)(req.headers),
        query: !e.Input?.Query ? E.right(undefined) : decode(e.Input.Query)(req.query),
        body: !e.Input?.Body ? E.right(undefined) : decode(e.Input.Body)(req.body),
      });

      const taskRunner = pipe(
        args,
        E.mapLeft((error) => buildDecodeError([error])),
        TA.fromEither,
        TA.chain((args) => controller(args as any, req, res)),
        TA.bimap(
          (e) => {
            return next(e);
          },
          (httpResponse) => {
            if (httpResponse.headers !== undefined) {
              res.set(httpResponse.headers);
            }

            res.status(httpResponse.statusCode).send(httpResponse.body);
          }
        )
      );

      return taskRunner();
    });
  };
