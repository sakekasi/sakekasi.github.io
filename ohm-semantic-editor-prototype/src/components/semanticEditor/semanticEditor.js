var SaveButton = require("./saveButton.js").SaveButton,
     JSTextEditor = require("../jsTextEditor/jsTextEditor.js").JSTextEditor;
var mapSemantics = require("../exampleRepresentation/mapSemantics.js"),
    semanticsOperations = require("../../semanticsOperations.js"),
    utils = require("../../util.js");
var saveAction = semanticsOperations.saveAction,
     reset = semanticsOperations.reset;
var createElement = utils.createElement;

class SemanticEditor {
  constructor(ruleName, ruleDOMNode, {
    ruleTOSemanticFunc, grammar,
    semantics, match, actions
  }){
    this.ruleName = ruleName;
    this.domNode = ruleDOMNode;
    this.semanticFunc = retrieveFunc(ruleTOSemanticFunc, ruleName, semantics);

    let currentNode = this.domNode;

    let optArgStr = this.semanticFunc.args,
        defaultArgs = getArgString(grammar.ruleBodies[ruleName]),
        body = this.semanticFunc.body;

    let seqNode = this.domNode.querySelector('seq');
    let children = Array.from(seqNode.cloneNode(true).children);
    seqNode.innerHTML = '';

    //setup annotations for names
    children.forEach((child, i)=>{
      let block = seqNode.appendChild(createElement('.block'));
      let nameTag = block.appendChild(child.cloneNode(true));
      let nameEditor = block.appendChild(createElement('textarea'));
      nameEditor._idx = i;

      if (!optArgStr || optArgStr[idx] === display) {
        nameEditor.hidden = true;
        if (optArgStr) {
          nameEditor.value = optArgStr;
        } else {
          nameEditor.value = defaultArgs[i];
        }
      } else {
        nameEditor.value = optArgStr[i];
      }

      if (!this.semanticFunc.args) {
        this.semanticFunc.args = [];
      }
      this.semanticFunc.args[i] = nameEditor.value;

      nameEditor.autofocus = true;
      nameEditor.cols = Math.max(nameEditor.value.length, 1);
      nameEditor.addEventListener('keyup', function() {
        nameEditor.cols = Math.max(nameEditor.value.length, 1);
        let args = this.ruleTOSemanticFunc.get(ruleName).args;
        args[nameEditor._idx] = nameEditor.value;
      });
      nameTag.addEventListener('click', function(e) {
        let editor = nameTag.nextSibling;
        editor.hidden = !editor.hidden;
        if (!editor.hidden && editor.value.length === 0) {
          editor.focus();
        }
      });
    })

    if (this.domNode.tagName === 'RULE') {
      currentNode = this.domNode.querySelector('choice');
    }


    this.bodyWrap = currentNode.appendChild(createElement('.bodyWrap'));
    this.bodyWrap.appendChild(createElement('span.arrow', ''));
    this.editorDom = this.bodyWrap.appendChild(createElement('.editorBody'));

    this.jsEditor = new JSTextEditor(
      this.editorDom, {
        body
    });
    this.jsEditor.editor.viewportMargin = Infinity;
    this.jsEditor.changeListeners.push(()=>{
      this.saveButton.saved = false;
    });
    this.jsEditor.settledChangeListeners.push((valid)=>{
      if(!valid){
        return;
      }

      this.saveButton.saved = true;
      let previousFunc = ruleTOSemanticFunc.get(ruleName);

      let before = previousFunc.body && previousFunc.body.trim() !== '';//this.ruleName in semantics.getOperation('eval').actionDict;
      let after = this.jsEditor.editor.getValue().trim() !== '';
      if(!(before && after) && !(!before && !after)){
        this.bodyWrap.classList.toggle('defined');
      }

      saveAction(semantics.getOperation('eval').actionDict,
        ruleName, previousFunc, this.jsEditor.editor.getValue());
      try{
        semanticsOperations.reset();
        semantics(match).eval();
      } catch(e) { console.log(e);}
      console.log(semanticsOperations.resultMap);
      let nodeToResult = mapSemantics.mapSemantics(semantics, "eval", match, semanticsOperations.resultMap);
      // console.log(nodeToResult);
      actions.updateSemanticResults(nodeToResult);
    });


    this.saveButton = new SaveButton();
    this.editorDom.appendChild(this.saveButton.domNode);
    this.saveButton.clickListeners.push(()=>{
      let previousFunc = ruleTOSemanticFunc.get(ruleName);

      let before = previousFunc.body && previousFunc.body.trim() !== '';//this.ruleName in semantics.getOperation('eval').actionDict;
      let after = this.jsEditor.editor.getValue().trim() !== '';
      if(!(before && after) && !(!before && !after)){
        this.bodyWrap.classList.toggle('defined');
      }

      saveAction(semantics.getOperation('eval').actionDict,
        ruleName, previousFunc, this.jsEditor.editor.getValue());
      try{
        semanticsOperations.reset();
        semantics(match).eval();
      } catch(e) { console.log(e);}
      console.log(semanticsOperations.resultMap);
      let nodeToResult = mapSemantics.mapSemantics(semantics, "eval", match, semanticsOperations.resultMap);
      // console.log(nodeToResult);
      actions.updateSemanticResults(nodeToResult);
    })

    this.bodyWrap.hidden = true;

  }
}

var toExport = {
  SemanticEditor
};

if(typeof module !== "undefined" && typeof module.exports !== "undefined"){
  module.exports = toExport;
} else {
  Object.assign(window, toExport);
}

//HELPER FUNCTIONS

function retrieveFunc(ruleTOSemanticFunc, ruleName, semantics) {
  if (ruleTOSemanticFunc.has(ruleName)) {
    return ruleTOSemanticFunc.get(ruleName);
  }

  var funcObj = Object.create(null);

  // TODO: ['get'+actionType](actionName)
  var actionFn = semantics.getOperation('eval').actionDict[ruleName];
  if (actionFn) {
    var actionFnStr = actionFn.toString();
    funcObj.args = [];
    actionFnStr.substring(actionFnStr.indexOf('(') + 1, actionFnStr.indexOf(')'))
      .split(',').forEach(function(arg) {
        funcObj.args.push(arg.trim());
      });

    var startIdx = actionFnStr.indexOf('var ans = (() => {') + 18;
    var nextIdx = actionFnStr.indexOf('})();', startIdx);
    var endIdx;
    while (nextIdx >= 0) {
      endIdx = nextIdx;
      nextIdx = actionFnStr.indexOf('})();', nextIdx + 6);
    }
    funcObj.body = actionFnStr.substring(startIdx, endIdx);
  }

  ruleTOSemanticFunc.set(ruleName, funcObj);
  return funcObj;
}

function getArgString(expr) {
  var ans = [];
  if (expr.constructor.name === 'Seq') {
    ans = expr.toArgString().split(',');
  } else {
    var arg = expr.toArgString();
    ans.push(arg.length === 0 ? '$1' : arg);
  }
  return ans;
}



/** WEBPACK FOOTER **
 ** ./src/components/semanticEditor/semanticEditor.js
 **/
