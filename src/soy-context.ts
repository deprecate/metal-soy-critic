import parseSoy, {types as S, traverse} from 'soyparser';

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

  visit(visitor: traverse.Visitor) {
    traverse.visit(this.ast, visitor);
  }
}
