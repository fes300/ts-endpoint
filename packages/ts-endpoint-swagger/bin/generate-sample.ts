import * as t from 'io-ts';
import * as path from 'path';
import { Endpoint } from 'ts-endpoint';
import { writeTo } from '../src';
import { DateFromISOString } from 'io-ts-types/lib/DateFromISOString';

const GetDummyParams = t.type({ id: t.string }, 'GetDummyParams');
const CreateDummyBody = t.type({ name: t.string }, 'CreateDummyBody');
const Dummy = t.strict({ id: t.string, name: t.string, createdAt: DateFromISOString }, 'Dummy');

const GetDummy = Endpoint({
  title: 'GET dummy sample',
  description: 'Dummy sample has the form of Dummy',
  Method: 'GET',
  getPath: ({ id }) => `/dummy/${id}`,
  Input: {
    Params: GetDummyParams,
  },
  Output: Dummy,
  tags: ['dummy'],
});

const GetDummies = Endpoint({
  Method: 'GET',
  getPath: () => `/dummy`,
  Input: {
    Query: t.type({}),
  },
  Output: Dummy,
  tags: ['dummy'],
});

const PostDummy = Endpoint({
  Method: 'POST',
  getPath: () => `/dummy`,
  Input: {
    Body: CreateDummyBody,
  },
  Output: Dummy,
  tags: ['dummy'],
});

const models = { GetDummyParams, CreateDummyBody, Dummy };
const endpoints = { v0: { dummy: { GetDummy, GetDummies, PostDummy } } };

const run = () => {
  const v = true;
  const to = path.resolve(process.cwd(), 'examples');

  return writeTo(
    {
      title: 'Sample Open API',
      description: 'Sample server of dummy objects',
      version: 'v0',
      server: {
        port: 3005,
        protocol: 'http',
        host: 'ts-endpoint.federicosordillo.com',
        basePath: '/api',
      },
      components: {
        security: {
          jwt: {
            in: 'header',
            type: 'http',
            name: 'Authorization',
            scheme: 'bearer',
          },
        },
      },
      security: [{ jwt: [] }],
      models,
      endpoints,
    },
    to,
    v
  );
};

run()().then(console.log).catch(console.error);
