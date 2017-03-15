const chalk = require('chalk');
const jsHelpers = require('./js-helpers');
const {joinErrors, toResult} = require('./util');

function isInternalName(name) {
  return name.startsWith('_') || name.endsWith('_');
}

module.exports = function validateInternal(soyAst, jsAst) {
  const params = jsHelpers.getParamsNode(jsAst);

  if (!params) {
    return toResult(true);
  }

  const missingInternal = params.properties
    .filter(node => {
      const name = node.key.name;

      return isInternalName(name) &&
        !jsHelpers.hasAttribute(node.value, 'internal');
    })
    .map(node => node.key.name);

  if (!missingInternal.length) {
    return toResult(true);
  }

  return toResult(
    false,
    `Based on their name, these attributes should have the ${chalk.yellow('.internal()')} config added:\n\n` +
    joinErrors(missingInternal));
}
