import * as S from './soy-parser';
import visit from './soy-traverse';

export function fullName(call: S.Call): string {
  const namespace = call.namespace || '';
  return `${namespace}.${call.name}`;
}

export function getSoyParams(ast: S.Program): Array<S.ParamDeclaration> {
  let params: Array<S.ParamDeclaration> = [];
  visit(ast, {
    Template(node) {
      if (node.namespace === null && node.name === 'render') {
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
