import { TaskEither } from 'fp-ts/lib/TaskEither';
import { HTTPResponse } from './HTTPResponse';

export type Controller<E, P, H, Q, B, R> = (args: {
  params: P;
  headers: H;
  query: Q;
  body: B;
}, req: Express.Request, res: Express.Response) => TaskEither<E, HTTPResponse<R>>;
