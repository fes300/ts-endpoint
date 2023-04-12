/**
 * Swagger provider
 *
 * Generate Swagger configuration from our endpoints definition
 *
 * Here is a the OpenAPI Specs used by swagger
 *
 * https://swagger.io/docs/specification/about/
 */

import * as O from 'fp-ts/lib/Option';
import * as R from 'fp-ts/lib/Record';
import { pipe } from 'fp-ts/lib/function';
import * as S from 'fp-ts/lib/string';
import { MinimalEndpointInstance } from 'ts-endpoint/lib';
import { apiSchemaFromEndpoint, getInnerSchemaName } from './transformEndpoint';
import { DocConfig } from './types';

export const getPaths = (
  endpoints: DocConfig['endpoints'],
  getDocumentation: (path: MinimalEndpointInstance) => string,
  models: { [key: string]: any }
): {
  paths: any;
  schemas: any;
} => {
  return pipe(
    endpoints,
    R.reduceWithIndex(S.Ord)(
      { paths: {}, schemas: {} },
      (_versionKey, versionAcc, versionEndpoints) => {
        return pipe(
          versionEndpoints,
          R.reduceWithIndex(S.Ord)(versionAcc, (_scopeKey, scopeAcc, scopeEndpoints) => {
            return pipe(
              scopeEndpoints,
              R.reduceWithIndex(S.Ord)({ paths: {}, schemas: {} }, (key, endpointAcc, endpoint) => {
                // get swagger compatible path
                const endpointStaticPath = endpoint.getStaticPath((param) => `{${param}}`);
                const prevEndpoints = (endpointAcc.paths as any)[endpointStaticPath] ?? undefined;

                const previousMethodSchema = prevEndpoints?.[endpoint.Method.toLowerCase()];
                const currentEndpointSchema = apiSchemaFromEndpoint(
                  key,
                  endpoint,
                  (endpoint as any).tags ?? ['all'],
                  getDocumentation,
                  models
                );

                console.log('current endpoint schema', JSON.stringify(currentEndpointSchema));

                const currentSchema = pipe(
                  (endpoint.Output as any)?.name,
                  O.fromNullable,
                  O.chain((name) => {
                    const hasRef = !!models[name];
                    if (hasRef) {
                      return O.some({
                        [getInnerSchemaName(name)]: {
                          type: 'object',
                          item: { allOf: { $ref: `#/components/schemas/${name}` } },
                        },
                      });
                    }
                    return O.none;
                  }),
                  O.getOrElse(() => ({}))
                );

                return {
                  schemas: {
                    ...currentSchema,
                  },
                  paths: {
                    ...endpointAcc.paths,
                    [endpointStaticPath]: {
                      ...prevEndpoints,
                      ...previousMethodSchema,
                      [endpoint.Method.toLowerCase()]: currentEndpointSchema,
                    },
                  },
                };
              }),
              (endpointResult) => ({
                schemas: { ...scopeAcc.schemas, ...endpointResult.schemas },
                paths: { ...scopeAcc.paths, ...endpointResult.paths },
              })
            );
          }),
          (defs) => ({
            paths: {
              ...versionAcc.paths,
              ...defs.paths,
            },
            schemas: {
              ...versionAcc.schemas,
              ...defs.schemas,
            },
          })
        );
      }
    )
  );
};
