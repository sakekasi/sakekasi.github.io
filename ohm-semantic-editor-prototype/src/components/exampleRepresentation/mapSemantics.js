'use strict';

var toExport = {
  registerMapSemantics,
  mapSemantics
};

if(typeof module !== "undefined" && typeof module.exports !== "undefined"){
  module.exports = toExport;
} else {
  Object.assign(window, toExport);
}

function registerMapSemantics(semantics){
  semantics.addOperation("mapSemantics(action, nodeToResults, resultMap)", {
    _nonterminal(children){
      // let examplePiece = this.interval.contents;
      let key = this._node.ctorName + '_from_' +
          this.interval.startIdx + '_to_' +
          this.interval.endIdx;
      // let result;
      // try {
      //   // let match = grammar.match(examplePiece, this._node.ctorName);
      //   result = this.args.resultMap[key];
      // } catch(e) {
      //   // console.error(e);
      //   result = e;//new Error(`${this._node.ctorName}: ${this.interval.contents}`);
      // }

      // console.log(typeof this.args.resultMap, this.args.resultMap.constructor && this.args.resultMap.constructor.name )
      if(key in this.args.resultMap){
        this.args.nodeToResults.set(this._node, this.args.resultMap[key]); //result
      }

      children.forEach(child=> child.mapSemantics(this.args.action, this.args.nodeToResults, this.args.resultMap));
    }
  });
}

function mapSemantics(semantics, action, match, resultMap){
  let nodeToResults = new Map();

  semantics(match).mapSemantics(action, nodeToResults, resultMap);

  return nodeToResults;
}
