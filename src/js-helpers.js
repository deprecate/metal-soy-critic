const jsTraverse = require('babel-traverse').default;

function getParamsNode(ast) {
  let node = null;

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
            node = parentPath.parentPath.node.right;
          }
        });

      path.stop();
    }
  });

  return node;
}

module.exports = {
  getParamsNode
};
