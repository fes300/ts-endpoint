/**
 * Swagger provider
 *
 * Generate Swagger configuration from our endpoints definition
 *
 * Here is a the OpenAPI Specs used by swagger
 *
 * https://swagger.io/docs/specification/about/
 */

import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import * as fs from 'fs';
import * as path from 'path';
import { MinimalEndpointInstance } from 'ts-endpoint/lib';
import { defaultGetDocumentation, generate } from './generate';
import { DocConfig } from './types';
import { validate } from './validate';

const getDocumentation = (e: MinimalEndpointInstance): string => {
  if (typeof e.description === 'object' && e.description.path) {
    return fs.readFileSync((e as any).description.path, 'utf-8');
  }

  return defaultGetDocumentation(e);
};

export const writeTo = (config: DocConfig, to: string, v?: boolean): TE.TaskEither<Error, void> => {
  return pipe(
    generate(config, getDocumentation),
    TE.fromEither,
    TE.chainFirst(() =>
      TE.tryCatch(
        async () => {
          fs.mkdirSync(to, { recursive: true });
          return await Promise.resolve();
        },
        (e) => e as any
      )
    ),
    TE.map((api) => {
      // this file is unused, but is needed to see what
      // comes from generateDoc
      fs.writeFileSync(path.resolve(to, 'open-api-unchecked.json'), JSON.stringify(api, null, 2));
      return api;
    }),
    TE.chain((api) => (v ? validate(api) : TE.right(api))),
    TE.map((api) => {
      fs.writeFileSync(path.resolve(to, 'open-api.json'), JSON.stringify(api, null, 2));
      return api;
    })
  );
};
