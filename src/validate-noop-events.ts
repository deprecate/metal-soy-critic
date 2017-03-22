import {fullName} from './soy-helpers';
import {toResult, Result, joinErrors} from './util';
import * as chalk from 'chalk';
import * as S from './soy-parser';
import * as T from 'babel-types';
import visit from './soy-traverse';

function hasEventsParam(params: Array<S.Param>): boolean {
  return !!params.find(param => param.name === 'events');
}

export default function validateNoopEvents(ast: S.Program, _: T.Node): Result {
  const calls: Set<string> = new Set();
  visit(ast, {
    Call(node) {
      if (node.name !== 'render' && hasEventsParam(node.body)) {
        calls.add(fullName(node));
      }
    }
  });

  if (!calls.size) {
    return toResult(true);
  }

  return toResult(
    false,
    `These calls are not components, so their ${chalk.yellow('events')} param will do nothing:\n\n` +
    joinErrors([...calls]));
}
