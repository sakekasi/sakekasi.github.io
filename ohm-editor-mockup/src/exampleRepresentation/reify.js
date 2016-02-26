'use strict';

var util = require("../util.js");

var getWithInit = util.getWithInit,
    mapObject = util.mapObject,
    mergeObjects = util.mergeObjects;

var toExport = {
  registerReifyActions,
  reify
};

if(typeof module !== "undefined" && typeof module.exports !== "undefined"){
  module.exports = toExport;
} else {
  Object.assign(window, toExport);
}

function closeTag(tagName){
  return `</${tagName}>`;
}

function openTag(tagName){
  return `<${tagName}>`;
}

function registerReifyActions(semantics){
  semantics.addOperation("reifyAST(tagPositions)", {
    _nonterminal(children){
      let start = this.interval.startIdx,
      end = this.interval.endIdx;
      let tagName = this._node.ctorName;

      getWithInit(this.args.tagPositions, start, []).push(openTag(tagName));
      children.forEach(child=> child.reifyAST(this.args.tagPositions));
      getWithInit(this.args.tagPositions, end, []).push(closeTag(tagName));
    }
  });

  semantics.addOperation("mapDOM(DOMNode, domToOhm, ohmToDom)", {
    _nonterminal(children){
      console.log(this._node.ctorName);
      this.args.domToOhm.set(this.args.DOMNode, this._node);
      this.args.ohmToDom.set(this._node, this.args.DOMNode);

      let DOMChildren = Array.prototype.slice.apply(this.args.DOMNode.children);
      for(let i=0; i < children.length; i++){
        let child = children[i];
        console.log(child._node.ctorName, child._node.constructor.name);
        if(child._node.ctorName === "_iter"
        && !(child._node.children.length > 0
          && child._node.children[0].constructor.name === "TerminalNode")){
            let nodes = [];
            child.children.forEach(()=> nodes.push(DOMChildren.shift()));

            child.mapDOM(nodes, this.args.domToOhm, this.args.ohmToDom);
            i += child.children.length === 0? 0: child.children.length - 1;
          } else if(child._node.constructor.name !== "TerminalNode"
          && child._node.ctorName !== "_iter"){
            child.mapDOM(DOMChildren.shift(), this.args.domToOhm, this.args.ohmToDom);
          }
        }
      },
      _iter(children){
        let DOMNodes = this.args.DOMNode;
        if(children.length !== DOMNodes.length){
          return;
        }

        children.forEach((child, i)=> child.mapDOM(DOMNodes[i], this.args.domToOhm, this.args.ohmToDom));
      }
    });
}

function reify(semantics, match){
  let tagPositions = {};
  let domToOhm = new Map(),
      ohmToDom = new Map();
  let example = match._cst.interval.contents;

  let semmatch = semantics(match);

  semmatch.reifyAST(tagPositions);

  tagPositions = mapObject(tagPositions, function(tags){
    return tags.join("");
  });

  var positionsToInsert = Object.keys(tagPositions);
  var stringsToInsert = Object.keys(tagPositions).map((key)=>tagPositions[key]);

  var start = 0,
      end;
  var splitExampleString = [];
  while(positionsToInsert.length > 0){
    end = positionsToInsert.shift();
    splitExampleString.push(
      example.substring(start, end)
    );

    start = end;
  }
  splitExampleString.push(
    example.substring(start)
  );

  var annotatedExamplePieces = [];
  annotatedExamplePieces.push(splitExampleString.shift());
  while(stringsToInsert.length > 0){
    annotatedExamplePieces.push(stringsToInsert.shift());
    annotatedExamplePieces.push(splitExampleString.shift());
  }
  annotatedExamplePieces.push(splitExampleString.shift());

  let annotatedExample = annotatedExamplePieces.join("");
  let parser = new DOMParser();
  let DOM = parser.parseFromString(annotatedExample, "text/html");
  DOM = DOM.querySelector('body').children[0];

  semmatch.mapDOM(DOM, domToOhm, ohmToDom);

  return [DOM, domToOhm, ohmToDom];
}
