import {parseTemplateName, reverseJoin} from './util';
import * as P from 'parsimmon';
import * as S from './soy-types';

/* Parsers */

const closingBrace = P.string('/}');
const colon = P.string(':');
const comma = P.string(',');
const dquote = P.string('"');
const lbracket = P.string('[');
const rbrace = P.string('}');
const rbracket = P.string(']');
const squote = P.string('\'');

const attributeName = joined(P.letter, P.string('-'));
const html = P.noneOf('{}').many().desc("Html Char");
const identifierName = joined(P.letter, P.digit, P.string('_'));
const namespace = joined(P.letter, P.digit, P.string('.'));

const templateName = namespace.map(parseTemplateName);

const namespaceCmd = P.string('{namespace')
  .skip(P.whitespace)
  .then(namespace)
  .skip(rbrace);

const stringLiteral = nodeMap(
  S.StringLiteral,
  squote.then(withAny(squote))
);

const booleanLiteral = nodeMap(
  S.BooleanLiteral,
  P.alt(
    P.string('true').result(true),
    P.string('false').result(false))
);

const numberLiteral = nodeMap(
  S.NumberLiteral,
  P.seq(
    P.oneOf('+-').fallback(''),
    joined(P.digit, P.string('.'))
  ).map(([sign, number]) => parseFloat(sign + number))
);

const param = P.lazy(() => nodeMap(
  S.Param,
  P.string('{param')
    .then(spaced(identifierName)),
  P.alt(
    spaced(attribute.many()).skip(rbrace).then(bodyFor('param')),
    spaced(colon).then(expression(closingBrace)))
));

const letStatement = P.lazy(() => nodeMap(
  S.LetStatement,
  P.string('{let')
    .skip(P.whitespace)
    .skip(P.string('$'))
    .then(identifierName),
  P.alt(
    spaced(attribute.many()).skip(rbrace).then(bodyFor('let')),
    spaced(colon).then(expression(closingBrace)))
));

const mapItem = nodeMap(
  S.MapItem,
  stringLiteral,
  spaced(colon).then(expression(P.alt(comma, rbracket)))
);

const mapLiteral = nodeMap(
  S.MapLiteral,
  lbracket.then(P.alt(
    spaced(mapItem).many(),
    P.string(']').result([])))
);

const call = nodeMap(
  S.Call,
  P.string('{call')
    .skip(P.whitespace)
    .then(templateName),
  P.alt(
    spaced(closingBrace).result([]),
    rbrace.then(spaced(param).many())
      .skip(spaced(closeCmd('call'))))
);

const attribute = nodeMap(
  S.Attribute,
  attributeName.skip(P.string('="')),
  withAny(dquote)
);

const paramDeclaration = nodeMap(
  S.ParamDeclaration,
  P.string('{@param')
    .then(optional(P.string('?')))
    .map(value => !value),
  spaced(identifierName),
  spaced(colon)
    .then(withAny(rbrace))
);

const template = nodeMap(
  S.Template,
  orAny(P.string('{template'))
    .skip(P.whitespace)
    .then(templateName),
  spaced(attribute).many(),
  spaced(rbrace).then(spaced(paramDeclaration).many()),
  bodyFor('template')
);

const delTemplate = nodeMap(
  S.DelTemplate,
  orAny(P.string('{deltemplate'))
    .skip(P.whitespace)
    .then(templateName),
  optional(P.seq(P.whitespace, P.string('variant='))
    .then(interpolation('"'))),
  rbrace.then(spaced(paramDeclaration).many()),
  bodyFor('deltemplate')
);

const program = nodeMap(
  S.Program,
  namespaceCmd,
  P.alt(template, delTemplate)
    .atLeast(1)
    .skip(spaced(P.eof))
);

const parser = program;

/* Higher-order Parsers */

