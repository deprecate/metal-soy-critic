import * as S from './soy-types';

export type VisitFunction<T> = (node: T) => void;

export interface VisitObject<T> {
  enter?: VisitFunction<T>;
  exit?: VisitFunction<T>;
}

export type Visit<T> = VisitFunction<T> | VisitObject<T>;

export interface Visitor {
  Call?: Visit<S.Call>;
  MapLiteral?: Visit<S.MapLiteral>,
  Template?: Visit<S.Template>;
  [propName: string]: Visit<S.Node> | undefined;
}

function noop() {}

function getEnter<T>(handler: Visit<T> | undefined): VisitFunction<T> {
  if (typeof handler === 'function') {
    return handler;
  } else if (handler && handler.enter) {
    return handler.enter;
  }

  return noop;
}

function getExit<T>(handler: Visit<T> | undefined): VisitFunction<T> {
  if (typeof handler === 'object' && handler.exit) {
    return handler.exit;
  }

  return noop;
}

export default function visit(node: S.Node, visitor: Visitor): void {
  const handler = visitor[node.type];

  getEnter(handler)(node);

  if (node.body) {
    if (Array.isArray(node.body)) {
      node.body.forEach(node => visit(node, visitor));
    } else {
      visit(node.body, visitor);
    }
  }

  getExit(handler)(node);
}
