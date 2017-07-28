import transform from '../string-transformer';

describe('string-transformer', () => {
  it('should allow for replacements', () => {
    const result = transform('FooBar', '(Foo)', '{$1}');

    expect(result).toBe('Foo');
  });

  it('should allow for multiple replacements', () => {
    let result = transform('23Bar42', '(\\d+)Bar(\\d+)', '{$2}Foo{$1}');
    expect(result).toBe('42Foo23');

    result = transform('Something.js', '(\\S+).js', '{$1}.java');
    expect(result).toBe('Something.java');
  });

  it('should throw an error if fails to match input', () => {
    expect(() => transform('23Bar42', 'Baz', '')).toThrowError();
  });
});
