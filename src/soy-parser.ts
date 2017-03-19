import {parseTemplateName} from './util';
import * as P from 'parsimmon';

/* Parsers */

const rb = P.string('}');
const cb = P.string('/}');
const dquote = P.string('"');

const html = P.noneOf('{}').many().desc("Html Char");
const namespace = joined(P.letter, P.digit, P.string('.'));
const paramName = joined(P.letter, P.digit);
const templateName = joined(P.letter, P.digit, P.string('.'));
const typeName = joined(P.letter, P.digit, P.oneOf('<>?'));

const boolean = P.alt(
  P.string('true').result(true),
  P.string('false').result(false)
);

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

const template = P.seqMap(
  orAny(P.string('{template'))
    .skip(P.whitespace)
    .then(templateName),
  P.seq(P.whitespace, P.string('private="'))
    .then(boolean)
    .skip(dquote)
    .fallback(false),
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

function optional<T>(parser: P.Parser<T>): P.Parser<T | null> {
  return parser.atMost(1).map(values => values[0] || null);
}

function interpolation(start: string, end: string = start): P.Parser<Interpolation> {
  return P.string(start).then(withAny(P.string(end))).map(Interpolation);
}

function cmd(name: string, ...inter: Array<string>): P.Parser<Node> {
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

export type Body = Array<Node>;

export interface Node {
  body?: Body,
  type: string
}

export interface Program extends Node {
  body: Array<Template>,
  namespace: string
}

function Program(namespace: string, body: Array<Template>): Program {
  return {
    body,
    namespace,
    type: 'Program'
  };
}

export interface Template extends Node {
  body: Body,
  name: string,
  namespace: string | null,
  params: Array<ParamDeclaration>,
  private: boolean
}

function Template(
  rawName: string,
  isPrivate: boolean,
  params: Array<ParamDeclaration> = [],
  body: Body = []): Template {
  const {name, namespace} = parseTemplateName(rawName);

  return {
    body,
    name,
    namespace,
    params,
    private: isPrivate,
    type: 'Template'
  };
}

export interface DelTemplate extends Node {
  body: Body,
  name: string,
  namespace: string | null,
  params: Array<ParamDeclaration>,
  variant: Interpolation | null
}

function DelTemplate(
  rawName: string,
  variant: Interpolation | null,
  params: Array<ParamDeclaration> = [],
  body: Body = []): DelTemplate {
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
  content: string
}

function Interpolation(content: string): Interpolation {
  return {
    content,
    type: 'Interpolation'
  };
}

export interface Param extends Node {
  body: Body,
  name: string
}

function Param(name: string, body: Body = []) {
  return {
    body,
    name,
    type: 'Param'
  };
}

export interface ParamDeclaration extends Node {
  name: string,
  paramType: string,
  required: boolean
}

function ParamDeclaration(
  required: boolean,
  name: string,
  paramType: string): ParamDeclaration {
  return {
    name,
    paramType,
    required,
    type: 'ParamDeclaration'
  };
}

export interface Call extends Node {
  body: Body,
  name: string,
  namespace: string | null
}

function Call(rawName: string, body: Body = []): Call {
  const {name, namespace} = parseTemplateName(rawName);

  return {
    body,
    name,
    namespace,
    type: 'Call'
  };
}

function MakeCmd(name: string, body: Body = []): Node {
  return {
    body,
    type: name.charAt(0).toUpperCase() + name.slice(1)
  };
}

export default function parse(input: string): Program {
  const result = parser.parse(input);
  if (!result.status) {
    throw result;
  }
  return result.value;
};
