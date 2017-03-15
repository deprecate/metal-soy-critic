const chalk = require('chalk');
const jsHelpers = require('./js-helpers');
const soyHelpers = require('./soy-helpers');
const {joinErrors, toResult} = require('./util');

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

  const missingParams = soyHelpers.getSoyParams(soyAst)
    .map(param => param.name)
    .filter(param => !jsParams.includes(param));

  if (missingParams.length) {
    return toResult(
      false,
      `The following params should be included in ${chalk.yellow('STATE')}:\n\n` +
      joinErrors(missingParams));
  }

  return toResult(true);
};
