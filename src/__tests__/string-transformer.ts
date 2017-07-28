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

  it('should apply filters to match input', () => {
    const result = transform('FooBAR', 'Foo(BAR)', '{$1|lower}');

    expect(result).toBe('bar');
  });

  it('should apply multipe filters to matched input', () => {
    const result = transform('SomeThing.js', '(\\S+).js', '{$1|snake|upper}.js');

    expect(result).toBe('SOME_THING.js');
  });

  it('should work with default values', () => {
    const result = transform('SomeThing.js', '(.*)', '{$1}');

    expect(result).toBe('SomeThing.js');
  });
});
