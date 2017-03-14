const chalk = require('chalk');
const jsTraverse = require('babel-traverse').default;
const path = require('path');
const soyTraverse = require('./soy-traverse');
const {toResult} = require('./util');

function getExternalSoyCalls(ast) {
  const {calls} = soyTraverse.visit(ast, {
    Call(node, state) {
      if (node.namespace) {
        state.calls.add(node.namespace);
      }
    }
  }, {calls: new Set()});

  return Array.from(calls.values());
}

function getImportPaths(ast) {
  const importPaths = [];
  jsTraverse(ast, {
    ImportDeclaration(path) {
      importPaths.push(path.node.source.value);
    }
  });

  return importPaths;
}

module.exports = function valdiateCallImports(soyAst, jsAst) {
  const importNames = getImportPaths(jsAst)
    .map(importPath => path.parse(importPath).name);

  const missingImports = getExternalSoyCalls(soyAst)
    .filter(name => !importNames.includes(name));

  if (missingImports.length) {
    return toResult(
      false,
      `It looks like the following component calls are missing an ${chalk.yellow('import')}:\n\n` +
      missingImports.map(name => chalk.red(name)).join('\n'));
  }

  return toResult(true);
}
