import * as S from './soy-parser';
import visit from './soy-traverse';

export function getSoyParams(ast: S.Program): Array<S.ParamDeclaration> {
  return visit(ast, {
    Template(node, state) {
      if (node.namespace === null && node.name === 'render') {
        state.params = node.params;
      }
    }
  }, {params: []}).params;
}
