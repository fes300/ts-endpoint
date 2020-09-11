import { Endpoint } from '../../Endpoint';
import * as t from 'io-ts';
import { createResponse } from '../NestJS';
import { Request } from 'express';
import { right } from 'fp-ts/lib/TaskEither';

const endpoints = {
  prova: Endpoint({
    Input: {
      Query: { color: t.string },
      Params: { id: t.number },
    },
    Method: 'GET',
    getPath: ({ id }) => `users/${id}/crayons`,
    Output: t.type({ crayons: t.array(t.number) }),
  }),
};

describe('createResponse types behave accordingly', () => {
  const req = {} as Request;
  const params = {};

  () => createResponse(endpoints.prova, req, params)(() => right({ crayons: [1, 2] }));

  const wrongImpl = (id: number) => right({ crayons: [id] });
  const correctImpl = ({ Params: { id } }: { Params: { id: number }; Query: { color: string } }) =>
    right({ crayons: [id] });

  // @ts-expect-error
  () => createResponse(endpoints.prova, req, params)(wrongImpl);

  () => createResponse(endpoints.prova, req, params)(correctImpl);

  it("wrong input won't compile", () => {
    expect(true).toBeTruthy();
  });
});
