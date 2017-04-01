import * as chalk from 'chalk';
import * as jsHelpers from './js-helpers';
import * as soyHelpers from './soy-helpers';
import {difference, joinErrors, toResult, Result} from './util';
import * as T from 'babel-types';
import * as S from './soy-types';

export default function validateRequiredParams(soyAst: S.Program, jsAst: T.Node): Result {
  const jsParams = jsHelpers.getParams(jsAst);
  const soyParams = soyHelpers.getSoyParams(soyAst);
  const soyParamNames = soyParams.map(param => param.name);

  const requiredJSParams = new Set<string>(jsParams
    .filter(node =>
      soyParamNames.includes(jsHelpers.getKeyName(node.key)) &&
        jsHelpers.hasAttribute(node.value, 'required'))
    .map(node => jsHelpers.getKeyName(node.key)));

  const requiredSoyParams = new Set<string>(soyParams
    .filter(param => param.required)
    .map(({name}) => name));

  const missingInJS = difference(requiredSoyParams, requiredJSParams);
  const missingInSoy = difference(requiredJSParams, requiredSoyParams);

  const messages: Array<string> = [];

  if (missingInJS.size) {
    messages.push(
      `These attributes are ${chalk.yellow('required')} in your Soy Template but not in your Component:\n\n` +
      joinErrors([...missingInJS]));
  }

  if (missingInSoy.size) {
    messages.push(
      `These attributes are ${chalk.yellow('.required()')} in your Component but not in your Template:\n\n` +
      joinErrors([...missingInSoy]));
  }

  return toResult(!messages.length, ...messages);
};
