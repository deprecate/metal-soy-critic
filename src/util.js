function toResult(status, ...messages) {
  return {
    messages,
    status
  };
}

function combineResults(first, second) {
  return toResult(
    first.status && second.status,
    ...first.messages.concat(second.messages)
  );
}

module.exports = {
  combineResults,
  toResult
};
