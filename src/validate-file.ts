import {combineResults, toResult, Result} from './util';
import * as babylon from 'babylon';
import * as fs from 'fs';
import * as S from './soy-types';
import * as T from 'babel-types';
import parseSoy, {SoyParseError} from './soy-parser';

/* Validators */
import validateRenderTemplate from './validate-render-template';
import validateCallImports from './validate-call-imports';
import validateParams from './validate-params';
import validateInternal from './validate-internal';
import validateRequiredParams from './validate-required-params';
import validateNoopEvents from './validate-noop-events';
import validateSortedParams from './validate-sorted-params';
import validateSortedParamDeclarations from './validate-sorted-param-declarations';
import validateSortedMaps from './validate-sorted-maps';
import validateTernaryElvis from './validate-ternary-elvis';

/**
 * Validators should be added here. Each validator is a function that should
 * have one of the following signatures.
 */
type Validator = (soyAst: S.Program, jsAst: T.Node) => Result;
type SoyValidator = (ast: S.Program) => Result;

const validators: Array<Validator> = [
  validateCallImports,
  validateParams,
  validateInternal,
  validateRequiredParams,
];

const soyValidators: Array<SoyValidator> = [
  validateRenderTemplate,
  validateNoopEvents,
  validateSortedParams,
  validateSortedParamDeclarations,
  validateSortedMaps,
  validateTernaryElvis
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

function runValidators(soyAst: S.Program, jsAst: T.Node): Result {
  return validators
    .map(validator => validator(soyAst, jsAst))
    .reduce(combineResults);
}

function runSoyValidators(ast: S.Program): Result {
  return soyValidators
    .map(validator => validator(ast))
    .reduce(combineResults);
}

async function validateWithSoy(soyAst: S.Program, filePath: string): Promise<Result> {
  try {
    const jsAst = await getJSAst(getJSPath(filePath));

    return combineResults(
      runSoyValidators(soyAst),
      runValidators(soyAst, jsAst));
  } catch (err) {
    if (err.code === 'ENOENT') {
      return runSoyValidators(soyAst);
    } else if (err instanceof SyntaxError) {
      return toResult(false, 'Failed to parse component (javascript) file');
    }
    throw new Error();
  }
}

export default async function validateFile(filePath: string): Promise<Result> {
  try {
    const soyAst = await getSoyAst(filePath);

    return validateWithSoy(soyAst, filePath);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return toResult(false, 'Failed to open soy file, does it exist?');
    } else if (err instanceof SoyParseError) {
      return toResult(false, err.message);
    }
    return toResult(false, 'Something went wrong validating this soy file');
  }
}
