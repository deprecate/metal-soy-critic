import {fullName} from './soy-helpers';
import {toResult, Result, isSorted, joinErrors} from './util';
import * as chalk from 'chalk';
import * as S from './soy-types';
import * as T from 'babel-types';
import visit from './soy-traverse';

function formatMessage(node: S.Call): string {
  const firstLine = node.body[0].mark.start.line;
  const lastLine = node.body[node.body.length - 1].mark.end.line;

  return `${fullName(node)} - Lines ${firstLine} to ${lastLine}`;
}

export default function validateSortedParams(ast: S.Program, _: T.Node): Result {
  const calls: Array<string> = [];
  visit(ast, {
    Call(node) {
      const paramNames = node.body.map(param => param.name);

      if (!isSorted(paramNames)) {
        calls.push(formatMessage(node));
      }
    }
  });

  if (!calls.length) {
    return toResult(true);
  }

  return toResult(
    false,
    `Please ${chalk.yellow('sort')} the params in these ${chalk.yellow('calls')}:\n\n` +
    joinErrors(calls));
}
