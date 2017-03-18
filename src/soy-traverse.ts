import * as S from './soy-parser';

export type VisitFunction<T> = (node: T, state: any) => void;

export interface VisitObject<T> {
  enter?: VisitFunction<T>;
  exit?: VisitFunction<T>;
}

export type Visit<T> = VisitFunction<T> | VisitFunction<T>;

export interface Visitor {
  Call?: Visit<S.Call>,
  Template?: Visit<S.Template>
}

function noop() {}

function getEnter<T>(handler: Visit<T>): VisitFunction<T> {
  if (typeof handler === 'function') {
    return handler;
  } else if (handler && (<VisitObject<T>>handler).enter) {
    return (<VisitObject<T>>handler).enter;
  } else {
    return noop;
  }
}

function getExit<T>(handler: Visit<T>): VisitFunction<T> {
  if (handler && (<VisitObject<T>>handler).exit) {
    return (<VisitObject<T>>handler).exit;
  } else {
    return noop;
  }
}

export default function visit<T>(node: S.Node, visitor: Visitor, state: T): T{
  const handler = visitor[node.type];

  getEnter(handler)(node, state);

  if (node.body) {
    node.body.forEach(node => visit(node, visitor, state))
  }

  getExit(handler)(node, state);

  return state;
}