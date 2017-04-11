import {joinErrors, toResult, Result} from './util';
import * as chalk from 'chalk';
import SoyContext from './soy-context';

export default function validateRenderTemplate(soyContext: SoyContext): Result {
  const templateNames = soyContext.ast.body.map(node => node.id.name);

  const renderFound = !!templateNames.find(name => name === 'render');

  if (renderFound) {
    return toResult(true);
  }

  return toResult(
    false,
    `Cannot find a ${chalk.yellow('.render')} template, do you have a typo?\n\n` +
    joinErrors(templateNames));
}
