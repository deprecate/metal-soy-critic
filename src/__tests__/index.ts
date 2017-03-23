import * as child_process from 'child_process';

describe('cli', () => {
  function runCli(...args: Array<string>): Promise<[number, string]> {
    return new Promise((resolve, reject) => {
      const output: Array<string> = [];
      const child = child_process.fork('./lib/index.js', args, {silent: true});

      child.stdout.on('data', data => {
        output.push(data.toString());
      });

      child.on('close', code => {
        resolve([code, output.join('')]);
      });
    });
  }

  test('should print usage without args', () => {
    return runCli().then(([exitCode, output]) => {
      expect(exitCode).toBe(0);
      expect(output).toMatchSnapshot();
    });
  });

  test('should validate file', () => {
    return runCli('test/fixtures/MissingInternal.soy').then(([exitCode, output]) => {
      expect(exitCode).toBe(1);
      expect(output).toMatchSnapshot();
    });
  });

  test('should print status when no errors', () => {
    return runCli('test/fixtures/Test.soy').then(([exitCode, output]) => {
      expect(exitCode).toBe(0);
      expect(output).toMatchSnapshot();
    });
  });

  test('should print more with verbose flag', () => {
    return runCli('-v', 'test/fixtures/Test.soy').then(([exitCode, output]) => {
      expect(exitCode).toBe(0);
      expect(output).toMatchSnapshot();
    });
  });
});
