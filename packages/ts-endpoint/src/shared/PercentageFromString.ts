import * as t from 'io-ts';
import { NumberFromString } from 'io-ts-types';
// a unique brand for positive numbers
interface PercentageFromStringBrand {
  readonly PercentageFromString: unique symbol;
}

export const PercentageFromString = t.brand(
  NumberFromString,
  (n): n is t.Branded<number, PercentageFromStringBrand> => n >= 0 && n <= 1,
  'PercentageFromString'
);

export type PercentageFromString = t.TypeOf<typeof PercentageFromString>;
