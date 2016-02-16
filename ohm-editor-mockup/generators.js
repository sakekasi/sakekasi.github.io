'use strict';

window.GENERATORS = {
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
  let histogram = gens.map(()=>0);
  while(true){
    // let sum = histogram.reduce((a, b)=> a+b);
    // let distToSum = histogram.map(x=> sum - x);
    // let sum2 = distToSum.reduce((a, b)=> a+b);
    // let probabilities = distToSum.map(x=> x/sum2);

    let choice = Math.floor(Math.random()*gens.length);
    let i = choice;
    // for(i=0; choice > probabilities[i]; i++ ){
    //   choice -= probabilities[i];
    // }

    histogram[i]++;
    yield gens[i].next().value;
  }
}

function* arrayInfGen(...gens){
  while(true){
    yield gens.map(g=>g.next().value);
  }
}

function* concatInfGen(...gens){
  for(items of arrayInfGen(...gens)){
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
