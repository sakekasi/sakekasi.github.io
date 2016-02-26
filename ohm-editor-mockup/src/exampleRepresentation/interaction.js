//maybe we want to do this using WebComponents
'use strict';

var $ = require("jquery");
var reify = require("./reify.js"),
    mapSemantics = require("./mapSemantics.js"),
    simplifyCST = require("./simplifyCST.js"),
    language = require ("../language.js"),
    TreeViz = require("./tree_visualization.js").TreeViz,

    toAST = require("../oo/toAST.js"); //TODO: make this language agnostic

// var grammar = language.grammar,
//     semantics = language.semantics;

document.addEventListener("DOMContentLoaded", function(event) {
  let grammar = language.grammar,
      semantics = language.semantics;

  //register semantic actions
  reify.registerReifyActions(semantics);
  mapSemantics.registerMapSemantics(grammar, semantics);
  simplifyCST.registerSimplifyAction(semantics);

  toAST.registerToAST(semantics);

  //get semantics match
  let exampleNode = document.querySelector('pre#example');
  let example = exampleNode.textContent;
  let match = grammar.match(example);
  let semmatch = semantics(match);

  //reify the CST to DOM
  let reified = reify.reify(semantics, match);
  let DOM = reified[0],
      domToOhm = reified[1],
      ohmToDom = reified[2];

  exampleNode.textContent = "";
  exampleNode.appendChild(DOM);

  //generate simplified CST
  let nodeToSimplified = new Map();
  let simplifiedCST = semmatch.simplifyCST(null, nodeToSimplified);
  let nodeToResults = mapSemantics.mapSemantics(semantics, "toAST", match);

  for(let key of nodeToResults.keys()){
    if(! (key.constructor.name === "TerminalNode")){
      let domNode = ohmToDom.get(key);
      let result = nodeToResults.get(key);

      key.result = result;
      domNode.setAttribute("result", result instanceof Error? "error": "success");
    }
  }

  //setup "exploding" behaviour
  DOM.classList.add("current");
  nodeToSimplified.get(domToOhm.get(DOM)).current = true;

  let treeVisualization = new TreeViz(
    document.querySelector("svg"),
    simplifiedCST,
    ohmToDom
  );

  let highlightTreeNode = function(node){
    treeVisualization.highlight(nodeToSimplified.get(domToOhm.get(node)));
  };
  let unHighlightTreeNode = function(node){
    treeVisualization.unHighlight(nodeToSimplified.get(domToOhm.get(node)));
  };

  Array.prototype.slice.call(document.querySelectorAll(".current")).forEach(function(node){
    let breakApart = (currentNode, event)=>{
      let currentSimplified = nodeToSimplified.get(domToOhm.get(currentNode));

      currentNode.removeEventListener("click", memobind1(breakApart, currentNode));
      currentNode.removeEventListener("mouseover", memobind1(highlightTreeNode, currentNode));
      currentNode.removeEventListener("mouseout", memobind1(unHighlightTreeNode, currentNode));

      if(currentNode.children.length > 0){
        currentNode.classList.remove("current");
        currentSimplified.current = false;
        unHighlightTreeNode(currentNode);

        Array.prototype.slice.call(nodeToSimplified.get(domToOhm.get(currentNode))._children).forEach((child)=>{
          let domChild = ohmToDom.get(child.cstNodes.slice(-1)[0]);

          domChild.addEventListener("click", memobind1(breakApart, domChild));
          domChild.addEventListener("mouseover", memobind1(highlightTreeNode, domChild));
          domChild.addEventListener("mouseout", memobind1(unHighlightTreeNode, domChild));

          domChild.classList.add("current");
          child.current = true;
        });
      } else {
        currentNode.classList.add("leaf");
      }
      treeVisualization.split(currentSimplified);
    };
    node.addEventListener("click", memobind1(breakApart, node));
    node.addEventListener("mouseover", memobind1(highlightTreeNode, node));
    node.addEventListener("mouseout", memobind1(unHighlightTreeNode, node));
  });

});

let memo = new Map();
function memobind1(fn, arg){
  if(memo.has(fn) && memo.get(fn).has(arg)){
    return memo.get(fn).get(arg);
  } else {
    let bound = fn.bind(null, arg);
    if( !memo.has(fn) ){
      memo.set(fn, new Map());
    }

    memo.get(fn).set(arg, bound);
    return bound;
  }
}
