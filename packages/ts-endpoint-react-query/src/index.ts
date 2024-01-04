import { pipe } from 'fp-ts/lib/function';
import * as A from 'fp-ts/Array';
import * as R from 'fp-ts/Record';
import { type EndpointsRESTClient } from 'ts-endpoint-rest-client/lib/index';
import { toQueries } from './QueryProvider';
import {
  toOverrideQueries,
  type CustomQueryOverride,
  type QueryProviderOverrides,
  type ResourceEndpointsQueriesOverride,
} from './QueryProviderOverrides';
import { type GetQueryProviderImplAt, type QueryProvider, type ResourceQuery } from './types';

type PatchedQueryProvider<ES, O extends Record<string, any>> = QueryProvider<ES> & {
  [K in keyof QueryProviderOverrides<ES, O>]: QueryProviderOverrides<
    ES,
    O
  >[K] extends ResourceEndpointsQueriesOverride<ES, any, any, infer CC>
    ? {
        Custom: {
          [KK in keyof CC]: CC[KK] extends CustomQueryOverride<ES, infer P, infer Q, infer O>
            ? ResourceQuery<P, Q, O>
            : GetQueryProviderImplAt<ES, K, KK>;
        };
      }
    : GetQueryProviderImplAt<ES, K>;
};

const CreateQueryProvider = <ES, O extends Record<string, any>>(
  apiRESTClient: EndpointsRESTClient<ES>,
  overrides?: QueryProviderOverrides<ES, O>
): PatchedQueryProvider<ES, O> => {
  const queryProvider = pipe(
    apiRESTClient,
    R.toArray,
    A.reduce({}, (q, [k, e]) => {
      const override = overrides?.[k] ?? undefined;
      return {
        ...q,
        [k]: toQueries(k, e, override),
      };
    })
  ) as QueryProvider<ES>;

  let queryProviderOverrides: any = {};
  if (overrides) {
    queryProviderOverrides = pipe(
      overrides,
      R.toArray,
      A.reduce({}, (q, [k, e]) => {
        return {
          ...q,
          [k]: toOverrideQueries(apiRESTClient, k, e),
        };
      })
    );
  }

  const patchedQueryProvider = pipe(
    queryProvider,
    R.toArray,
    A.reduce({}, (q, [k, e]) => {
      const def = queryProviderOverrides[k];
      if (def) {
        const { Custom, ...rest } = queryProviderOverrides[k];
        return {
          ...q,
          [k]: {
            get: rest.get ?? e.get,
            list: rest.list ?? e.list,
            Custom: {
              ...(e.Custom as any),
              ...Custom,
            },
          },
        };
      }
      return { ...q, [k]: e };
    })
  ) as PatchedQueryProvider<ES, O>;

  return patchedQueryProvider;
};

export { CreateQueryProvider, type QueryProvider };
