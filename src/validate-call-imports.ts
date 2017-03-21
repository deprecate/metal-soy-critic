import {joinErrors, toResult, Result} from './util';
import * as chalk from 'chalk';
import * as path from 'path';
import * as S from './soy-parser';
import * as T from 'babel-types';
import jsTraverse from 'babel-traverse';
import soyVisit from './soy-traverse';

function getExternalSoyCalls(ast: S.Program): Array<string> {
  const calls: Set<string> = new Set();
  soyVisit(ast, {
    Call(node) {
      if (node.namespace) {
        calls.add(node.namespace);
      }
    }
  });
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
