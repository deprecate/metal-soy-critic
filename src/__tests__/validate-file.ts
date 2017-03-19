import {getFixturePath}  from '../../test/util';
import validateFile from '../validate-file';

describe('Validate file', () => {
  function validate(fileName) {
    return validateFile(getFixturePath(fileName));
  }

  test('should pass', () => validate('Test.soy').then(result => {
      expect(result.status).toBe(true);
  }));

  test('should fail; missing params', () => validate('MissingParams.soy').then(result => {
      expect(result.status).toBe(false);
      expect(result.messages).toMatchSnapshot();
  }));

  test('should fail; missing internal', () => validate('MissingInternal.soy').then(result => {
      expect(result.status).toBe(false);
      expect(result.messages).toMatchSnapshot();
  }));

  test('should fail; missing import', () => validate('MissingCallImport.soy').then(result => {
      expect(result.status).toBe(false);
      expect(result.messages).toMatchSnapshot();
  }));

  test('should fail; missing required', () => validate('MissingRequired.soy').then(result => {
      expect(result.status).toBe(false);
      expect(result.messages).toMatchSnapshot();
  }));

  test('should fail; invalid namespace', () => validate('InvalidNamespace.soy').then(result => {
      expect(result.status).toBe(false);
      expect(result.messages).toMatchSnapshot();
  }));

  test('should fail; missing render', () => validate('MissingRender.soy').then(result => {
      expect(result.status).toBe(false);
      expect(result.messages).toMatchSnapshot();
  }));

  test('should fail; invalid javascript', () => validate('InvalidJS.soy').then(result => {
      expect(result.status).toBe(false);
      expect(result.messages).toMatchSnapshot();
  }));
});
