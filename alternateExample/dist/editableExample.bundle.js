webpackJsonp([0],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var OhmGrammarTextEditor = __webpack_require__(1).OhmGrammarTextEditor;
	
	var language = __webpack_require__(4),
	    toAST = __webpack_require__(6),
	    grammarSlice = __webpack_require__(8).grammarSlice;
	
	var keywordTags = language.grammar.ruleBodies['keyword'].terms.map(function (term) {
	  return term.ruleName;
	});
	
	var grammar = language.grammar,
	    semantics = language.semantics;
	
	var exampleNode = document.querySelector('pre#example');
	var example = exampleNode.textContent;
	exampleNode.textContent = "";
	var match = undefined;
	try {
	  match = grammar.match(example);
	} catch (e) {
	  console.error(e, match.message);
	}
	
	var ohmGrammarTextEditor = new OhmGrammarTextEditor(document.querySelector('exampleText'), {
	  body: example, grammar: grammar
	});

/***/ }
]);
//# sourceMappingURL=editableExample.bundle.js.map