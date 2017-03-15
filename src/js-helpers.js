const jsTraverse = require('babel-traverse').default;
const t = require('babel-types');

function hasAttribute(node, name) {
  if (t.isIdentifier(node) && node.name === 'Config') {
    return false;
  }

  if (t.isCallExpression(node) &&
    t.isMemberExpression(node.callee) &&
    t.isIdentifier(node.callee.property)
  ) {
    if (node.callee.property.name === name) {
      return true;
    }

    return hasAttribute(node.callee.object, name);
  }

  return false;
}

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
  getParamsNode,
  hasAttribute
};
