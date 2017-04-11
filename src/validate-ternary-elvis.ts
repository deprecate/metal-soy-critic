import {isReference, isFunctionCall} from './soy-helpers';
import {toResult, Result, joinErrors} from './util';
import * as chalk from 'chalk';
import * as S from './soy-types';
import SoyContext from './soy-context';

function formatMessage(node: S.Ternary, name: string): string {
  return `$${name} - Line ${node.mark.start.line}`;
}

export default function validateTernaryElvis(soyContext: SoyContext): Result {
  const references: Array<string> = [];
  soyContext.visit({
    Ternary(node) {
      if (isFunctionCall(node.condition) && node.condition.name === 'isNonnull') {
        const firstArg = node.condition.body[0];
        if (isReference(firstArg)) {
          const referenceName = firstArg.name;

          if (isReference(node.left) && node.left.name === referenceName) {
            references.push(formatMessage(node, referenceName));
          }
        }
      }
    }
  });

  if (!references.length) {
    return toResult(true);
  }

  return toResult(
    false,
    `Use the ${chalk.yellow('Elvis (?:)')} operator instead of a ternary for ${chalk.yellow('default')} values:\n\n` +
    joinErrors(references));
}
