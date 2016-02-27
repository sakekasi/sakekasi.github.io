webpackJsonp([0],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	__webpack_require__(9);
	__webpack_require__(14);


/***/ },
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var $ = __webpack_require__(6),
	    language = __webpack_require__(10),
	    makeExample = __webpack_require__(12),
	    registerInterpret = __webpack_require__(13).registerInterpret;
	
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


/***/ },
/* 10 */,
/* 11 */,
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var language = __webpack_require__(10),
	    chroma = __webpack_require__(7);
	
	
	function renderExample(exampleStr){
	  let example = document.createElement('example');
	  example.textContent = exampleStr;
	
	  try{
	    let match = language.grammar.match(exampleStr);
	    let interpreted = language.semantics(match).interpret();
	    // example.textContent += ` ${interpreted.toString()}`;
	    example.style.color = chroma("green").css("hsl");
	  }catch (e){
	    console.log(e);
	    example.style.color = chroma("red").css("hsl");
	  }
	
	  return example;
	}
	
	module.exports = renderExample;


/***/ },
/* 13 */
/***/ function(module, exports) {

	'use strict';
	
	var toExport = {
	  registerInterpret
	};
	
	if(typeof module !== "undefined" && typeof module.exports !== "undefined"){
	  module.exports = toExport;
	} else {
	  Object.assign(window, toExport);
	}
	
	var constants = {pi: Math.PI, e: Math.E};
	
	function registerInterpret(semantics){
	  semantics.addOperation('interpret', {
	    Exp: function(e) {
	      return e.interpret();  // Note that operations are accessed as methods on the CST nodes.
	    },
	
	    AddExp: function(e) {
	      return e.interpret();
	    },
	    AddExp_plus: function(x, _, y) {
	      return x.interpret() + y.interpret();
	    },
	    // AddExp_minus: function(x, _, y) {
	    //   return x.interpret() - y.interpret();
	    // },
	
	    MulExp:        function(e)         { return e.interpret(); },
	    MulExp_times:  function(x, _, y)   { return x.interpret() * y.interpret(); },
	    MulExp_divide: function(x, _, y)   { return x.interpret() / y.interpret(); },
	    ExpExp:        function(e)         { return e.interpret(); },
	    ExpExp_power:  function(x, _, y)   { return Math.pow(x.interpret(), y.interpret()); },
	    PriExp:        function(e)         { return e.interpret(); },
	    PriExp_paren:  function(_l, e, _r) { return e.interpret(); },
	    PriExp_pos:    function(_, e)      { return e.interpret(); },
	    PriExp_neg:    function(_, e)      { return -e.interpret(); },
	
	    ident: function(_l, _ns) {
	      return constants[this.interval.contents] || 0;
	    },
	    number: function(_) {
	      return parseFloat(this.interval.contents);
	    }
	  });
	}


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var EXAMPLES = __webpack_require__(9),
	    $ = __webpack_require__(6),
	    makeExample = __webpack_require__(12),
	    language = __webpack_require__(10),
	    diversity_fns = __webpack_require__(15);
	
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


/***/ },
/* 15 */
/***/ function(module, exports) {

	//an implementation of pq distance as shown in
	//  Augsten, Nikolaus, Michael Bohlen, and Johann Gamper. "Approximate Tree Matching with pq-Grams."
	function distance_pq(a, b, label = "label", p=2, q=3){
	  //sets of pq labels
	  let profilea = pq_profile(a, p, q, label),
	      profileb = pq_profile(b, p, q, label);
	
	  let intersectionSize = 0;
	  seen = [];
	  profilea.forEach(ai=>{
	    if(profileb.find((bi)=> pq_equal(bi,ai)) &&
	       !seen.find((i)=>pq_equal(ai, i))
	      ){
	      let freqa = profilea.filter(i=> pq_equal(i, ai)).length;
	      let freqb = profileb.filter(i=> pq_equal(i, ai)).length;
	      intersectionSize += Math.min(freqa, freqb);
	      seen.push(ai);
	    }
	  });
	
	  let unionSize = profilea.length + profileb.length;
	
	  return 1 - 2*(intersectionSize / unionSize);
	}
	
	//mean square distance
	function diversity(example, set, label = "label", distance = distance_pq){
	  let diversity = 0;
	  set.forEach((item)=>{
	    diversity += Math.pow(distance(item, example, label), 2);
	  });
	  diversity /= set.length;
	
	  return diversity;
	}
	
	function entropy(set, label = "label"){
	  let buckets = {};
	
	  set.forEach((item)=>{
	    if(!buckets.hasOwnProperty(item[label])){
	      buckets[item[label]] = 0;
	    }
	    buckets[item[label]]++;
	  });
	
	  let sum = Object.keys(buckets).reduce((agg, key)=> agg + buckets[key], 0);
	
	  let proportions = Object.keys(buckets).map((key)=> buckets[key]/sum);
	  console.log(proportions);
	  return -proportions.map((p)=> p * Math.log(p)).reduce((a,b)=> a+b, 0);
	}
	
	if(typeof module !== "undefined" && typeof module.exports !== "undefined"){
	  module.exports = {
	    distance_pq,
	    diversity,
	    entropy
	  };
	} else {
	  window.distance_pq = distance_pq;
	  window.diversity = diversity;
	  window.entropy = entropy;
	}
	
	
	
	
	//PQ DISTANCE HELPERS
	
	function pq_profile(root, p, q, label){
	  let profile = [];
	  let ancestors = makeArray(p);
	  profile = profile_helper(root, p, q, profile, ancestors, label);
	  return profile;
	}
	
	function profile_helper(/*tree,*/ node, p, q, profile, ancestors, label){
	  ancestors = pq_shift(ancestors, node[label]);
	  let siblings = makeArray(q);
	
	  if(node.children && node.children.length > 0){
	    node.children.forEach((child)=>{
	      siblings = pq_shift(siblings, child[label]);
	      profile = profile.concat([ancestors.concat(siblings)]);
	      profile = profile_helper(child, p, q, profile, ancestors, label);
	    })
	  } else { //LEAF
	    profile = profile.concat([ancestors.concat(siblings)]);
	  }
	
	  return profile;
	}
	
	function pq_shift(array, item){
	  array.shift();
	  array.push(item);
	  return array;
	}
	
	function makeArray(length){
	  var array = [];
	  for(let i=0; i<length; i++, array.push(null));
	  return array;
	}
	
	function pq_equal(tuplea, tupleb){
	  return tuplea.map((la,i)=> la === tupleb[i]).reduce((a,b)=> a && b, true);
	}


/***/ }
]);
//# sourceMappingURL=arithmetic.bundle.js.map