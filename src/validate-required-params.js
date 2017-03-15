const chalk = require('chalk');
const jsHelpers = require('./js-helpers');
const soyHelpers = require('./soy-helpers');
const {joinErrors, toResult} = require('./util');

module.exports = function validateRequiredParams(soyAst, jsAst) {
  let jsParams = jsHelpers.getParamsNode(jsAst);

  if (!jsParams) {
    return toResult(true);
  }

  const soyParams = soyHelpers.getSoyParams(soyAst);
  const soyParamNames = soyParams.map(param => param.name);

  const requiredJSParams = jsParams.properties
    .filter(node =>
      soyParamNames.includes(node.key.name) &&
        jsHelpers.hasAttribute(node.value, 'required'))
    .map(node => node.key.name);

  const requiredSoyParams = soyParams
    .filter(param => param.required)
    .map(({name}) => name);

  const missingInJS = requiredSoyParams
    .filter(param => !requiredJSParams.includes(param));

  const missingInSoy = requiredJSParams
    .filter(param => !requiredSoyParams.includes(param));

  const messages = [];

  if (missingInJS.length) {
    messages.push(
      `These attributes are ${chalk.yellow('required')} in your Soy Template but not in your Component:\n\n` +
      joinErrors(missingInJS));
  }

  if (missingInSoy.length) {
    messages.push(
      `These attributes are ${chalk.yellow('.required()')} in your Component but not in your Template:\n\n` +
      joinErrors(missingInSoy));
  }

  return toResult(!messages.length, ...messages);
};
