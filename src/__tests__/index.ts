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
});
