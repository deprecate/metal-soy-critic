import * as babylon from 'babylon';
import * as T from 'babel-types';
import visit, {Binding, TraverseOptions} from 'babel-traverse';

export default class JSContext {
  readonly ast: T.Node;
  private _defaultBinding: Binding | null;

  constructor(readonly raw: string) {
    this.ast = babylon.parse(raw, {allowImportExportEverywhere: true});
    this._defaultBinding = this._getDefaultBinding();
  }

  static getNameOrMemberName(node: T.Node): string | null {
    if (T.isIdentifier(node)) {
      return node.name;
    } else if (T.isMemberExpression(node)) {
      return JSContext.getKeyName(node.property);
    }
    return null;
  }

  static getKeyName(node: T.Node): string {
    if (T.isIdentifier(node)) {
      return node.name;
    } else if (T.isStringLiteral(node)) {
      return node.value;
    }

    throw new Error('Unable to parse key name');
  }

  static hasAttribute(node: T.Node, name: string): boolean {
    if (T.isIdentifier(node) && node.name === 'Config') {
      return false;
    }

    if (T.isCallExpression(node) &&
      T.isMemberExpression(node.callee) &&
      T.isIdentifier(node.callee.property)
    ) {
      if (node.callee.property.name === name) {
        return true;
      }

      return JSContext.hasAttribute(node.callee.object, name);
    }

    return false;
  }

  getClassMethodNames(): Array<string> {
    const methodNames: Array<string> = [];

    if (this._defaultBinding && T.isClassDeclaration(this._defaultBinding.path.node)) {
      this._defaultBinding.path.node.body.body.forEach(node => {
        if (T.isClassMethod(node)) {
          methodNames.push(JSContext.getKeyName(node.key));
        }
      });
    }

    return methodNames;
  }

  getClassName(): string | null {
    if (this._defaultBinding && T.isClassDeclaration(this._defaultBinding.path.node)) {
      return this._defaultBinding.path.node.id.name;
    }

    return null;
  }

  getParentClassName(): string | null {
    if (this._defaultBinding && T.isClassDeclaration(this._defaultBinding.path.node)) {
      return JSContext.getNameOrMemberName(this._defaultBinding.path.node.superClass);
    }

    return null;
  }

  getParams(): Array<T.ObjectProperty> {
    let params: Array<T.ObjectProperty> = [];

    if (this._defaultBinding) {
      for (let i = 0; i < this._defaultBinding.referencePaths.length; i++) {
        const {parentPath} = this._defaultBinding.referencePaths[i];

        if (T.isMemberExpression(parentPath.node) &&
          T.isIdentifier(parentPath.node.property) &&
          parentPath.node.property.name === 'STATE' &&
          T.isAssignmentExpression(parentPath.parentPath.node) &&
          T.isObjectExpression(parentPath.parentPath.node.right)
        ) {
          params = <Array<T.ObjectProperty>>parentPath.parentPath.node.right.properties
            .filter(node => T.isObjectProperty(node));

          break;
        }
      }
    }

    return params;
  }

  getParamNames(): Array<string> {
    return this.getParams()
      .map(param => JSContext.getKeyName(param.key));
  }

  getSuperClassImportPath(): string | null {
    let importPath = null;

    const parentClassName = this.getParentClassName();
    if (parentClassName) {
      this.visit({
        Program(path) {
          const binding = path.scope.getBinding(parentClassName);

          if (binding && T.isImportDeclaration(binding.path.parentPath.node)) {
            importPath = binding.path.parentPath.node.source.value;
            path.stop();
          }
        }
      });
    }

    return importPath;
  }

  visit(traverseOptions: TraverseOptions) {
    visit(this.ast, traverseOptions);
  }

  private _getDefaultBinding(): Binding | null {
    let binding = null;

    this.visit({
      ExportDefaultDeclaration(path) {
        path.stop();

        if (T.isIdentifier(path.node.declaration)) {
          binding = path
            .findParent(path => path.isProgram())
            .scope
            .getBinding(path.node.declaration.name);
        }
      }
    });

    return binding;
  }
}
