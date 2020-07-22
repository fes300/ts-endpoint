import { PercentageFromString } from '../PercentageFromString';

describe('PercentageFromString', () => {
  it('well formatted PercentageFromString should pass validation', () => {
    const result = PercentageFromString.decode('0.2');
    const result2 = PercentageFromString.decode('1');
    const result3 = PercentageFromString.decode('0');

    expect(result._tag).toEqual('Right');
    expect(result2._tag).toEqual('Right');
    expect(result3._tag).toEqual('Right');
  });
  it('wrongly formatted PercentageFromString should NOT pass validation', () => {
    const result = PercentageFromString.decode('-0.2');
    const result2 = PercentageFromString.decode('1.2');
    const result3 = PercentageFromString.decode('0,2');
    const result4 = PercentageFromString.decode('foo');
    expect(result._tag).toEqual('Left');
    expect(result2._tag).toEqual('Left');
    expect(result3._tag).toEqual('Left');
    expect(result4._tag).toEqual('Left');
  });
});
