// var HighlightingEditor = require("../highlightingEditor/interaction.js").HighlightingEditor,
var GrammarView = require("../grammarVisualization/interaction.js").GrammarView,
    SemanticEditor = require("../semanticEditor/semanticEditor.js").SemanticEditor,
    utils = require("../../util.js"),
    treeUtils = require("../../treeUtils.js"),
    semanticsOperations = require("../../semanticsOperations.js");
var initSemantics = semanticsOperations.initSemantics;
var createElement = utils.createElement;


var _ = function(arr){return Array.prototype.slice.call(arr)};

class GrammarSemantics{
  constructor(element, {grammar, semantics, match, actions}){
    this.grammar = grammar;
    this.semantics = semantics;
    initSemantics(this.semantics);

    this.match = match

    this.actions = actions;
    let grammarView = new GrammarView(element, {grammar: this.grammar});
    let grammarDomTree = grammarView.element;

    let ruleDOMNodes = Object.keys(grammar.ruleBodies)
      .map(rule=> grammarView.getNode(rule));

    this.ruleToDOM = new Map();
    Object.keys(grammar.ruleBodies)
      .forEach((rule, i)=>{
      this.ruleToDOM.set(rule, ruleDOMNodes[i]);
    });

    this.ruleTOSemanticFunc = new Map();
    this.ruleTOSemanticEditor = new Map();
    Object.keys(grammar.ruleBodies).forEach((ruleName, idx) => {
      let grammarNode = grammarView.getNode(ruleName);
      if (grammarNode.tagName === 'RULE') { //RULE? case insensitive
        let altNode = grammarNode.querySelector('alt');
        if (altNode.children.length > 1) {
          return;
        }
      }

      let semanticEditor = new SemanticEditor(ruleName, grammarNode, {
        ruleTOSemanticFunc: this.ruleTOSemanticFunc,
        grammar: this.grammar, semantics: this.semantics,
        match: this.match, actions
      });
    });

    this.relevantRules = ["Program", "Stmts"];
  }

  highlight(simplifiedCSTNode){
    let ruleName = simplifiedCSTNode.ctorName;
    if(ruleName === "terminal"){
      ruleName = simplifiedCSTNode.cstNodes[0].ctorName;
    }

    let domNode = this.ruleToDOM.get(ruleName);
    if(domNode){
      domNode.classList.add("hover");
      if(this.previousTimeout){ clearTimeout(this.previousTimeout); }
      this.previousTimeout = setTimeout(scrollToNode.bind(null, domNode), 200);
    }
  }

  unHighlight(simplifiedCSTNode){
    let ruleName = simplifiedCSTNode.ctorName;
    if(ruleName === "terminal"){
      ruleName = simplifiedCSTNode.cstNodes[0].ctorName;
    }
    let domNode = this.ruleToDOM.get(ruleName);
    if(domNode){
      domNode.classList.remove("hover");
    }
  }

  split(simplifiedCSTNode){
    let children = simplifiedCSTNode._children?
      simplifiedCSTNode._children:
      simplifiedCSTNode.children;

    children.forEach((child)=>{
      child.current = true;
    });

    let rules = [];
    children.forEach((child)=>{
      child.cstNodes.forEach((cstNode)=>{
        let rule = cstNode.ctorName.split("_")[0];
        rules.push(rule);
      })
    });

    let nextRelevant = this.relevantRules.concat(rules);//.filter((ruleName)=> ruleName !== "terminal");
    // console.log(Array.from(new Set(nextRelevant)));
    this.relevantRules = Array.from(new Set(nextRelevant)); //unique
  }

  join(simplifiedCSTNode){
    let descendants = treeUtils.descendants(simplifiedCSTNode, (child)=>
      child._children? child._children: child.children);
    descendants.forEach((desc)=> desc.current = false);
    simplifiedCSTNode.current = true;

    let rules = [];
    let frontier = [treeUtils.root(simplifiedCSTNode)];
    while(frontier.length > 0){
      let current = frontier.shift();
      current.cstNodes.forEach((cstNode)=>{
        let rule = cstNode.ctorName.split("_")[0];
        rules.push(rule);
      });

      let currentChildren = current.children? current.children: []; //children visible to tree
      frontier = frontier.concat(currentChildren);
    }

    // console.log(rules);
    this.relevantRules = Array.from(new Set(rules));
  }

  get relevantRules(){
    return this._relevantRules;
  }

  set relevantRules(relevantRules){
    this._relevantRules = relevantRules.filter(rule=> this.grammar.ruleBodies.hasOwnProperty(rule));

    //hide all rules
    Array.from(this.ruleToDOM.keys())
      .filter(ruleName=> ruleName.split("_").length < 2)
      .map(key=> this.ruleToDOM.get(key))
      .forEach(domNode=>
        domNode.style.display = "none"
      );

    this._relevantRules.forEach(rule=>{
      this.ruleToDOM.get(rule).style.display = "initial";
    });
  }
}

var toExport = {
  GrammarSemantics
};

if(typeof module !== "undefined" && typeof module.exports !== "undefined"){
  module.exports = toExport;
} else {
  Object.assign(window, toExport);
}


function scrollToNode(domNode){
  let scrollable = domNode.closest("column#grammarSemantics");
  let scrollViewHeight = scrollable.getBoundingClientRect().height;
  let scrollViewY = scrollable.getBoundingClientRect().top;
  let maxScroll = scrollable.scrollHeight - scrollViewHeight

  domNode.scrollIntoView({block: "end", behavior: "smooth"});

  let domNodeHeight = domNode.getBoundingClientRect().height;
  let domNodeY = domNode.getBoundingClientRect().top;

  let newScroll = scrollable.scrollTop + ((domNodeY-scrollViewY) - ((scrollViewHeight - domNodeHeight)/2));
  if(newScroll < 0){
    scrollable.scrollTop = 0;
  } else if(newScroll > maxScroll){
    scrollable.scrollTop = maxScroll;
  } else {
    scrollable.scrollTop = newScroll;
  }
}