function nodeMap<T, U>(mapper: (mark: S.Mark, a1: T) => U, p1: P.Parser<T>): P.Parser<U>;
function nodeMap<T, U, V>(mapper: (mark: S.Mark, a1: T, a2: U) => V, p1: P.Parser<T>, p2: P.Parser<U>): P.Parser<V>;
function nodeMap<T, U, V, W>(mapper: (mark: S.Mark, a1: T, a2: U, a3: V) => W, p1: P.Parser<T>, p2: P.Parser<U>, p3: P.Parser<V>): P.Parser<W>;
function nodeMap<T, U, V, W, X>(mapper: (mark: S.Mark, a1: T, a2: U, a3: V, a4: W) => X, p1: P.Parser<T>, p2: P.Parser<U>, p3: P.Parser<V>, p4: P.Parser<W>): P.Parser<X>;
function nodeMap(mapper: any, ...parsers: Array<any>) {
  return P.seq(...parsers)
    .mark()
    .map(({start, value, end}) => {
      return mapper({
        start,
        end
      }, ...value);
    });
}

function optional<T>(parser: P.Parser<T>): P.Parser<T | null> {
  return parser.atMost(1).map(values => values[0] || null);
}

function expression<T>(end: P.Parser<T>): P.Parser<S.Expression> {
  const spacedEnd = P.optWhitespace.then(end);
  return P.lazy(() => P.alt(
    P.alt(
      stringLiteral,
      booleanLiteral,
      mapLiteral,
      numberLiteral).skip(spacedEnd),
    otherExpression(spacedEnd))
  );
}

function otherExpression<T>(end: P.Parser<T>): P.Parser<S.OtherExpression> {
  return nodeMap(
    S.OtherExpression,
    withAny(end)
  );
}

function interpolation(start: string, end: string = start): P.Parser<S.Interpolation> {
  return nodeMap(
    S.Interpolation,
    P.string(start).then(withAny(P.string(end)))
  );
}

function otherCmd(name: string, ...inter: Array<string>): P.Parser<S.OtherCmd> {
  return nodeMap(
    (mark, body) => S.OtherCmd(mark, name, body),
    openCmd(name).then(bodyFor(name, ...inter))
  );
}

function bodyFor(name: string, ...inter: Array<String>): P.Parser<S.Body> {
  const bodyParser: P.Parser<S.Body> = P.lazy(() =>
    html.then(P.alt(
      closeCmd(name).result([]),
      P.alt(...inter.map(openCmd))
        .result([])
        .then(bodyParser),
      P.seqMap(
        P.alt(
          call,
          letStatement,
          otherCmd('if', 'elseif', 'else'),
          otherCmd('foreach', 'ifempty'),
          otherCmd('msg', 'fallbackmsg'),
          otherCmd('switch'),
          otherCmd('literal'),
          interpolation('{', '}')),
        bodyParser,
        reverseJoin)))
  );

  return bodyParser;
}

function orAny<T>(parser: P.Parser<T>): P.Parser<T> {
  const newParser: P.Parser<T> = P.lazy(() =>
    parser.or(P.any.then(newParser))
  );

  return newParser;
}

function withAny<T>(parser: P.Parser<T>): P.Parser<string> {
  const newParser: P.Parser<string> = P.lazy(() =>
    P.alt(
      parser.result(''),
      P.seqMap(
        P.any,
        newParser,
        (s, next) => s + next))
  );

  return newParser;
}

function spaced<T>(parser: P.Parser<T>): P.Parser<T> {
  return P.optWhitespace
    .then(parser)
    .skip(P.optWhitespace);
}

function joined(...parsers: Array<P.Parser<string>>): P.Parser<string> {
  return P.alt(...parsers)
    .many()
    .map(values => values.join(''));
}

function closeCmd(name: string): P.Parser<string> {
  return P.string(`{/${name}}`);
}

function openCmd(name: string): P.Parser<string> {
  return P.string(`{${name}`).skip(orAny(rbrace));
}

/* API */

export class SoyParseError extends Error {}

export default function parse(input: string): S.Program {
  const result = parser.parse(input);
  if (!result.status) {
    throw new SoyParseError('Failed to parse soy template');
  }
  return result.value;
};
