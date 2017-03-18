import {joinErrors, toResult, Result} from './util';
import * as chalk from 'chalk';
import * as jsHelpers from './js-helpers';
import * as S from './soy-parser';
import * as soyHelpers from './soy-helpers';
import * as T from 'babel-types';

function getJSParams(ast: T.Node): Array<string> | null {
  const params = jsHelpers.getParams(ast);
  if (params) {
    return params.map(prop => jsHelpers.getKeyName(prop.key));
  }

  return null;
}

export default function validateParams(soyAst: S.Program, jsAst: T.Node): Result {
  const jsParams = getJSParams(jsAst);

  if (!jsParams) {
    return toResult(true);
  }

  const missingParams = soyHelpers.getSoyParams(soyAst)
    .map(param => param.name)
    .filter(param => !jsParams.includes(param));

  if (missingParams.length) {
    return toResult(
      false,
      `The following params should be included in ${chalk.yellow('STATE')}:\n\n` +
      joinErrors(missingParams));
  }

  return toResult(true);
};
