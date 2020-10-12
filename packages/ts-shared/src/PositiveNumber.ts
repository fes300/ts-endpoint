import * as t from 'io-ts';

export interface PositiveNumberBrand {
  readonly PositiveNumber: unique symbol;
}

export const PositiveNumber = t.brand(
  t.number,
  (posNum): posNum is t.Branded<number, PositiveNumberBrand> => posNum >= 0,
  'PositiveNumber'
);

export type PositiveNumber = t.TypeOf<typeof PositiveNumber>;
