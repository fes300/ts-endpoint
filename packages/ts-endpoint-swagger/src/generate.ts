/**
 * Swagger provider
 *
 * Generate Swagger configuration from our endpoints definition
 *
 * Here is a the OpenAPI Specs used by swagger
 *
 * https://swagger.io/docs/specification/about/
 */

import * as R from 'fp-ts/lib/Record';
import { flow, pipe } from 'fp-ts/lib/function';
import * as S from 'fp-ts/lib/string';
import * as t from 'io-ts';
import { MinimalEndpointInstance } from 'ts-endpoint/lib';
import { getOpenAPISchema, getOpenAPISchemaFromModel } from './IOTSToOpenAPISchema';
import { DocConfig } from './types';
import { getPaths } from './paths';
import { getInnerSchemaName } from './transformEndpoint';
import * as E from 'fp-ts/Either';

export const defaultGetDocumentation = (e: MinimalEndpointInstance) =>
  e.title ??
  (typeof e.description === 'string' ? e.description : undefined) ??
  `${e.Method}: ${e.getStaticPath((a) => `:${a}`)}`;

const DEFAULT_SCHEMA = {
  any: {
    type: 'any',
    description: 'Any value',
  },
  string: {
    type: 'string',
    description: 'A string value',
  },
  url: {
    type: 'string',
    description: 'A valid URL',
  },
  boolean: {
    type: 'boolean',
    description: 'A `true | false` value',
  },
};

interface ModelSchema {}

const generateModelSchema = (config: DocConfig): ModelSchema => {
  const initialSchema = {
    any: t.any,
    ...config.models,
  };
  const modelSchemaF = getOpenAPISchemaFromModel(initialSchema);
  const modelSchema = pipe(
    initialSchema,
    R.reduceWithIndex(S.Ord)(DEFAULT_SCHEMA, (_key, acc, model) => {
      console.debug('Model %O', model);
      const modelSchema = getOpenAPISchema(model);
      modelSchemaF(model);
      // console.debug('Model schema %O', modelSchema);
      if (model.name) {
        return {
          ...acc,
          [getInnerSchemaName(model.name)]: modelSchema,
        };
      }

      return acc;
    })
  );

  return modelSchema;
};

export const generate = (
  config: DocConfig,
  getDocumentation?: (path: MinimalEndpointInstance) => string
): E.Either<Error, any> => {
  return E.tryCatch(() => {
    const getDocs = getDocumentation ?? defaultGetDocumentation;

    const modelSchema = generateModelSchema(config);
    // console.log('model schema', JSON.stringify(modelSchema, null, 2));

    const { paths } = getPaths(config.endpoints, getDocs, modelSchema);
    // console.log('paths', paths);

    return {
      openapi: '3.0.3',
      info: {
        title: config.title,
        description: config.description,
        version: config.version,
      },
      servers: [
        {
          url: `{protocol}://{host}{port}/{basePath}`,
          description: 'Node Server',
          variables: {
            protocol: { default: config.server.protocol },
            host: { default: config.server.host },
            port: {
              default: config.server.port,
              enum: [config.server.port, '443'],
            },
            basePath: {
              default: config.server.basePath,
            },
          },
        },
      ],
      security: config.security,
      components: {
        securitySchemes: config.components.security,
        schemas: {
          ...modelSchema,
        },
      },
      paths,
    };
  }, E.toError);
};

export const generateOrFail = flow(
  generate,
  E.fold(
    (e) => {
      throw e;
    },
    (r) => r
  )
);
