'use strict';

var semantics = null;

function closeTag(tagName){
  return `</${tagName}>`;
}

function openTag(tagName){
  return `<${tagName}>`;
}


function reify(grammar, example){
  let tagPositions = {};
  let domToOhm = new Map(),
      ohmToDom = new Map();

  if(!semantics){
    semantics = grammar.semantics();
    semantics.addOperation("reifyAST", {
      _nonterminal(children){
        let start = this.interval.startIdx,
            end = this.interval.endIdx;
        let tagName = this._node.ctorName;

        getWithInit(tagPositions, start, []).push(openTag(tagName));
        children.forEach(child=> child.reifyAST());
        getWithInit(tagPositions, end, []).push(closeTag(tagName));
      }
    });

    semantics.addOperation("mapDOM(DOMNode)", {
      _nonterminal(children){
        console.log(this._node.ctorName);
        domToOhm.set(this.args.DOMNode, this._node);
        ohmToDom.set(this._node, this.args.DOMNode);

        let DOMChildren = Array.prototype.slice.apply(this.args.DOMNode.children);
        for(let i=0; i < children.length; i++){
          let child = children[i];
          console.log(child._node.ctorName, child._node.constructor.name);
          if(child._node.ctorName === "_iter"
             && !(child._node.children.length > 0
                  && child._node.children[0].constructor.name === "TerminalNode")){
            let nodes = [];
            child.children.forEach(()=> nodes.push(DOMChildren.shift()));

            child.mapDOM(nodes);
            i += child.children.length === 0? 0: child.children.length - 1;
          } else if(child._node.constructor.name !== "TerminalNode"
                    && child._node.ctorName !== "_iter"){
            child.mapDOM(DOMChildren.shift());
          }
        }
      },
      _iter(children){
        let DOMNodes = this.args.DOMNode;
        if(children.length !== DOMNodes.length){
          return;
        }

        children.forEach((child, i)=> child.mapDOM(DOMNodes[i]));
      }
    });
  }

  let semmatch = semantics(grammar.match(example));

  semmatch.reifyAST();

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

  semmatch.mapDOM(DOM);

  return [DOM, domToOhm, ohmToDom];
}

if(typeof module !== "undefined" && typeof module.exports !== "undefined"){
  module.exports = reify;
} else {
  window.reify = reify;
}



function getWithInit(object, key, defaultValue){
  if(!object.hasOwnProperty(key)){
    object[key] = defaultValue;
  }

  return object[key];
}

function mapObject(object, fun){
  var out = {};
  Object.keys(object).forEach(function(key){
    out[key] = fun(object[key]);
  });

  return out;
}

function mergeObjects(a, b, fun){
  var out = {};
  Object.keys(a).forEach(function(key){
    if(b.hasOwnProperty(key)){
      out[key] = fun(a[key], b[key]);
    } else {
      out[key] = a[key];
    }
  });

  return Object.assign({}, b, out); //if conflict between b and out, prefer out.
}
