import * as chalk from 'chalk';
import * as jsHelpers from './js-helpers';
import {joinErrors, toResult, Result} from './util';
import * as t from 'babel-types';

function isInternalName(name: string): boolean {
  return name.startsWith('_') || name.endsWith('_');
}

export default function validateInternal(soyAst: any, jsAst: any): Result {
  const params = jsHelpers.getParams(jsAst);

  if (!params) {
    return toResult(true);
  }

  const missingInternal = params
    .filter(node => {
      node = <t.ObjectProperty>node;
      
      const name = (<t.Identifier>node.key).name;

      return isInternalName(name) &&
        !jsHelpers.hasAttribute(node.value, 'internal');
    })
    .map(node => (<t.Identifier>node.key).name);

  if (!missingInternal.length) {
    return toResult(true);
  }

  return toResult(
    false,
    `Based on their name, these attributes should have the ${chalk.yellow('.internal()')} config added:\n\n` +
    joinErrors(missingInternal));
}
