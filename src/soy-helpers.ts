import visit from './soy-traverse';

export function getSoyParams(ast): Array<any> {
  return visit(ast, {
    Template(node, state) {
      if (node.namespace === null && node.name === 'render') {
        state.params = node.params;
      }
    }
  }, {params: []}).params;
}