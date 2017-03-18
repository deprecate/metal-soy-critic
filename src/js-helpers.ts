import jsTraverse from 'babel-traverse';
import * as T from 'babel-types';

export function hasAttribute(node: T.Node, name: string): boolean {
  if (T.isIdentifier(node) && node.name === 'Config') {
    return false;
  }

  if (T.isCallExpression(node) &&
    T.isMemberExpression(node.callee) &&
    T.isIdentifier(node.callee.property)
  ) {
    if (node.callee.property.name === name) {
      return true;
    }

    return hasAttribute(node.callee.object, name);
  }

  return false;
}

export function getParams(ast: T.Node): Array<T.Property> | null {
  let node;

  jsTraverse(ast, {
    ExportDefaultDeclaration(path) {
      const defaultName = (<T.Identifier>path.node.declaration).name;

      path
        .findParent(path => path.isProgram())
        .scope.bindings[defaultName].referencePaths.forEach(path => {
          const {parentPath} = path;

          if (parentPath.isMemberExpression() &&
            (<T.Identifier>(<T.MemberExpression>parentPath.node).property).name === 'STATE' &&
            parentPath.parentPath.isAssignmentExpression()
          ) {
            node = (<T.ObjectExpression>(<T.AssignmentExpression>parentPath.parentPath.node).right).properties;
          }
        });

      path.stop();
    }
  });

  return node;
}