import * as t from 'io-ts';

export interface PercentageBrand {
  readonly Percentage: unique symbol;
}

export const Percentage = t.brand(
  t.number,
  (n): n is t.Branded<number, PercentageBrand> => n >= 0 && n <= 1,
  'Percentage'
);

export type Percentage = t.TypeOf<typeof Percentage>;
