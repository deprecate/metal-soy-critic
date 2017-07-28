import * as changeCase from 'change-case';

const INTERPOLATION = /{\$(\d{1,3})((\|[a-zA-Z]+)*)}/g;

function applyFilters(input: string, filters: Array<string>): string {
  return filters.reduce(
    (result, filter) => ((<any>changeCase)[filter] || defaultFilter)(result),
    input);
}

function defaultFilter(input: string): string {
  return input;
}

changeCase;
defaultFilter;
export default function transform(input: string, regex: string, output: string): string {
  const matches = input.match(new RegExp(regex));

  if (!matches) {
    throw new Error('Failed to match input string.');
  }

  return output.replace(INTERPOLATION, (_, group: string, rawFilters: string) => {
    const filters = rawFilters
      .split('|')
      .filter(filter => filter);

    return applyFilters(
      matches[parseInt(group)],
      filters);
  });
}
