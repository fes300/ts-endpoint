import { Percentage } from '../Percentage';

describe('Percentage', () => {
  it('well formatted Percentage should pass validation', () => {
    const result = Percentage.decode(0.2);
    const result2 = Percentage.decode(1);
    const result3 = Percentage.decode(0);

    expect(result._tag).toEqual('Right');
    expect(result2._tag).toEqual('Right');
    expect(result3._tag).toEqual('Right');
  });
  it('wrongly formatted Percentage should NOT pass validation', () => {
    const result = Percentage.decode(-0.2);
    const result2 = Percentage.decode(1.2);
    const result3 = Percentage.decode('foo');
    expect(result._tag).toEqual('Left');
    expect(result2._tag).toEqual('Left');
    expect(result3._tag).toEqual('Left');
  });
});
