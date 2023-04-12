/**
 * OpenAPI validate function
 *
 * Here is a the OpenAPI Specs used by swagger
 *
 * https://swagger.io/docs/specification/about/
 */

import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { validate: openAPIValidate } = require('@apidevtools/swagger-cli');

export const validate = (openDocAPI: unknown): TE.TaskEither<any, any> => {
  return pipe(
    TE.tryCatch(
      () => {
        return new Promise((resolve, reject) => {
          openAPIValidate(openDocAPI, { schema: false, spec: true }, (err: any) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(openDocAPI);
          });
        });
      },
      (e: any) => e.toJSON()
    )
  );
};
