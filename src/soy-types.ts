import * as P from 'parsimmon';
import {TemplateName} from './util';

export type Cmd
  = Call
  | Interpolation
  | LetStatement
  | OtherCmd;

export type Body = Array<Node>;

export type Expression
  = MapLiteral
  | StringLiteral
  | NumberLiteral
  | BooleanLiteral
  | OtherExpression
  | Reference
  | Ternary
  | FunctionCall;

export interface Node {
  body?: Body,
  mark: Mark,
  type: string
}

export interface Mark {
  start: P.Index;
  end: P.Index;
}

export interface Program extends Node {
  body: Array<Template | DelTemplate>,
  namespace: string,
  type: 'Program',
}

export function Program(mark: Mark, namespace: string, body: Array<Template>): Program {
  return {
    body,
    mark,
    namespace,
    type: 'Program'
  };
}

export interface Attribute extends Node {
  name: string,
  value: string,
  type: 'Attribute'
}

export function Attribute(mark: Mark, name: string, value: string): Attribute {
  return {
    mark,
    name,
    value,
    type: 'Attribute'
  };
}

export interface OtherExpression extends Node {
  type: 'OtherExpression';
  content: string;
}

export function OtherExpression(mark: Mark, content: string): OtherExpression {
  return {
    content,
    mark,
    type: 'OtherExpression'
  };
}

export interface FunctionCall extends Node {
  type: 'FunctionCall';
  name: string;
  body: Array<Expression>;
}

export function FunctionCall(
  mark: Mark,
  name: string,
  body: Array<Expression>
): FunctionCall {
  return {
    body,
    mark,
    name,
    type: 'FunctionCall'
  };
}

export interface Reference extends Node {
  type: 'Reference';
  name: string;
}

export function Reference(mark: Mark, name: string): Reference {
  return {
    mark,
    name,
    type: 'Reference'
  };
}

export interface Ternary extends Node {
  type: 'Ternary';
  condition: Expression;
  left: Expression;
  right: Expression;
}

export function Ternary(
  mark: Mark,
  condition: Expression,
  left: Expression,
  right: Expression
): Ternary {
  return {
    condition,
    left,
    mark,
    right,
    type: 'Ternary'
  };
}

export interface MapLiteral extends Node {
  items: Array<MapItem>;
  type: 'MapLiteral';
}

export function MapLiteral(mark:Mark, items: Array<MapItem>): MapLiteral {
  return {
    items,
    mark,
    type: 'MapLiteral'
  };
}

export interface MapItem extends Node {
  type: 'MapItem';
  key: StringLiteral;
  value: Expression;
}

export function MapItem(mark: Mark, key: StringLiteral, value: Expression): MapItem {
  return {
    mark,
    key,
    value,
    type: 'MapItem'
  };
}

export interface BooleanLiteral extends Node {
  type: 'BooleanLiteral';
  value: boolean
}

export function BooleanLiteral(mark: Mark, value: boolean): BooleanLiteral {
  return {
    mark,
    type: 'BooleanLiteral',
    value
  };
}

export interface StringLiteral extends Node {
  type: 'StringLiteral';
  value: string;
}

export function StringLiteral(mark: Mark, value: string): StringLiteral {
  return {
    mark,
    type: 'StringLiteral',
    value
  };
}

export interface NumberLiteral extends Node {
  type: 'NumberLiteral';
  value: number;
}

export function NumberLiteral(mark: Mark, value: number): NumberLiteral {
  return {
    mark,
    type: 'NumberLiteral',
    value
  };
}

export interface SoyDoc extends Node {
  about: string,
  params: Array<ParamDeclaration>,
  type: 'SoyDoc'
}

export function SoyDoc(mark: Mark, about: string, params: Array<ParamDeclaration>): SoyDoc {
  return {
    about,
    mark,
    params,
    type: 'SoyDoc'
  };
}

export interface Template extends Node {
  attributes: Array<Attribute>,
  body: Body,
  doc: SoyDoc | null,
  id: TemplateName,
  params: Array<ParamDeclaration>,
  type: 'Template'
}

export function Template(
  mark: Mark,
  doc: SoyDoc | null,
  id: TemplateName,
  attributes: Array<Attribute>,
  params: Array<ParamDeclaration> = [],
  body: Body = [])
  : Template {

  return {
    attributes,
    body,
    mark,
    id,
    params,
    doc,
    type: 'Template'
  };
}

export interface DelTemplate extends Node {
  body: Body,
  doc: SoyDoc | null,
  id: TemplateName,
  params: Array<ParamDeclaration>,
  variant: Interpolation | null,
  type: 'DelTemplate'
}

export function DelTemplate(
  mark: Mark,
  doc: SoyDoc | null,
  id: TemplateName,
  variant: Interpolation | null,
  params: Array<ParamDeclaration> = [],
  body: Body = [])
  : DelTemplate {

  return {
    body,
    doc,
    mark,
    id,
    params,
    variant,
    type: 'DelTemplate'
  };
}

export interface Interpolation extends Node {
  content: string,
  type: 'Interpolation'
}

export function Interpolation(mark: Mark, content: string): Interpolation {
  return {
    content,
    mark,
    type: 'Interpolation'
  };
}

export interface Param extends Node {
  body: Body,
  name: string,
  type: 'Param',
}

export function Param(mark: Mark, name: string, body: Body): Param {
  return {
    body,
    mark,
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

export function ParamDeclaration(
  mark: Mark,
  required: boolean,
  name: string,
  paramType: string)
  : ParamDeclaration {
  return {
    mark,
    name,
    paramType,
    required,
    type: 'ParamDeclaration'
  };
}

export interface LetStatement extends Node {
  type: 'LetStatement';
  body: Body;
  name: string;
}

export function LetStatement(mark: Mark, name: string, body: Body): LetStatement {
  return {
    body,
    mark,
    name,
    type: 'LetStatement'
  };
}

export interface Call extends Node {
  body: Array<Param>,
  id: TemplateName,
  type: 'Call'
}

export function Call(mark: Mark, id: TemplateName, body: Array<Param> = []): Call {
  return {
    mark,
    body,
    id,
    type: 'Call'
  };
}

export interface OtherCmd extends Node {
  body: Body
}

export function OtherCmd(mark: Mark, name: string, body: Body = []): OtherCmd {
  return {
    body,
    mark,
    type: name.charAt(0).toUpperCase() + name.slice(1)
  };
}
