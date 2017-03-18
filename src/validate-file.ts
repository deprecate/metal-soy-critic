import {combineResults, toResult, Result} from './util';
import * as babylon from 'babylon';
import * as fs from 'fs';
import * as S from './soy-parser';
import * as T from 'babel-types';
import parseSoy from './soy-parser';

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

type Validator = (soyAst: S.Program, jsAst: T.Node) => Result;

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

class ErrorResult extends Error {
  type: ErrorTypes;
  inner: Error;

  constructor(type: ErrorTypes, inner: Error) {
    super();
    this.type = type;
    this.inner = inner;
  }
}

function toError(type: ErrorTypes): (Error) => never {
  return inner => {
    throw new ErrorResult(type, inner);
  };
}

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

function getSoyAst(filePath: string): Promise<S.Program> {
  return readFile(filePath)
    .then(
      buffer => {
        try {
          return parseSoy(buffer.toString('utf8'));
        } catch (e) {
          throw new ErrorResult(ErrorTypes.SoyParse, e);
        }
      },
      toError(ErrorTypes.SoyRead)
    );
}

function getJSAst(filePath: string): Promise<T.Node> {
  return readFile(filePath)
    .then(
      buffer => {
        try {
          return babylon.parse(buffer.toString('utf8'), {allowImportExportEverywhere: true});
        } catch (e) {
          throw new ErrorResult(ErrorTypes.JSParse, e);
        }
      },
      toError(ErrorTypes.JSRead)
    );
}

function runValidations(soyAst: S.Program, jsAst: T.Node): Result {
  return validators
    .map(validator => validator(soyAst, jsAst))
    .reduce(combineResults);
}

export default function validateFile(filePath: string): Promise<Result> {
  return getSoyAst(filePath)
    .then(soyAst => getJSAst(getJSPath(filePath))
    .then(jsAst => runValidations(soyAst, jsAst)))
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
