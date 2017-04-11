import {combineResults, toResult, Result} from './util';
import * as fs from 'fs';
import {SoyParseError} from './soy-parser';
import SoyContext from './soy-context';
import JSContext from './js-context';

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
type Validator = (soyContext: SoyContext, jsContext: JSContext) => Result;
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

function readFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, buffer) => {
      if (err) {
        return reject(err);
      }
      resolve(buffer.toString('utf8'));
    });
  });
}

function getJSPath(filePath: string): string {
  return filePath.replace('.soy', '.js');
}

async function getSoyContext(filePath: string): Promise<SoyContext> {
  const raw = await readFile(filePath);
  return new SoyContext(raw);
}

async function getJSContext(filePath: string): Promise<JSContext> {
  const raw = await readFile(filePath);
  return new JSContext(raw);
}

function runValidators(soyContext: SoyContext, jsContext: JSContext): Result {
  return validators
    .map(validator => validator(soyContext, jsContext))
    .reduce(combineResults);
}

function runSoyValidators(soyContext: SoyContext): Result {
  return soyValidators
    .map(validator => validator(soyContext))
    .reduce(combineResults);
}

async function validateWithSoy(soyContext: SoyContext, filePath: string): Promise<Result> {
  try {
    const jsContext = await getJSContext(getJSPath(filePath));

    return combineResults(
      runSoyValidators(soyContext),
      runValidators(soyContext, jsContext));
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
    const soyContext = await getSoyContext(filePath);

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
