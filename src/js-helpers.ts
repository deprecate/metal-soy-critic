import * as T from 'babel-types';
import jsTraverse from 'babel-traverse';

export function getKeyName(node: T.Node): string {
  if (T.isIdentifier(node)) {
    return node.name;
  } else if (T.isStringLiteral(node)) {
    return node.value;
  }

  throw new Error('Unable to parse key name');
}

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

export function getParams(ast: T.Node): Array<T.ObjectProperty> | null {
  let node = null;

  jsTraverse(ast, {
    ExportDefaultDeclaration(path) {
      let defaultName;
      if (T.isIdentifier(path.node.declaration)) {
        defaultName = path.node.declaration.name;
      } else {
        return;
      }

      path
        .findParent(path => path.isProgram())
        .scope.bindings[defaultName].referencePaths.forEach(path => {
          const {parentPath} = path;

          if (T.isMemberExpression(parentPath.node) &&
            T.isIdentifier(parentPath.node.property) &&
            parentPath.node.property.name === 'STATE' &&
            T.isAssignmentExpression(parentPath.parentPath.node) &&
            T.isObjectExpression(parentPath.parentPath.node.right)
          ) {
            node = parentPath.parentPath.node.right.properties;
          }
        });

      path.stop();
    }
  });

  return node;
}
