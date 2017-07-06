import {includes, joinErrors, toResult, Result} from './util';
import * as chalk from 'chalk';
import * as path from 'path';
import * as T from 'babel-types';
import jsTraverse from 'babel-traverse';
import SoyContext from './soy-context';
import JSContext from './js-context';

function getExternalSoyCalls(soyContext: SoyContext): Array<string> {
  const calls: Set<string> = new Set();
  soyContext.visit({
    Call(node) {
      if (node.id.namespace) {
        calls.add(node.id.namespace);
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

export default function valdiateCallImports(soyContext: SoyContext, jsContext: JSContext): Result {
  const importNames = getImportPaths(jsContext.ast)
    .map(importPath => path.parse(importPath).name);

  const missingImports = getExternalSoyCalls(soyContext)
    .filter(name => !importNames.find(importName => includes(importName, name)));

  if (missingImports.length) {
    return toResult(
      false,
      `It looks like the following component calls are missing an ${chalk.yellow('import')}:\n\n` +
      joinErrors(missingImports));
  }

  return toResult(true);
}
