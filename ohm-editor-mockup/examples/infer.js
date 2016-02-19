'use strict';

window.g = ohm.grammarFromScriptElement();

function inferExamples(example){
  var examples = {};

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

  var match = g.match(example);
  s(match).addExamples();

  return examples;
}

function exampleChanged(){
  var example = document.querySelector("#exampleIn").value;
  document.querySelector("#exampleOut").textContent = JSON.stringify(
    inferExamples(example),
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

window.inferExamples = inferExamples;


//UTILS
function getWithInit(object, key, defaultValue){
  if(!object.hasOwnProperty(key)){
    object[key] = defaultValue;
  }

  return object[key];
}
