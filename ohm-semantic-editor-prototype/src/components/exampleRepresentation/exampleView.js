'use strict';

var reify = require("./reify.js"),
    utils = require("../../util.js"),
    treeUtils = require("../../treeUtils.js");

var language = require("../../language.js");

class ExampleView {
  constructor(exampleNode, {
    semantics, match,
    nodeToSimplified, nodeToResults,
    keywordTags, actions
  }){
    this.keywordTags = keywordTags;
    this.actions = actions;
    this.nodeToSimplified = nodeToSimplified;
    this.nodeToResults = nodeToResults;

    //2. the reified form of the CST
    let reified = reify.reify(semantics, match);
    this.DOM = reified[0];
    this.domToOhm = reified[1];
    this.ohmToDom = reified[2];

    this.DOMNode = exampleNode;
    this.DOMNode.textContent = "";
    this.DOMNode.appendChild(this.DOM);

    this.updateSemanticResults(this.nodeToResults);

    //sets relevant flags/adds relevant attributes to the right structure(s)
    for(let key of this.ohmToDom.keys()){
      let domNode = this.ohmToDom.get(key);
      let simplifiedNode = this.nodeToSimplified.get(key);
      let parent = domNode.parentNode;

      this.ohmToDom.get(simplifiedNode.cstNodes[0]).setAttribute("possibleCurrent", "true");
      if(key.constructor.name === "TerminalNode"){
        if( Array.prototype.slice.call(parent.children).find(
              child=> child.tagName.toLowerCase() !== "terminal")){
          parallelToggle("landmark",
            domNode, simplifiedNode
          );
        }
      } else {
        if (this.keywordTags.find(tag=> tag.toLowerCase() === domNode.tagName.toLowerCase())){
          parallelToggle("keyword",
            domNode, simplifiedNode
          );
        }
      }
    }
    parallelToggle("current",
      this.DOM, this.nodeToSimplified.get(this.domToOhm.get(this.DOM))
    );

    this.DOM.addEventListener("click", utils.memobind(this.onClick, this, this.DOM));
    this.DOM.addEventListener("mouseover", utils.memobind(this.onMouseover, this, this.DOM));
    this.DOM.addEventListener("mouseout", utils.memobind(this.onMouseout, this, this.DOM));
  }

  updateSemanticResults(newNodeToResults){
    this.nodeToResults = newNodeToResults;

    for(let key of this.ohmToDom.keys()){
      let domNode = this.ohmToDom.get(key);

      if(key.constructor.name !== "TerminalNode" && this.nodeToResults.has(key)){
        let result = this.nodeToResults.get(key);
        key.result = result;
        domNode.setAttribute("result", result instanceof Error? "error": "success");
      }
    }
  }

  //OPERATIONS
  makeCurrent(node){
    let domNode = this.ohmToDom.get(node.cstNodes[0]);
    domNode.classList.add("current");

    domNode.addEventListener("click", utils.memobind(this.onClick, this, domNode));
    domNode.addEventListener("mouseover", utils.memobind(this.onMouseover, this, domNode));
    domNode.addEventListener("mouseout", utils.memobind(this.onMouseout, this, domNode));
  }

  makeNonCurrent(node){
    let domNode = this.ohmToDom.get(node.cstNodes[0]);
    domNode.classList.remove("current");

    domNode.removeEventListener("click", utils.memobind(this.onClick, this, domNode));
    domNode.removeEventListener("mouseover", utils.memobind(this.onMouseover, this, domNode));
    domNode.removeEventListener("mouseout", utils.memobind(this.onMouseout, this, domNode));

    this.onMouseout(domNode);
  }

  split(simplifiedCSTNode){
    let children = simplifiedCSTNode._children? simplifiedCSTNode._children: simplifiedCSTNode.children;

    this.makeNonCurrent(simplifiedCSTNode);
    children.forEach(this.makeCurrent.bind(this));
  }

  join(simplifiedCSTNode){
    let descendants = treeUtils.descendants(simplifiedCSTNode, (child)=>
      child._children? child._children: child.children);

    descendants.forEach(this.makeNonCurrent.bind(this));
    this.makeCurrent(simplifiedCSTNode);
  }

  highlight(node){
    //highlight corresponding dom node
    let domNode = this.ohmToDom.get(node.cstNodes[0]);
    domNode.classList.add("active");
  }

  unHighlight(node){
    //unhighlight corresponding dom node
    let domNode = this.ohmToDom.get(node.cstNodes[0]);
    domNode.classList.remove("active");
  }

  //EVENT LISTENERS
  onClick(currentNode, event){
    let currentSimplified = this.nodeToSimplified.get(this.domToOhm.get(currentNode));
    if(event.altKey || event.ctrlKey){
      currentSimplified = currentSimplified.parent || currentSimplified;
      this.actions.join(currentSimplified);
    } else {
      this.actions.split(currentSimplified);
    }
    event.stopPropagation();
  }

  onMouseover(currentNode, event){
    let currentSimplified = this.nodeToSimplified.get(this.domToOhm.get(currentNode));
    this.actions.highlight(currentSimplified);
  }

  onMouseout(currentNode, event){
    let currentSimplified = this.nodeToSimplified.get(this.domToOhm.get(currentNode));
    this.actions.unHighlight(currentSimplified);
  }
}

var toExport = {
  ExampleView
};

if(typeof module !== "undefined" && typeof module.exports !== "undefined"){
  module.exports = toExport;
} else {
  Object.assign(window, toExport);
}

//HELPER FUNCTIONS

//sets/removes a flag in several objects/DOM nodes
function parallelToggle(property, ...objects){
  objects.forEach((object)=>{
    if(object instanceof Node){
      if(object.classList.contains(property)){
        object.classList.remove(property);
      } else {
        object.classList.add(property);
      }
    } else {
      if(object[property]){
        object[property] = false;
      } else {
        object[property] = true;
      }
    }
  });
}



/** WEBPACK FOOTER **
 ** ./src/components/exampleRepresentation/exampleView.js
 **/