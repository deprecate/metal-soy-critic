import * as P from 'parsimmon';

declare module 'parsimmon' {
  function lookahead<T>(p: Parser<T>): P.Parser<string>;

  interface Parser<T> {
    lookahead<U>(p: Parser<U>): Parser<T>;
  }
}
