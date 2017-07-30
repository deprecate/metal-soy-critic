import {joinErrors, toResult, Result} from './util';
import * as chalk from 'chalk';
import SoyContext from './soy-context';
import JSContext from './js-context';

export default function validateParams(soyContext: SoyContext, jsContext: JSContext): Result {
  const jsParams = jsContext.getParamNames();
  const classMethods = jsContext.getClassMethodNames();

  const missingParams = soyContext.getRenderParams()
    .map(param => param.name)
    .filter(param => !jsParams.includes(param) && !classMethods.includes(param));

  if (missingParams.length) {
    return toResult(
      false,
      `These params can't be found in ${chalk.yellow('STATE')} or your ${chalk.yellow('Class')}:\n\n` +
      joinErrors(missingParams));
  }

  return toResult(true);
};
