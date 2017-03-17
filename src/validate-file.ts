import * as Promise from 'bluebird';
import * as fs from 'fs';
import * as tp from 'typed-promisify';
const readFile = tp.promisify(fs.readFile);

import * as babylon from 'babylon';
import parseSoy from './soy-parser';
import {combineResults, sequence, toResult, Result} from './util';

const enum ErrorTypes {
  JSParse,
  JSRead,
  SoyParse,
  SoyRead
}

/**
 * Validators should be added here. Each validator is a function that should
 * have the following signature:
 *
 * validator(soyAst: SoyAst, jsAst: JSAst): Util.Result
 *
 */

type Validator = (soyAst: any, jsAst: any) => Result;

import validateCallImports from './validate-call-imports';
import validateParams from './validate-params';
import validateInternal from './validate-internal';
import validateRequiredParams from './validate-required-params';

const validators: Array<Validator> = [
  validateCallImports,
  validateParams,
  validateInternal,
  validateRequiredParams
];

interface ErrorResult {
  type: string,
  inner: any
}

function toError(type: ErrorTypes): (any) => void {
  return inner => {
    throw {
      type,
      inner
    };
  };
}

function getJSPath(filePath: string): string {
  return filePath.replace('.soy', '.js');
}

function getSoyAst(filePath: string): any {
  return readFile(filePath)
    .then(
      input => Promise.try(() => parseSoy(input.toString('utf8'))).catch(toError(ErrorTypes.SoyParse)),
      toError(ErrorTypes.SoyRead)
    );
}

function getJSAst(filePath: string): any {
  return readFile(filePath)
    .then(
      buffer => Promise.try(
        () => babylon.parse(buffer.toString('utf8'), {allowImportExportEverywhere: true})
      ).catch(toError(ErrorTypes.JSParse)),
      toError(ErrorTypes.JSRead)
    );
}

function runValidations(soyAst, jsAst): Result {
  return validators
    .map(validator => validator(soyAst, jsAst))
    .reduce(combineResults);
}

export default function validateFile(filePath: string): Promise<Result> {
  return sequence(() => getSoyAst(filePath), () => getJSAst(getJSPath(filePath)))
    .then(([soyAst, jsAst]) => runValidations(soyAst, jsAst))
    .catch(error => {
      switch (error.type) {
        case ErrorTypes.JSRead:
          return toResult(true);
        case ErrorTypes.JSParse:
          return toResult(false, 'Failed to parse component');
        case ErrorTypes.SoyRead:
          return toResult(false, 'Unable to read soy template');
        case ErrorTypes.SoyParse:
          return toResult(false, 'Failed to parse soy template');
        default:
          return toResult(false, 'Something went wrong validating soy file');
      }
    });
}
