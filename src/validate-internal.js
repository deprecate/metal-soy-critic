const chalk = require('chalk');
const jsHelpers = require('./js-helpers');
const t = require('babel-types');
const {toResult} = require('./util');

function isInternalName(name) {
  return name.startsWith('_') || name.endsWith('_');
}

function isMissingInternal(node) {
  if (t.isIdentifier(node) && node.name === 'Config') {
    return true;
  }

  if (t.isCallExpression(node) &&
    t.isMemberExpression(node.callee) &&
    t.isIdentifier(node.callee.property)
  ) {
    if (node.callee.property.name === 'internal') {
      return false
    }

    return isMissingInternal(node.callee.object);
  }

  return false;
}

module.exports = function validateInternal(soyAst, jsAst) {
  const params = jsHelpers.getParamsNode(jsAst);

  if (!params) {
    return toResult(true);
  }

  const missingInternal = [];
  params.properties.forEach(node => {
    const name = node.key.name;

    if (isInternalName(name) && isMissingInternal(node.value)) {
      missingInternal.push(name)
    }
  });

  if (!missingInternal.length) {
    return toResult(true);
  }

  return toResult(
    false,
    `Based on their name, these attributes should have the ${chalk.yellow('.internal()')} config added:\n\n` +
    missingInternal.map(name => chalk.red(name)).join('\n'));
}
