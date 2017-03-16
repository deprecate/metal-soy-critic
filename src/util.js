const chalk = require('chalk');
const Promise = require('bluebird');

function combineResults(first, second) {
  return toResult(
    first.status && second.status,
    ...first.messages.concat(second.messages)
  );
}

function difference(setA, setB) {
  const difference = new Set();
  for (const elem of setA) {
    if (!setB.has(elem)) {
      difference.add(elem);
    }
  }
  return difference;
}

function toResult(status, ...messages) {
  return {
    messages,
    status
  };
}

function parseTemplateName(rawName) {
  const segments = rawName.split('.');
  const namespace = segments
    .slice(0, segments.length - 1)
    .join('.');

  return {
    name: segments[segments.length - 1],
    namespace: namespace || null
  };
}

function sequence(...tasks) {
  return Promise.reduce(tasks, (res, next) =>
    next().then(value => [...res, value]),
    []
  );
}

function joinErrors(lines) {
  return lines
    .map(line => chalk.red(line))
    .join('\n');
}

module.exports = {
  combineResults,
  difference,
  joinErrors,
  parseTemplateName,
  sequence,
  toResult
};
