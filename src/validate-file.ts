import {combineResults, toResult, Result} from './util';
import * as babylon from 'babylon';
import * as fs from 'fs';
import * as T from 'babel-types';
import {SoyParseError} from './soy-parser';
import SoyContext from './soy-context';

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
type Validator = (soyContext: SoyContext, jsAst: T.Node) => Result;
type SoyValidator = (ast: SoyContext) => Result;

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

async function getSoyAst(filePath: string): Promise<SoyContext> {
  const buffer = await readFile(filePath);
  return new SoyContext(buffer.toString('utf8'));
}

async function getJSAst(filePath: string): Promise<T.Node> {
  const buffer = await readFile(filePath);
  return babylon.parse(buffer.toString('utf8'), {allowImportExportEverywhere: true});
}

function runValidators(soyContext: SoyContext, jsAst: T.Node): Result {
  return validators
    .map(validator => validator(soyContext, jsAst))
    .reduce(combineResults);
}

function runSoyValidators(soyContext: SoyContext): Result {
  return soyValidators
    .map(validator => validator(soyContext))
    .reduce(combineResults);
}

async function validateWithSoy(soyContext: SoyContext, filePath: string): Promise<Result> {
  try {
    const jsAst = await getJSAst(getJSPath(filePath));

    return combineResults(
      runSoyValidators(soyContext),
      runValidators(soyContext, jsAst));
  } catch (err) {
    if (err.code === 'ENOENT') {
      return runSoyValidators(soyContext);
    } else if (err instanceof SyntaxError) {
      return toResult(false, 'Failed to parse component (javascript) file');
    }
    throw new Error();
  }
}

export default async function validateFile(filePath: string): Promise<Result> {
  try {
    const soyContext = await getSoyAst(filePath);

    return validateWithSoy(soyContext, filePath);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return toResult(false, 'Failed to open soy file, does it exist?');
    } else if (err instanceof SoyParseError) {
      return toResult(false, err.message);
    }
    return toResult(false, 'Something went wrong validating this soy file');
  }
}
