import * as Config from '../config';
import * as process from 'process';

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

    afterAll(() => {
      process.chdir(cwd);
    });

    it('should return a default configuration if no file is found', () => {
      const config = Config.readConfig();

      expect(config).toBeInstanceOf(Object);
      expect(config.callToImportRegex).toBe('(.*)');
    });

    it('should return a configuration specificied in a file', () => {
      process.chdir('./test/fixtures/config');

      const config = Config.readConfig();

      expect(config.callToImportRegex).toBe('(\\S+)');
    });
  });
});
