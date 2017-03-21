import {combineResults, toResult, Result} from './util';
import * as babylon from 'babylon';
import * as fs from 'fs';
import * as S from './soy-parser';
import * as T from 'babel-types';
import parseSoy, {SoyParseError} from './soy-parser';

/* Validators */
import validateRenderTemplate from './validate-render-template';
import validateCallImports from './validate-call-imports';
import validateParams from './validate-params';
import validateInternal from './validate-internal';
import validateRequiredParams from './validate-required-params';
import validateNoopEvents from './validate-noop-events';

/**
 * Validators should be added here. Each validator is a function that should
 * have the following signature.
 */
type Validator = (soyAst: S.Program, jsAst: T.Node) => Result;

const validators: Array<Validator> = [
  validateRenderTemplate,
  validateCallImports,
  validateParams,
  validateInternal,
  validateRequiredParams,
  validateNoopEvents
];

function readFile(filePath: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
}

function getJSPath(filePath: string): string {
  return filePath.replace('.soy', '.js');
}

async function getSoyAst(filePath: string): Promise<S.Program> {
  const buffer = await readFile(filePath);
  return parseSoy(buffer.toString('utf8'));
}

async function getJSAst(filePath: string): Promise<T.Node> {
  const buffer = await readFile(filePath);
  return babylon.parse(buffer.toString('utf8'), {allowImportExportEverywhere: true});
}

function runValidations(soyAst: S.Program, jsAst: T.Node): Result {
  return validators
    .map(validator => validator(soyAst, jsAst))
    .reduce(combineResults);
}

export default async function validateFile(filePath: string): Promise<Result> {
  try {
    const soyAst = await getSoyAst(filePath);
    const jsAst = await getJSAst(getJSPath(filePath));

    return runValidations(soyAst, jsAst);
  } catch (err) {
    if (err.code === 'ENOENT') {
      if (err.path.endsWith('.js')) {
        return toResult(true);
      }
      return toResult(false, 'Failed to open soy file, does it exist?');
    } else if (err instanceof SoyParseError) {
      return toResult(false, err.message);
    } else if (err instanceof SyntaxError) {
      return toResult(false, 'Failed to parse component (javascript) file');
    }
    return toResult(false, 'Something went wrong validating this soy file');
  }
}
