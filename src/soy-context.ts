import * as S from './soy-types';
import visit, {Visitor} from './soy-traverse';
import parseSoy from './soy-parser';

export default class SoyContext {
  readonly ast: S.Program;

  constructor(readonly raw: string) {
    this.ast = parseSoy(raw);
  }

  getRenderParams(): Array<S.ParamDeclaration> {
    const renderTemplate = this.ast.body
      .find(({id}) => id.namespace === null && id.name === 'render');

    return renderTemplate ? renderTemplate.params : [];
  }

  getRaw({mark}: S.Node): string {
    return this.raw.substring(mark.start.offset, mark.end.offset);
  }

  visit(visitor: Visitor) {
    visit(this.ast, visitor);
  }
}
