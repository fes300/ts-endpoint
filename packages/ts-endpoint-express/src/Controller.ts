import { TaskEither } from 'fp-ts/TaskEither';
import { HTTPResponse } from './HTTPResponse';

export type Controller<E, A, R> = (
  args: A,
  req: Express.Request,
  res: Express.Response
) => TaskEither<E, HTTPResponse<R>>;
