import * as chalk from 'chalk';
import * as program from 'commander';
import validateFile from './validate-file';
import {Result} from './util';
const pkg = require('../package.json');

function main() {
  program
    .version(pkg.version)
    .usage('mcritic [options] <file ...>')
    .parse(process.argv);

  if (!program.args.length) {
    process.exit(0);
  }

  Promise
    .all(program.args.map(validate))
    .then(validations => {
      const failed = validations.filter(validation => !validation.result.status);

      if (!failed.length) {
        process.exit(0);
      }

      console.log(chalk.red(`The following ${failed.length} file(s) have problems:\n`));

      failed.forEach(printValidation);
      printHeader();

      process.exit(1);
    });
}

function printValidation(validation: Validation): void {
  const {messages} = validation.result;

  printHeader(`File - ${validation.file}`);
  messages.forEach(message => printIndented(message));
}

function printIndented(string = '', indentSize = 2, symbol = '/'): void {
  const indentStr = chalk.black(symbol.repeat(indentSize));

  console.log(indentStr);
  string
    .split('\n')
    .forEach(line => console.log(indentStr, ' ', line));
  console.log(indentStr);
}

function printHeader(content = '', symbol = '/'): void {
  console.log(
    chalk.black(symbol.repeat(10) + ' '),
    chalk.yellow(content));
}

interface Validation {
  file: string,
  result: Result
}

function validate(file: string): Promise<Validation> {
  return validateFile(file)
    .then(result => ({
      file,
      result
    }));
}

main();
