import {joinErrors, toResult, Result} from './util';
import * as chalk from 'chalk';
import SoyContext from './soy-context';

export default function validateDocParams(soyContext: SoyContext): Result {
  const templateNames = soyContext.ast.body
    .filter(node => node.doc && node.doc.params.length)
    .map(node => node.id.name);

  if (!templateNames.length) {
    return toResult(true);
  }

  return toResult(
    false,
    `Param declarations in docs is ${chalk.yellow('deprecated')}, see these templates:\n\n` +
    joinErrors(templateNames));
}
