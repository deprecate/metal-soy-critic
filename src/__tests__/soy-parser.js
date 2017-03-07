const soyParser = require('../soy-parser');
const {getFixture} = require('../../test/util');

describe('Soy Parser', () => {
  test('should parse file correctly', () => {
    const input = getFixture('Test.soy');

    const ast = soyParser(input);

    expect(ast).toMatchSnapshot();
  });

  test('should fail to parse file', () => {
    const input = getFixture('Invalid.soy');

    expect(() => soyParser(input)).toThrow();
  });
});
