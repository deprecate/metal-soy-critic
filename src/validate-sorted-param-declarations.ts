import {fullName} from './soy-helpers';
import {toResult, Result, joinErrors} from './util';
import * as chalk from 'chalk';
import * as S from './soy-types';
import SoyContext from './soy-context';

function shouldSort(template: S.Template | S.DelTemplate): boolean {
  const sortedparams = template.params
    .concat()
    .sort((a, b) => {
      if (a.required && !b.required) {
        return -1;
      } else if (!a.required && b.required) {
        return 1;
      }
      return a.name.localeCompare(b.name);
    });

  return sortedparams.map(p => p.name).join() !==
    template.params.map(p => p.name).join();
}

export default function validateSortedParamDeclarations(soyContext: SoyContext): Result {
  const notSorted = soyContext.ast.body
    .filter(shouldSort)
    .map(fullName);

  if (notSorted.length) {
    return toResult(
      false,
      `These templates need their ${chalk.yellow('param')} declarations ${chalk.yellow('sorted')}:\n\n` +
      joinErrors(notSorted));
  }
  return toResult(true);
}
