function noop() {}

function getEnter(handler) {
  if (typeof handler === 'function') {
    return handler;
  } else if (handler && handler.enter) {
    return handler.enter;
  } else {
    return noop;
  }
}

function getExit(handler) {
  if (handler && handler.exit) {
    return handler.exit;
  } else {
    return noop;
  }
}

export default function visit(node, visitor, state) {
  const handler = visitor[node.type];

  getEnter(handler)(node, state);

  if (node.body) {
    node.body.forEach(node => visit(node, visitor, state))
  }

  getExit(handler)(node, state);

  return state;
}