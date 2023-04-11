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
import { MinimalEndpoint, MinimalEndpointInstance } from 'ts-endpoint/lib';
import { getOpenAPISchemaFromModel } from './IOTSToOpenAPISchema';

/**
 * Check the endpoint has body defined
 *
 */

interface MinimalEndpointWithBody extends Omit<MinimalEndpoint, 'Input'> {
  Input: {
    Body: any;
  };
}
const hasRequestBody = (e: any): e is MinimalEndpointWithBody => {
  return (
    (e.Method === 'POST' || e.Method === 'PUT' || e.Method === 'PATCH') &&
    (e.Input as any)?.Body !== undefined
  );
};

export const getInnerSchemaName = (tt: string): string => {
  if (tt.startsWith('Array<')) {
    // console.log(tt);
    const innerName = tt.replace('Array<', '').replace('>', '');
    // console.log('inner name', innerName);
    return innerName;
  }

  return tt;
};

/**
 * generate the Open API schema from endpoint
 */
export const apiSchemaFromEndpoint = (
  key: string,
  e: MinimalEndpointInstance,
  tags: string[],
  getDocumentation: (e: MinimalEndpointInstance) => string,
  models: { [key: string]: any }
): any => {
  const getRefOrAPISchema = getOpenAPISchemaFromModel(models);
  const responseStatusCode = e.Method === 'POST' ? 201 : 200;

  const input = e.Input;

  const Headers = (input as any).Headers;

  // derive headers from io-ts definition of e.Input.Headers
  const headerParameters =
    Headers !== undefined
      ? R.keys(Headers.props).reduce<any[]>(
          (acc, k) =>
            acc.concat({
              name: k,
              in: 'header',
              required: false,
              schema: getRefOrAPISchema((Headers?.props)[k]),
            }),
          []
        )
      : [];

  // add security when "x-authorization" header is defined
  const security = Headers?.props?.['x-authorization'] !== undefined ? [{ ACTToken: [] }] : [];

  const Query = (input as any).Query;

  // derive query parameters from io-ts definition of e.Input.Query
  const queryParameters =
    Query !== undefined
      ? R.keys(Query.props).reduce<any[]>(
          (acc, k) =>
            acc.concat({
              name: k,
              in: 'query',
              required: Query?._tag === 'PartialType',
              schema: getRefOrAPISchema((Query?.props)[k]),
            }),
          []
        )
      : [];

  const Params = (input as any).Params;
  // derive path parameters from io-ts definition of e.Input.Params
  const pathParameters =
    Params !== undefined
      ? R.keys(Params.props).reduce<any[]>((acc, k) => {
          const { required, ...schema } = getRefOrAPISchema((Params?.props)[k]);
          return acc.concat({
            name: k,
            in: 'path',
            required: true,
            schema,
          });
        }, [])
      : [];

  // combine all parameters
  const parameters = [...headerParameters, ...queryParameters, ...pathParameters];
  //   console.log('parameters', parameters);

  // add definition of request body, if needed

  const requestBody = hasRequestBody(e)
    ? {
        requestBody: {
          content: {
            'application/json': {
              schema: {
                allOf: [
                  {
                    $ref: `#/components/schemas/${getInnerSchemaName((e.Input.Body as any).name)}`,
                  },
                ],
              },
            },
          },
        },
      }
    : {};

  const schemaName = getInnerSchemaName((e.Output as any).name);

  // define success response
  const successResponse = {
    [responseStatusCode]: {
      description: schemaName,
      content: {
        'application/json': {
          schema: {
            allOf: [
              {
                $ref: `#/components/schemas/${schemaName}`,
              },
            ],
          },
        },
      },
    },
  };

  // TODO: define error response

  // eslint-disable-next-line
  // console.log(schemaName, { hasDocumentationMethod, description });

  return {
    summary: (e as any).title ?? key,
    description: getDocumentation(e),
    tags,
    parameters,
    security,
    ...requestBody,
    responses: {
      ...successResponse,
    },
  };
};
