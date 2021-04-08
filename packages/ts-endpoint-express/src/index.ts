import {
  InferEndpointInstanceParams,
  MinimalEndpoint,
  MinimalEndpointInstance,
} from 'ts-endpoint/lib';
import * as express from 'express';
import { Controller } from './Controller';
import * as E from 'fp-ts/Either';
import { sequenceS } from 'fp-ts/Apply';
import { pipe } from 'fp-ts/pipeable';
import * as TA from 'fp-ts/TaskEither';
import { IOError } from 'ts-io-error/lib';
import { Codec, RecordCodec, runtimeType } from 'ts-io-error/lib/Codec';

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

export type AddEndpoint = (
  router: express.Router,
  ...m: express.RequestHandler[]
) => <E extends MinimalEndpointInstance>(
  e: E,
  c: Controller<
    IOError<NonNullable<E['Errors']>>,
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

/**
 * Adds an endpoint to your router.
 */
export const AddEndpoint: AddEndpoint = (router, ...m) => (e, controller) => {
  const matcher = getRouterMatcher(router, e);
  const path = e.getStaticPath((param: string) => `:${param}`);

  matcher.bind(router)(path, ...(m ?? []), async (req, res, next) => {
    const args = sequenceS(E.either)({
      params:
        e.Input?.Params === undefined ? E.right(undefined) : e.Input.Params.decode(req.params),
      headers:
        e.Input?.Headers === undefined ? E.right(undefined) : e.Input.Headers.decode(req.headers),
      query: e.Input?.Query === undefined ? E.right(undefined) : e.Input.Query.decode(req.query),
      body: e.Input?.Body === undefined ? E.right(undefined) : e.Input.Body.decode(req.body),
    });

    const taskRunner = pipe(
      args,
      E.mapLeft(
        (errors) =>
          new IOError('error decoding args', {
            kind: 'DecodingError',
            errors: errors as unknown[],
          })
      ),
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
