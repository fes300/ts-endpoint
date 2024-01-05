import * as t from 'io-ts';
import { Endpoint } from 'ts-endpoint';
import { RESTEndpoints } from '../types/RESTEndpoints';

const Actor = t.strict({
  id: t.string,
  name: t.string,
  createdAt: t.string,
  updatedAt: t.string,
}, 'Actor');

const TestEndpoints = {
  Actor: RESTEndpoints({
    Get: Endpoint({
      Method: 'GET',
      getPath: ({ id }) => `/actors/${id}`,
      Input: { Params: t.type({ id: t.string }), Query: undefined },
      Output: t.strict({ data: Actor }),
    }),
    List: Endpoint({
      Method: 'GET',
      getPath: () => `/actors`,
      Input: {
        Query: t.partial({
          _start: t.number,
          _end: t.number,
          ids: t.array(t.string),
        }),
      },
      Output: t.strict({ data: t.array(Actor), total: t.number }),
    }),
    Create: Endpoint({
      Method: 'POST',
      getPath: () => `/actors`,
      Input: { Body: Actor },
      Output: t.strict({ data: Actor }),
    }),
    Edit: Endpoint({
      Method: 'PUT',
      getPath: ({ id }) => `/actors/${id}`,
      Input: {
        Params: t.type({ id: t.string }),
        Body: Actor,
      },
      Output: t.strict({ data: Actor }),
    }),
    Delete: Endpoint({
      Method: 'DELETE',
      getPath: ({ id }) => `/actors/${id}`,
      Input: { Params: t.type({ id: t.string }) },
      Output: t.boolean,
    }),
    Custom: {
      GetSiblings: Endpoint({
        Method: 'GET',
        getPath: ({ id }) => `/actors/${id}/siblings`,
        Input: { Params: t.type({ id: t.string }) },
        Output: t.strict({ data: t.array(Actor) }),
      }),
    },
  }),
};

export { TestEndpoints };
