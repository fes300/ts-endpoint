import {
  Options,
  Get,
  Delete,
  Head,
  Patch,
  Post,
  Put,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PathReporter } from 'io-ts/lib/PathReporter';
import { TaskEither } from 'fp-ts/lib/TaskEither';
import { Request } from 'express';
import * as t from 'io-ts';
import { EndpointInstance } from '..';
import { IOError } from '../shared/errors';

export const MethodDecorator = <E extends EndpointInstance<any>>(endpoint: E) => {
  const path = endpoint.getStaticPath((p) => `:${p}`);
  switch (endpoint.Method) {
    case 'DELETE':
      return Delete(path);
    case 'GET':
      return Get(path);
    case 'HEAD':
      return Head(path);
    case 'OPTIONS':
      return Options(path);
    case 'PATCH':
      return Patch(path);
    case 'POST':
      return Post(path);
    case 'PUT':
      return Put(path);
  }
};

export const createResponse = <E extends EndpointInstance<any>>(
  endpoint: E,
  req: Request,
  params: { [k: string]: any }
) => (
  f: (
    input: t.TypeOf<t.ExactType<t.Type<E['Input']>>>
  ) => TaskEither<IOError, t.TypeOf<E['Output']>>
): Promise<t.OutputOf<E['Output']>> => {
  endpoint;
  endpoint.Input;

  const validatedInputs = t.strict(endpoint.Input).decode({
    ...(endpoint.Input.Params ? { Params: params } : {}),
    ...(endpoint.Input.Query ? { Query: req.query } : {}),
    ...(endpoint.Input.Headers ? { Headers: req.headers } : {}),
    ...(endpoint.Input.Body ? { Body: req.body } : {}),
  });

  if (validatedInputs._tag === 'Left') {
    throw new HttpException(
      `Wrong Input: ${PathReporter.report(validatedInputs)}`,
      HttpStatus.UNPROCESSABLE_ENTITY
    );
  }

  return f(validatedInputs.right)().then((result) => {
    if (result._tag === 'Left') {
      throw new HttpException(
        `${result.left.details.kind}: ${result.left.message}`,
        result.left.status
      );
    }
    return endpoint.Output.encode(result.right);
  });
};
