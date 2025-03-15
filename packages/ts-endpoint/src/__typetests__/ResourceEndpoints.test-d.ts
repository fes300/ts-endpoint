import { assertType, test } from 'vitest';
import { ResourceEndpoints, ResourceEndpointsTypeOf } from '../ResourceEndpoint';
import { CreateCrayon, GetUserCrayons, ListCrayons } from '../__test__/samples';

test('ResourceEndpoints', async () => {
  // @ts-expect-error
  assertType(ResourceEndpoints({}));

  const resourceEndpoints = ResourceEndpoints({
    Get: GetUserCrayons,
    List: ListCrayons,
    Create: CreateCrayon,
    Edit: CreateCrayon,
    Delete: CreateCrayon,
    Custom: {},
  });

  assertType<ResourceEndpointsTypeOf<typeof resourceEndpoints>['Get']['Input']['Params']>({
    id: 1
  });
});
