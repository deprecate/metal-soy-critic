#!/usr/bin/env node
'use strict';

const chalk = require('chalk');
const pkg = require('../package.json');
const program = require('commander');
const Promise = require('bluebird');
const validateFile = require('./validate-file');

function main() {
  program
    .version(pkg.version)
    .usage('mcritic [options] <file ...>')
    .parse(process.argv);

  if (!program.args.length) {
    process.exit(0);
  }

  Promise
    .map(program.args, validate)
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

function printValidation({file, result}) {
  const {messages} = result;

  printHeader(`File - ${file}`);
  messages.forEach(message => printIndented(message));
}

function printIndented(string = '', indentSize = 2, symbol = '/') {
  const indentStr = chalk.black(symbol.repeat(indentSize));

  console.log(indentStr);
  string
    .split('\n')
    .forEach(line => console.log(indentStr, ' ', line));
  console.log(indentStr);
}

function printHeader(content = '', symbol = '/') {
  console.log(
    chalk.black(symbol.repeat(10) + ' '),
    chalk.yellow(content));
}

function validate(file) {
  return validateFile(file)
    .then(result => ({
      file,
      result
    }));
}

main();
