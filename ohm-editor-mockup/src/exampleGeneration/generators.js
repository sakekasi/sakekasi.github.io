'use strict';
var EXAMPLES = require("./exampledb.js"),
    $ = require("jquery"),
    makeExample = require("./example.js"),
    language = require('../language.js'),
    diversity_fns = require("./diversity.js");

let diversity = diversity_fns.diversity;
let distance_pq = diversity_fns.distance_pq;

let GENERATORS = {
  Exp,
  AddExp,
  AddExp_plus,
  AddExp_minus,
  MulExp,
  MulExp_times,
  MulExp_divide,
  ExpExp,
  ExpExp_power,
  PriExp,
  PriExp_paren,
  PriExp_pos,
  PriExp_neg,
  ident,
  number,
  number_whole,
  number_fract
};

if(typeof module !== "undefined" && typeof module.exports !== "undefined"){
  module.exports = GENERATORS;
} else {
  window.GENERATORS = GENERATORS;
}

function* Exp(es){
  var seen = new Set();
  for(let e of shuffleGen(es, seen)){
    yield e;
  }

  for(let exp of AddExp([])){
    yield exp;
  }
}

function* AddExp(aes){
  var seen = new Set();
  for(let ae of shuffleGen(aes, seen)){
    yield ae;
  }

  for(let addexp of stochasticChooseGen(
    AddExp_plus([]),
    AddExp_minus([]),
    MulExp([])
  )){
    yield addexp;
  }
}


function* AddExp_plus(aes){
  var seen = new Set();
  for(let ae of shuffleGen(aes, seen)){
    yield ae;
  }

  for(let [ae, me] of arrayInfGen(
    AddExp(EXAMPLES.AddExp),
    MulExp([]))){
    yield `${ae} + ${me}`;
  }
}

function* AddExp_minus(aes){
  var seen = new Set();
  for(let ae of shuffleGen(aes, seen)){
    yield ae;
  }

  for(let [ae, me] of arrayInfGen(
    AddExp(EXAMPLES.AddExp),
    MulExp([]))){
    yield `${ae} - ${me}`;
  }
}

function* MulExp(mes){
  var seen = new Set();
  for(let me of shuffleGen(mes, seen)){
    yield me;
  }

  for(let mulexp of stochasticChooseGen(
    MulExp_times([]),
    MulExp_divide([]),
    ExpExp([])
  )){
    yield mulexp;
  }
}

function* MulExp_times(mes){
  var seen = new Set();
  for(let me of shuffleGen(mes, seen)){
    yield me;
  }

  for(let [me, ee] of arrayInfGen(
    MulExp(EXAMPLES.MulExp),
    ExpExp([])
  )){
    yield `${me}*${ee}`;
  }
}

function* MulExp_divide(mes){
  var seen = new Set();
  for(let me of shuffleGen(mes, seen)){
    yield me;
  }

  for(let [me, ee] of arrayInfGen(
    MulExp(EXAMPLES.MulExp),
    ExpExp([])
  )){
    yield `${me}/${ee}`;
  }
}

function* ExpExp(ees){
  var seen = new Set();
  for(let ee of shuffleGen(ees, seen)){
    yield ee;
  }

  for(let expexp of stochasticChooseGen(
    ExpExp_power([]),
    PriExp([])
  )){
    yield expexp;
  }
}

function* ExpExp_power(ees){
  var seen = new Set();
  for(let ee of shuffleGen(ees, seen)){
    yield ee;
  }

  for(let [pe, ee] of arrayInfGen(PriExp([]), ExpExp(EXAMPLES.ExpExp))){
    yield `${pe}^${ee}`;
  }
}

function* PriExp(pes){
  var seen = new Set();
  for(let pe of shuffleGen(pes, seen)){
    yield pe;
  }

  for(let priexp of stochasticChooseGen(
    PriExp_paren([]),
    PriExp_pos([]),
    PriExp_neg([]),
    ident([]),
    number([])
  )){
    yield priexp;
  }
}

function* PriExp_paren(pes){
  var seen = new Set();
  for(let pe of shuffleGen(pes, seen)){
    yield pe;
  }

  for(let exp of Exp(EXAMPLES.Exp)){
    yield `(${exp})`;
  }
}

function* PriExp_pos(pes){
  var seen = new Set();
  for(let pe of shuffleGen(pes, seen)){
    yield pe;
  }

  for(let priexp of PriExp(EXAMPLES.PriExp)){
    yield `+ ${priexp}`;
  }
}

function* PriExp_neg(pes){
  var seen = new Set();
  for(let pe of shuffleGen(pes, seen)){
    yield pe;
  }

  for(let priexp of PriExp(EXAMPLES.PriExp)){
    yield `- ${priexp}`;
  }
}

function* ident(idents){
  var seen = new Set();
  for(let ident of shuffleGen(idents, seen)){
    yield ident;
  }

  for(let ident of concatInfGen(cycleGen(letter, EXAMPLES.letter),
                                 starGen(alnum, EXAMPLES.alnum))){
    yield ident;
  }
}

function* number(numbers){
  var seen = new Set();
  for(let number of shuffleGen(numbers, seen)){
    yield number;
  }

  for(let priexp of stochasticChooseGen(
    number_whole([]),
    number_fract([])
  )){
    yield priexp;
  }
}

