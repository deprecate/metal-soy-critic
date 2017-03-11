const jsTraverse = require('babel-traverse').default;
const soyTraverse = require('./soy-traverse');
const {toResult} = require('./util');
const chalk = require('chalk');

function getSoyParams(ast) {
  return soyTraverse.visit(ast, {
    Template(node, state) {
      if (node.name === '.render') {
        state.params = node.params.map(param => param.name);
      }
    }
  }, {params: []}).params;
}

function getJSParams(ast) {
  let params = null;

  jsTraverse(ast, {
    ExportDefaultDeclaration(path) {
      const defaultName = path.node.declaration.name;

      path
        .findParent(path => path.isProgram())
        .scope.bindings[defaultName].referencePaths.forEach(path => {
          const {parentPath} = path;

          if (parentPath.isMemberExpression() &&
            parentPath.node.property.name === 'STATE' &&
            parentPath.parentPath.isAssignmentExpression()
          ) {
            params = parentPath.parentPath.node.right.properties.map(
              prop => prop.key.name
            );
          }
        });

      path.stop();
    }
  });

  return params;
}

module.exports = function validateParams(soyAst, jsAst) {
  const soyParams = getSoyParams(soyAst);
  const jsParams = getJSParams(jsAst);

  if (!jsParams) {
    return toResult(true);
  }

  const missingParams = soyParams.filter(param => !jsParams.includes(param));

  if (missingParams.length) {
    return toResult(
      false,
      'The following params should be included in STATE:\n\n' +
      missingParams.map(name => chalk.red(name)).join('\n'));
  }

  return toResult(true);
};
