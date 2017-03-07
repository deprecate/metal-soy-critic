const {getFixturePath} = require('../../test/util');
const validateFile = require('../validate-file');

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
});
