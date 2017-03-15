const chalk = require('chalk');

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

function joinErrors(lines) {
  return lines
    .map(line => chalk.red(line))
    .join('\n');
}

module.exports = {
  combineResults,
  difference,
  joinErrors,
  toResult
};
