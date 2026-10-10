import { MaskPipe } from './mask.pipe';

describe('MaskPipe', () => {
  const pipe = new MaskPipe();

  it('should mask all but last 4 chars by default', () => {
    expect(pipe.transform('1234567890')).toBe('●●●●●●7890');
  });

  it('should return full value when reveal is true', () => {
    expect(pipe.transform('1234567890', true)).toBe('1234567890');
  });

  it('should return em dash for null', () => {
    expect(pipe.transform(null)).toBe('—');
  });

  it('should return em dash for empty string', () => {
    expect(pipe.transform('')).toBe('—');
  });

  it('should mask entire value when shorter than visibleChars', () => {
    expect(pipe.transform('123')).toBe('●●●');
  });

  it('should respect custom visibleChars count', () => {
    expect(pipe.transform('123456789', false, 2)).toBe('●●●●●●●89');
  });
});
