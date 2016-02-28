//maybe we want to do this using WebComponents
'use strict';

var $ = require("jquery");
var reify = require("./reify.js"),
    mapSemantics = require("./mapSemantics.js"),
    simplifyCST = require("./simplifyCST.js"),
    language = require ("../language.js"),
    TreeViz = require("./tree_visualization.js").TreeViz,
    treeUtils = require("./treeUtils.js"),

    toAST = require("../oo/toAST.js"); //TODO: make this language agnostic

var _ = function(x){ return Array.prototype.slice.call(x)};

var domToOhm, ohmToDom, nodeToSimplified, nodeToResults, treeVisualization;

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
  let match;
  let semmatch;
  try {
    match = grammar.match(example);
    semmatch = semantics(match);
  } catch (e) {
    console.error(match.message);
  }


  //reify the CST to DOM
  let reified = reify.reify(semantics, match);
  let DOM = reified[0];
  domToOhm = reified[1];
  ohmToDom = reified[2];

  exampleNode.textContent = "";
  exampleNode.appendChild(DOM);

  //generate simplified CST
  nodeToSimplified = new Map();
  let simplifiedCST = semmatch.simplifyCST(null, nodeToSimplified);
  nodeToResults = mapSemantics.mapSemantics(semantics, "toAST", match);

  for(let key of ohmToDom.keys()){
    let domNode = ohmToDom.get(key);
    let simplifiedNode = nodeToSimplified.get(key);

    if(! (key.constructor.name === "TerminalNode")){
      if(nodeToResults.has(key)){
        let result = nodeToResults.get(key);

        ohmToDom.get(simplifiedNode.cstNodes[0]).setAttribute("possibleCurrent", "true");

        key.result = result;
        domNode.setAttribute("result", result instanceof Error? "error": "success");
      }
    } else {
      let parent = domNode.parentNode;
      if( Array.prototype.slice.call(parent.children).find(child=> child.tagName.toLowerCase() !== "terminal")  ){
        domNode.classList.add("landmark");
        simplifiedNode.landmark = true;
      }
    }
  }

  //setup "exploding" behaviour
  DOM.classList.add("current");
  nodeToSimplified.get(domToOhm.get(DOM)).current = true;

  treeVisualization = new TreeViz(
    document.querySelector("svg"),
    simplifiedCST,
    ohmToDom,
    {
      splitNode,
      joinNode,
      highlightNode,
      unHighlightNode
    }
  );

  DOM.addEventListener("click", memobind1(onClick, DOM));
  DOM.addEventListener("mouseover", memobind1(onMouseover, DOM));
  DOM.addEventListener("mouseout", memobind1(onMouseout, DOM));


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

//EVENT LISTENERS
function onClick(currentNode, event){
  let currentSimplified = nodeToSimplified.get(domToOhm.get(currentNode));
  if(event.altKey || event.ctrlKey){
    currentSimplified = currentSimplified.parent || currentSimplified;
    joinNode(currentSimplified);
  } else {
    splitNode(currentSimplified);
  }
  event.stopPropagation();
}

function onMouseover(currentNode, event){
  let currentSimplified = nodeToSimplified.get(domToOhm.get(currentNode));
  highlightNode(currentSimplified);
}

function onMouseout(currentNode, event){
  let currentSimplified = nodeToSimplified.get(domToOhm.get(currentNode));
  unHighlightNode(currentSimplified);
}

function makeCurrent(simplifiedCSTNode){
  let domNode = ohmToDom.get(simplifiedCSTNode.cstNodes[0]);
  domNode.classList.add("current");

  domNode.addEventListener("click", memobind1(onClick, domNode));
  domNode.addEventListener("mouseover", memobind1(onMouseover, domNode));
  domNode.addEventListener("mouseout", memobind1(onMouseout, domNode));
}

function makeNonCurrent(simplifiedCSTNode){
  let domNode = ohmToDom.get(simplifiedCSTNode.cstNodes[0]);
  domNode.classList.remove("current");

  domNode.removeEventListener("click", memobind1(onClick, domNode));
  domNode.removeEventListener("mouseover", memobind1(onMouseover, domNode));
  domNode.removeEventListener("mouseout", memobind1(onMouseout, domNode));

  onMouseout(domNode);
}


//VISUALIZATION OPERATIONS
function splitNode(simplifiedCSTNode){
  let children = simplifiedCSTNode._children? simplifiedCSTNode._children: simplifiedCSTNode.children;

  if(children && children.length > 0){
    //make cst node's children current
    simplifiedCSTNode.current = false;
    makeNonCurrent(simplifiedCSTNode);

    //make corresponding dom node's children current
    children.forEach(child=> child.current = true);
    children.forEach(makeCurrent);

    //split tree visualization
    treeVisualization.split(simplifiedCSTNode);
  }
}

function joinNode(simplifiedCSTNode){
  let descendants = treeUtils.descendants(simplifiedCSTNode, (child)=>
    child._children? child._children: child.children);

  //remove cst node's children's noncurrent
  descendants.forEach(child=> child.current = false);
  descendants.forEach(makeNonCurrent);

  //make corresponding dom node current
  simplifiedCSTNode.current = true;
  makeCurrent(simplifiedCSTNode);

  //join tree visualization
  treeVisualization.join(simplifiedCSTNode);
}

function highlightNode(simplifiedCSTNode){
  //highlight corresponding dom node
  let domNode = ohmToDom.get(simplifiedCSTNode.cstNodes[0]);
  domNode.classList.add("active");

  //highlight tree visualization
  treeVisualization.highlight(simplifiedCSTNode);
}

function unHighlightNode(simplifiedCSTNode){
  //unhighlight corresponding dom node
  let domNode = ohmToDom.get(simplifiedCSTNode.cstNodes[0]);
  domNode.classList.remove("active");

  //unhighlight tree viz
  treeVisualization.unHighlight(simplifiedCSTNode);
}
