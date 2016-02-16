'use strict';

var g = ohm.grammarFromScriptElement();

var examples = {};
window.EXAMPLES = examples;

var s = g.semantics();

s.addOperation("addExamples", {
  _nonterminal(children){
    getWithInit(examples, this._node.ctorName, new Set()).add(
      this.interval.contents
    );

    children.forEach((child)=>{
      child.addExamples();
    });
  },
  _terminal(){
    getWithInit(examples, this._node.ctorName, new Set()).add(
      this.interval.contents
    );
  }
});

var examplesSeen = new Set();

function inferExamples(example){
  if(!examplesSeen.has(example)){
    var match = g.match(example);
    s(match).addExamples();
    examplesSeen.add(example);
  }
}

function exampleChanged(example){
  inferExamples(example);

  var exampleNode = document.createElement("example");
  exampleNode.textContent = example;

  document.querySelector("#exampleInput").value = "";

  document.querySelector("examples").appendChild(exampleNode);
  document.querySelector("pre#exampleOutput").textContent = getExampleString();
}

// window.inferExamples = inferExamples;


//UTILS
function getWithInit(object, key, defaultValue){
  if(!object.hasOwnProperty(key)){
    object[key] = defaultValue;
  }

  return object[key];
}

$(document).ready(function(){
  document.querySelector("input#exampleInput").addEventListener("keyup", function(e){
    if(e.code === "Enter"){
      var example = document.querySelector("#exampleInput").value;
      exampleChanged(example);
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
    exampleChanged(example);
  }

  $('rule choice').mouseover(function(){
    let ruleName = $(this).closest('rule').children('name').text();
    let caseName = $(this).find('casename');
    if(caseName.length > 0){
      ruleName += "_"+caseName.text();
    } else if($(this).closest('rule').find('alt').get()[0].children.length > 1){
      ruleName = $(this).find('app').text();
    }

    setRelevantExamples(ruleName);
    setGeneratedExamples(ruleName);
  })

  $('rule > name').mouseover(function(){
    let ruleName = $(this).text();
    setRelevantExamples(ruleName);
    setGeneratedExamples(ruleName);
  })
});

function setRelevantExamples(ruleName){
  let relevantExamples = EXAMPLES[ruleName];
  let node = document.querySelector('relevantexamples');
  node.textContent = "";
  if(relevantExamples){
    for(let example of relevantExamples){
      let exampleNode = document.createElement('example');
      exampleNode.textContent = example;
      node.appendChild(exampleNode);
    }
  }
}

function setGeneratedExamples(ruleName){
  console.log(ruleName);
  let generator = GENERATORS[ruleName]([]);
  let node = document.querySelector('generatedexamples');
  node.textContent = "";
  if(generator){
    let i;
    for(i=0; i < 50; i++, generator.next()){}
    for(i = 0; i < 10; i++){
      let example = generator.next().value;
      let exampleNode = document.createElement('example');
      exampleNode.textContent = example;
      node.appendChild(exampleNode);
    }
  }
}

function getExampleString(){
  return JSON.stringify(
    EXAMPLES,
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
