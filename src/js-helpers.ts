import * as T from 'babel-types';
import jsTraverse, {Binding} from 'babel-traverse';

export function getDefaultBinding(ast: T.Node): Binding | null {
  let binding = null;

  jsTraverse(ast, {
    ExportDefaultDeclaration(path) {
      path.stop();

      if (T.isIdentifier(path.node.declaration)) {
        binding = path
          .findParent(path => path.isProgram())
          .scope
          .getBinding(path.node.declaration.name);
      }
    }
  });

  return binding;
}

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

export function getParams(ast: T.Node): Array<T.ObjectProperty> {
  let params: Array<T.ObjectProperty> = [];

  const defaultBinding = getDefaultBinding(ast);
  if (defaultBinding) {
    for (let i = 0; i < defaultBinding.referencePaths.length; i++) {
      const {parentPath} = defaultBinding.referencePaths[i];

      if (T.isMemberExpression(parentPath.node) &&
        T.isIdentifier(parentPath.node.property) &&
        parentPath.node.property.name === 'STATE' &&
        T.isAssignmentExpression(parentPath.parentPath.node) &&
        T.isObjectExpression(parentPath.parentPath.node.right)
      ) {
        parentPath.parentPath.node.right.properties.forEach(node => {
          if (params && T.isObjectProperty(node)) {
            params.push(node);
          }
        });
        break;
      }
    }
  }

  return params;
}

export function getParamNames(ast: T.Node): Array<string> {
  return getParams(ast)
    .map(param => getKeyName(param.key));
}

export function getClassMethodNames(ast: T.Node): Array<string> {
  const methodNames: Array<string> = [];

  const defaultBinding = getDefaultBinding(ast);
  if (defaultBinding && T.isClassDeclaration(defaultBinding.path.node)) {
    defaultBinding.path.node.body.body.forEach(node => {
      if (T.isClassMethod(node)) {
        methodNames.push(getKeyName(node.key));
      }
    });
  }

  return methodNames;
}