import * as express from 'express';
import * as E from 'fp-ts/Either';
import * as TA from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import {
  InferEndpointInstanceParams,
  MinimalEndpoint,
  MinimalEndpointInstance,
} from 'ts-endpoint/lib';
import { IOError } from 'ts-io-error/lib';
import { Codec, runtimeType } from 'ts-io-error/lib/Codec';
import { Controller } from './Controller';
import { Kind, URIS } from './HKT';
import RequestDecoder, { DecodeRequestSuccess } from './RequestDecoder';

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
    DecodeRequestSuccess<E>['result'],
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
export const GetEndpointSubscriber =
  <M extends URIS = 'IOError'>(
    buildDecodeError: (e: unknown[]) => Kind<M, unknown>
  ): AddEndpoint<M> =>
  (router, ...m) =>
  <EI extends MinimalEndpointInstance>(
    e: EI,
    controller: Controller<
      Kind<M, NonNullable<EI['Errors']>>,
      DecodeRequestSuccess<EI>['result'],
      runtimeType<InferEndpointInstanceParams<EI>['output']>
    >
  ) => {
    const matcher = getRouterMatcher(router, e);
    const path = e.getStaticPath((param: string) => `:${param}`);

    matcher.bind(router)(path, ...(m ?? []), async (req, res, next) => {
      const args = RequestDecoder(e).decode(req);

      const taskRunner = pipe(
        args,
        E.mapLeft(buildDecodeError),
        TA.fromEither,
        TA.chain((args) => controller(args, req, res)),
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
