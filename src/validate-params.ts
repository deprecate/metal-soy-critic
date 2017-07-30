import {joinErrors, toResult, Result} from './util';
import * as chalk from 'chalk';
import SoyContext from './soy-context';
import JSContext from './js-context';
import {Config} from './config';

function getImplicitParams(className: string | null, paramsMap: any):string[] {
  return className ? Object.keys(paramsMap)
    .filter(regex => className.match(new RegExp(regex)))
    .reduce((acc, value) => acc.concat(paramsMap[value]), []) : [];
}

export default function validateParams(soyContext: SoyContext, jsContext: JSContext, config: Config): Result {
  const jsParams = jsContext.getParamNames();
  const classMethods = jsContext.getClassMethodNames();
  const implicitParams = getImplicitParams(jsContext.getClassName(), config.implicitParams);

  const missingParams = soyContext.getRenderParams()
    .map(param => param.name)
    .filter(param => !jsParams.includes(param) && !classMethods.includes(param) && !implicitParams.includes(param));

  if (missingParams.length) {
    return toResult(
      false,
      `These params can't be found in ${chalk.yellow('STATE')} or your ${chalk.yellow('Class')}:\n\n` +
      joinErrors(missingParams));
  }

  return toResult(true);
};
