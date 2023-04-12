import { IOTOpenDocSchema } from './IOTSToOpenAPISchema';
import {
  MinimalEndpointInstance
} from 'ts-endpoint/lib';

interface ServerConfig {
  protocol: 'http' | 'https';
  host: string;
  port: number;
  basePath: string;
}

export interface DocConfig {
  title: string;
  description: string;
  version: string;
  endpoints: {
    // version
    [key: string]: {
      // scope (public, creator)
      [key: string]: {
        // endpoint name
        [key: string]: MinimalEndpointInstance;
      };
    };
  };
  models: {
    [key: string]: IOTOpenDocSchema;
  };
  server: ServerConfig;
  components: {
    security: {
      [key: string]: {
        type: 'http' | 'apiKey';
        name: string;
        in: 'header';
        scheme: 'bearer';
        bearerFormat?: 'JWT';
      };
    };
  };
  security: [{ [key: string]: string[] }];
}