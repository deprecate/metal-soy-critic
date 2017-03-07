const P = require('parsimmon');
const Promise = require('bluebird');

/* Parsers */

const rb = P.string('}');

const namespace = joined(P.letter, P.digit, P.string('.'));

const paramName = joined(P.letter, P.digit);

const templateName = joined(P.letter, P.digit, P.string('.'));

const typeName = joined(P.letter, P.digit, P.oneOf('<>?'));

const namespaceCmd = P.string('{namespace')
  .skip(P.whitespace)
  .then(namespace)
  .skip(rb);

const param = P.seqMap(
  P.string('{@param')
    .then(P.string('?').atMost(1))
    .map(values => values.length < 1),
  spaced(paramName),
  spaced(P.string(':'))
    .then(spaced(typeName))
    .skip(rb),
  Param
);

const call = P.string('{call')
  .skip(P.whitespace)
  .then(templateName)
  .skip(P.alt(
    P.string(' /}'),
    rb.then(orAny(closeCmd('call')))))
  .map(Call);

const template = P.seqMap(
  orAny(P.string('{template'))
    .skip(P.whitespace)
    .then(templateName)
    .skip(rb),
  spaced(param).many(),
  orAny(call).many()
    .skip(orAny(closeCmd('template'))),
  Template
);

const parser = P.seqMap(
  namespaceCmd,
  template.atLeast(1).skip(spaced(P.eof)),
  Program
);

/* Helpers */

function orAny(parser) {
  const newParser = P.lazy(() =>
    P.alt(parser, P.any.then(newParser))
  );

  return newParser;
}

function spaced(parser) {
  return P.optWhitespace
    .then(parser)
    .skip(P.optWhitespace);
}

function joined(...parsers) {
  return P.alt(...parsers)
    .many()
    .map(values => values.join(''));
}

function closeCmd(name) {
  return P.string(`{/${name}}`);
}


/* Nodes */

function Program(namespace, body) {
  return {
    body,
    namespace,
    type: 'Program'
  };
}

function Template(name, params = [], body = []) {
  return {
    body,
    name,
    params,
    type: 'Template'
  };
}

function Param(required, name, paramType) {
  return {
    name,
    paramType,
    required,
    type: 'Param'
  };
}

function Call(name) {
  return {
    name,
    type: 'Call'
  };
}

module.exports = function parse(input) {
  const result = parser.parse(input);
  if (!result.status) {
    throw result;
  }
  return result.value;
};
