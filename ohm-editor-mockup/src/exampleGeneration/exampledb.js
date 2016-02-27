'use strict';

var $ = require("jquery"),
    language = require("../language.js"),
    makeExample = require("./example.js"),
    registerInterpret = require("../arithmetic/interpret.js").registerInterpret;

var examples = {};

if(typeof module !== "undefined" && typeof module.exports !== "undefined"){
  module.exports = examples;
} else {
  window.EXAMPLES = examples;
}


var examplesSeen = new Set();

function inferExamples(example){
  if(!examplesSeen.has(example)){
    var match = language.grammar.match(example);
    language.semantics(match).addExamples();
    examplesSeen.add(example);
  }
}

function exampleAdded(example){
  inferExamples(example);
  var exampleNode = makeExample(example);
  document.querySelector("examples").appendChild(exampleNode);
}

//UTILS
function getWithInit(object, key, defaultValue){
  if(!object.hasOwnProperty(key)){
    object[key] = defaultValue;
  }

  return object[key];
}

document.addEventListener("DOMContentLoaded", function(){
   registerInterpret(language.semantics);

   language.semantics.addOperation("addExamples", {
    _nonterminal(children){
      getWithInit(module.exports, this._node.ctorName, new Set()).add(
        this.interval.contents
      );

      children.forEach((child)=>{
        child.addExamples();
      });
    },
    _terminal(){
      getWithInit(module.exports, this._node.ctorName, new Set()).add(
        this.interval.contents
      );
    }
  });

  document.querySelector("input#exampleInput").addEventListener("keyup", function(e){
    if(e.code === "Enter"){
      var example = document.querySelector("#exampleInput").value;
      exampleAdded(example);
      document.querySelector("#exampleInput").value = "";
    }
  });

  var examples = [
    "a + b * c ^ d - -e",
    "pi * (r ^ 2)",
    "12 + 34 ^ + 55",
    "test / 0",
    "3.14159265"
  ];
  for(let example of examples){
    exampleAdded(example);
  }

  setRelevantExamples("Exp");

  $('rule choice').mouseover(function(){
    let ruleName = $(this).closest('rule').children('name').text();
    let caseName = $(this).find('casename');
    if(caseName.length > 0){
      ruleName += "_"+caseName.text();
    } else if($(this).closest('rule').find('alt').get()[0].children.length > 1){
      ruleName = $(this).find('app').text();
    }

    setRelevantExamples(ruleName);
    // setGeneratedExamples(ruleName);
  })

  $('rule > name').mouseover(function(){
    let ruleName = $(this).text();
    setRelevantExamples(ruleName);
    // setGeneratedExamples(ruleName);
  })

  $('action').mouseover(function(){
    let ruleName = $(this).attr('ruleId');
    setRelevantExamples(ruleName);
  });
});

function setRelevantExamples(ruleName){
  let relevantExamples = examples[ruleName];
  let node = document.querySelector('relevantexamples');

  while (node.hasChildNodes()) {
    node.removeChild(node.lastChild);
  }

  if(relevantExamples){
    for(let example of relevantExamples){
      node.appendChild(makeExample(example));
    }
  }
}


function getExampleString(){
  return JSON.stringify(
    examples,
    function(k, v){
      if(v instanceof Set){
        var a = [];
        for(var item of v){
          a.push(item);
        }
        return a;
      }
      return v;
    },
    '  '
  );
}
