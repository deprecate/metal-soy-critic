import * as process from 'process';
import * as Config from '../config';

describe('config', () => {
  describe('getConfigFilePath', () => {
    const cwd = process.cwd();

    afterAll(() => {
      process.chdir(cwd);
    });

    it('should return null if no file is found', () => {
      const path = Config.getConfigFilePath();

      expect(path).toBeNull();
    });

    it('should return a string if a file is found', () => {
      process.chdir('./test/fixtures/config');

      const path = Config.getConfigFilePath();

      expect(path).toMatch(/\.soycriticrc/);
    });
  });

  describe('readConfig', () => {
    const cwd = process.cwd();

    afterEach(() => {
      process.chdir(cwd);
    });

    it('should return a default configuration if no file is found', () => {
      const config = Config.readConfig();

      expect(config).toBeInstanceOf(Object);
      expect(config.callToImport).toEqual([{regex: '(.*)', replace: '{$1}'}]);
    });

    it('should return a configuration specified in a file', () => {
      process.chdir('./test/fixtures/config');

      const config = Config.readConfig();

      expect(config.callToImport).toEqual([{regex: '(\\S+)', replace: '{$1|param}'}]);
    });

    it('should read config files with a json extension', () => {
      process.chdir('./test/fixtures/config-json');

      const config = Config.readConfig();

      expect(config.callToImport).toEqual([{regex: 'json', replace: '{$1|param}'}]);
    });

    it('should return a converted configuration specified in a file if is found in the old way', () => {
      process.chdir('./test/fixtures/deprecated-config');

      const config = Config.readConfig();

      expect(config.callToImport).toEqual([{regex: '(\\S+)', replace: '{$1|param}'}]);
    });
  });

  describe('isRegex', () => {
    it('should return true if the string is a regex', () => {
      expect(Config.isRegex('foo')).toBe(true);
      expect(Config.isRegex('foo.*')).toBe(true);
      expect(Config.isRegex('foo(.*')).toBe(false);
    });
  });

  describe('validateConfig', () => {
    it('should return the config for valid a config', () => {
      expect(Config.validateConfig(Config.DEFAULT_CONFIG)).toMatchObject(Config.DEFAULT_CONFIG);
    });

    it('should throw an Error if the config is invalid', () => {
      const invalidConfig = {
        callToImport: [
          {
            regex: '(asd',
            replace: 'bar',
          },
        ],
        implicitParams: {},
      };

      expect(() => Config.validateConfig(invalidConfig)).toThrowError();
    });
  });
});
