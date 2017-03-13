const soyParser = require('../soy-parser');
const {getFixture} = require('../../test/util');

describe('Soy Parser', () => {
  test('should parse file correctly', () => {
    const input = getFixture('Test.soy');

    expect(soyParser(input)).toMatchSnapshot();
  });

  test('should fail to parse file', () => {
    const input = getFixture('Invalid.soy');

    expect(() => soyParser(input)).toThrow();
  });

  test('should parse nested calls', () => {
    const input = getFixture('NestedCalls.soy');

    try {
      soyParser(input);
    } catch(e) {
      console.log(e);
    }

    expect(soyParser(input)).toMatchSnapshot();
  });
});
