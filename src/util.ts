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

export interface TemplateName {
  name: string,
  namespace: string | null
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

export function isSorted(items: Array<string>): boolean {
  const sortedItems = items
    .concat()
    .sort((a, b) => a.localeCompare(b));

  return sortedItems.join() === items.join();
}
