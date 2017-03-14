const P = require('parsimmon');

/* Parsers */

const lb = P.string('{');
const rb = P.string('}');
const cb = P.string('/}');

const html = P.noneOf('{}').many().desc("Html Char");
const namespace = joined(P.letter, P.digit, P.string('.'));
const paramName = joined(P.letter, P.digit);
const templateName = joined(P.letter, P.digit, P.string('.'));
const typeName = joined(P.letter, P.digit, P.oneOf('<>?'));

const namespaceCmd = P.string('{namespace')
  .skip(P.whitespace)
  .then(namespace)
  .skip(rb);

const param = P.lazy(() => P.seqMap(
  P.string('{param')
    .then(spaced(paramName)),
  orAny(P.alt(
    cb.result([]),
    rb.then(bodyFor('param')))),
  Param
));

const interpolation = lb.then(withAny(rb)).map(Interpolation);

const paramDeclaration = P.seqMap(
  P.string('{@param')
    .then(P.string('?').atMost(1))
    .map(values => values.length < 1),
  spaced(paramName),
  spaced(P.string(':'))
    .then(spaced(typeName))
    .skip(rb),
  ParamDeclaration
);

const call = P.seqMap(
  P.string('{call')
    .skip(P.whitespace)
    .then(templateName),
  P.alt(
    spaced(cb).result([]),
    rb.then(spaced(param).many())
      .skip(spaced(closeCmd('call')))),
  Call
);

const template = P.seqMap(
  orAny(P.string('{template'))
    .skip(P.whitespace)
    .then(templateName)
    .skip(rb),
  spaced(paramDeclaration).many(),
  bodyFor('template'),
  Template
);

const parser = P.seqMap(
  namespaceCmd,
  template.atLeast(1).skip(spaced(P.eof)),
  Program
);

/* Higher-order Parsers */

function cmd(name, ...inter) {
  return openCmd(name).then(
    bodyFor(name, ...inter).map(body => MakeCmd(name, body))
  );
}

function bodyFor(name, ...inter) {
  const bodyParser = P.lazy(() =>
    html.then(P.alt(
      closeCmd(name).result([]),
      P.alt(...inter.map(openCmd))
        .result([])
        .then(bodyParser),
      P.seqMap(
        P.alt(
          call,
          cmd('if', 'elseif', 'else'),
          cmd('foreach', 'ifempty'),
          cmd('msg', 'fallbackmsg'),
          cmd('switch'),
          cmd('let'),
          cmd('literal'),
          interpolation),
        bodyParser,
        (left, right) => [left, ...right])))
  );

  return bodyParser;
}

function orAny(parser) {
  const newParser = P.lazy(() =>
    parser.or(P.any.then(newParser))
  );

  return newParser;
}

function withAny(parser) {
  const newParser = P.lazy(() =>
    P.alt(
      parser.result(''),
      P.seqMap(
        P.any,
        newParser,
        (s, next) => s + next))
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

function openCmd(name) {
  return P.string(`{${name}`).skip(orAny(rb));
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

function Interpolation(content) {
  return {
    content,
    type: 'Interpolation'
  };
}

function Param(name, body = []) {
  return {
    body,
    name,
    type: 'Param'
  };
}

function ParamDeclaration(required, name, paramType) {
  return {
    name,
    paramType,
    required,
    type: 'ParamDeclaration'
  };
}

function Call(name, body = []) {
  const segments = name.split('.');
  const namespace = segments
    .slice(0, segments.length - 1)
    .join('.');

  return {
    body,
    name: segments[segments.length - 1],
    namespace: namespace || null,
    type: 'Call'
  };
}

function MakeCmd(name, body = []) {
  return {
    body,
    type: name.charAt(0).toUpperCase() + name.slice(1)
  };
}

module.exports = function parse(input) {
  const result = parser.parse(input);
  if (!result.status) {
    throw result;
  }
  return result.value;
};
