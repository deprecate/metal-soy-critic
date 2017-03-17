import * as chalk from 'chalk';
import * as jsHelpers from './js-helpers';
import * as soyHelpers from './soy-helpers';
import {difference, joinErrors, toResult} from './util';
import * as t from 'babel-types';

export default function validateRequiredParams(soyAst, jsAst) {
  let jsParams = jsHelpers.getParams(jsAst);

  if (!jsParams) {
    return toResult(true);
  }

  const soyParams = soyHelpers.getSoyParams(soyAst);
  const soyParamNames = soyParams.map(param => param.name);

  const requiredJSParams = new Set<string>(jsParams
    .filter(node =>
      soyParamNames.includes((<t.Identifier>node.key).name) &&
        jsHelpers.hasAttribute(node.value, 'required'))
    .map(node => (<t.Identifier>node.key).name));

  const requiredSoyParams = new Set<string>(soyParams
    .filter(param => param.required)
    .map(({name}) => name));

  const missingInJS = difference(requiredSoyParams, requiredJSParams);
  const missingInSoy = difference(requiredJSParams, requiredSoyParams);

  const messages = [];

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
