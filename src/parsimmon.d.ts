import 'parsimmon';

declare module 'parsimmon' {
  function lookahead<T>(p: Parser<T>): Parser<string>;

  interface Parser<T> {
    lookahead<U>(p: Parser<U>): Parser<T>;
  }
}
