import jsTraverse from 'babel-traverse';
import * as t from 'babel-types';

export function hasAttribute(node: t.Node, name: string): boolean {
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

export function getParams(ast): Array<t.Property> {
  let node = null;

  jsTraverse(ast, {
    ExportDefaultDeclaration(path) {
      const defaultName = (<t.Identifier>path.node.declaration).name;

      path
        .findParent(path => path.isProgram())
        .scope.bindings[defaultName].referencePaths.forEach(path => {
          const {parentPath} = path;

          if (parentPath.isMemberExpression() &&
            (<t.Identifier>(<t.MemberExpression>parentPath.node).property).name === 'STATE' &&
            parentPath.parentPath.isAssignmentExpression()
          ) {
            node = (<t.ObjectExpression>(<t.AssignmentExpression>parentPath.parentPath.node).right).properties;
          }
        });

      path.stop();
    }
  });

  return node;
}