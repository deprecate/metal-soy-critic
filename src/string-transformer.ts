const INTERPOLATION = /{\$(\d{1,3})((\|[a-zA-Z]+)*)}/g;

export default function transform(input: string, regex: string, output: string): string {
  const matches = input.match(new RegExp(regex));

  if (!matches) {
    throw new Error('Failed to match input string.');
  }

  return output.replace(INTERPOLATION, (_, group: string) => {
    return matches[parseInt(group)];
  });
}
