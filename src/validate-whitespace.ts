import {toResult, Result, joinErrors} from './util';
import * as chalk from 'chalk';
import * as S from './soy-types';
import SoyContext from './soy-context';

const paramDeclarationRegex = /\s+}/;

function matchTuple<T>(node: T, raw: string): [T, RegExpMatchArray | null] {
  return [node, raw.match(paramDeclarationRegex)];
}

function formatMessage(node: S.Node, match: RegExpMatchArray): string {
  const {input = ""} = match;

  return `Line ${node.mark.end.line}: ${input.replace(match[0], chalk.inverse(match[0]))}`;
}

function paramDeclarations(soyContext: SoyContext): Array<string> {
  return soyContext.ast.body
    .map(template => template.params)
    .reduce((res, next) => [...res, ...next])
    .map(node => matchTuple(node, soyContext.getRaw(node)))
    .filter(([_, match]) => !!match)
    .map(([node, match]) => formatMessage(node, match!))
}

export default function validateWhitespace(soyContext: SoyContext): Result {
  const badLines = paramDeclarations(soyContext);

  if (badLines.length) {
    return toResult(
      false,
      `There seems to be extra ${chalk.yellow('whitespace')} on these lines:\n\n` +
      joinErrors(badLines));
  }

  return toResult(true);
}
