'use strict';

function registerMapSemantics(grammar, semantics){
  semantics.addOperation("mapSemantics(action, nodeToResults)", {
    _nonterminal(children){
      let examplePiece = this.interval.contents;

      let result;
      try {
        let match = grammar.match(examplePiece, this._node.ctorName);
        result = semantics(match)[this.args.action]();
      } catch(e) {
        console.error(e);
        result = e;//new Error(`${this._node.ctorName}: ${this.interval.contents}`);
      }

      this.args.nodeToResults.set(this._node, result);

      children.forEach(child=> child.mapSemantics(this.args.action, this.args.nodeToResults));
    }
  });
}

function mapSemantics(semantics, action, match){
  let nodeToResults = new Map();

  semantics(match).mapSemantics(action, nodeToResults);

  return nodeToResults;
}
