'use strict';

window.exampledb = JSON.parse(document.querySelector("script[type='text/json']").textContent);

function* digitDET(digits){
  for(let digit of digits){
    yield digit;
  }
}
function* digitR(digits){
  digits = shuffle(digits);
  for(let digit of digits){
    yield digit;
  }
}

function* n(numbers, numDigits = 1){
  var seen = new Set();
  numbers = shuffle(numbers);
  for(let n of numbers){
    seen.add(n);
    yield n;
  }

  // let numDigits = 0;
  while(true){
    let currentGenerators = [];
    for(let i = 0; i < numDigits; i++){
      currentGenerators.push(digitR(exampledb.digit));
    }

    let currentValues = currentGenerators.map(g=>g.next());
    while(!currentValues[0].done){
      let example = currentValues.map(i=>i.value).join("");
      if(!seen.has(example)){
        yield example;
      }
      currentValues = currentGenerators.map(g=>g.next());
    }

    numDigits++;
  }
}

//PE
// = "(" E ")" -- paren
// | n
function* PE(pes){
  var seen = new Set();
  for(let pe of shuffleGen(pes, seen)){
    yield pe;
  }

  let clauses = [
    (function*(){
      let gen = E([])//exampledb.E);
      while(true){
        yield `(${gen.next().value})`;
      }
    })(),
    n([], Math.floor(Math.random()*5 + 1))
    // n(exampledb.n)
  ];
  let clauseCutoff = [0.5];

  for(var example of synthesizer(clauses, clauseCutoff, seen)){
    yield example;
  }
}

// ME
//   = ME "*" PE -- times
//   = ME "/" PE -- divide
//   | PE
function* ME(mes){
  var seen = new Set();
  for(let me of shuffleGen(mes, seen)){
    yield me;
  }

  let clauses = [
    (function*(){
      let MEgen = ME(exampledb.ME);
      let PEgen = PE([])//exampledb.PE);
      while(true){
        yield `${MEgen.next().value} * ${PEgen.next().value}`;
      }
    })(),
    (function*(){
      let MEgen = ME(exampledb.ME);
      let PEgen = PE([])//exampledb.PE);
      while(true){
        yield `${MEgen.next().value} / ${PEgen.next().value}`;
      }
    })(),
    PE([])//exampledb.PE)
  ];
  let clauseCutoff = [0.33,0.66];

  for(var example of synthesizer(clauses, clauseCutoff, seen)){
    yield example;
  }
}

// AE
//   = AE "+" ME -- plus
//   | AE "-" ME -- minus
//   | ME
function* AE(aes){
  var seen = new Set();
  for(let ae of shuffleGen(aes, seen)){
    yield ae;
  }

  let clauses = [
    (function*(){
      let AEgen = AE(exampledb.AE);
      let MEgen = ME([])//exampledb.ME);
      while(true){
        yield `${AEgen.next().value} + ${MEgen.next().value}`;
      }
    })(),
    (function*(){
      let AEgen = AE(exampledb.AE);
      let MEgen = ME([])//exampledb.ME);
      while(true){
        yield `${AEgen.next().value} - ${MEgen.next().value}`;
      }
    })(),
    ME([])//exampledb.ME)
  ];
  let clauseCutoffs = [
    0.33, 0.66
  ];

  for(var example of synthesizer(clauses, clauseCutoffs, seen)){
    yield example;
  }
}

// E = AE
function* E(es){
  var seen = new Set();
  for(let e of shuffleGen(es, seen)){
    yield e;
  }

  for(let ae of AE([])){//exampledb.AE)){
    yield ae;
  }
}

window.generators = {
  E,
  AE,
  ME,
  PE,
  n
}

window.onload = function(){
  var button = document.querySelector("button#next");
  var examples = document.querySelector("examples");
  var generator = E(exampledb.E);

  var appendExample = function(){
    var example = generator.next().value;
    var exampleElement = document.createElement("example");
    exampleElement.textContent = example;

    examples.appendChild(exampleElement);
  };

  button.addEventListener("click", appendExample);
  document.addEventListener("keydown", function(e){
    if(e.code === "Space"){
      appendExample();
    }
  })
}

function* synthesizer(choices, cutoffs, seen){
  let example;
  while(true){
    example = randomChoiceWithUpdate(choices, cutoffs).next().value;
    if(!seen.has(example)){
      seen.add(example);
      yield example;
    }
  }
}

function* shuffleGen(items, seen){
  items = shuffle(items);
  for(let item of items){
    seen.add(item);
    yield item;
  }
}

function randomChoiceWithUpdate(choices, cutoffs){
  let point = Math.random();

  let i;
  for(i=0; cutoffs[i] < point; i++){}

  if(i < cutoffs.length){
    cutoffs[i] -= 0.05;
  } else if(i === cutoffs.length){
    cutoffs[cutoffs.length - 1] += 0.05;
  }

  return choices[i];
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
