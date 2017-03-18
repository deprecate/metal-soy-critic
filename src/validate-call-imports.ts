import * as chalk from 'chalk';
import jsTraverse from 'babel-traverse';
import * as path from 'path';
import soyVisit from './soy-traverse';
import {joinErrors, toResult, Result} from './util';
import * as S from './soy-parser';
import * as T from 'babel-types';

function getExternalSoyCalls(ast: S.Program): Array<string> {
  const {calls} = soyVisit(ast, {
    Call(node, state) {
      if (node.namespace) {
        state.calls.add(node.namespace);
      }
    }
  }, {calls: new Set()});

  return [...calls];
}

function getImportPaths(ast: T.Node): Array<string> {
  const importPaths: Array<string> = [];
  jsTraverse(ast, {
    ImportDeclaration(path) {
      importPaths.push(path.node.source.value);
    }
  });

  return importPaths;
}

export default function valdiateCallImports(soyAst: S.Program, jsAst: T.Node): Result {
  const importNames = getImportPaths(jsAst)
    .map(importPath => path.parse(importPath).name);

  const missingImports = getExternalSoyCalls(soyAst)
    .filter(name => !importNames.includes(name));

  if (missingImports.length) {
    return toResult(
      false,
      `It looks like the following component calls are missing an ${chalk.yellow('import')}:\n\n` +
      joinErrors(missingImports));
  }

  return toResult(true);
}
