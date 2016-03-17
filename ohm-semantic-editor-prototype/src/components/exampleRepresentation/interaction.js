//maybe we want to do this using WebComponents
'use strict';

var $ = require("jquery");
var TreeView = require("./treeView.js").TreeView,
    ExampleView = require("./exampleView.js").ExampleView,
    treeUtils = require("../../treeUtils.js"),
    utils = require("../../util.js");
var language = require("../../language.js");

var _ = function(x){ return Array.prototype.slice.call(x)};

class ThirdEyeExampleVisualization {
  //* node - a CST node
  //* simplified - a node in the simplified CST
  //* dom - a node in the reified DOM

  constructor(domNode, {
    semantics, match, keywordTags, actions
  }){
    this.actions = actions;
    this.domNode = domNode;

    this.match = match;
    this.semmatch = semantics(match);

    //3. the simplified cst
    this.nodeToSimplified = new Map();
    this.simplifiedCST = this.semmatch.simplifyCST(null, this.nodeToSimplified);
    this.nodeToResults = new Map();

    let thirdEyeActions = {
      split: this.split.bind(this),
      join: this.join.bind(this),
      highlight: this.highlight.bind(this),
      unHighlight: this.unHighlight.bind(this)
    };

    this.exampleView = new ExampleView(
      this.domNode.querySelector('pre#example'), {
        semantics, match,
        nodeToSimplified: this.nodeToSimplified,
        nodeToResults: this.nodeToResults,
        keywordTags, actions: thirdEyeActions
    });

    this.treeView = new TreeView(
      this.domNode.querySelector("svg"),{
        root: this.simplifiedCST,
        actions: thirdEyeActions
    });
  }

  updateSemanticResults(newNodeToResults){
    // console.log('update', newNodeToResults);
    this.nodeToResults = newNodeToResults;
    this.exampleView.updateSemanticResults(newNodeToResults);
    this.treeView.update();
  }

  split(simplifiedCSTNode){
    let children = simplifiedCSTNode.originalChildren();

    if(simplifiedCSTNode.splittable()){
      //make cst node's children current
      simplifiedCSTNode.current = false;
      children.forEach(child=> child.current = true);

      //split tree visualization
      this.exampleView.split(simplifiedCSTNode);
      this.treeView.split(simplifiedCSTNode);
    } else {
      simplifiedCSTNode.leaf = true;
      this.treeView.update();
    }

    this.actions.split(simplifiedCSTNode); //parent actions
  }

  join(simplifiedCSTNode){
    let descendants = treeUtils.descendants(simplifiedCSTNode, (child)=>
      child.originalChildren());

    descendants.forEach(child=> child.current = false);
    simplifiedCSTNode.current = true;

    this.exampleView.join(simplifiedCSTNode);
    this.treeView.join(simplifiedCSTNode);
    this.actions.join(simplifiedCSTNode);
  }

  highlight(simplifiedCSTNode){
    this.actions.highlight(simplifiedCSTNode);
    this.exampleView.highlight(simplifiedCSTNode);
    this.treeView.highlight(simplifiedCSTNode);
  }

  unHighlight(simplifiedCSTNode){
    this.actions.unHighlight(simplifiedCSTNode);
    this.exampleView.unHighlight(simplifiedCSTNode);
    this.treeView.unHighlight(simplifiedCSTNode);
  }
}

var toExport = {
  ThirdEyeExampleVisualization
};

if(typeof module !== "undefined" && typeof module.exports !== "undefined"){
  module.exports = toExport;
} else {
  Object.assign(window, toExport);
}
