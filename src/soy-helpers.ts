import * as S from './soy-parser';
import visit from './soy-traverse';

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
