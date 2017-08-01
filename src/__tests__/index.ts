import * as child_process from 'child_process';
import * as path from 'path';

describe('cli', () => {
  function runCliFrom(bin: string, cwd: string, ...args: Array<string>): Promise<[number, string]> {
    return new Promise((resolve, reject) => {
      const output: Array<string> = [];
      const child = child_process.fork(bin, args, {cwd, silent: true});

      child.stdout.on('data', data => {
        output.push(data.toString());
      });

      child.on('close', code => {
        resolve([code, output.join('')]);
      });
    });
  }

  function runCli(...args: Array<string>): Promise<[number, string]> {
    return runCliFrom('./lib/index.js', process.cwd(), ...args);
  }

  test('should print usage without args', async () => {
    const [exitCode, output] = await runCli();

    expect(exitCode).toBe(0);
    expect(output).toMatchSnapshot();
  });

  test('should validate file', async () => {
    const [exitCode, output] = await runCli('test/fixtures/MissingInternal.soy');

    expect(exitCode).toBe(1);
    expect(output).toMatchSnapshot();
  });

  test('should print status when no errors', async () => {
    const [exitCode, output] = await runCli('test/fixtures/Test.soy');

    expect(exitCode).toBe(0);
    expect(output).toMatchSnapshot();
  });

  test('should print more with verbose flag', async () => {
    const [exitCode, output] = await runCli('-v', 'test/fixtures/Test.soy');

    expect(exitCode).toBe(0);
    expect(output).toMatchSnapshot();
  });

  test('should recursively look for Soy files if passed a directory', async () => {
    const [exitCode, output] = await runCli('test/fixtures');

    expect(exitCode).toBe(1);
    expect(output).toMatchSnapshot();
  });

  test('should accept an ignore glob', async () => {
    const [exitCode, output] = await runCli('test/fixtures', '--ignore', '**/*.soy');

    expect(exitCode).toBe(0);
    expect(output).toMatchSnapshot();
  });

  test('should run using config file', async () => {
    const [exitCode, output] = await runCliFrom(
      '../../../lib/index.js',
       './test/fixtures/config',
      '../TransformedImport.soy');

    expect(exitCode).toBe(0);
    expect(output).toMatchSnapshot();
  });

  test('should fail with invalid config file', async () => {
    const [exitCode, output] = await runCliFrom(
      '../../../lib/index.js',
       './test/fixtures/invalid-config',
      '../TransformedImport.soy');

    expect(exitCode).toBe(1);
    expect(output).toMatchSnapshot();
  });
});
