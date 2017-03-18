import * as chalk from 'chalk';

export interface Result {
  status: boolean;
  messages: Array<string>;
}

export function combineResults(first: Result, second: Result): Result {
  return toResult(
    first.status && second.status,
    ...first.messages.concat(second.messages)
  );
}

export function toResult(status: boolean, ...messages: Array<string>): Result {
  return {
    messages,
    status
  };
}

interface ParsedNamespace {
  name: string,
  namespace: string | null
}

export function parseTemplateName(rawName: string): ParsedNamespace {
  const segments = rawName.split('.');
  const namespace = segments
    .slice(0, segments.length - 1)
    .join('.');

  return {
    name: segments[segments.length - 1],
    namespace: namespace || null
  };
}

export function difference<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  const difference = new Set();
  for (const elem of setA) {
    if (!setB.has(elem)) {
      difference.add(elem);
    }
  }
  return difference;
}

export function joinErrors(lines: Array<string>): string {
  return lines
    .map(line => chalk.red(line))
    .join('\n');
}