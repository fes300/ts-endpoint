import * as t from 'io-ts';
import { TaskEither } from 'fp-ts/lib/TaskEither';
import { HTTPResponse } from './HTTPResponse';

export type Controller<E, P, H, Q, B, R> = (req: {
  params: P;
  headers: H;
  query: Q;
  body: B;
}) => TaskEither<t.Errors | E, HTTPResponse<R>>;
