const soyTraverse = require('./soy-traverse');

function getSoyParams(ast) {
  return soyTraverse.visit(ast, {
    Template(node, state) {
      if (node.namespace === null && node.name === 'render') {
        state.params = node.params;
      }
    }
  }, {params: []}).params;
}

module.exports = {
  getSoyParams
};
