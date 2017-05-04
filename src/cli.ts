import {Result} from './util';
import * as fs from 'fs';
import * as path from 'path';
import * as chalk from 'chalk';
import * as program from 'commander';
import validateFile from './validate-file';
import * as glob from 'glob';
const pkg = require('../package.json');

export async function main(argv: Array<string>): Promise<void> {
  const cli = program
    .version(pkg.version)
    .usage('mcritic [options] <path>')
    .option('-i, --ignore <ignore>', 'A glob to ignore files, if passed a directory')
    .option('-v, --verbose', 'Output for all files')
    .parse(argv);

  if (!program.args.length) {
    cli.help();
  }

  const filePath = program.args[0];

  try {
    var files = await getSoyFiles(filePath, program.ignore);
  } catch(e) {
    console.log(chalk.red(`Failed to find Soy files using path: "${filePath}"`));
    return process.exit(1);
  }

  const validations = await Promise.all(files.map(validate));
  const failed = validations.filter(([_, result]) => !result.status);
  const passed = validations.filter(([_, result]) => result.status);

  console.log(chalk[failed.length ? 'red' : 'green'](`${failed.length} out of ${validations.length} file(s) have problems:\n`));

  if (program.verbose && passed.length) {
    passed.forEach(printValidation);
  }

  if (failed.length) {
    failed.forEach(printValidation);
    return process.exit(1);
  }

  return process.exit(0);
}

async function getSoyFiles(filePath: string, ignore?: string): Promise<Array<string>> {
  const isDir = await pathIsDir(filePath);

  if (isDir) {
    return new Promise<Array<string>>((resolve, reject) => {
      glob(path.resolve(filePath, '**', '*.soy'), {ignore}, (err, matches) => {
        if (err) {
          return reject(err);
        }
        resolve(matches);
      });
    });
  }
  return Promise.resolve([filePath]);
}

function pathIsDir(filePath: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      resolve(stats.isDirectory());
    });
  });
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
