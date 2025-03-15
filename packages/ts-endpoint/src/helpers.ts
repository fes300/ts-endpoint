import { runtimeType } from 'ts-io-error/lib/Codec';
import { RequiredKeys } from 'typelevel-ts';

export const addSlash = (s: string) => (s.slice(0, 1) === '/' ? s : `/${s}`);

export type DecodedPropsType<P> = P extends {}
  ? { [k in RequiredKeys<P>]: runtimeType<P[k]> }
  : never;

export type KnownErrorStatus<W> = undefined extends W
  ? undefined
  : W extends Record<infer K, any>
  ? K
  : undefined;

export type KnownErrorBody<W> = undefined extends W
  ? undefined
  : W extends Record<any, infer V>
  ? V
  : undefined;