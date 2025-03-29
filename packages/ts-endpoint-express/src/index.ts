import * as express from 'express';
import { sequenceS } from 'fp-ts/Apply';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/pipeable';
import * as TA from 'fp-ts/TaskEither';
import {
  InferEndpointInstanceParams,
  MinimalEndpoint,
  MinimalEndpointInstance,
} from 'ts-endpoint';
import { Codec, IOError, RecordCodec, runtimeType } from 'ts-io-error';
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

type UndefinedOrRuntime<N> = N extends RecordCodec<any, any>
  ? { [k in keyof N['props']]: runtimeType<N['props'][k]> }
  : undefined;

export type ErrorMeta<E> = {
  message: string;
  errors?: E;
};

declare module './HKT' {
  interface URItoKind<A> {
    IOError: [A] extends [Record<string, Codec<any, any, any>>] ? IOError<A> : IOError<never>;
  }
}

export type AddEndpoint<M extends URIS = 'IOError'> = (
  router: express.Router,
  ...m: express.RequestHandler[]
) => <E extends MinimalEndpointInstance>(
  endpoint: E,
  controller: Controller<
    Kind<M, NonNullable<E['Errors']>>,
    UndefinedOrRuntime<InferEndpointInstanceParams<E>['params']>,
    UndefinedOrRuntime<InferEndpointInstanceParams<E>['headers']>,
    UndefinedOrRuntime<InferEndpointInstanceParams<E>['query']>,
    InferEndpointInstanceParams<E>['body'] extends undefined
      ? undefined
      : InferEndpointInstanceParams<E>['body'] extends Codec<any, any, any>
      ? runtimeType<InferEndpointInstanceParams<E>['body']>
      : undefined,
    runtimeType<InferEndpointInstanceParams<E>['output']>
  >
) => void;

export const buildIOError = (errors: unknown[]) => {
  return new IOError('error decoding args', {
    kind: 'DecodingError',
    errors,
  });
};

/**
 * Adds an endpoint to your router.
 */
export const GetEndpointSubscriber = <M extends URIS = 'IOError'>(
  buildDecodeError: (e: unknown[]) => Kind<M, any>
): AddEndpoint<M> => (router, ...m) => (e, controller) => {
  const matcher = getRouterMatcher(router, e);
  const path = e.getStaticPath((param: string) => `:${param}`);

  matcher.bind(router)(path, ...(m ?? []), async (req, res, next) => {
    const args = sequenceS(E.either)({
      params: !e.Input?.Params ? E.right(undefined) : e.Input.Params.decode(req.params),
      headers: !e.Input?.Headers ? E.right(undefined) : e.Input.Headers.decode(req.headers),
      query: !e.Input?.Query ? E.right(undefined) : e.Input.Query.decode(req.query),
      body: !e.Input?.Body ? E.right(undefined) : e.Input.Body.decode(req.body),
    });

    const taskRunner = pipe(
      args,
      E.mapLeft(buildDecodeError),
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
