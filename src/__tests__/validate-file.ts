import {getFixturePath}  from '../../test/util';
import validateFile from '../validate-file';

describe('Validate file', () => {
  function validate(fileName) {
    return validateFile(getFixturePath(fileName));
  }

  test('should pass', () => validate('Test.soy').then(result => {
    expect(result.status).toBe(true);
  }));

  test('should pass; method param', () => validate('MethodParam.soy').then(result => {
    expect(result.status).toBe(true);
    expect(result.messages.length).toBe(0);
  }));

  test('should pass; ignores subclasses', () => validate('IgnoreSubclass.soy').then(result => {
    expect(result.status).toBe(true);
    expect(result.messages.length).toBe(0);
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

  test('should fail; noop events', () => validate('NoopEvents.soy').then(result => {
    expect(result.status).toBe(false);
    expect(result.messages).toMatchSnapshot();
  }));

  test('should fail; sorted params', () => validate('SortedParams.soy').then(result => {
    expect(result.status).toBe(false);
    expect(result.messages).toMatchSnapshot();
  }));

  test('should fail; sorted param declarations', () => validate('SortedParamDeclarations.soy').then(result => {
    expect(result.status).toBe(false);
    expect(result.messages).toMatchSnapshot();
  }));

  test('should fail; sorted map keys', () => validate('UnsortedMap.soy').then(result => {
    expect(result.status).toBe(false);
    expect(result.messages).toMatchSnapshot();
  }));

  test('should fail; sorted map keys', () => validate('BadTernaryElvis.soy').then(result => {
    expect(result.status).toBe(false);
    expect(result.messages).toMatchSnapshot();
  }));
});
