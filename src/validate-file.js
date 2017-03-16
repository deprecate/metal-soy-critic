const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

const babylon = require('babylon');
const parseSoy = require('./soy-parser');
const path = require('path');
const {combineResults, sequence, toResult} = require('./util');

/* Error Types */

const ERR_JS_PARSE = 'ERR_JS_PARSE';
const ERR_JS_READ = 'ERR_JS_READ';
const ERR_SOY_PARSE = 'ERR_SOY_PARSE';
const ERR_SOY_READ = 'ERR_SOY_READ';

/**
 * Validators should be added here. Each validator is a function that should
 * have the following signature:
 *
 * validator(soyAst: SoyAst, jsAst: JSAst): Util.Result
 *
 */
const validators = [
  require('./validate-call-imports'),
  require('./validate-params'),
  require('./validate-internal'),
  require('./validate-required-params')
];

function toError(type) {
  return inner => {
    throw {
      type,
      inner
    };
  };
}

function getJSPath(filePath) {
  return path.format({
    dir: path.dirname(filePath),
    base: path.basename(filePath, '.soy') + '.js'
  });
}

function getSoyAst(filePath) {
  return fs.readFileAsync(filePath, 'utf8')
    .then(
      input => Promise.try(() => parseSoy(input)).catch(toError(ERR_SOY_PARSE)),
      toError(ERR_SOY_READ)
    );
}

function getJSAst(filePath) {
  return fs.readFileAsync(filePath, 'utf8')
    .then(
      input => Promise.try(
        () => babylon.parse(input, {allowImportExportEverywhere: true})
      ).catch(toError(ERR_JS_PARSE)),
      toError(ERR_JS_READ)
    );
}

function runValidations(soyAst, jsAst) {
  return validators
    .map(validator => validator(soyAst, jsAst))
    .reduce(combineResults);
}

module.exports = function validateFile(filePath) {
  return sequence(() => getSoyAst(filePath), () => getJSAst(getJSPath(filePath)))
    .then(([soyAst, jsAst]) => runValidations(soyAst, jsAst))
    .catch(error => {
      switch (error.type) {
        case ERR_JS_READ:
          return toResult(true);
        case ERR_JS_PARSE:
          return toResult(false, 'Failed to parse component');
        case ERR_SOY_READ:
          return toResult(false, 'Unable to read soy template');
        case ERR_SOY_PARSE:
          return toResult(false, 'Failed to parse soy template');
        default:
          return toResult(false, 'Something went wrong validating soy file');
      }
    });
}
