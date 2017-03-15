const chalk = require('chalk');
const jsHelpers = require('./js-helpers');
const soyHelpers = require('./soy-helpers');
const {difference, joinErrors, toResult} = require('./util');

module.exports = function validateRequiredParams(soyAst, jsAst) {
  let jsParams = jsHelpers.getParamsNode(jsAst);

  if (!jsParams) {
    return toResult(true);
  }

  const soyParams = soyHelpers.getSoyParams(soyAst);
  const soyParamNames = soyParams.map(param => param.name);

  const requiredJSParams = new Set(jsParams.properties
    .filter(node =>
      soyParamNames.includes(node.key.name) &&
        jsHelpers.hasAttribute(node.value, 'required'))
    .map(node => node.key.name));

  const requiredSoyParams = new Set(soyParams
    .filter(param => param.required)
    .map(({name}) => name));

  const missingInJS = difference(requiredSoyParams, requiredJSParams);
  const missingInSoy = difference(requiredJSParams, requiredSoyParams);

  const messages = [];

  if (missingInJS.size) {
    messages.push(
      `These attributes are ${chalk.yellow('required')} in your Soy Template but not in your Component:\n\n` +
      joinErrors([...missingInJS]));
  }

  if (missingInSoy.size) {
    messages.push(
      `These attributes are ${chalk.yellow('.required()')} in your Component but not in your Template:\n\n` +
      joinErrors([...missingInSoy]));
  }

  return toResult(!messages.length, ...messages);
};
