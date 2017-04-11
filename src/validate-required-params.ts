import {difference, joinErrors, toResult, Result} from './util';
import * as chalk from 'chalk';
import SoyContext from './soy-context';
import JSContext from './js-context';

export default function validateRequiredParams(soyContext: SoyContext, jsContext: JSContext): Result {
  const jsParams = jsContext.getParams();
  const soyParams = soyContext.getRenderParams();
  const soyParamNames = soyParams.map(param => param.name);

  const requiredJSParams = new Set<string>(jsParams
    .filter(node =>
      soyParamNames.includes(JSContext.getKeyName(node.key)) &&
        JSContext.hasAttribute(node.value, 'required'))
    .map(node => JSContext.getKeyName(node.key)));

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
