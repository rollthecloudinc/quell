import { NumeralPipe } from './numeral.pipe';

describe('NumeralPipe', () => {
  it('create an instance', () => {
    const pipe = new NumeralPipe();
    expect(pipe).toBeTruthy();
  });
});
