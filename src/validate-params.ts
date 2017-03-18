import * as chalk from 'chalk';
import * as jsHelpers from './js-helpers';
import * as soyHelpers from './soy-helpers';
import {joinErrors, toResult, Result} from './util';
import * as T from 'babel-types';
import * as S from './soy-parser';

function getJSParams(ast: T.Node): Array<string> {
  const params = jsHelpers.getParams(ast);
  if (params) {
    return params.map(prop => (<T.Identifier>prop.key).name);
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
