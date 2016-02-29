webpackJsonp([0],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
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
	
	if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
	  module.exports = examples;
	} else {
	  window.EXAMPLES = examples;
	}
	
	var examplesSeen = new Set();
	
	function inferExamples(example) {
	  if (!examplesSeen.has(example)) {
	    var match = language.grammar.match(example);
	    language.semantics(match).addExamples();
	    examplesSeen.add(example);
	  }
	}
	
	function exampleAdded(example) {
	  inferExamples(example);
	  var exampleNode = makeExample(example);
	  document.querySelector("examples").appendChild(exampleNode);
	}
	
	//UTILS
	function getWithInit(object, key, defaultValue) {
	  if (!object.hasOwnProperty(key)) {
	    object[key] = defaultValue;
	  }
	
	  return object[key];
	}
	
	document.addEventListener("DOMContentLoaded", function () {
	  registerInterpret(language.semantics);
	
	  language.semantics.addOperation("addExamples", {
	    _nonterminal: function _nonterminal(children) {
	      getWithInit(module.exports, this._node.ctorName, new Set()).add(this.interval.contents);
	
	      children.forEach(function (child) {
	        child.addExamples();
	      });
	    },
	    _terminal: function _terminal() {
	      getWithInit(module.exports, this._node.ctorName, new Set()).add(this.interval.contents);
	    }
	  });
	
	  document.querySelector("input#exampleInput").addEventListener("keyup", function (e) {
	    if (e.code === "Enter") {
	      var example = document.querySelector("#exampleInput").value;
	      exampleAdded(example);
	      document.querySelector("#exampleInput").value = "";
	    }
	  });
	
	  var examples = ["a + b * c ^ d - -e", "pi * (r ^ 2)", "12 + 34 ^ + 55", "test / 0", "3.14159265"];
	  var _iteratorNormalCompletion = true;
	  var _didIteratorError = false;
	  var _iteratorError = undefined;
	
	  try {
	    for (var _iterator = examples[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	      var example = _step.value;
	
	      exampleAdded(example);
	    }
	  } catch (err) {
	    _didIteratorError = true;
	    _iteratorError = err;
	  } finally {
	    try {
	      if (!_iteratorNormalCompletion && _iterator.return) {
	        _iterator.return();
	      }
	    } finally {
	      if (_didIteratorError) {
	        throw _iteratorError;
	      }
	    }
	  }
	
	  setRelevantExamples("Exp");
	
	  $('rule choice').mouseover(function () {
	    var ruleName = $(this).closest('rule').children('name').text();
	    var caseName = $(this).find('casename');
	    if (caseName.length > 0) {
	      ruleName += "_" + caseName.text();
	    } else if ($(this).closest('rule').find('alt').get()[0].children.length > 1) {
	      ruleName = $(this).find('app').text();
	    }
	
	    setRelevantExamples(ruleName);
	    // setGeneratedExamples(ruleName);
	  });
	
	  $('rule > name').mouseover(function () {
	    var ruleName = $(this).text();
	    setRelevantExamples(ruleName);
	    // setGeneratedExamples(ruleName);
	  });
	
	  $('action').mouseover(function () {
	    var ruleName = $(this).attr('ruleId');
	    setRelevantExamples(ruleName);
	  });
	});
	
	function setRelevantExamples(ruleName) {
	  var relevantExamples = examples[ruleName];
	  var node = document.querySelector('relevantexamples');
	
	  while (node.hasChildNodes()) {
	    node.removeChild(node.lastChild);
	  }
	
	  if (relevantExamples) {
	    var _iteratorNormalCompletion2 = true;
	    var _didIteratorError2 = false;
	    var _iteratorError2 = undefined;
	
	    try {
	      for (var _iterator2 = relevantExamples[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	        var example = _step2.value;
	
	        node.appendChild(makeExample(example));
	      }
	    } catch (err) {
	      _didIteratorError2 = true;
	      _iteratorError2 = err;
	    } finally {
	      try {
	        if (!_iteratorNormalCompletion2 && _iterator2.return) {
	          _iterator2.return();
	        }
	      } finally {
	        if (_didIteratorError2) {
	          throw _iteratorError2;
	        }
	      }
	    }
	  }
	}
	
	function getExampleString() {
	  return JSON.stringify(examples, function (k, v) {
	    if (v instanceof Set) {
	      var a = [];
	      var _iteratorNormalCompletion3 = true;
	      var _didIteratorError3 = false;
	      var _iteratorError3 = undefined;
	
	      try {
	        for (var _iterator3 = v[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
	          var item = _step3.value;
	
	          a.push(item);
	        }
	      } catch (err) {
	        _didIteratorError3 = true;
	        _iteratorError3 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion3 && _iterator3.return) {
	            _iterator3.return();
	          }
	        } finally {
	          if (_didIteratorError3) {
	            throw _iteratorError3;
	          }
	        }
	      }
	
	      return a;
	    }
	    return v;
	  }, '  ');
	}

/***/ },
/* 10 */,
/* 11 */,
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var language = __webpack_require__(10),
	    chroma = __webpack_require__(7);
	
	function renderExample(exampleStr) {
	  var example = document.createElement('example');
	  example.textContent = exampleStr;
	
	  try {
	    var match = language.grammar.match(exampleStr);
	    var interpreted = language.semantics(match).interpret();
	    // example.textContent += ` ${interpreted.toString()}`;
	    example.style.color = chroma("green").css("hsl");
	  } catch (e) {
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
	  registerInterpret: registerInterpret
	};
	
	if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
	  module.exports = toExport;
	} else {
	  Object.assign(window, toExport);
	}
	
	var constants = { pi: Math.PI, e: Math.E };
	
	function registerInterpret(semantics) {
	  semantics.addOperation('interpret', {
	    Exp: function Exp(e) {
	      return e.interpret(); // Note that operations are accessed as methods on the CST nodes.
	    },
	
	    AddExp: function AddExp(e) {
	      return e.interpret();
	    },
	    AddExp_plus: function AddExp_plus(x, _, y) {
	      return x.interpret() + y.interpret();
	    },
	    // AddExp_minus: function(x, _, y) {
	    //   return x.interpret() - y.interpret();
	    // },
	
	    MulExp: function MulExp(e) {
	      return e.interpret();
	    },
	    MulExp_times: function MulExp_times(x, _, y) {
	      return x.interpret() * y.interpret();
	    },
	    MulExp_divide: function MulExp_divide(x, _, y) {
	      return x.interpret() / y.interpret();
	    },
	    ExpExp: function ExpExp(e) {
	      return e.interpret();
	    },
	    ExpExp_power: function ExpExp_power(x, _, y) {
	      return Math.pow(x.interpret(), y.interpret());
	    },
	    PriExp: function PriExp(e) {
	      return e.interpret();
	    },
	    PriExp_paren: function PriExp_paren(_l, e, _r) {
	      return e.interpret();
	    },
	    PriExp_pos: function PriExp_pos(_, e) {
	      return e.interpret();
	    },
	    PriExp_neg: function PriExp_neg(_, e) {
	      return -e.interpret();
	    },
	
	    ident: function ident(_l, _ns) {
	      return constants[this.interval.contents] || 0;
	    },
	    number: function number(_) {
	      return parseFloat(this.interval.contents);
	    }
	  });
	}

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	var _marked = [Exp, AddExp, AddExp_plus, AddExp_minus, MulExp, MulExp_times, MulExp_divide, ExpExp, ExpExp_power, PriExp, PriExp_paren, PriExp_pos, PriExp_neg, ident, number, number_whole, number_fract, digit, alnum, letter, stochasticChooseGen, arrayInfGen, concatInfGen, cycleGen, starGen, shuffleGen].map(regeneratorRuntime.mark);
	
	var EXAMPLES = __webpack_require__(9),
	    $ = __webpack_require__(6),
	    makeExample = __webpack_require__(12),
	    language = __webpack_require__(10),
	    diversity_fns = __webpack_require__(15);
	
	var diversity = diversity_fns.diversity;
	var distance_pq = diversity_fns.distance_pq;
	
	var GENERATORS = {
	  Exp: Exp,
	  AddExp: AddExp,
	  AddExp_plus: AddExp_plus,
	  AddExp_minus: AddExp_minus,
	  MulExp: MulExp,
	  MulExp_times: MulExp_times,
	  MulExp_divide: MulExp_divide,
	  ExpExp: ExpExp,
	  ExpExp_power: ExpExp_power,
	  PriExp: PriExp,
	  PriExp_paren: PriExp_paren,
	  PriExp_pos: PriExp_pos,
	  PriExp_neg: PriExp_neg,
	  ident: ident,
	  number: number,
	  number_whole: number_whole,
	  number_fract: number_fract
	};
	
	if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
	  module.exports = GENERATORS;
	} else {
	  window.GENERATORS = GENERATORS;
	}
	
	function Exp(es) {
	  var seen, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, e, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, exp;
	
	  return regeneratorRuntime.wrap(function Exp$(_context) {
	    while (1) {
	      switch (_context.prev = _context.next) {
	        case 0:
	          seen = new Set();
	          _iteratorNormalCompletion = true;
	          _didIteratorError = false;
	          _iteratorError = undefined;
	          _context.prev = 4;
	          _iterator = shuffleGen(es, seen)[Symbol.iterator]();
	
	        case 6:
	          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
	            _context.next = 13;
	            break;
	          }
	
	          e = _step.value;
	          _context.next = 10;
	          return e;
	
	        case 10:
	          _iteratorNormalCompletion = true;
	          _context.next = 6;
	          break;
	
	        case 13:
	          _context.next = 19;
	          break;
	
	        case 15:
	          _context.prev = 15;
	          _context.t0 = _context["catch"](4);
	          _didIteratorError = true;
	          _iteratorError = _context.t0;
	
	        case 19:
	          _context.prev = 19;
	          _context.prev = 20;
	
	          if (!_iteratorNormalCompletion && _iterator.return) {
	            _iterator.return();
	          }
	
	        case 22:
	          _context.prev = 22;
	
	          if (!_didIteratorError) {
	            _context.next = 25;
	            break;
	          }
	
	          throw _iteratorError;
	
	        case 25:
	          return _context.finish(22);
	
	        case 26:
	          return _context.finish(19);
	
	        case 27:
	          _iteratorNormalCompletion2 = true;
	          _didIteratorError2 = false;
	          _iteratorError2 = undefined;
	          _context.prev = 30;
	          _iterator2 = AddExp([])[Symbol.iterator]();
	
	        case 32:
	          if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
	            _context.next = 39;
	            break;
	          }
	
	          exp = _step2.value;
	          _context.next = 36;
	          return exp;
	
	        case 36:
	          _iteratorNormalCompletion2 = true;
	          _context.next = 32;
	          break;
	
	        case 39:
	          _context.next = 45;
	          break;
	
	        case 41:
	          _context.prev = 41;
	          _context.t1 = _context["catch"](30);
	          _didIteratorError2 = true;
	          _iteratorError2 = _context.t1;
	
	        case 45:
	          _context.prev = 45;
	          _context.prev = 46;
	
	          if (!_iteratorNormalCompletion2 && _iterator2.return) {
	            _iterator2.return();
	          }
	
	        case 48:
	          _context.prev = 48;
	
	          if (!_didIteratorError2) {
	            _context.next = 51;
	            break;
	          }
	
	          throw _iteratorError2;
	
	        case 51:
	          return _context.finish(48);
	
	        case 52:
	          return _context.finish(45);
	
	        case 53:
	        case "end":
	          return _context.stop();
	      }
	    }
	  }, _marked[0], this, [[4, 15, 19, 27], [20,, 22, 26], [30, 41, 45, 53], [46,, 48, 52]]);
	}
	
	function AddExp(aes) {
	  var seen, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, ae, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, addexp;
	
	  return regeneratorRuntime.wrap(function AddExp$(_context2) {
	    while (1) {
	      switch (_context2.prev = _context2.next) {
	        case 0:
	          seen = new Set();
	          _iteratorNormalCompletion3 = true;
	          _didIteratorError3 = false;
	          _iteratorError3 = undefined;
	          _context2.prev = 4;
	          _iterator3 = shuffleGen(aes, seen)[Symbol.iterator]();
	
	        case 6:
	          if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
	            _context2.next = 13;
	            break;
	          }
	
	          ae = _step3.value;
	          _context2.next = 10;
	          return ae;
	
	        case 10:
	          _iteratorNormalCompletion3 = true;
	          _context2.next = 6;
	          break;
	
	        case 13:
	          _context2.next = 19;
	          break;
	
	        case 15:
	          _context2.prev = 15;
	          _context2.t0 = _context2["catch"](4);
	          _didIteratorError3 = true;
	          _iteratorError3 = _context2.t0;
	
	        case 19:
	          _context2.prev = 19;
	          _context2.prev = 20;
	
	          if (!_iteratorNormalCompletion3 && _iterator3.return) {
	            _iterator3.return();
	          }
	
	        case 22:
	          _context2.prev = 22;
	
	          if (!_didIteratorError3) {
	            _context2.next = 25;
	            break;
	          }
	
	          throw _iteratorError3;
	
	        case 25:
	          return _context2.finish(22);
	
	        case 26:
	          return _context2.finish(19);
	
	        case 27:
	          _iteratorNormalCompletion4 = true;
	          _didIteratorError4 = false;
	          _iteratorError4 = undefined;
	          _context2.prev = 30;
	          _iterator4 = stochasticChooseGen(AddExp_plus([]), AddExp_minus([]), MulExp([]))[Symbol.iterator]();
	
	        case 32:
	          if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
	            _context2.next = 39;
	            break;
	          }
	
	          addexp = _step4.value;
	          _context2.next = 36;
	          return addexp;
	
	        case 36:
	          _iteratorNormalCompletion4 = true;
	          _context2.next = 32;
	          break;
	
	        case 39:
	          _context2.next = 45;
	          break;
	
	        case 41:
	          _context2.prev = 41;
	          _context2.t1 = _context2["catch"](30);
	          _didIteratorError4 = true;
	          _iteratorError4 = _context2.t1;
	
	        case 45:
	          _context2.prev = 45;
	          _context2.prev = 46;
	
	          if (!_iteratorNormalCompletion4 && _iterator4.return) {
	            _iterator4.return();
	          }
	
	        case 48:
	          _context2.prev = 48;
	
	          if (!_didIteratorError4) {
	            _context2.next = 51;
	            break;
	          }
	
	          throw _iteratorError4;
	
	        case 51:
	          return _context2.finish(48);
	
	        case 52:
	          return _context2.finish(45);
	
	        case 53:
	        case "end":
	          return _context2.stop();
	      }
	    }
	  }, _marked[1], this, [[4, 15, 19, 27], [20,, 22, 26], [30, 41, 45, 53], [46,, 48, 52]]);
	}
	
	function AddExp_plus(aes) {
	  var seen, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, _ae, _iteratorNormalCompletion6, _didIteratorError6, _iteratorError6, _iterator6, _step6, _step6$value, _ae2, me;
	
	  return regeneratorRuntime.wrap(function AddExp_plus$(_context3) {
	    while (1) {
	      switch (_context3.prev = _context3.next) {
	        case 0:
	          seen = new Set();
	          _iteratorNormalCompletion5 = true;
	          _didIteratorError5 = false;
	          _iteratorError5 = undefined;
	          _context3.prev = 4;
	          _iterator5 = shuffleGen(aes, seen)[Symbol.iterator]();
	
	        case 6:
	          if (_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done) {
	            _context3.next = 13;
	            break;
	          }
	
	          _ae = _step5.value;
	          _context3.next = 10;
	          return _ae;
	
	        case 10:
	          _iteratorNormalCompletion5 = true;
	          _context3.next = 6;
	          break;
	
	        case 13:
	          _context3.next = 19;
	          break;
	
	        case 15:
	          _context3.prev = 15;
	          _context3.t0 = _context3["catch"](4);
	          _didIteratorError5 = true;
	          _iteratorError5 = _context3.t0;
	
	        case 19:
	          _context3.prev = 19;
	          _context3.prev = 20;
	
	          if (!_iteratorNormalCompletion5 && _iterator5.return) {
	            _iterator5.return();
	          }
	
	        case 22:
	          _context3.prev = 22;
	
	          if (!_didIteratorError5) {
	            _context3.next = 25;
	            break;
	          }
	
	          throw _iteratorError5;
	
	        case 25:
	          return _context3.finish(22);
	
	        case 26:
	          return _context3.finish(19);
	
	        case 27:
	          _iteratorNormalCompletion6 = true;
	          _didIteratorError6 = false;
	          _iteratorError6 = undefined;
	          _context3.prev = 30;
	          _iterator6 = arrayInfGen(AddExp(EXAMPLES.AddExp), MulExp([]))[Symbol.iterator]();
	
	        case 32:
	          if (_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done) {
	            _context3.next = 41;
	            break;
	          }
	
	          _step6$value = _slicedToArray(_step6.value, 2);
	          _ae2 = _step6$value[0];
	          me = _step6$value[1];
	          _context3.next = 38;
	          return _ae2 + " + " + me;
	
	        case 38:
	          _iteratorNormalCompletion6 = true;
	          _context3.next = 32;
	          break;
	
	        case 41:
	          _context3.next = 47;
	          break;
	
	        case 43:
	          _context3.prev = 43;
	          _context3.t1 = _context3["catch"](30);
	          _didIteratorError6 = true;
	          _iteratorError6 = _context3.t1;
	
	        case 47:
	          _context3.prev = 47;
	          _context3.prev = 48;
	
	          if (!_iteratorNormalCompletion6 && _iterator6.return) {
	            _iterator6.return();
	          }
	
	        case 50:
	          _context3.prev = 50;
	
	          if (!_didIteratorError6) {
	            _context3.next = 53;
	            break;
	          }
	
	          throw _iteratorError6;
	
	        case 53:
	          return _context3.finish(50);
	
	        case 54:
	          return _context3.finish(47);
	
	        case 55:
	        case "end":
	          return _context3.stop();
	      }
	    }
	  }, _marked[2], this, [[4, 15, 19, 27], [20,, 22, 26], [30, 43, 47, 55], [48,, 50, 54]]);
	}
	
	function AddExp_minus(aes) {
	  var seen, _iteratorNormalCompletion7, _didIteratorError7, _iteratorError7, _iterator7, _step7, _ae3, _iteratorNormalCompletion8, _didIteratorError8, _iteratorError8, _iterator8, _step8, _step8$value, _ae4, _me;
	
	  return regeneratorRuntime.wrap(function AddExp_minus$(_context4) {
	    while (1) {
	      switch (_context4.prev = _context4.next) {
	        case 0:
	          seen = new Set();
	          _iteratorNormalCompletion7 = true;
	          _didIteratorError7 = false;
	          _iteratorError7 = undefined;
	          _context4.prev = 4;
	          _iterator7 = shuffleGen(aes, seen)[Symbol.iterator]();
	
	        case 6:
	          if (_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done) {
	            _context4.next = 13;
	            break;
	          }
	
	          _ae3 = _step7.value;
	          _context4.next = 10;
	          return _ae3;
	
	        case 10:
	          _iteratorNormalCompletion7 = true;
	          _context4.next = 6;
	          break;
	
	        case 13:
	          _context4.next = 19;
	          break;
	
	        case 15:
	          _context4.prev = 15;
	          _context4.t0 = _context4["catch"](4);
	          _didIteratorError7 = true;
	          _iteratorError7 = _context4.t0;
	
	        case 19:
	          _context4.prev = 19;
	          _context4.prev = 20;
	
	          if (!_iteratorNormalCompletion7 && _iterator7.return) {
	            _iterator7.return();
	          }
	
	        case 22:
	          _context4.prev = 22;
	
	          if (!_didIteratorError7) {
	            _context4.next = 25;
	            break;
	          }
	
	          throw _iteratorError7;
	
	        case 25:
	          return _context4.finish(22);
	
	        case 26:
	          return _context4.finish(19);
	
	        case 27:
	          _iteratorNormalCompletion8 = true;
	          _didIteratorError8 = false;
	          _iteratorError8 = undefined;
	          _context4.prev = 30;
	          _iterator8 = arrayInfGen(AddExp(EXAMPLES.AddExp), MulExp([]))[Symbol.iterator]();
	
	        case 32:
	          if (_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done) {
	            _context4.next = 41;
	            break;
	          }
	
	          _step8$value = _slicedToArray(_step8.value, 2);
	          _ae4 = _step8$value[0];
	          _me = _step8$value[1];
	          _context4.next = 38;
	          return _ae4 + " - " + _me;
	
	        case 38:
	          _iteratorNormalCompletion8 = true;
	          _context4.next = 32;
	          break;
	
	        case 41:
	          _context4.next = 47;
	          break;
	
	        case 43:
	          _context4.prev = 43;
	          _context4.t1 = _context4["catch"](30);
	          _didIteratorError8 = true;
	          _iteratorError8 = _context4.t1;
	
	        case 47:
	          _context4.prev = 47;
	          _context4.prev = 48;
	
	          if (!_iteratorNormalCompletion8 && _iterator8.return) {
	            _iterator8.return();
	          }
	
	        case 50:
	          _context4.prev = 50;
	
	          if (!_didIteratorError8) {
	            _context4.next = 53;
	            break;
	          }
	
	          throw _iteratorError8;
	
	        case 53:
	          return _context4.finish(50);
	
	        case 54:
	          return _context4.finish(47);
	
	        case 55:
	        case "end":
	          return _context4.stop();
	      }
	    }
	  }, _marked[3], this, [[4, 15, 19, 27], [20,, 22, 26], [30, 43, 47, 55], [48,, 50, 54]]);
	}
	
	function MulExp(mes) {
	  var seen, _iteratorNormalCompletion9, _didIteratorError9, _iteratorError9, _iterator9, _step9, _me2, _iteratorNormalCompletion10, _didIteratorError10, _iteratorError10, _iterator10, _step10, mulexp;
	
	  return regeneratorRuntime.wrap(function MulExp$(_context5) {
	    while (1) {
	      switch (_context5.prev = _context5.next) {
	        case 0:
	          seen = new Set();
	          _iteratorNormalCompletion9 = true;
	          _didIteratorError9 = false;
	          _iteratorError9 = undefined;
	          _context5.prev = 4;
	          _iterator9 = shuffleGen(mes, seen)[Symbol.iterator]();
	
	        case 6:
	          if (_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done) {
	            _context5.next = 13;
	            break;
	          }
	
	          _me2 = _step9.value;
	          _context5.next = 10;
	          return _me2;
	
	        case 10:
	          _iteratorNormalCompletion9 = true;
	          _context5.next = 6;
	          break;
	
	        case 13:
	          _context5.next = 19;
	          break;
	
	        case 15:
	          _context5.prev = 15;
	          _context5.t0 = _context5["catch"](4);
	          _didIteratorError9 = true;
	          _iteratorError9 = _context5.t0;
	
	        case 19:
	          _context5.prev = 19;
	          _context5.prev = 20;
	
	          if (!_iteratorNormalCompletion9 && _iterator9.return) {
	            _iterator9.return();
	          }
	
	        case 22:
	          _context5.prev = 22;
	
	          if (!_didIteratorError9) {
	            _context5.next = 25;
	            break;
	          }
	
	          throw _iteratorError9;
	
	        case 25:
	          return _context5.finish(22);
	
	        case 26:
	          return _context5.finish(19);
	
	        case 27:
	          _iteratorNormalCompletion10 = true;
	          _didIteratorError10 = false;
	          _iteratorError10 = undefined;
	          _context5.prev = 30;
	          _iterator10 = stochasticChooseGen(MulExp_times([]), MulExp_divide([]), ExpExp([]))[Symbol.iterator]();
	
	        case 32:
	          if (_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done) {
	            _context5.next = 39;
	            break;
	          }
	
	          mulexp = _step10.value;
	          _context5.next = 36;
	          return mulexp;
	
	        case 36:
	          _iteratorNormalCompletion10 = true;
	          _context5.next = 32;
	          break;
	
	        case 39:
	          _context5.next = 45;
	          break;
	
	        case 41:
	          _context5.prev = 41;
	          _context5.t1 = _context5["catch"](30);
	          _didIteratorError10 = true;
	          _iteratorError10 = _context5.t1;
	
	        case 45:
	          _context5.prev = 45;
	          _context5.prev = 46;
	
	          if (!_iteratorNormalCompletion10 && _iterator10.return) {
	            _iterator10.return();
	          }
	
	        case 48:
	          _context5.prev = 48;
	
	          if (!_didIteratorError10) {
	            _context5.next = 51;
	            break;
	          }
	
	          throw _iteratorError10;
	
	        case 51:
	          return _context5.finish(48);
	
	        case 52:
	          return _context5.finish(45);
	
	        case 53:
	        case "end":
	          return _context5.stop();
	      }
	    }
	  }, _marked[4], this, [[4, 15, 19, 27], [20,, 22, 26], [30, 41, 45, 53], [46,, 48, 52]]);
	}
	
	function MulExp_times(mes) {
	  var seen, _iteratorNormalCompletion11, _didIteratorError11, _iteratorError11, _iterator11, _step11, _me3, _iteratorNormalCompletion12, _didIteratorError12, _iteratorError12, _iterator12, _step12, _step12$value, _me4, ee;
	
	  return regeneratorRuntime.wrap(function MulExp_times$(_context6) {
	    while (1) {
	      switch (_context6.prev = _context6.next) {
	        case 0:
	          seen = new Set();
	          _iteratorNormalCompletion11 = true;
	          _didIteratorError11 = false;
	          _iteratorError11 = undefined;
	          _context6.prev = 4;
	          _iterator11 = shuffleGen(mes, seen)[Symbol.iterator]();
	
	        case 6:
	          if (_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done) {
	            _context6.next = 13;
	            break;
	          }
	
	          _me3 = _step11.value;
	          _context6.next = 10;
	          return _me3;
	
	        case 10:
	          _iteratorNormalCompletion11 = true;
	          _context6.next = 6;
	          break;
	
	        case 13:
	          _context6.next = 19;
	          break;
	
	        case 15:
	          _context6.prev = 15;
	          _context6.t0 = _context6["catch"](4);
	          _didIteratorError11 = true;
	          _iteratorError11 = _context6.t0;
	
	        case 19:
	          _context6.prev = 19;
	          _context6.prev = 20;
	
	          if (!_iteratorNormalCompletion11 && _iterator11.return) {
	            _iterator11.return();
	          }
	
	        case 22:
	          _context6.prev = 22;
	
	          if (!_didIteratorError11) {
	            _context6.next = 25;
	            break;
	          }
	
	          throw _iteratorError11;
	
	        case 25:
	          return _context6.finish(22);
	
	        case 26:
	          return _context6.finish(19);
	
	        case 27:
	          _iteratorNormalCompletion12 = true;
	          _didIteratorError12 = false;
	          _iteratorError12 = undefined;
	          _context6.prev = 30;
	          _iterator12 = arrayInfGen(MulExp(EXAMPLES.MulExp), ExpExp([]))[Symbol.iterator]();
	
	        case 32:
	          if (_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done) {
	            _context6.next = 41;
	            break;
	          }
	
	          _step12$value = _slicedToArray(_step12.value, 2);
	          _me4 = _step12$value[0];
	          ee = _step12$value[1];
	          _context6.next = 38;
	          return _me4 + "*" + ee;
	
	        case 38:
	          _iteratorNormalCompletion12 = true;
	          _context6.next = 32;
	          break;
	
	        case 41:
	          _context6.next = 47;
	          break;
	
	        case 43:
	          _context6.prev = 43;
	          _context6.t1 = _context6["catch"](30);
	          _didIteratorError12 = true;
	          _iteratorError12 = _context6.t1;
	
	        case 47:
	          _context6.prev = 47;
	          _context6.prev = 48;
	
	          if (!_iteratorNormalCompletion12 && _iterator12.return) {
	            _iterator12.return();
	          }
	
	        case 50:
	          _context6.prev = 50;
	
	          if (!_didIteratorError12) {
	            _context6.next = 53;
	            break;
	          }
	
	          throw _iteratorError12;
	
	        case 53:
	          return _context6.finish(50);
	
	        case 54:
	          return _context6.finish(47);
	
	        case 55:
	        case "end":
	          return _context6.stop();
	      }
	    }
	  }, _marked[5], this, [[4, 15, 19, 27], [20,, 22, 26], [30, 43, 47, 55], [48,, 50, 54]]);
	}
	
	function MulExp_divide(mes) {
	  var seen, _iteratorNormalCompletion13, _didIteratorError13, _iteratorError13, _iterator13, _step13, _me5, _iteratorNormalCompletion14, _didIteratorError14, _iteratorError14, _iterator14, _step14, _step14$value, _me6, _ee;
	
	  return regeneratorRuntime.wrap(function MulExp_divide$(_context7) {
	    while (1) {
	      switch (_context7.prev = _context7.next) {
	        case 0:
	          seen = new Set();
	          _iteratorNormalCompletion13 = true;
	          _didIteratorError13 = false;
	          _iteratorError13 = undefined;
	          _context7.prev = 4;
	          _iterator13 = shuffleGen(mes, seen)[Symbol.iterator]();
	
	        case 6:
	          if (_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done) {
	            _context7.next = 13;
	            break;
	          }
	
	          _me5 = _step13.value;
	          _context7.next = 10;
	          return _me5;
	
	        case 10:
	          _iteratorNormalCompletion13 = true;
	          _context7.next = 6;
	          break;
	
	        case 13:
	          _context7.next = 19;
	          break;
	
	        case 15:
	          _context7.prev = 15;
	          _context7.t0 = _context7["catch"](4);
	          _didIteratorError13 = true;
	          _iteratorError13 = _context7.t0;
	
	        case 19:
	          _context7.prev = 19;
	          _context7.prev = 20;
	
	          if (!_iteratorNormalCompletion13 && _iterator13.return) {
	            _iterator13.return();
	          }
	
	        case 22:
	          _context7.prev = 22;
	
	          if (!_didIteratorError13) {
	            _context7.next = 25;
	            break;
	          }
	
	          throw _iteratorError13;
	
	        case 25:
	          return _context7.finish(22);
	
	        case 26:
	          return _context7.finish(19);
	
	        case 27:
	          _iteratorNormalCompletion14 = true;
	          _didIteratorError14 = false;
	          _iteratorError14 = undefined;
	          _context7.prev = 30;
	          _iterator14 = arrayInfGen(MulExp(EXAMPLES.MulExp), ExpExp([]))[Symbol.iterator]();
	
	        case 32:
	          if (_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done) {
	            _context7.next = 41;
	            break;
	          }
	
	          _step14$value = _slicedToArray(_step14.value, 2);
	          _me6 = _step14$value[0];
	          _ee = _step14$value[1];
	          _context7.next = 38;
	          return _me6 + "/" + _ee;
	
	        case 38:
	          _iteratorNormalCompletion14 = true;
	          _context7.next = 32;
	          break;
	
	        case 41:
	          _context7.next = 47;
	          break;
	
	        case 43:
	          _context7.prev = 43;
	          _context7.t1 = _context7["catch"](30);
	          _didIteratorError14 = true;
	          _iteratorError14 = _context7.t1;
	
	        case 47:
	          _context7.prev = 47;
	          _context7.prev = 48;
	
	          if (!_iteratorNormalCompletion14 && _iterator14.return) {
	            _iterator14.return();
	          }
	
	        case 50:
	          _context7.prev = 50;
	
	          if (!_didIteratorError14) {
	            _context7.next = 53;
	            break;
	          }
	
	          throw _iteratorError14;
	
	        case 53:
	          return _context7.finish(50);
	
	        case 54:
	          return _context7.finish(47);
	
	        case 55:
	        case "end":
	          return _context7.stop();
	      }
	    }
	  }, _marked[6], this, [[4, 15, 19, 27], [20,, 22, 26], [30, 43, 47, 55], [48,, 50, 54]]);
	}
	
	function ExpExp(ees) {
	  var seen, _iteratorNormalCompletion15, _didIteratorError15, _iteratorError15, _iterator15, _step15, _ee2, _iteratorNormalCompletion16, _didIteratorError16, _iteratorError16, _iterator16, _step16, expexp;
	
	  return regeneratorRuntime.wrap(function ExpExp$(_context8) {
	    while (1) {
	      switch (_context8.prev = _context8.next) {
	        case 0:
	          seen = new Set();
	          _iteratorNormalCompletion15 = true;
	          _didIteratorError15 = false;
	          _iteratorError15 = undefined;
	          _context8.prev = 4;
	          _iterator15 = shuffleGen(ees, seen)[Symbol.iterator]();
	
	        case 6:
	          if (_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done) {
	            _context8.next = 13;
	            break;
	          }
	
	          _ee2 = _step15.value;
	          _context8.next = 10;
	          return _ee2;
	
	        case 10:
	          _iteratorNormalCompletion15 = true;
	          _context8.next = 6;
	          break;
	
	        case 13:
	          _context8.next = 19;
	          break;
	
	        case 15:
	          _context8.prev = 15;
	          _context8.t0 = _context8["catch"](4);
	          _didIteratorError15 = true;
	          _iteratorError15 = _context8.t0;
	
	        case 19:
	          _context8.prev = 19;
	          _context8.prev = 20;
	
	          if (!_iteratorNormalCompletion15 && _iterator15.return) {
	            _iterator15.return();
	          }
	
	        case 22:
	          _context8.prev = 22;
	
	          if (!_didIteratorError15) {
	            _context8.next = 25;
	            break;
	          }
	
	          throw _iteratorError15;
	
	        case 25:
	          return _context8.finish(22);
	
	        case 26:
	          return _context8.finish(19);
	
	        case 27:
	          _iteratorNormalCompletion16 = true;
	          _didIteratorError16 = false;
	          _iteratorError16 = undefined;
	          _context8.prev = 30;
	          _iterator16 = stochasticChooseGen(ExpExp_power([]), PriExp([]))[Symbol.iterator]();
	
	        case 32:
	          if (_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done) {
	            _context8.next = 39;
	            break;
	          }
	
	          expexp = _step16.value;
	          _context8.next = 36;
	          return expexp;
	
	        case 36:
	          _iteratorNormalCompletion16 = true;
	          _context8.next = 32;
	          break;
	
	        case 39:
	          _context8.next = 45;
	          break;
	
	        case 41:
	          _context8.prev = 41;
	          _context8.t1 = _context8["catch"](30);
	          _didIteratorError16 = true;
	          _iteratorError16 = _context8.t1;
	
	        case 45:
	          _context8.prev = 45;
	          _context8.prev = 46;
	
	          if (!_iteratorNormalCompletion16 && _iterator16.return) {
	            _iterator16.return();
	          }
	
	        case 48:
	          _context8.prev = 48;
	
	          if (!_didIteratorError16) {
	            _context8.next = 51;
	            break;
	          }
	
	          throw _iteratorError16;
	
	        case 51:
	          return _context8.finish(48);
	
	        case 52:
	          return _context8.finish(45);
	
	        case 53:
	        case "end":
	          return _context8.stop();
	      }
	    }
	  }, _marked[7], this, [[4, 15, 19, 27], [20,, 22, 26], [30, 41, 45, 53], [46,, 48, 52]]);
	}
	
	function ExpExp_power(ees) {
	  var seen, _iteratorNormalCompletion17, _didIteratorError17, _iteratorError17, _iterator17, _step17, _ee3, _iteratorNormalCompletion18, _didIteratorError18, _iteratorError18, _iterator18, _step18, _step18$value, pe, _ee4;
	
	  return regeneratorRuntime.wrap(function ExpExp_power$(_context9) {
	    while (1) {
	      switch (_context9.prev = _context9.next) {
	        case 0:
	          seen = new Set();
	          _iteratorNormalCompletion17 = true;
	          _didIteratorError17 = false;
	          _iteratorError17 = undefined;
	          _context9.prev = 4;
	          _iterator17 = shuffleGen(ees, seen)[Symbol.iterator]();
	
	        case 6:
	          if (_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done) {
	            _context9.next = 13;
	            break;
	          }
	
	          _ee3 = _step17.value;
	          _context9.next = 10;
	          return _ee3;
	
	        case 10:
	          _iteratorNormalCompletion17 = true;
	          _context9.next = 6;
	          break;
	
	        case 13:
	          _context9.next = 19;
	          break;
	
	        case 15:
	          _context9.prev = 15;
	          _context9.t0 = _context9["catch"](4);
	          _didIteratorError17 = true;
	          _iteratorError17 = _context9.t0;
	
	        case 19:
	          _context9.prev = 19;
	          _context9.prev = 20;
	
	          if (!_iteratorNormalCompletion17 && _iterator17.return) {
	            _iterator17.return();
	          }
	
	        case 22:
	          _context9.prev = 22;
	
	          if (!_didIteratorError17) {
	            _context9.next = 25;
	            break;
	          }
	
	          throw _iteratorError17;
	
	        case 25:
	          return _context9.finish(22);
	
	        case 26:
	          return _context9.finish(19);
	
	        case 27:
	          _iteratorNormalCompletion18 = true;
	          _didIteratorError18 = false;
	          _iteratorError18 = undefined;
	          _context9.prev = 30;
	          _iterator18 = arrayInfGen(PriExp([]), ExpExp(EXAMPLES.ExpExp))[Symbol.iterator]();
	
	        case 32:
	          if (_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done) {
	            _context9.next = 41;
	            break;
	          }
	
	          _step18$value = _slicedToArray(_step18.value, 2);
	          pe = _step18$value[0];
	          _ee4 = _step18$value[1];
	          _context9.next = 38;
	          return pe + "^" + _ee4;
	
	        case 38:
	          _iteratorNormalCompletion18 = true;
	          _context9.next = 32;
	          break;
	
	        case 41:
	          _context9.next = 47;
	          break;
	
	        case 43:
	          _context9.prev = 43;
	          _context9.t1 = _context9["catch"](30);
	          _didIteratorError18 = true;
	          _iteratorError18 = _context9.t1;
	
	        case 47:
	          _context9.prev = 47;
	          _context9.prev = 48;
	
	          if (!_iteratorNormalCompletion18 && _iterator18.return) {
	            _iterator18.return();
	          }
	
	        case 50:
	          _context9.prev = 50;
	
	          if (!_didIteratorError18) {
	            _context9.next = 53;
	            break;
	          }
	
	          throw _iteratorError18;
	
	        case 53:
	          return _context9.finish(50);
	
	        case 54:
	          return _context9.finish(47);
	
	        case 55:
	        case "end":
	          return _context9.stop();
	      }
	    }
	  }, _marked[8], this, [[4, 15, 19, 27], [20,, 22, 26], [30, 43, 47, 55], [48,, 50, 54]]);
	}
	
	function PriExp(pes) {
	  var seen, _iteratorNormalCompletion19, _didIteratorError19, _iteratorError19, _iterator19, _step19, _pe, _iteratorNormalCompletion20, _didIteratorError20, _iteratorError20, _iterator20, _step20, priexp;
	
	  return regeneratorRuntime.wrap(function PriExp$(_context10) {
	    while (1) {
	      switch (_context10.prev = _context10.next) {
	        case 0:
	          seen = new Set();
	          _iteratorNormalCompletion19 = true;
	          _didIteratorError19 = false;
	          _iteratorError19 = undefined;
	          _context10.prev = 4;
	          _iterator19 = shuffleGen(pes, seen)[Symbol.iterator]();
	
	        case 6:
	          if (_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done) {
	            _context10.next = 13;
	            break;
	          }
	
	          _pe = _step19.value;
	          _context10.next = 10;
	          return _pe;
	
	        case 10:
	          _iteratorNormalCompletion19 = true;
	          _context10.next = 6;
	          break;
	
	        case 13:
	          _context10.next = 19;
	          break;
	
	        case 15:
	          _context10.prev = 15;
	          _context10.t0 = _context10["catch"](4);
	          _didIteratorError19 = true;
	          _iteratorError19 = _context10.t0;
	
	        case 19:
	          _context10.prev = 19;
	          _context10.prev = 20;
	
	          if (!_iteratorNormalCompletion19 && _iterator19.return) {
	            _iterator19.return();
	          }
	
	        case 22:
	          _context10.prev = 22;
	
	          if (!_didIteratorError19) {
	            _context10.next = 25;
	            break;
	          }
	
	          throw _iteratorError19;
	
	        case 25:
	          return _context10.finish(22);
	
	        case 26:
	          return _context10.finish(19);
	
	        case 27:
	          _iteratorNormalCompletion20 = true;
	          _didIteratorError20 = false;
	          _iteratorError20 = undefined;
	          _context10.prev = 30;
	          _iterator20 = stochasticChooseGen(PriExp_paren([]), PriExp_pos([]), PriExp_neg([]), ident([]), number([]))[Symbol.iterator]();
	
	        case 32:
	          if (_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done) {
	            _context10.next = 39;
	            break;
	          }
	
	          priexp = _step20.value;
	          _context10.next = 36;
	          return priexp;
	
	        case 36:
	          _iteratorNormalCompletion20 = true;
	          _context10.next = 32;
	          break;
	
	        case 39:
	          _context10.next = 45;
	          break;
	
	        case 41:
	          _context10.prev = 41;
	          _context10.t1 = _context10["catch"](30);
	          _didIteratorError20 = true;
	          _iteratorError20 = _context10.t1;
	
	        case 45:
	          _context10.prev = 45;
	          _context10.prev = 46;
	
	          if (!_iteratorNormalCompletion20 && _iterator20.return) {
	            _iterator20.return();
	          }
	
	        case 48:
	          _context10.prev = 48;
	
	          if (!_didIteratorError20) {
	            _context10.next = 51;
	            break;
	          }
	
	          throw _iteratorError20;
	
	        case 51:
	          return _context10.finish(48);
	
	        case 52:
	          return _context10.finish(45);
	
	        case 53:
	        case "end":
	          return _context10.stop();
	      }
	    }
	  }, _marked[9], this, [[4, 15, 19, 27], [20,, 22, 26], [30, 41, 45, 53], [46,, 48, 52]]);
	}
	
	function PriExp_paren(pes) {
	  var seen, _iteratorNormalCompletion21, _didIteratorError21, _iteratorError21, _iterator21, _step21, _pe2, _iteratorNormalCompletion22, _didIteratorError22, _iteratorError22, _iterator22, _step22, _exp;
	
	  return regeneratorRuntime.wrap(function PriExp_paren$(_context11) {
	    while (1) {
	      switch (_context11.prev = _context11.next) {
	        case 0:
	          seen = new Set();
	          _iteratorNormalCompletion21 = true;
	          _didIteratorError21 = false;
	          _iteratorError21 = undefined;
	          _context11.prev = 4;
	          _iterator21 = shuffleGen(pes, seen)[Symbol.iterator]();
	
	        case 6:
	          if (_iteratorNormalCompletion21 = (_step21 = _iterator21.next()).done) {
	            _context11.next = 13;
	            break;
	          }
	
	          _pe2 = _step21.value;
	          _context11.next = 10;
	          return _pe2;
	
	        case 10:
	          _iteratorNormalCompletion21 = true;
	          _context11.next = 6;
	          break;
	
	        case 13:
	          _context11.next = 19;
	          break;
	
	        case 15:
	          _context11.prev = 15;
	          _context11.t0 = _context11["catch"](4);
	          _didIteratorError21 = true;
	          _iteratorError21 = _context11.t0;
	
	        case 19:
	          _context11.prev = 19;
	          _context11.prev = 20;
	
	          if (!_iteratorNormalCompletion21 && _iterator21.return) {
	            _iterator21.return();
	          }
	
	        case 22:
	          _context11.prev = 22;
	
	          if (!_didIteratorError21) {
	            _context11.next = 25;
	            break;
	          }
	
	          throw _iteratorError21;
	
	        case 25:
	          return _context11.finish(22);
	
	        case 26:
	          return _context11.finish(19);
	
	        case 27:
	          _iteratorNormalCompletion22 = true;
	          _didIteratorError22 = false;
	          _iteratorError22 = undefined;
	          _context11.prev = 30;
	          _iterator22 = Exp(EXAMPLES.Exp)[Symbol.iterator]();
	
	        case 32:
	          if (_iteratorNormalCompletion22 = (_step22 = _iterator22.next()).done) {
	            _context11.next = 39;
	            break;
	          }
	
	          _exp = _step22.value;
	          _context11.next = 36;
	          return "(" + _exp + ")";
	
	        case 36:
	          _iteratorNormalCompletion22 = true;
	          _context11.next = 32;
	          break;
	
	        case 39:
	          _context11.next = 45;
	          break;
	
	        case 41:
	          _context11.prev = 41;
	          _context11.t1 = _context11["catch"](30);
	          _didIteratorError22 = true;
	          _iteratorError22 = _context11.t1;
	
	        case 45:
	          _context11.prev = 45;
	          _context11.prev = 46;
	
	          if (!_iteratorNormalCompletion22 && _iterator22.return) {
	            _iterator22.return();
	          }
	
	        case 48:
	          _context11.prev = 48;
	
	          if (!_didIteratorError22) {
	            _context11.next = 51;
	            break;
	          }
	
	          throw _iteratorError22;
	
	        case 51:
	          return _context11.finish(48);
	
	        case 52:
	          return _context11.finish(45);
	
	        case 53:
	        case "end":
	          return _context11.stop();
	      }
	    }
	  }, _marked[10], this, [[4, 15, 19, 27], [20,, 22, 26], [30, 41, 45, 53], [46,, 48, 52]]);
	}
	
	function PriExp_pos(pes) {
	  var seen, _iteratorNormalCompletion23, _didIteratorError23, _iteratorError23, _iterator23, _step23, _pe3, _iteratorNormalCompletion24, _didIteratorError24, _iteratorError24, _iterator24, _step24, _priexp;
	
	  return regeneratorRuntime.wrap(function PriExp_pos$(_context12) {
	    while (1) {
	      switch (_context12.prev = _context12.next) {
	        case 0:
	          seen = new Set();
	          _iteratorNormalCompletion23 = true;
	          _didIteratorError23 = false;
	          _iteratorError23 = undefined;
	          _context12.prev = 4;
	          _iterator23 = shuffleGen(pes, seen)[Symbol.iterator]();
	
	        case 6:
	          if (_iteratorNormalCompletion23 = (_step23 = _iterator23.next()).done) {
	            _context12.next = 13;
	            break;
	          }
	
	          _pe3 = _step23.value;
	          _context12.next = 10;
	          return _pe3;
	
	        case 10:
	          _iteratorNormalCompletion23 = true;
	          _context12.next = 6;
	          break;
	
	        case 13:
	          _context12.next = 19;
	          break;
	
	        case 15:
	          _context12.prev = 15;
	          _context12.t0 = _context12["catch"](4);
	          _didIteratorError23 = true;
	          _iteratorError23 = _context12.t0;
	
	        case 19:
	          _context12.prev = 19;
	          _context12.prev = 20;
	
	          if (!_iteratorNormalCompletion23 && _iterator23.return) {
	            _iterator23.return();
	          }
	
	        case 22:
	          _context12.prev = 22;
	
	          if (!_didIteratorError23) {
	            _context12.next = 25;
	            break;
	          }
	
	          throw _iteratorError23;
	
	        case 25:
	          return _context12.finish(22);
	
	        case 26:
	          return _context12.finish(19);
	
	        case 27:
	          _iteratorNormalCompletion24 = true;
	          _didIteratorError24 = false;
	          _iteratorError24 = undefined;
	          _context12.prev = 30;
	          _iterator24 = PriExp(EXAMPLES.PriExp)[Symbol.iterator]();
	
	        case 32:
	          if (_iteratorNormalCompletion24 = (_step24 = _iterator24.next()).done) {
	            _context12.next = 39;
	            break;
	          }
	
	          _priexp = _step24.value;
	          _context12.next = 36;
	          return "+ " + _priexp;
	
	        case 36:
	          _iteratorNormalCompletion24 = true;
	          _context12.next = 32;
	          break;
	
	        case 39:
	          _context12.next = 45;
	          break;
	
	        case 41:
	          _context12.prev = 41;
	          _context12.t1 = _context12["catch"](30);
	          _didIteratorError24 = true;
	          _iteratorError24 = _context12.t1;
	
	        case 45:
	          _context12.prev = 45;
	          _context12.prev = 46;
	
	          if (!_iteratorNormalCompletion24 && _iterator24.return) {
	            _iterator24.return();
	          }
	
	        case 48:
	          _context12.prev = 48;
	
	          if (!_didIteratorError24) {
	            _context12.next = 51;
	            break;
	          }
	
	          throw _iteratorError24;
	
	        case 51:
	          return _context12.finish(48);
	
	        case 52:
	          return _context12.finish(45);
	
	        case 53:
	        case "end":
	          return _context12.stop();
	      }
	    }
	  }, _marked[11], this, [[4, 15, 19, 27], [20,, 22, 26], [30, 41, 45, 53], [46,, 48, 52]]);
	}
	
	function PriExp_neg(pes) {
	  var seen, _iteratorNormalCompletion25, _didIteratorError25, _iteratorError25, _iterator25, _step25, _pe4, _iteratorNormalCompletion26, _didIteratorError26, _iteratorError26, _iterator26, _step26, _priexp2;
	
	  return regeneratorRuntime.wrap(function PriExp_neg$(_context13) {
	    while (1) {
	      switch (_context13.prev = _context13.next) {
	        case 0:
	          seen = new Set();
	          _iteratorNormalCompletion25 = true;
	          _didIteratorError25 = false;
	          _iteratorError25 = undefined;
	          _context13.prev = 4;
	          _iterator25 = shuffleGen(pes, seen)[Symbol.iterator]();
	
	        case 6:
	          if (_iteratorNormalCompletion25 = (_step25 = _iterator25.next()).done) {
	            _context13.next = 13;
	            break;
	          }
	
	          _pe4 = _step25.value;
	          _context13.next = 10;
	          return _pe4;
	
	        case 10:
	          _iteratorNormalCompletion25 = true;
	          _context13.next = 6;
	          break;
	
	        case 13:
	          _context13.next = 19;
	          break;
	
	        case 15:
	          _context13.prev = 15;
	          _context13.t0 = _context13["catch"](4);
	          _didIteratorError25 = true;
	          _iteratorError25 = _context13.t0;
	
	        case 19:
	          _context13.prev = 19;
	          _context13.prev = 20;
	
	          if (!_iteratorNormalCompletion25 && _iterator25.return) {
	            _iterator25.return();
	          }
	
	        case 22:
	          _context13.prev = 22;
	
	          if (!_didIteratorError25) {
	            _context13.next = 25;
	            break;
	          }
	
	          throw _iteratorError25;
	
	        case 25:
	          return _context13.finish(22);
	
	        case 26:
	          return _context13.finish(19);
	
	        case 27:
	          _iteratorNormalCompletion26 = true;
	          _didIteratorError26 = false;
	          _iteratorError26 = undefined;
	          _context13.prev = 30;
	          _iterator26 = PriExp(EXAMPLES.PriExp)[Symbol.iterator]();
	
	        case 32:
	          if (_iteratorNormalCompletion26 = (_step26 = _iterator26.next()).done) {
	            _context13.next = 39;
	            break;
	          }
	
	          _priexp2 = _step26.value;
	          _context13.next = 36;
	          return "- " + _priexp2;
	
	        case 36:
	          _iteratorNormalCompletion26 = true;
	          _context13.next = 32;
	          break;
	
	        case 39:
	          _context13.next = 45;
	          break;
	
	        case 41:
	          _context13.prev = 41;
	          _context13.t1 = _context13["catch"](30);
	          _didIteratorError26 = true;
	          _iteratorError26 = _context13.t1;
	
	        case 45:
	          _context13.prev = 45;
	          _context13.prev = 46;
	
	          if (!_iteratorNormalCompletion26 && _iterator26.return) {
	            _iterator26.return();
	          }
	
	        case 48:
	          _context13.prev = 48;
	
	          if (!_didIteratorError26) {
	            _context13.next = 51;
	            break;
	          }
	
	          throw _iteratorError26;
	
	        case 51:
	          return _context13.finish(48);
	
	        case 52:
	          return _context13.finish(45);
	
	        case 53:
	        case "end":
	          return _context13.stop();
	      }
	    }
	  }, _marked[12], this, [[4, 15, 19, 27], [20,, 22, 26], [30, 41, 45, 53], [46,, 48, 52]]);
	}
	
	function ident(idents) {
	  var seen, _iteratorNormalCompletion27, _didIteratorError27, _iteratorError27, _iterator27, _step27, _ident, _iteratorNormalCompletion28, _didIteratorError28, _iteratorError28, _iterator28, _step28, _ident2;
	
	  return regeneratorRuntime.wrap(function ident$(_context14) {
	    while (1) {
	      switch (_context14.prev = _context14.next) {
	        case 0:
	          seen = new Set();
	          _iteratorNormalCompletion27 = true;
	          _didIteratorError27 = false;
	          _iteratorError27 = undefined;
	          _context14.prev = 4;
	          _iterator27 = shuffleGen(idents, seen)[Symbol.iterator]();
	
	        case 6:
	          if (_iteratorNormalCompletion27 = (_step27 = _iterator27.next()).done) {
	            _context14.next = 13;
	            break;
	          }
	
	          _ident = _step27.value;
	          _context14.next = 10;
	          return _ident;
	
	        case 10:
	          _iteratorNormalCompletion27 = true;
	          _context14.next = 6;
	          break;
	
	        case 13:
	          _context14.next = 19;
	          break;
	
	        case 15:
	          _context14.prev = 15;
	          _context14.t0 = _context14["catch"](4);
	          _didIteratorError27 = true;
	          _iteratorError27 = _context14.t0;
	
	        case 19:
	          _context14.prev = 19;
	          _context14.prev = 20;
	
	          if (!_iteratorNormalCompletion27 && _iterator27.return) {
	            _iterator27.return();
	          }
	
	        case 22:
	          _context14.prev = 22;
	
	          if (!_didIteratorError27) {
	            _context14.next = 25;
	            break;
	          }
	
	          throw _iteratorError27;
	
	        case 25:
	          return _context14.finish(22);
	
	        case 26:
	          return _context14.finish(19);
	
	        case 27:
	          _iteratorNormalCompletion28 = true;
	          _didIteratorError28 = false;
	          _iteratorError28 = undefined;
	          _context14.prev = 30;
	          _iterator28 = concatInfGen(cycleGen(letter, EXAMPLES.letter), starGen(alnum, EXAMPLES.alnum))[Symbol.iterator]();
	
	        case 32:
	          if (_iteratorNormalCompletion28 = (_step28 = _iterator28.next()).done) {
	            _context14.next = 39;
	            break;
	          }
	
	          _ident2 = _step28.value;
	          _context14.next = 36;
	          return _ident2;
	
	        case 36:
	          _iteratorNormalCompletion28 = true;
	          _context14.next = 32;
	          break;
	
	        case 39:
	          _context14.next = 45;
	          break;
	
	        case 41:
	          _context14.prev = 41;
	          _context14.t1 = _context14["catch"](30);
	          _didIteratorError28 = true;
	          _iteratorError28 = _context14.t1;
	
	        case 45:
	          _context14.prev = 45;
	          _context14.prev = 46;
	
	          if (!_iteratorNormalCompletion28 && _iterator28.return) {
	            _iterator28.return();
	          }
	
	        case 48:
	          _context14.prev = 48;
	
	          if (!_didIteratorError28) {
	            _context14.next = 51;
	            break;
	          }
	
	          throw _iteratorError28;
	
	        case 51:
	          return _context14.finish(48);
	
	        case 52:
	          return _context14.finish(45);
	
	        case 53:
	        case "end":
	          return _context14.stop();
	      }
	    }
	  }, _marked[13], this, [[4, 15, 19, 27], [20,, 22, 26], [30, 41, 45, 53], [46,, 48, 52]]);
	}
	
	function number(numbers) {
	  var seen, _iteratorNormalCompletion29, _didIteratorError29, _iteratorError29, _iterator29, _step29, _number, _iteratorNormalCompletion30, _didIteratorError30, _iteratorError30, _iterator30, _step30, _priexp3;
	
	  return regeneratorRuntime.wrap(function number$(_context15) {
	    while (1) {
	      switch (_context15.prev = _context15.next) {
	        case 0:
	          seen = new Set();
	          _iteratorNormalCompletion29 = true;
	          _didIteratorError29 = false;
	          _iteratorError29 = undefined;
	          _context15.prev = 4;
	          _iterator29 = shuffleGen(numbers, seen)[Symbol.iterator]();
	
	        case 6:
	          if (_iteratorNormalCompletion29 = (_step29 = _iterator29.next()).done) {
	            _context15.next = 13;
	            break;
	          }
	
	          _number = _step29.value;
	          _context15.next = 10;
	          return _number;
	
	        case 10:
	          _iteratorNormalCompletion29 = true;
	          _context15.next = 6;
	          break;
	
	        case 13:
	          _context15.next = 19;
	          break;
	
	        case 15:
	          _context15.prev = 15;
	          _context15.t0 = _context15["catch"](4);
	          _didIteratorError29 = true;
	          _iteratorError29 = _context15.t0;
	
	        case 19:
	          _context15.prev = 19;
	          _context15.prev = 20;
	
	          if (!_iteratorNormalCompletion29 && _iterator29.return) {
	            _iterator29.return();
	          }
	
	        case 22:
	          _context15.prev = 22;
	
	          if (!_didIteratorError29) {
	            _context15.next = 25;
	            break;
	          }
	
	          throw _iteratorError29;
	
	        case 25:
	          return _context15.finish(22);
	
	        case 26:
	          return _context15.finish(19);
	
	        case 27:
	          _iteratorNormalCompletion30 = true;
	          _didIteratorError30 = false;
	          _iteratorError30 = undefined;
	          _context15.prev = 30;
	          _iterator30 = stochasticChooseGen(number_whole([]), number_fract([]))[Symbol.iterator]();
	
	        case 32:
	          if (_iteratorNormalCompletion30 = (_step30 = _iterator30.next()).done) {
	            _context15.next = 39;
	            break;
	          }
	
	          _priexp3 = _step30.value;
	          _context15.next = 36;
	          return _priexp3;
	
	        case 36:
	          _iteratorNormalCompletion30 = true;
	          _context15.next = 32;
	          break;
	
	        case 39:
	          _context15.next = 45;
	          break;
	
	        case 41:
	          _context15.prev = 41;
	          _context15.t1 = _context15["catch"](30);
	          _didIteratorError30 = true;
	          _iteratorError30 = _context15.t1;
	
	        case 45:
	          _context15.prev = 45;
	          _context15.prev = 46;
	
	          if (!_iteratorNormalCompletion30 && _iterator30.return) {
	            _iterator30.return();
	          }
	
	        case 48:
	          _context15.prev = 48;
	
	          if (!_didIteratorError30) {
	            _context15.next = 51;
	            break;
	          }
	
	          throw _iteratorError30;
	
	        case 51:
	          return _context15.finish(48);
	
	        case 52:
	          return _context15.finish(45);
	
	        case 53:
	        case "end":
	          return _context15.stop();
	      }
	    }
	  }, _marked[14], this, [[4, 15, 19, 27], [20,, 22, 26], [30, 41, 45, 53], [46,, 48, 52]]);
	}
	
	function number_whole(numbers) {
	  var numDigits = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];
	
	  var seen, _iteratorNormalCompletion31, _didIteratorError31, _iteratorError31, _iterator31, _step31, _number2, _iteratorNormalCompletion32, _didIteratorError32, _iteratorError32, _iterator32, _step32, _number3;
	
	  return regeneratorRuntime.wrap(function number_whole$(_context16) {
	    while (1) {
	      switch (_context16.prev = _context16.next) {
	        case 0:
	          seen = new Set();
	          _iteratorNormalCompletion31 = true;
	          _didIteratorError31 = false;
	          _iteratorError31 = undefined;
	          _context16.prev = 4;
	          _iterator31 = shuffleGen(numbers, seen)[Symbol.iterator]();
	
	        case 6:
	          if (_iteratorNormalCompletion31 = (_step31 = _iterator31.next()).done) {
	            _context16.next = 13;
	            break;
	          }
	
	          _number2 = _step31.value;
	          _context16.next = 10;
	          return _number2;
	
	        case 10:
	          _iteratorNormalCompletion31 = true;
	          _context16.next = 6;
	          break;
	
	        case 13:
	          _context16.next = 19;
	          break;
	
	        case 15:
	          _context16.prev = 15;
	          _context16.t0 = _context16["catch"](4);
	          _didIteratorError31 = true;
	          _iteratorError31 = _context16.t0;
	
	        case 19:
	          _context16.prev = 19;
	          _context16.prev = 20;
	
	          if (!_iteratorNormalCompletion31 && _iterator31.return) {
	            _iterator31.return();
	          }
	
	        case 22:
	          _context16.prev = 22;
	
	          if (!_didIteratorError31) {
	            _context16.next = 25;
	            break;
	          }
	
	          throw _iteratorError31;
	
	        case 25:
	          return _context16.finish(22);
	
	        case 26:
	          return _context16.finish(19);
	
	        case 27:
	          _iteratorNormalCompletion32 = true;
	          _didIteratorError32 = false;
	          _iteratorError32 = undefined;
	          _context16.prev = 30;
	          _iterator32 = starGen(digit, EXAMPLES.digit, numDigits)[Symbol.iterator]();
	
	        case 32:
	          if (_iteratorNormalCompletion32 = (_step32 = _iterator32.next()).done) {
	            _context16.next = 39;
	            break;
	          }
	
	          _number3 = _step32.value;
	          _context16.next = 36;
	          return _number3;
	
	        case 36:
	          _iteratorNormalCompletion32 = true;
	          _context16.next = 32;
	          break;
	
	        case 39:
	          _context16.next = 45;
	          break;
	
	        case 41:
	          _context16.prev = 41;
	          _context16.t1 = _context16["catch"](30);
	          _didIteratorError32 = true;
	          _iteratorError32 = _context16.t1;
	
	        case 45:
	          _context16.prev = 45;
	          _context16.prev = 46;
	
	          if (!_iteratorNormalCompletion32 && _iterator32.return) {
	            _iterator32.return();
	          }
	
	        case 48:
	          _context16.prev = 48;
	
	          if (!_didIteratorError32) {
	            _context16.next = 51;
	            break;
	          }
	
	          throw _iteratorError32;
	
	        case 51:
	          return _context16.finish(48);
	
	        case 52:
	          return _context16.finish(45);
	
	        case 53:
	        case "end":
	          return _context16.stop();
	      }
	    }
	  }, _marked[15], this, [[4, 15, 19, 27], [20,, 22, 26], [30, 41, 45, 53], [46,, 48, 52]]);
	}
	
	function number_fract(numbers) {
	  var numDigits = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];
	
	  var seen, _iteratorNormalCompletion33, _didIteratorError33, _iteratorError33, _iterator33, _step33, _number4, _iteratorNormalCompletion34, _didIteratorError34, _iteratorError34, _iterator34, _step34, _number5;
	
	  return regeneratorRuntime.wrap(function number_fract$(_context18) {
	    while (1) {
	      switch (_context18.prev = _context18.next) {
	        case 0:
	          seen = new Set();
	          _iteratorNormalCompletion33 = true;
	          _didIteratorError33 = false;
	          _iteratorError33 = undefined;
	          _context18.prev = 4;
	          _iterator33 = shuffleGen(numbers, seen)[Symbol.iterator]();
	
	        case 6:
	          if (_iteratorNormalCompletion33 = (_step33 = _iterator33.next()).done) {
	            _context18.next = 13;
	            break;
	          }
	
	          _number4 = _step33.value;
	          _context18.next = 10;
	          return _number4;
	
	        case 10:
	          _iteratorNormalCompletion33 = true;
	          _context18.next = 6;
	          break;
	
	        case 13:
	          _context18.next = 19;
	          break;
	
	        case 15:
	          _context18.prev = 15;
	          _context18.t0 = _context18["catch"](4);
	          _didIteratorError33 = true;
	          _iteratorError33 = _context18.t0;
	
	        case 19:
	          _context18.prev = 19;
	          _context18.prev = 20;
	
	          if (!_iteratorNormalCompletion33 && _iterator33.return) {
	            _iterator33.return();
	          }
	
	        case 22:
	          _context18.prev = 22;
	
	          if (!_didIteratorError33) {
	            _context18.next = 25;
	            break;
	          }
	
	          throw _iteratorError33;
	
	        case 25:
	          return _context18.finish(22);
	
	        case 26:
	          return _context18.finish(19);
	
	        case 27:
	          _iteratorNormalCompletion34 = true;
	          _didIteratorError34 = false;
	          _iteratorError34 = undefined;
	          _context18.prev = 30;
	          _iterator34 = concatInfGen(starGen(digit, EXAMPLES.digit), regeneratorRuntime.mark(function _callee() {
	            return regeneratorRuntime.wrap(function _callee$(_context17) {
	              while (1) {
	                switch (_context17.prev = _context17.next) {
	                  case 0:
	                    if (false) {
	                      _context17.next = 5;
	                      break;
	                    }
	
	                    _context17.next = 3;
	                    return ".";
	
	                  case 3:
	                    _context17.next = 0;
	                    break;
	
	                  case 5:
	                  case "end":
	                    return _context17.stop();
	                }
	              }
	            }, _callee, this);
	          })(), starGen(digit, EXAMPLES.digit, numDigits))[Symbol.iterator]();
	
	        case 32:
	          if (_iteratorNormalCompletion34 = (_step34 = _iterator34.next()).done) {
	            _context18.next = 39;
	            break;
	          }
	
	          _number5 = _step34.value;
	          _context18.next = 36;
	          return _number5;
	
	        case 36:
	          _iteratorNormalCompletion34 = true;
	          _context18.next = 32;
	          break;
	
	        case 39:
	          _context18.next = 45;
	          break;
	
	        case 41:
	          _context18.prev = 41;
	          _context18.t1 = _context18["catch"](30);
	          _didIteratorError34 = true;
	          _iteratorError34 = _context18.t1;
	
	        case 45:
	          _context18.prev = 45;
	          _context18.prev = 46;
	
	          if (!_iteratorNormalCompletion34 && _iterator34.return) {
	            _iterator34.return();
	          }
	
	        case 48:
	          _context18.prev = 48;
	
	          if (!_didIteratorError34) {
	            _context18.next = 51;
	            break;
	          }
	
	          throw _iteratorError34;
	
	        case 51:
	          return _context18.finish(48);
	
	        case 52:
	          return _context18.finish(45);
	
	        case 53:
	        case "end":
	          return _context18.stop();
	      }
	    }
	  }, _marked[16], this, [[4, 15, 19, 27], [20,, 22, 26], [30, 41, 45, 53], [46,, 48, 52]]);
	}
	
	function digit(digits) {
	  var seen, _iteratorNormalCompletion35, _didIteratorError35, _iteratorError35, _iterator35, _step35, _digit;
	
	  return regeneratorRuntime.wrap(function digit$(_context19) {
	    while (1) {
	      switch (_context19.prev = _context19.next) {
	        case 0:
	          seen = new Set();
	          _iteratorNormalCompletion35 = true;
	          _didIteratorError35 = false;
	          _iteratorError35 = undefined;
	          _context19.prev = 4;
	          _iterator35 = shuffleGen(digits, seen)[Symbol.iterator]();
	
	        case 6:
	          if (_iteratorNormalCompletion35 = (_step35 = _iterator35.next()).done) {
	            _context19.next = 13;
	            break;
	          }
	
	          _digit = _step35.value;
	          _context19.next = 10;
	          return _digit;
	
	        case 10:
	          _iteratorNormalCompletion35 = true;
	          _context19.next = 6;
	          break;
	
	        case 13:
	          _context19.next = 19;
	          break;
	
	        case 15:
	          _context19.prev = 15;
	          _context19.t0 = _context19["catch"](4);
	          _didIteratorError35 = true;
	          _iteratorError35 = _context19.t0;
	
	        case 19:
	          _context19.prev = 19;
	          _context19.prev = 20;
	
	          if (!_iteratorNormalCompletion35 && _iterator35.return) {
	            _iterator35.return();
	          }
	
	        case 22:
	          _context19.prev = 22;
	
	          if (!_didIteratorError35) {
	            _context19.next = 25;
	            break;
	          }
	
	          throw _iteratorError35;
	
	        case 25:
	          return _context19.finish(22);
	
	        case 26:
	          return _context19.finish(19);
	
	        case 27:
	        case "end":
	          return _context19.stop();
	      }
	    }
	  }, _marked[17], this, [[4, 15, 19, 27], [20,, 22, 26]]);
	}
	
	function alnum(alnums) {
	  var seen, _iteratorNormalCompletion36, _didIteratorError36, _iteratorError36, _iterator36, _step36, _alnum;
	
	  return regeneratorRuntime.wrap(function alnum$(_context20) {
	    while (1) {
	      switch (_context20.prev = _context20.next) {
	        case 0:
	          seen = new Set();
	          _iteratorNormalCompletion36 = true;
	          _didIteratorError36 = false;
	          _iteratorError36 = undefined;
	          _context20.prev = 4;
	          _iterator36 = shuffleGen(alnums, seen)[Symbol.iterator]();
	
	        case 6:
	          if (_iteratorNormalCompletion36 = (_step36 = _iterator36.next()).done) {
	            _context20.next = 13;
	            break;
	          }
	
	          _alnum = _step36.value;
	          _context20.next = 10;
	          return _alnum;
	
	        case 10:
	          _iteratorNormalCompletion36 = true;
	          _context20.next = 6;
	          break;
	
	        case 13:
	          _context20.next = 19;
	          break;
	
	        case 15:
	          _context20.prev = 15;
	          _context20.t0 = _context20["catch"](4);
	          _didIteratorError36 = true;
	          _iteratorError36 = _context20.t0;
	
	        case 19:
	          _context20.prev = 19;
	          _context20.prev = 20;
	
	          if (!_iteratorNormalCompletion36 && _iterator36.return) {
	            _iterator36.return();
	          }
	
	        case 22:
	          _context20.prev = 22;
	
	          if (!_didIteratorError36) {
	            _context20.next = 25;
	            break;
	          }
	
	          throw _iteratorError36;
	
	        case 25:
	          return _context20.finish(22);
	
	        case 26:
	          return _context20.finish(19);
	
	        case 27:
	        case "end":
	          return _context20.stop();
	      }
	    }
	  }, _marked[18], this, [[4, 15, 19, 27], [20,, 22, 26]]);
	}
	
	function letter(letters) {
	  var seen, _iteratorNormalCompletion37, _didIteratorError37, _iteratorError37, _iterator37, _step37, _letter;
	
	  return regeneratorRuntime.wrap(function letter$(_context21) {
	    while (1) {
	      switch (_context21.prev = _context21.next) {
	        case 0:
	          seen = new Set();
	          _iteratorNormalCompletion37 = true;
	          _didIteratorError37 = false;
	          _iteratorError37 = undefined;
	          _context21.prev = 4;
	          _iterator37 = shuffleGen(letters, seen)[Symbol.iterator]();
	
	        case 6:
	          if (_iteratorNormalCompletion37 = (_step37 = _iterator37.next()).done) {
	            _context21.next = 13;
	            break;
	          }
	
	          _letter = _step37.value;
	          _context21.next = 10;
	          return _letter;
	
	        case 10:
	          _iteratorNormalCompletion37 = true;
	          _context21.next = 6;
	          break;
	
	        case 13:
	          _context21.next = 19;
	          break;
	
	        case 15:
	          _context21.prev = 15;
	          _context21.t0 = _context21["catch"](4);
	          _didIteratorError37 = true;
	          _iteratorError37 = _context21.t0;
	
	        case 19:
	          _context21.prev = 19;
	          _context21.prev = 20;
	
	          if (!_iteratorNormalCompletion37 && _iterator37.return) {
	            _iterator37.return();
	          }
	
	        case 22:
	          _context21.prev = 22;
	
	          if (!_didIteratorError37) {
	            _context21.next = 25;
	            break;
	          }
	
	          throw _iteratorError37;
	
	        case 25:
	          return _context21.finish(22);
	
	        case 26:
	          return _context21.finish(19);
	
	        case 27:
	        case "end":
	          return _context21.stop();
	      }
	    }
	  }, _marked[19], this, [[4, 15, 19, 27], [20,, 22, 26]]);
	}
	
	//UTILS
	
	function stochasticChooseGen() {
	  for (var _len = arguments.length, gens = Array(_len), _key = 0; _key < _len; _key++) {
	    gens[_key] = arguments[_key];
	  }
	
	  var weights, sum, choice, i;
	  return regeneratorRuntime.wrap(function stochasticChooseGen$(_context22) {
	    while (1) {
	      switch (_context22.prev = _context22.next) {
	        case 0:
	          weights = gens.map(function () {
	            return 1;
	          });
	
	        case 1:
	          if (false) {
	            _context22.next = 11;
	            break;
	          }
	
	          sum = weights.reduce(function (a, b) {
	            return a + b;
	          });
	          choice = Math.random() * sum;
	          i = undefined;
	
	          for (i = 0; choice > weights[i]; choice -= weights[i++]) {}
	
	          weights[i] /= 2;
	          _context22.next = 9;
	          return gens[i].next().value;
	
	        case 9:
	          _context22.next = 1;
	          break;
	
	        case 11:
	        case "end":
	          return _context22.stop();
	      }
	    }
	  }, _marked[20], this);
	}
	
	function arrayInfGen() {
	  for (var _len2 = arguments.length, gens = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	    gens[_key2] = arguments[_key2];
	  }
	
	  return regeneratorRuntime.wrap(function arrayInfGen$(_context23) {
	    while (1) {
	      switch (_context23.prev = _context23.next) {
	        case 0:
	          if (false) {
	            _context23.next = 5;
	            break;
	          }
	
	          _context23.next = 3;
	          return gens.map(function (g) {
	            return g.next().value;
	          });
	
	        case 3:
	          _context23.next = 0;
	          break;
	
	        case 5:
	        case "end":
	          return _context23.stop();
	      }
	    }
	  }, _marked[21], this);
	}
	
	function concatInfGen() {
	  var _iteratorNormalCompletion38,
	      _didIteratorError38,
	      _iteratorError38,
	      _iterator38,
	      _step38,
	      items,
	      _args24 = arguments;
	
	  return regeneratorRuntime.wrap(function concatInfGen$(_context24) {
	    while (1) {
	      switch (_context24.prev = _context24.next) {
	        case 0:
	          _iteratorNormalCompletion38 = true;
	          _didIteratorError38 = false;
	          _iteratorError38 = undefined;
	          _context24.prev = 3;
	          _iterator38 = arrayInfGen.apply(undefined, _args24)[Symbol.iterator]();
	
	        case 5:
	          if (_iteratorNormalCompletion38 = (_step38 = _iterator38.next()).done) {
	            _context24.next = 12;
	            break;
	          }
	
	          items = _step38.value;
	          _context24.next = 9;
	          return items.join("");
	
	        case 9:
	          _iteratorNormalCompletion38 = true;
	          _context24.next = 5;
	          break;
	
	        case 12:
	          _context24.next = 18;
	          break;
	
	        case 14:
	          _context24.prev = 14;
	          _context24.t0 = _context24["catch"](3);
	          _didIteratorError38 = true;
	          _iteratorError38 = _context24.t0;
	
	        case 18:
	          _context24.prev = 18;
	          _context24.prev = 19;
	
	          if (!_iteratorNormalCompletion38 && _iterator38.return) {
	            _iterator38.return();
	          }
	
	        case 21:
	          _context24.prev = 21;
	
	          if (!_didIteratorError38) {
	            _context24.next = 24;
	            break;
	          }
	
	          throw _iteratorError38;
	
	        case 24:
	          return _context24.finish(21);
	
	        case 25:
	          return _context24.finish(18);
	
	        case 26:
	        case "end":
	          return _context24.stop();
	      }
	    }
	  }, _marked[22], this, [[3, 14, 18, 26], [19,, 21, 25]]);
	}
	
	function cycleGen(genfn, samples) {
	  var current, _iteratorNormalCompletion39, _didIteratorError39, _iteratorError39, _iterator39, _step39, example;
	
	  return regeneratorRuntime.wrap(function cycleGen$(_context25) {
	    while (1) {
	      switch (_context25.prev = _context25.next) {
	        case 0:
	          if (false) {
	            _context25.next = 30;
	            break;
	          }
	
	          current = genfn(samples);
	          _iteratorNormalCompletion39 = true;
	          _didIteratorError39 = false;
	          _iteratorError39 = undefined;
	          _context25.prev = 5;
	          _iterator39 = current[Symbol.iterator]();
	
	        case 7:
	          if (_iteratorNormalCompletion39 = (_step39 = _iterator39.next()).done) {
	            _context25.next = 14;
	            break;
	          }
	
	          example = _step39.value;
	          _context25.next = 11;
	          return example;
	
	        case 11:
	          _iteratorNormalCompletion39 = true;
	          _context25.next = 7;
	          break;
	
	        case 14:
	          _context25.next = 20;
	          break;
	
	        case 16:
	          _context25.prev = 16;
	          _context25.t0 = _context25["catch"](5);
	          _didIteratorError39 = true;
	          _iteratorError39 = _context25.t0;
	
	        case 20:
	          _context25.prev = 20;
	          _context25.prev = 21;
	
	          if (!_iteratorNormalCompletion39 && _iterator39.return) {
	            _iterator39.return();
	          }
	
	        case 23:
	          _context25.prev = 23;
	
	          if (!_didIteratorError39) {
	            _context25.next = 26;
	            break;
	          }
	
	          throw _iteratorError39;
	
	        case 26:
	          return _context25.finish(23);
	
	        case 27:
	          return _context25.finish(20);
	
	        case 28:
	          _context25.next = 0;
	          break;
	
	        case 30:
	        case "end":
	          return _context25.stop();
	      }
	    }
	  }, _marked[23], this, [[5, 16, 20, 28], [21,, 23, 27]]);
	}
	
	function starGen(genfn, samples) {
	  var num = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
	
	  var currentGenerators, _i, currentValues, _example;
	
	  return regeneratorRuntime.wrap(function starGen$(_context26) {
	    while (1) {
	      switch (_context26.prev = _context26.next) {
	        case 0:
	          if (false) {
	            _context26.next = 19;
	            break;
	          }
	
	          if (!(num === 0)) {
	            _context26.next = 6;
	            break;
	          }
	
	          _context26.next = 4;
	          return "";
	
	        case 4:
	          num++;
	          return _context26.abrupt("continue", 0);
	
	        case 6:
	          currentGenerators = [];
	
	          for (_i = 0; _i < num; _i++) {
	            currentGenerators.push(genfn(samples));
	          }
	
	          currentValues = currentGenerators.map(function (g) {
	            return g.next();
	          });
	
	        case 9:
	          if (currentValues[0].done) {
	            _context26.next = 16;
	            break;
	          }
	
	          _example = currentValues.map(function (i) {
	            return i.value;
	          }).join("");
	          _context26.next = 13;
	          return _example;
	
	        case 13:
	          currentValues = currentGenerators.map(function (g) {
	            return g.next();
	          });
	          _context26.next = 9;
	          break;
	
	        case 16:
	
	          num++;
	          _context26.next = 0;
	          break;
	
	        case 19:
	        case "end":
	          return _context26.stop();
	      }
	    }
	  }, _marked[24], this);
	}
	
	function shuffleGen(items, seen) {
	  var _iteratorNormalCompletion40, _didIteratorError40, _iteratorError40, _iterator40, _step40, item;
	
	  return regeneratorRuntime.wrap(function shuffleGen$(_context27) {
	    while (1) {
	      switch (_context27.prev = _context27.next) {
	        case 0:
	          if (items instanceof Set) {
	            items = [].concat(_toConsumableArray(items));
	          }
	
	          items = shuffle(items);
	
	          _iteratorNormalCompletion40 = true;
	          _didIteratorError40 = false;
	          _iteratorError40 = undefined;
	          _context27.prev = 5;
	          _iterator40 = items[Symbol.iterator]();
	
	        case 7:
	          if (_iteratorNormalCompletion40 = (_step40 = _iterator40.next()).done) {
	            _context27.next = 15;
	            break;
	          }
	
	          item = _step40.value;
	
	          seen.add(item);
	          _context27.next = 12;
	          return item;
	
	        case 12:
	          _iteratorNormalCompletion40 = true;
	          _context27.next = 7;
	          break;
	
	        case 15:
	          _context27.next = 21;
	          break;
	
	        case 17:
	          _context27.prev = 17;
	          _context27.t0 = _context27["catch"](5);
	          _didIteratorError40 = true;
	          _iteratorError40 = _context27.t0;
	
	        case 21:
	          _context27.prev = 21;
	          _context27.prev = 22;
	
	          if (!_iteratorNormalCompletion40 && _iterator40.return) {
	            _iterator40.return();
	          }
	
	        case 24:
	          _context27.prev = 24;
	
	          if (!_didIteratorError40) {
	            _context27.next = 27;
	            break;
	          }
	
	          throw _iteratorError40;
	
	        case 27:
	          return _context27.finish(24);
	
	        case 28:
	          return _context27.finish(21);
	
	        case 29:
	        case "end":
	          return _context27.stop();
	      }
	    }
	  }, _marked[25], this, [[5, 17, 21, 29], [22,, 24, 28]]);
	}
	
	function shuffle(array) {
	  array = array.slice();
	  var currentIndex = array.length,
	      temporaryValue,
	      randomIndex;
	
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
	function setGeneratedExamples(ruleName) {
	  console.log(ruleName);
	  var generator = GENERATORS[ruleName]([]);
	  var node = document.querySelector('generatedexamples');
	  node.textContent = "";
	  if (generator) {
	    (function () {
	      var diverseExamples = [];
	      var averageDiversity = 0;
	      var numSeen = 0;
	
	      var _loop = function _loop() {
	        var size = diverseExamples.length;
	        var example = generator.next().value;
	        var exampleCST = undefined;
	        var match = undefined;
	
	        match = language.grammar.match(example, ruleName);
	        exampleCST = match._cst;
	        exampleCST.originalText = example;
	
	        var exampleDiversity = 0;
	        if (size > 0) {
	          exampleDiversity = diversity(example, diverseExamples, "ctorName");
	          exampleCST.diversity = exampleDiversity;
	        }
	
	        if (size === 0 || exampleDiversity > averageDiversity) {
	          if (size >= 10) {
	            (function () {
	              var leastDiversity = diverseExamples.reduce(function (a, b) {
	                return a.diversity < b.diversity ? a : b;
	              });
	              averageDiversity -= leastDiversity.diversity / diverseExamples.length;
	              diverseExamples.forEach(function (example) {
	                example.diversity -=
	                // Math.pow(distance_pq(leastDiversity, example, "ctorName"), 2) /
	                leastDiversity.diversity / diverseExamples.length;
	              });
	              diverseExamples.splice(diverseExamples.indexOf(leastDiversity), 1);
	            })();
	          }
	          //update diversity for each element
	          size = diverseExamples.length;
	          diverseExamples.forEach(function (example) {
	            example.diversity = example.diversity * (size / (size + 1)) + exampleCST.diversity / (size + 1);
	          });
	          averageDiversity = averageDiversity * (size / (size + 1)) + exampleDiversity / (size + 1);
	          diverseExamples.push(exampleCST);
	        }
	
	        numSeen++;
	      };
	
	      while (numSeen < 50) {
	        _loop();
	      }
	
	      diverseExamples.map(function (i) {
	        return i.originalText;
	      }).map(makeExample).forEach(function (exampleNode) {
	        node.appendChild(exampleNode);
	      });
	    })();
	  }
	}
	
	document.addEventListener("DOMContentLoaded", function () {
	  setGeneratedExamples("Exp");
	
	  document.querySelector("input#exampleInput").addEventListener("keyup", function (e) {
	    if (e.code === "Enter") {
	      var example = document.querySelector("#exampleInput").value;
	      exampleChanged(example);
	    }
	  });
	
	  $('rule choice').mouseover(function () {
	    var ruleName = $(this).closest('rule').children('name').text();
	    var caseName = $(this).find('casename');
	    if (caseName.length > 0) {
	      ruleName += "_" + caseName.text();
	    } else if ($(this).closest('rule').find('alt').get()[0].children.length > 1) {
	      ruleName = $(this).find('app').text();
	    }
	
	    // setRelevantExamples(ruleName);
	    setGeneratedExamples(ruleName);
	  });
	
	  $('rule > name').mouseover(function () {
	    var ruleName = $(this).text();
	    // setRelevantExamples(ruleName);
	    setGeneratedExamples(ruleName);
	  });
	
	  $('action').mouseover(function () {
	    var ruleName = $(this).attr('ruleId');
	    setGeneratedExamples(ruleName);
	  });
	});

/***/ },
/* 15 */
/***/ function(module, exports) {

	"use strict";
	
	//an implementation of pq distance as shown in
	//  Augsten, Nikolaus, Michael Bohlen, and Johann Gamper. "Approximate Tree Matching with pq-Grams."
	function distance_pq(a, b) {
	  var label = arguments.length <= 2 || arguments[2] === undefined ? "label" : arguments[2];
	  var p = arguments.length <= 3 || arguments[3] === undefined ? 2 : arguments[3];
	  var q = arguments.length <= 4 || arguments[4] === undefined ? 3 : arguments[4];
	
	  //sets of pq labels
	  var profilea = pq_profile(a, p, q, label),
	      profileb = pq_profile(b, p, q, label);
	
	  var intersectionSize = 0;
	  seen = [];
	  profilea.forEach(function (ai) {
	    if (profileb.find(function (bi) {
	      return pq_equal(bi, ai);
	    }) && !seen.find(function (i) {
	      return pq_equal(ai, i);
	    })) {
	      var freqa = profilea.filter(function (i) {
	        return pq_equal(i, ai);
	      }).length;
	      var freqb = profileb.filter(function (i) {
	        return pq_equal(i, ai);
	      }).length;
	      intersectionSize += Math.min(freqa, freqb);
	      seen.push(ai);
	    }
	  });
	
	  var unionSize = profilea.length + profileb.length;
	
	  return 1 - 2 * (intersectionSize / unionSize);
	}
	
	//mean square distance
	function diversity(example, set) {
	  var label = arguments.length <= 2 || arguments[2] === undefined ? "label" : arguments[2];
	  var distance = arguments.length <= 3 || arguments[3] === undefined ? distance_pq : arguments[3];
	
	  var diversity = 0;
	  set.forEach(function (item) {
	    diversity += Math.pow(distance(item, example, label), 2);
	  });
	  diversity /= set.length;
	
	  return diversity;
	}
	
	function entropy(set) {
	  var label = arguments.length <= 1 || arguments[1] === undefined ? "label" : arguments[1];
	
	  var buckets = {};
	
	  set.forEach(function (item) {
	    if (!buckets.hasOwnProperty(item[label])) {
	      buckets[item[label]] = 0;
	    }
	    buckets[item[label]]++;
	  });
	
	  var sum = Object.keys(buckets).reduce(function (agg, key) {
	    return agg + buckets[key];
	  }, 0);
	
	  var proportions = Object.keys(buckets).map(function (key) {
	    return buckets[key] / sum;
	  });
	  console.log(proportions);
	  return -proportions.map(function (p) {
	    return p * Math.log(p);
	  }).reduce(function (a, b) {
	    return a + b;
	  }, 0);
	}
	
	if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
	  module.exports = {
	    distance_pq: distance_pq,
	    diversity: diversity,
	    entropy: entropy
	  };
	} else {
	  window.distance_pq = distance_pq;
	  window.diversity = diversity;
	  window.entropy = entropy;
	}
	
	//PQ DISTANCE HELPERS
	
	function pq_profile(root, p, q, label) {
	  var profile = [];
	  var ancestors = makeArray(p);
	  profile = profile_helper(root, p, q, profile, ancestors, label);
	  return profile;
	}
	
	function profile_helper( /*tree,*/node, p, q, profile, ancestors, label) {
	  ancestors = pq_shift(ancestors, node[label]);
	  var siblings = makeArray(q);
	
	  if (node.children && node.children.length > 0) {
	    node.children.forEach(function (child) {
	      siblings = pq_shift(siblings, child[label]);
	      profile = profile.concat([ancestors.concat(siblings)]);
	      profile = profile_helper(child, p, q, profile, ancestors, label);
	    });
	  } else {
	    //LEAF
	    profile = profile.concat([ancestors.concat(siblings)]);
	  }
	
	  return profile;
	}
	
	function pq_shift(array, item) {
	  array.shift();
	  array.push(item);
	  return array;
	}
	
	function makeArray(length) {
	  var array = [];
	  for (var i = 0; i < length; i++, array.push(null)) {}
	  return array;
	}
	
	function pq_equal(tuplea, tupleb) {
	  return tuplea.map(function (la, i) {
	    return la === tupleb[i];
	  }).reduce(function (a, b) {
	    return a && b;
	  }, true);
	}

/***/ }
]);
//# sourceMappingURL=arithmetic.bundle.js.map