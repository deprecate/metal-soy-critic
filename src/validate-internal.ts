import * as chalk from 'chalk';
import * as jsHelpers from './js-helpers';
import {joinErrors, toResult, Result} from './util';
import * as T from 'babel-types';
import * as S from './soy-parser';

function isInternalName(name: string): boolean {
  return name.startsWith('_') || name.endsWith('_');
}

export default function validateInternal(soyAst: S.Program, jsAst: T.Node): Result {
  const params = jsHelpers.getParams(jsAst);

  if (!params) {
    return toResult(true);
  }

  const missingInternal = params
    .filter(node => {
      const name = (<T.Identifier>node.key).name;

      return isInternalName(name) &&
        !jsHelpers.hasAttribute(node.value, 'internal');
    })
    .map(node => (<T.Identifier>node.key).name);

  if (!missingInternal.length) {
    return toResult(true);
  }

  return toResult(
    false,
    `Based on their name, these attributes should have the ${chalk.yellow('.internal()')} config added:\n\n` +
    joinErrors(missingInternal));
}
