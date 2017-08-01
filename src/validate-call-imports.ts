import transform from './string-transformer';
import SoyContext from './soy-context';
import jsTraverse from 'babel-traverse';
import JSContext from './js-context';
import * as T from 'babel-types';
import * as path from 'path';
import * as chalk from 'chalk';
import {joinErrors, toResult, Result} from './util';
import {Config} from './config';

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

export default function valdiateCallImports(soyContext: SoyContext, jsContext: JSContext, config: Config): Result {
  const importNames = getImportPaths(jsContext.ast)
    .map(importPath => path.parse(importPath).name);

  const missingImports = getExternalSoyCalls(soyContext)
    .filter(name => {
      name = transform(name, config.callToImportRegex, config.callToImportReplace);
      return !importNames.find(importName => importName.includes(name));
    });

  if (missingImports.length) {
    return toResult(
      false,
      `It looks like the following component calls are missing an ${chalk.yellow('import')}:\n\n` +
      joinErrors(missingImports));
  }

  return toResult(true);
}
