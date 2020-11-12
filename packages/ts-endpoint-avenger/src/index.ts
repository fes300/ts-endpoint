import { Eq } from 'fp-ts/lib/Eq';
import { CacheValue } from 'avenger/lib/CacheValue';
import { StrategyBuilder } from 'avenger/lib/Query';
import { Endpoint, EndpointInstance } from 'ts-endpoint';
import { IOError } from 'ts-shared/lib/errors';
import { ObservableQuery } from 'avenger/lib/Query';

/**
 * helper to filter out keys of an object whose value is not the target
 * @example
 * ```
 * type A = { a: string, b: number }
 * type OnlyNumberKeys<C> = { [K in keyof C as FilterIn<K, C[K], number>]: C[K] }
 * type E = OnlyNumberKeys<A> // type is { b: number }
 * ```
 */
type FilterIn<K, V, F> = V extends F ? K : never

type TSCompose<A> = A;
type TSproduct<A> = A;

type TSQuery<E extends EndpointInstance<any> | TSCompose<any> | TSproduct<any>> = E extends EndpointInstance<infer EP> ? EP extends Endpoint<
  any,
  infer O,
  any,
  any,
  infer B,
  any
  >
    ? {
      type: 'Query';
      IOCheck: Eq<CacheValue<IOError, O>>;
      FetchStrategy: StrategyBuilder<B, IOError, O>;
      endpoint: E;
    }
    : never
  : never;

type TSCommand<E extends EndpointInstance<any>, ES extends Record<string, TSQuery<any>>> = {
  type: 'Command';
  endpoint: E;
  invalidates: Partial<ES>;
};

type TSEndpoint<E extends EndpointInstance<any>, ES extends Record<string, TSQuery<any>>> =
  | TSQuery<E>
  | TSCommand<E, ES>;

type EndpointToQuery<E extends EndpointInstance<Endpoint<any, any>>> = E extends EndpointInstance<infer EP> ? EP extends Endpoint<
    any,
    infer O,
    any,
    infer Q,
    any,
    any
  >
    ? ObservableQuery<Q, IOError, O>
    : never
  : never;

export declare function GetAvengerClient<ES extends Record<string, TSEndpoint<any, any>>>(
  e: ES
): {
  queries: {
    [K in keyof ES as FilterIn<K, ES[K], TSQuery<ES[K]["endpoint"]>>]: EndpointToQuery<ES[K]["endpoint"]>
  };
  commands: {
    [K in keyof ES as FilterIn<K, ES[K], TSCommand<ES[K]["endpoint"], {[k in keyof ES as FilterIn<K, ES[K], TSQuery<any>>]: ES[K]["endpoint"]}>>]: ES[K]
  };
};
