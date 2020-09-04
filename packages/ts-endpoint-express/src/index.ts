import { EndpointInstance, Endpoint } from 'ts-endpoint';
import * as t from 'io-ts';
import * as express from 'express';
import { Controller } from './Controller';
import * as E from 'fp-ts/lib/Either';
import { sequenceS } from 'fp-ts/lib/Apply';
import { pipe } from 'fp-ts/lib/pipeable';
import * as TA from 'fp-ts/lib/TaskEither';

const getRouterMatcher = (
  router: express.Router,
  e: EndpointInstance<any>
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

export type AddEndpoint = (
  router: express.Router,
  ...m: express.RequestHandler[]
) => <
  E,
  O extends t.Type<any, any, any>,
  H extends { [k: string]: t.Type<any, any, any> } | undefined = undefined,
  Q extends { [k: string]: t.Type<any, any, any> } | undefined = undefined,
  B extends { [k: string]: t.Type<any, any, any> } | undefined = undefined,
  P extends { [k: string]: t.Type<any, any, any> } | undefined = undefined
>(
  e: EndpointInstance<Endpoint<any, O, H, Q, B, P>>,
  c: Controller<
    E,
    OutputOrNever<P>,
    OutputOrNever<H>,
    OutputOrNever<Q>,
    OutputOrNever<B>,
    t.TypeOf<O>
  >
) => void;

export const AddEndpoint: AddEndpoint = (router, ...m) => (e, controller) => {
  const matcher = getRouterMatcher(router, e);
  const path = e.getStaticPath((param) => `:${param}`);

  matcher.bind(router)(path, ...(m ?? []), async (req, res, next) => {
    const args = sequenceS(E.either)({
      params: (e.Input.Params ?? t.undefined).decode(req.params),
      headers: (e.Input.Headers ?? t.undefined).decode(req.headers),
      query: (e.Input.Query ?? t.undefined).decode(req.query),
      body: (e.Input.Body ?? t.undefined).decode(req.body),
    });

    const taskRunner = pipe(
      TA.fromEither(args),
      TA.chain((args) => controller(args as any)),
      TA.bimap(
        (e) => next(e),
        (httpResponse) => {
          if (httpResponse.headers !== undefined) {
            res.set(httpResponse.headers);
          }

          return res.status(httpResponse.statusCode).send(httpResponse.body);
        }
      )
    );

    return taskRunner();
  });
};
