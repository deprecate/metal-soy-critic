const chalk = require('chalk');

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

function combineResults(first, second) {
  return toResult(
    first.status && second.status,
    ...first.messages.concat(second.messages)
  );
}

module.exports = {
  combineResults,
  joinErrors,
  toResult
};
