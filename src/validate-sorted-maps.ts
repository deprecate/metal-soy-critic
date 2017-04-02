import {toResult, Result, isSorted, joinErrors} from './util';
import * as chalk from 'chalk';
import * as S from './soy-types';
import visit from './soy-traverse';

function formatMessage(node: S.MapLiteral): string {
  const firstLine = node.items[0].mark.start.line;
  const lastLine = node.items[node.items.length - 1].mark.start.line;

  return `Lines ${firstLine} to ${lastLine}`;
}

export default function validateSortedParams(ast: S.Program): Result {
  const messages: Array<string> = [];
  visit(ast, {
    MapLiteral(node) {
      const keys = node.items.map(item => item.key.value);

      if (!isSorted(keys)) {
        messages.push(formatMessage(node));
      }
    }
  });

  if (messages.length) {
    return toResult(
      false,
      `These ${chalk.yellow('map keys')} should be ${chalk.yellow('sorted')}:\n\n` +
      joinErrors(messages));
  }
  return toResult(true);
}
