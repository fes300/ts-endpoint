import { Schema } from 'effect';
import { Endpoint } from '../Endpoint';

export const GetUserCrayons = Endpoint({
  Input: {
    Params: Schema.Struct({ id: Schema.Number }),
    Query: Schema.Struct({ color: Schema.String }),
  },
  Method: 'GET',
  getPath: ({ id }) => `users/${id.toString()}/crayons`,
  Output: Schema.Struct({ crayons: Schema.Array(Schema.String) }),
});

export const GetUserCrayon = Endpoint({
  Input: {
    Params: Schema.Struct({ userId: Schema.Number, crayonId: Schema.Number }),
    Query: Schema.Struct({ color: Schema.String }),
  },
  Method: 'GET',
  getPath: ({ userId, crayonId }) => `users/${userId.toString()}/crayons/${crayonId.toString()}`,
  Output: Schema.Struct({ crayons: Schema.Array(Schema.String) }),
});

export const ListCrayons = Endpoint({
  Input: {
    Query: Schema.Struct({ color: Schema.String }),
  },
  Method: 'GET',
  getPath: () => `users/crayons`,
  Output: Schema.Struct({ crayons: Schema.Array(Schema.String) }),
});

export const CreateCrayon = Endpoint({
  Input: {
    Body: Schema.Struct({ color: Schema.String }),
  },
  Method: 'POST',
  getPath: () => `users/crayons`,
  Output: Schema.Struct({ crayons: Schema.Array(Schema.String) }),
});

export const EditCrayon = Endpoint({
  Input: {
    Params: Schema.Struct({ id: Schema.Number }),
    Body: Schema.Struct({ color: Schema.String }),
  },
  Method: 'PUT',
  getPath: ({ id }) => `users/${id.toString()}/crayons`,
  Output: Schema.Struct({ crayons: Schema.Array(Schema.String) }),
});

export const DeleteCrayon = Endpoint({
  Input: {
    Params: Schema.Struct({ id: Schema.Number }),
  },
  Method: 'DELETE',
  getPath: ({ id }) => `users/${id.toString()}/crayons`,
  Output: Schema.Struct({ crayons: Schema.Array(Schema.String) }),
});
