import {fullName} from './soy-helpers';
import {toResult, Result, joinErrors} from './util';
import * as chalk from 'chalk';
import * as S from './soy-parser';
import * as T from 'babel-types';
import visit from './soy-traverse';

export default function validateSortedParams(ast: S.Program, _: T.Node): Result {
  const calls: Array<[string, Array<string>]> = [];
  visit(ast, {
    Call(node) {
      const paramNames = node.body.map(param => param.name);

      const sortedParamNames = paramNames.slice(0, paramNames.length);
      
      sortedParamNames.sort((a, b) => a.localeCompare(b));

      if (sortedParamNames.join(' ') !== paramNames.join(' ')) {
        calls.push([fullName(node), paramNames]);
      }
    }
  });

  if (!calls.length) {
    return toResult(true);
  }

  return toResult(
    false,
    ...calls.map(
        ([fullName, paramNames]) => `Please ${chalk.yellow('sort')} the following params in ${chalk.yellow(fullName)}:\n\n${joinErrors(paramNames)}`
    ));
}