function* number_whole(numbers, numDigits = 1){
  var seen = new Set();
  for(let number of shuffleGen(numbers, seen)){
    yield number;
  }

  for(let number of starGen(digit, EXAMPLES.digit, numDigits)){
    yield number;
  }
}

function* number_fract(numbers, numDigits = 1){
  var seen = new Set();
  for(let number of shuffleGen(numbers, seen)){
    yield number;
  }

  for(let number of concatInfGen(
    starGen(digit, EXAMPLES.digit),
    (function*(){while(true){ yield "."; }})(),
    starGen(digit, EXAMPLES.digit, numDigits)
  )){
    yield number;
  }
}

function* digit(digits){
  var seen = new Set();
  for(let digit of shuffleGen(digits, seen)){
    yield digit;
  }
}

function* alnum(alnums){
  var seen = new Set();
  for(let alnum of shuffleGen(alnums, seen)){
    yield alnum;
  }
}

function* letter(letters){
  var seen = new Set();
  for(let letter of shuffleGen(letters, seen)){
    yield letter;
  }
}


//UTILS

function* stochasticChooseGen(...gens){
  let weights = gens.map(()=>1);
  while(true){
    let sum = weights.reduce((a, b)=> a+b);

    let choice = Math.random()*sum;
    let i;
    for(i = 0; choice > weights[i]; choice -= weights[i++]){}

    weights[i] /= 2;
    yield gens[i].next().value;
  }
}

function* arrayInfGen(...gens){
  while(true){
    yield gens.map(g=>g.next().value);
  }
}

function* concatInfGen(...gens){
  for(let items of arrayInfGen(...gens)){
    yield items.join("");
  }
}

function* cycleGen(genfn, samples){
  while(true){
    let current = genfn(samples);
    for(let example of current){
      yield example;
    }
  }
}

function* starGen(genfn, samples, num = 0){
  while(true){
    if(num === 0){
      yield "";
      num++;
      continue;
    }

    let currentGenerators = [];
    for(let i = 0; i < num; i++){
      currentGenerators.push(genfn(samples));
    }

    let currentValues = currentGenerators.map(g=>g.next());
    while(!currentValues[0].done){
      let example = currentValues.map(i=>i.value).join("");
      yield example;
      currentValues = currentGenerators.map(g=>g.next());
    }

    num++;
  }
}

function* shuffleGen(items, seen){
  if(items instanceof Set){
    items = [...items];
  }

  items = shuffle(items);

  for(let item of items){
    seen.add(item);
    yield item;
  }
}

function shuffle(array) {
  array = array.slice();
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

//DOM STUFF
function setGeneratedExamples(ruleName){
  console.log(ruleName);
  let generator = GENERATORS[ruleName]([]);
  let node = document.querySelector('generatedexamples');
  node.textContent = "";
  if(generator){
    let diverseExamples = [];
    let averageDiversity = 0;
    let numSeen = 0;
    while(numSeen < 50){
      let size = diverseExamples.length;
      let example = generator.next().value;
      let exampleCST;
      let match;

      match = language.grammar.match(example, ruleName);
      exampleCST = match._cst;
      exampleCST.originalText = example;

      let exampleDiversity=0;
      if(size > 0){
        exampleDiversity = diversity(example, diverseExamples, "ctorName");
        exampleCST.diversity = exampleDiversity;
      }

      if(size === 0 || exampleDiversity > averageDiversity){
        if(size >= 10){
          let leastDiversity = diverseExamples.reduce((a, b)=> a.diversity < b.diversity? a: b);
          averageDiversity -= leastDiversity.diversity / diverseExamples.length;
          diverseExamples.forEach((example)=>{
            example.diversity -=
              // Math.pow(distance_pq(leastDiversity, example, "ctorName"), 2) /
              leastDiversity.diversity / diverseExamples.length;
          });
          diverseExamples.splice(diverseExamples.indexOf(leastDiversity), 1);
        }
        //update diversity for each element
        size = diverseExamples.length;
        diverseExamples.forEach((example)=>{
          example.diversity =
            example.diversity * (size / (size + 1)) +
            exampleCST.diversity / (size + 1);
        });
        averageDiversity =
          averageDiversity * (size / (size + 1)) +
          exampleDiversity/ (size + 1);
        diverseExamples.push(exampleCST);
      }

      numSeen++;
    }

    diverseExamples
      .map(i=>i.originalText)
      .map(makeExample).forEach(exampleNode =>{
      node.appendChild(exampleNode);
    });
  }
}

document.addEventListener("DOMContentLoaded", function(){
  setGeneratedExamples("Exp");

  document.querySelector("input#exampleInput").addEventListener("keyup", function(e){
    if(e.code === "Enter"){
      var example = document.querySelector("#exampleInput").value;
      exampleChanged(example);
    }
  });

  $('rule choice').mouseover(function(){
    let ruleName = $(this).closest('rule').children('name').text();
    let caseName = $(this).find('casename');
    if(caseName.length > 0){
      ruleName += "_"+caseName.text();
    } else if($(this).closest('rule').find('alt').get()[0].children.length > 1){
      ruleName = $(this).find('app').text();
    }

    // setRelevantExamples(ruleName);
    setGeneratedExamples(ruleName);
  });

  $('rule > name').mouseover(function(){
    let ruleName = $(this).text();
    // setRelevantExamples(ruleName);
    setGeneratedExamples(ruleName);
  });

  $('action').mouseover(function(){
    let ruleName = $(this).attr('ruleId');
    setGeneratedExamples(ruleName);
  });
});
