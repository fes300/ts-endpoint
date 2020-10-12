import * as t from 'io-ts'

export interface BearerTokenBrand {
  readonly BearerToken: unique symbol
}

const bearerRexExp = /Bearer+\s[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/

export const BearerToken = t.brand(
  t.string,
  (u: string): u is t.Branded<string, BearerTokenBrand> => bearerRexExp.test(u),
  'BearerToken',
)

export type BearerToken = t.TypeOf<typeof BearerToken>