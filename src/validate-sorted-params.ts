import {toResult, Result, joinErrors} from './util';
import * as S from './soy-parser';
import * as T from 'babel-types';
import visit from './soy-traverse';

export interface paramObj extends Object {
  namespace: string,
  paramNames: Array<string>
}

export default function validateSortedParams(ast: S.Program, _: T.Node): Result {
  const calls: Array<paramObj> = new Array();
  visit(ast, {
    Call(node) {
      const paramNames = node.body.map(param => param.name);

      const sortedParamNames = paramNames.slice(0, paramNames.length);
      
      sortedParamNames.sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1);

      if (sortedParamNames.join(' ') !== paramNames.join(' ')) {
        calls.push(
            {
                namespace: node.namespace || '',
                paramNames
            }
        );
      }
    }
  });

  if (!calls.length) {
    return toResult(true);
  }

  return toResult(
    false,
    calls.map(
        call => `Please sort the following params in ${call.namespace}:\n\n${joinErrors(call.paramNames)}`
    ).join('\n\n'));
}
