const jsTraverse = require('babel-traverse').default;
const soyTraverse = require('./soy-traverse');
const {toResult} = require('./util');
const chalk = require('chalk');

function getSoyParams(ast) {
  const {params} = soyTraverse.visit(ast, {
    Template(node, state) {
      if (node.name === '.render') {
        state.params = (node.params.map(param => param.name));
      }
    }
  }, {params: []});

  return params;
}

function getJSParams(ast) {
  let defaultName;
  jsTraverse(ast, {
    ExportDefaultDeclaration({node}) {
      defaultName = node.declaration.name;
    }
  });

  if (!defaultName) {
    return null;
  }

  const params = [];
  jsTraverse(ast, {
    Program(path) {
      const binding = path.scope.bindings[defaultName];
      binding.referencePaths.forEach(path => {
        const {container} = path;

        if (container.type === 'MemberExpression' &&
          container.property.name === 'STATE'
        ) {
          if (path.parentPath.parentPath.isAssignmentExpression()) {
            path.parentPath.parentPath.node.right.properties.forEach(
              ({key}) => params.push(key.name)
            );
          }
        }
      });
    }
  });

  return params;
}

module.exports = function(soyAst, jsAst) {
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
