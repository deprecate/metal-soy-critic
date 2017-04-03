import * as S from './soy-types';
import visit from './soy-traverse';

export function fullName(node: S.Call | S.Template | S.DelTemplate): string {
  const namespace = node.id.namespace || '';
  return `${namespace}.${node.id.name}`;
}

export function getSoyParams(ast: S.Program): Array<S.ParamDeclaration> {
  let params: Array<S.ParamDeclaration> = [];
  visit(ast, {
    Template(node) {
      if (node.id.namespace === null && node.id.name === 'render') {
        params = node.params;
      }
    }
  });
  return params;
}

export function isCall(node: S.Node): node is S.Call {
  return node.type === 'Call';
}

export function isInterpolation(node: S.Node): node is S.Interpolation {
  return node.type === 'Interpolation';
}

export function isReference(node: S.Node): node is S.Reference {
  return node.type === 'Reference';
}

export function isFunctionCall(node: S.Node): node is S.FunctionCall {
  return node.type === 'FunctionCall';
}
