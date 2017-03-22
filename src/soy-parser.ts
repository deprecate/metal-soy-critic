import {parseTemplateName} from './util';
import * as P from 'parsimmon';

/* Parsers */

const cb = P.string('/}');
const dquote = P.string('"');
const rb = P.string('}');

const attributeName = joined(P.letter, P.string('-'));
const html = P.noneOf('{}').many().desc("Html Char");
const namespace = joined(P.letter, P.digit, P.string('.'));
const paramName = joined(P.letter, P.digit, P.string('_'));
const templateName = joined(P.letter, P.digit, P.string('.'));
const typeName = joined(P.letter, P.digit, P.oneOf('<>?|'));

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

const paramDeclaration = P.seqMap(
  P.string('{@param')
    .then(optional(P.string('?')))
    .map(value => !value),
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

const attribute = P.seqMap(
  attributeName.skip(P.string('="')),
  withAny(dquote),
  Attribute
);

const template = P.seqMap(
  orAny(P.string('{template'))
    .skip(P.whitespace)
    .then(templateName),
  spaced(attribute).many(),
  spaced(rb).then(spaced(paramDeclaration).many()),
  bodyFor('template'),
  Template
);

const delTemplate = P.seqMap(
  orAny(P.string('{deltemplate'))
    .skip(P.whitespace)
    .then(templateName),
  optional(P.seq(P.whitespace, P.string('variant='))
    .then(interpolation('"'))),
  rb.then(spaced(paramDeclaration).many()),
  bodyFor('deltemplate'),
  DelTemplate
);

const program = P.seqMap(
  namespaceCmd,
  P.alt(template, delTemplate)
    .atLeast(1)
    .skip(spaced(P.eof)),
  Program
);

const parser = program;

/* Higher-order Parsers */

export interface Loc {
  start: P.Index;
  end: P.Index;
}

function locMap<T, U>(mapper: (loc: Loc, a1: T) => U, p1: P.Parser<T>): P.Parser<U>;
function locMap<T, U, V>(mapper: (loc: Loc, a1: T, a2: U) => V, p1: P.Parser<T>, p2: P.Parser<U>): P.Parser<V>;
function locMap(mapper: any, ...parsers: Array<any>) {
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

function interpolation(start: string, end: string = start): P.Parser<Interpolation> {
  return P.string(start).then(withAny(P.string(end))).map(Interpolation);
}

function cmd(name: string, ...inter: Array<string>): P.Parser<OtherCmd> {
  return openCmd(name).then(
    bodyFor(name, ...inter).map(body => MakeCmd(name, body))
  );
}

function bodyFor(name: string, ...inter: Array<String>): P.Parser<Body> {
  const bodyParser: P.Parser<Body> = P.lazy(() =>
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
          interpolation('{', '}')),
        bodyParser,
        (left, right: Body) => [left, ...right])))
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
  return P.string(`{${name}`).skip(orAny(rb));
}

/* Nodes */

export type Body = Array<Call | Interpolation | OtherCmd>;

export interface Node {
  body?: Body,
  type: string
}

export interface Program extends Node {
  body: Array<Template>,
  namespace: string,
  type: 'Program',
}

function Program(namespace: string, body: Array<Template>): Program {
  return {
    body,
    namespace,
    type: 'Program'
  };
}

export interface Attribute extends Node {
  name: string,
  value: string,
  type: 'Attribute'
}

function Attribute(name: string, value: string): Attribute {
  return {
    name,
    value,
    type: 'Attribute'
  };
}

export interface Template extends Node {
  attributes: Array<Attribute>,
  body: Body,
  name: string,
  namespace: string | null,
  params: Array<ParamDeclaration>,
  type: 'Template'
}

function Template(
  rawName: string,
  attributes: Array<Attribute>,
  params: Array<ParamDeclaration> = [],
  body: Body = [])
  : Template {
  const {name, namespace} = parseTemplateName(rawName);

  return {
    attributes,
    body,
    name,
    namespace,
    params,
    type: 'Template'
  };
}

export interface DelTemplate extends Node {
  body: Body,
  name: string,
  namespace: string | null,
  params: Array<ParamDeclaration>,
  variant: Interpolation | null,
  type: 'DelTemplate'
}

function DelTemplate(
  rawName: string,
  variant: Interpolation | null,
  params: Array<ParamDeclaration> = [],
  body: Body = [])
  : DelTemplate {
  const {name, namespace} = parseTemplateName(rawName);

  return {
    body,
    name,
    namespace,
    params,
    variant,
    type: 'DelTemplate'
  };
}

export interface Interpolation extends Node {
  content: string,
  type: 'Interpolation'
}

function Interpolation(content: string): Interpolation {
  return {
    content,
    type: 'Interpolation'
  };
}

export interface Param extends Node {
  body: Body,
  name: string,
  type: 'Param'
}

function Param(name: string, body: Body = []): Param {
  return {
    body,
    name,
    type: 'Param'
  };
}

export interface ParamDeclaration extends Node {
  name: string,
  paramType: string,
  required: boolean,
  type: 'ParamDeclaration'
}

function ParamDeclaration(
  required: boolean,
  name: string,
  paramType: string)
  : ParamDeclaration {
  return {
    name,
    paramType,
    required,
    type: 'ParamDeclaration'
  };
}

export interface Call extends Node {
  loc: Loc;
  body: Array<Param>,
  name: string,
  namespace: string | null,
  type: 'Call'
}

function Call(loc: Loc, rawName: string, body: Array<Param> = []): Call {
  const {name, namespace} = parseTemplateName(rawName);

  return {
    loc,
    body,
    name,
    namespace,
    type: 'Call'
  };
}

export interface OtherCmd extends Node {
  body: Body
}

function MakeCmd(name: string, body: Body = []): OtherCmd {
  return {
    body,
    type: name.charAt(0).toUpperCase() + name.slice(1)
  };
}

export class SoyParseError extends Error {}

export default function parse(input: string): Program {
  const result = parser.parse(input);
  if (!result.status) {
    throw new SoyParseError('Failed to parse soy template');
  }
  return result.value;
};
