import { Endpoint } from 'ts-endpoint';
import { generate } from '../generate';
import { DocConfig } from '../types';
import * as t from 'io-ts';

const docConfig: DocConfig = {
  title: 'Doc Config',
  description: 'Base doc config',
  version: 'v0',
  endpoints: {},
  models: {},
  server: {
    protocol: 'http',
    basePath: '/',
    host: 'localhost',
    port: 8000,
  },
  components: {
    security: {
      jwt: {
        type: 'apiKey',
        name: 'authorization',
        in: 'header',
      },
    },
  },
  security: [{ jwt: [] }],
};

const expectedOpenAPI = {
  openapi: '3.0.3',
  info: {
    title: docConfig.title,
    description: docConfig.description,
    version: docConfig.version,
  },
  servers: [
    {
      variables: {
        protocol: {
          default: docConfig.server.protocol,
        },
        port: {
          default: docConfig.server.port,
        },
        host: {
          default: docConfig.server.host,
        },
      },
    },
  ],
  security: [{ jwt: [] }],
  components: {
    securitySchemes: { jwt: {} },
  },
  paths: {},
};

describe('generateDoc', () => {
  test('should output open api doc without paths', () => {
    const openAPIDoc = generate(docConfig, (e) => e.description?.toString() ?? e.title ?? '');

    console.log(openAPIDoc);

    expect(openAPIDoc).toMatchObject(expectedOpenAPI);
  });

  test('should output open api doc with a single path', () => {
    const GETDummyParams = t.type({ id: t.string }, 'GETDummyParams');
    const GETDummyOutput = t.type({ name: t.string }, 'DummyOutput');
    const dummyGet = Endpoint({
      title: 'GET dummy resource',
      Method: 'GET',
      getPath: ({ id }) => `/dummy/${id}`,
      Input: {
        Params: GETDummyParams,
      },
      Output: GETDummyOutput,
    });
    const openAPIDoc = generate(
      {
        ...docConfig,
        models: {
          GETDummyParams,
          GETDummyOutput,
        },
        endpoints: { v0: { dummy: { get: dummyGet } } },
      },
      (e) => e.description?.toString() ?? e.title ?? ''
    );

    console.log(openAPIDoc.paths);

    expect(openAPIDoc).toMatchObject({
      ...expectedOpenAPI,
      paths: {
        '/dummy/{id}': {
          get: {
            parameters: [
              {
                in: 'path',
                name: 'id',
                schema: {
                  description: 'string',
                  type: 'string',
                },
              },
            ],
            responses: {
              200: {
                description: 'DummyOutput',
                content: {
                  'application/json': {
                    schema: {
                      $ref: `#/components/schemas/DummyOutput`,
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          DummyOutput: {
            description: 'DummyOutput',
            properties: {
              name: {
                description: 'string',
                type: 'string',
              },
            },
          },
        },
      },
    });
  });

  test('should output open api doc with many paths', () => {
    const GETDummyParams = t.type({ id: t.string }, 'GETDummyParams');
    const GETDummyOutput = t.type({ name: t.string }, 'DummyOutput');
    const dummyGet = Endpoint({
      title: 'GET dummy resource',
      Method: 'GET',
      getPath: ({ id }) => `/dummy/${id}`,
      Input: {
        Params: GETDummyParams,
      },
      Output: GETDummyOutput,
    });

    const GETDummyBody = t.type({ name: t.string, description: t.string }, 'GETDummyParams');
    const dummyPost = Endpoint({
      title: 'Create dummy resource',
      Method: 'POST',
      getPath: () => `/dummy/`,
      Input: {
        Body: GETDummyBody,
      },
      Output: GETDummyOutput,
    });

    const result = generate({
      ...docConfig,
      endpoints: {
        v0: {
          dummy: {
            get: dummyGet,
            post: dummyPost,
          },
        },
      },
      models: { GETDummyParams, GETDummyBody, GETDummyOutput },
    });

    expect(result).toMatchSnapshot();
  });
});
