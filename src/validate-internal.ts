import {joinErrors, toResult, Result} from './util';
import SoyContext from './soy-context';
import * as chalk from 'chalk';
import JSContext from './js-context';

function isInternalName(name: string): boolean {
  return name.startsWith('_') || name.endsWith('_');
}

export default function validateInternal(_: SoyContext, jsContext: JSContext): Result {
  const params = jsContext.getParams();

  const missingInternal = params
    .filter(node => {
      const name = JSContext.getKeyName(node.key);

      return isInternalName(name) &&
        !JSContext.hasAttribute(node.value, 'internal');
    })
    .map(node => JSContext.getKeyName(node.key));

  if (!missingInternal.length) {
    return toResult(true);
  }

  return toResult(
    false,
    `Based on their name, these attributes should have the ${chalk.yellow('.internal()')} config added:\n\n` +
    joinErrors(missingInternal));
}
