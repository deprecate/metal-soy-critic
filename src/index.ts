import {Result} from './util';
import * as chalk from 'chalk';
import * as program from 'commander';
import validateFile from './validate-file';
const pkg = require('../package.json');

async function main(): Promise<void> {
  program
    .version(pkg.version)
    .usage('mcritic [options] <file ...>')
    .parse(process.argv);

  if (!program.args.length) {
    process.exit(0);
  }

  const validations = await Promise.all(program.args.map(validate));
  const failed = validations.filter(([_, result]) => !result.status);

  if (!failed.length) {
    process.exit(0);
  }

  console.log(chalk.red(`The following ${failed.length} file(s) have problems:\n`));

  failed.forEach(printValidation);
  printHeader();

  process.exit(1);
}

function printValidation([filePath, result]: [string, Result]): void {
  const {messages} = result;

  printHeader(`File - ${filePath}`);
  messages.forEach(message => printIndented(message));
}

function printIndented(message = '', indentSize = 2, symbol = '/'): void {
  const indentStr = chalk.black(symbol.repeat(indentSize));

  console.log(indentStr);
  message
    .split('\n')
    .forEach(line => console.log(indentStr, ' ', line));
  console.log(indentStr);
}

function printHeader(content = '', symbol = '/'): void {
  console.log(
    chalk.black(symbol.repeat(10) + ' '),
    chalk.yellow(content));
}

async function validate(filePath: string): Promise<[string, Result]> {
  const result = await validateFile(filePath);

  return [filePath, result];
}

main();
