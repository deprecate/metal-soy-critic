import {Result} from './util';
import * as chalk from 'chalk';
import * as program from 'commander';
import validateFile from './validate-file';
const pkg = require('../package.json');

export async function main(argv: Array<string>): Promise<void> {
  const cli = program
    .version(pkg.version)
    .usage('mcritic [options] <file ...>')
    .option('-v, --verbose', 'output for all files')
    .parse(argv);

  if (!program.args.length) {
    cli.help();
  }

  const validations = await Promise.all(program.args.map(validate));
  const failed = validations.filter(([_, result]) => !result.status);
  const passed = validations.filter(([_, result]) => result.status);

  const {verbose} = program;

  console.log(chalk[failed.length ? 'red' : 'green'](`${failed.length} out of ${validations.length} file(s) have problems:\n`));

  if (!verbose && !failed.length) {
    process.exit(0);
  }

  if (verbose && passed.length) {
    passed.forEach(printValidation);
  }

  if (failed.length) {
    failed.forEach(printValidation);
  }

  printHeader();

  process.exit(1);
}

function printValidation([filePath, result]: [string, Result]): void {
  const {messages, status} = result;

  printHeader(`File - ${filePath}`);
  if (status) {
    printIndented('No problems were found.');
  }
  else {
    messages.forEach(message => printIndented(message));
  }
}

function printIndented(message = '', indentSize = 2, symbol = ' '): void {
  const indentStr = chalk.black(symbol.repeat(indentSize));

  console.log();
  message
    .split('\n')
    .forEach(line => console.log(indentStr, ' ', line));
  console.log('\n');
}

function printHeader(content = ''): void {
  console.log(chalk.yellow(content));
}

async function validate(filePath: string): Promise<[string, Result]> {
  const result = await validateFile(filePath);

  return [filePath, result];
}
