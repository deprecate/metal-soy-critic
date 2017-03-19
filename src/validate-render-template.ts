import * as chalk from 'chalk';
import * as S from './soy-parser';
import {joinErrors, toResult, Result} from './util';

export default function validateRenderTemplate(soyAst: S.Program): Result {
  const templateNames = soyAst.body.map(({name}) => name);

  const renderFound = !!templateNames.find(name => name === 'render');

  if (renderFound) {
    return toResult(true);
  }

  return toResult(
    false,
    `Cannot find a ${chalk.yellow('.render')} template, do you have a typo?\n\n` +
    joinErrors(templateNames));
}
