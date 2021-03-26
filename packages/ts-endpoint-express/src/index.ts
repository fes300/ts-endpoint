import {
  InferEndpointInstanceParams,
  EndpointInstance,
  Endpoint,
  HTTPMethod,
  EndpointError,
} from 'ts-endpoint';
import * as t from 'io-ts';
import * as express from 'express';
import { Controller } from './Controller';
import * as E from 'fp-ts/Either';
import { sequenceS } from 'fp-ts/Apply';
import { pipe } from 'fp-ts/pipeable';
import * as TA from 'fp-ts/TaskEither';
import { IOError } from 'ts-shared/lib/errors';

const getRouterMatcher = <
  M extends HTTPMethod,
  O extends t.Type<any, any, any>,
  H extends { [k: string]: t.Type<any, any, any> } | undefined = undefined,
  Q extends { [k: string]: t.Type<any, any, any> } | undefined = undefined,
  B extends t.Type<any, any, any> | undefined = undefined,
  P extends { [k: string]: t.Type<any, any, any> } | undefined = undefined,
  E extends Array<EndpointError<any, any>> | undefined = undefined
>(
  router: express.Router,
  e: EndpointInstance<Endpoint<M, O, H, Q, B, P, E>>
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

type CodecRecordOutput<R extends { [k: string]: t.Type<any, any, any> }> = {
  [k in keyof R]: t.TypeOf<R[k]>;
};

type OutputOrNever<T> = T extends { [k: string]: t.Type<any, any, any> }
  ? CodecRecordOutput<T>
  : never;

export type ErrorMeta = {
  message: string;
  errors?: t.Errors;
};

type ErrorsOrNever<E> = E extends Array<infer EE>
  ? EE extends EndpointError<infer S, infer B>
    ? { status: S; body: t.TypeOf<B> }
    : never
  : never;

export type AddEndpoint = (
  router: express.Router,
  ...m: express.RequestHandler[]
) => <E extends EndpointInstance<any>>(
  e: E,
  c: Controller<
    IOError<ErrorsOrNever<E['Errors']>[]>,
    OutputOrNever<InferEndpointInstanceParams<E>['params']>,
    OutputOrNever<InferEndpointInstanceParams<E>['headers']>,
    OutputOrNever<InferEndpointInstanceParams<E>['query']>,
    InferEndpointInstanceParams<E>['body'] extends undefined
      ? undefined
      : InferEndpointInstanceParams<E>['body'] extends t.Type<any, any, any>
      ? t.TypeOf<InferEndpointInstanceParams<E>['body']>
      : undefined,
    t.TypeOf<InferEndpointInstanceParams<E>['output']>
  >
) => void;

export const AddEndpoint: AddEndpoint = (router, ...m) => (e, controller) => {
  const matcher = getRouterMatcher(router, e);
  const path = e.getStaticPath((param) => `:${param}`);

  matcher.bind(router)(path, ...(m ?? []), async (req, res, next) => {
    const args = sequenceS(E.either)({
      params: e.Input.Params === undefined ? E.right(undefined) : e.Input.Params.decode(req.params),
      headers:
        e.Input.Headers === undefined ? E.right(undefined) : e.Input.Headers.decode(req.headers),
      query: e.Input.Query === undefined ? E.right(undefined) : e.Input.Query.decode(req.query),
      body: e.Input.Body === undefined ? E.right(undefined) : e.Input.Body.decode(req.body),
    });

    const taskRunner = pipe(
      args,
      E.mapLeft(
        (errors) =>
          new IOError('error decoding args', {
            kind: 'DecodingError',
            errors: errors as t.Errors,
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
