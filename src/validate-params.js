const chalk = require('chalk');
const jsHelpers = require('./js-helpers');
const soyTraverse = require('./soy-traverse');
const {toResult} = require('./util');

function getSoyParams(ast) {
  return soyTraverse.visit(ast, {
    Template(node, state) {
      if (node.name === '.render') {
        state.params = node.params.map(param => param.name);
      }
    }
  }, {params: []}).params;
}

function getJSParams(ast) {
  let params = null;

  const node = jsHelpers.getParamsNode(ast);
  if (node) {
    params = node.properties.map(prop => prop.key.name);
  }

  return params;
}

module.exports = function validateParams(soyAst, jsAst) {
  const jsParams = getJSParams(jsAst);

  if (!jsParams) {
    return toResult(true);
  }

  const missingParams = getSoyParams(soyAst)
    .filter(param => !jsParams.includes(param));

  if (missingParams.length) {
    return toResult(
      false,
      'The following params should be included in STATE:\n\n' +
      missingParams.map(name => chalk.red(name)).join('\n'));
  }

  return toResult(true);
};
