import {getFixture} from '../../test/util';
import soyParser from '../soy-parser';

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

    expect(soyParser(input)).toMatchSnapshot();
  });

  test('should parse deltemplates', () => {
    const input = getFixture('DelTemplate.soy');

    expect(soyParser(input)).toMatchSnapshot();
  });

  test('should parse private templates', () => {
    const input = getFixture('PrivateTemplate.soy');

    expect(soyParser(input)).toMatchSnapshot();
  });
});
