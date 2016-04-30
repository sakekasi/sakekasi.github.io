webpackJsonp([0,1],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var HighlightingEditor = __webpack_require__(1).HighlightingEditor,
	    ThirdEyeExampleVisualization = __webpack_require__(2).ThirdEyeExampleVisualization,
	    GrammarSemantics = __webpack_require__(15).GrammarSemantics,
	    mapSemantics = __webpack_require__(22),
	    simplifyCST = __webpack_require__(24),
	    reify = __webpack_require__(12);
	
	var language = __webpack_require__(13),
	    toAST = __webpack_require__(25),
	    grammarSlice = __webpack_require__(27).grammarSlice;
	
	var keywordTags = ["keyword", "class", "def", "extends", "falseK", "new", "nullK", "return", "super", "this", "trueK", "var", "with"];
	
	document.addEventListener("DOMContentLoaded", function (event) {
	  var grammar = language.grammar,
	      semantics = language.semantics;
	
	  toAST.registerToAST(semantics);
	  mapSemantics.registerMapSemantics(semantics);
	  simplifyCST.registerSimplifyAction(semantics);
	  reify.registerReifyActions(semantics);
	
	  var exampleNode = document.querySelector('pre#example');
	  var example = exampleNode.textContent;
	  exampleNode.textContent = "";
	  var match = undefined;
	  try {
	    match = grammar.match(example);
	  } catch (e) {
	    console.error(e, match.message);
	  }
	
	  var grammarSemantics = undefined,
	      thirdEyeViz = undefined;
	  var gsActions = {
	    highlight: function highlight() {
	      var _grammarSemantics;
	
	      return (_grammarSemantics = grammarSemantics).highlight.apply(_grammarSemantics, arguments);
	    },
	    unHighlight: function unHighlight() {
	      var _grammarSemantics2;
	
	      return (_grammarSemantics2 = grammarSemantics).unHighlight.apply(_grammarSemantics2, arguments);
	    },
	    split: function split() {
	      var _grammarSemantics3;
	
	      return (_grammarSemantics3 = grammarSemantics).split.apply(_grammarSemantics3, arguments);
	    },
	    join: function join() {
	      var _grammarSemantics4;
	
	      return (_grammarSemantics4 = grammarSemantics).join.apply(_grammarSemantics4, arguments);
	    }
	  };
	  var thirdEyeActions = {
	    highlight: function highlight() {
	      var _thirdEyeViz;
	
	      return (_thirdEyeViz = thirdEyeViz).highlight.apply(_thirdEyeViz, arguments);
	    },
	    unHighlight: function unHighlight() {
	      var _thirdEyeViz2;
	
	      return (_thirdEyeViz2 = thirdEyeViz).unHighlight.apply(_thirdEyeViz2, arguments);
	    },
	    split: function split() {
	      var _thirdEyeViz3;
	
	      return (_thirdEyeViz3 = thirdEyeViz).split.apply(_thirdEyeViz3, arguments);
	    },
	    join: function join() {
	      var _thirdEyeViz4;
	
	      return (_thirdEyeViz4 = thirdEyeViz).join.apply(_thirdEyeViz4, arguments);
	    },
	    updateSemanticResults: function updateSemanticResults() {
	      var _thirdEyeViz5;
	
	      return (_thirdEyeViz5 = thirdEyeViz).updateSemanticResults.apply(_thirdEyeViz5, arguments);
	    }
	  };
	
	  thirdEyeViz = new ThirdEyeExampleVisualization(document.querySelector('example'), {
	    semantics: semantics, match: match, keywordTags: keywordTags, actions: gsActions
	  });
	
	  grammarSemantics = new GrammarSemantics(document.querySelector('.editorWrapper'), {
	    grammar: grammar, semantics: semantics, match: match, actions: thirdEyeActions
	  });
	});

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var HighlightingEditor = function () {
	  function HighlightingEditor(element, grammar) {
	    var pparse = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
	
	    _classCallCheck(this, HighlightingEditor);
	
	    this.grammar = grammar;
	    this.pparse = pparse;
	
	    var editor = this.editor = CodeMirror(element);
	    this.editor.setOption("extraKeys", {
	      Tab: function Tab(cm) {
	        var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
	        cm.replaceSelection(spaces);
	      }
	    });
	
	    var that = this;
	    this.count = 0;
	    this.marks = [];
	    this.nodeToMark = new Map();
	    this.markToNode = new Map();
	
	    //*ref https://gitlab.com/cdg/ppls/raw/master/lib/playground.js
	    this.semantics = grammar && grammar.semantics().addOperation('syntaxHighlight', {
	      _nonterminal: function _nonterminal(children) {
	        // console.log(children[0].ctorName, that.count++);
	        var ruleName = this.ctorName;
	        var doc = that.editor.doc;
	
	        var currentMark = doc.markText(doc.posFromIndex(this.interval.startIdx), doc.posFromIndex(this.interval.endIdx), { className: ruleName });
	
	        that.marks.push(currentMark);
	        that.nodeToMark.set(this._node, currentMark);
	        that.markToNode.set(currentMark, this._node);
	
	        // that.markInterval( this.interval, ruleName, false );
	
	        // Only bother to mark up the first level of lexical rule.
	        // (We don't care about the decomposition of a token for syntax highlighting.)
	        if (this.isSyntactic() || ruleName === 'tokens' || ruleName === 'keyword' || ruleName === 'space' || ruleName === 'spaces') {
	          children.forEach(function (child) {
	            child.syntaxHighlight();
	          });
	        }
	      }
	    });
	  }
	
	  _createClass(HighlightingEditor, [{
	    key: "setValue",
	    value: function setValue(contents) {
	      this.editor.setValue(contents);
	      this.count = 0;
	      if (this.pparse) {
	        this.clearMarks();
	        this.nodeToMark = new Map();
	        this.markToNode = new Map();
	        this._syntaxHighlight(contents);
	      }
	    }
	
	    //*ref https://raw.githubusercontent.com/cdglabs/ohm/master/visualizer/cmUtil.js
	
	  }, {
	    key: "markInterval",
	    value: function markInterval(interval, className, canHighlightBlocks) {
	      var startPos = this.editor.posFromIndex(interval.startIdx - 1);
	      var endPos = this.editor.posFromIndex(interval.endIdx);
	
	      // See if the selection can be expanded to a block selection.
	      if (canHighlightBlocks && isBlockSelectable(this.editor, startPos, endPos)) {
	        return markBlock(this.editor, startPos.line, endPos.line, className);
	      }
	      return this.editor.markText(startPos, endPos, { className: className });
	    }
	
	    //*ref https://raw.githubusercontent.com/cdglabs/ohm/master/visualizer/cmUtil.js
	
	  }, {
	    key: "clearMark",
	    value: function clearMark(mark) {
	      if (mark) {
	        mark.clear();
	      }
	    }
	  }, {
	    key: "clearMarks",
	    value: function clearMarks() {
	      var mark = undefined;
	      while (mark = this.marks.shift()) {
	        mark.clear();
	      }
	    }
	
	    //*ref https://raw.githubusercontent.com/cdglabs/ohm/master/visualizer/cmUtil.js
	
	  }, {
	    key: "scrollToInterval",
	    value: function scrollToInterval(interval) {
	      var startHeight = indexToHeight(this.editor, interval.startIdx);
	      var endHeight = indexToHeight(this.editor, interval.endIdx);
	      var scrollInfo = this.editor.getScrollInfo();
	      var margin = scrollInfo.clientHeight - (endHeight - startHeight);
	      if (startHeight < scrollInfo.top || endHeight > scrollInfo.top + scrollInfo.clientHeight) {
	        this.editor.scrollIntoView({ left: 0, top: startHeight,
	          right: 0, bottom: endHeight }, margin > 0 ? margin / 2 : undefined);
	      }
	    }
	  }, {
	    key: "_syntaxHighlight",
	    value: function _syntaxHighlight(src) {
	      console.log("_syntaxHighlight start");
	      //*ref https://gitlab.com/cdg/ppls/raw/master/lib/playground.js
	      var matchResult = this.grammar.match(src);
	      console.log("matchresult");
	      if (matchResult.succeeded()) {
	        console.log("succeeded");
	        console.log("starting semact 1");
	        this.semantics(matchResult).syntaxHighlight();
	        console.log("starting semact 2");
	        this.semantics(matchResult.getDiscardedSpaces()).syntaxHighlight();
	      } else {
	        console.log("failed");
	        // The input didn't parse, but we can at least highlight tokens individually.
	        matchResult = this.grammar.match(src, 'tokens');
	        console.log("starting semact");
	        this.semantics(matchResult).syntaxHighlight();
	      }
	
	      console.log("_syntaxHighlight end");
	    }
	  }]);
	
	  return HighlightingEditor;
	}();
	
	var toExport = {
	  HighlightingEditor: HighlightingEditor
	};
	
	if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
	  module.exports = toExport;
	} else {
	  Object.assign(window, toExport);
	}
	
	//HELPERS
	///////////////
	
	function isSyntactic(ruleName) {
	  var firstLetter = ruleName.charAt(0).toLowerCase();
	  return 'a' <= firstLetter && firstLetter <= 'z';
	}
	
	function countLeadingWhitespace(str) {
	  return str.match(/^\s*/)[0].length;
	}
	
	function countTrailingWhitespace(str) {
	  return str.match(/\s*$/)[0].length;
	}
	
	function indexToHeight(cm, index) {
	  var pos = cm.posFromIndex(index);
	  return cm.heightAtLine(pos.line, 'local');
	}
	
	function isBlockSelectable(cm, startPos, endPos) {
	  var lastLine = cm.getLine(endPos.line);
	  return countLeadingWhitespace(cm.getLine(startPos.line)) === startPos.ch && lastLine.length - countTrailingWhitespace(lastLine) === endPos.ch;
	}
	
	// Mark a block of text with `className` by marking entire lines.
	function markBlock(cm, startLine, endLine, className) {
	  for (var i = startLine; i <= endLine; ++i) {
	    cm.addLineClass(i, 'wrap', className);
	  }
	  return {
	    clear: function clear() {
	      for (var i = startLine; i <= endLine; ++i) {
	        cm.removeLineClass(i, 'wrap', className);
	      }
	    }
	  };
	}

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	//maybe we want to do this using WebComponents
	'use strict';
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var $ = __webpack_require__(3);
	var TreeView = __webpack_require__(4).TreeView,
	    ExampleView = __webpack_require__(11).ExampleView,
	    treeUtils = __webpack_require__(9),
	    utils = __webpack_require__(10);
	var language = __webpack_require__(13);
	
	var _ = function _(x) {
	  return Array.prototype.slice.call(x);
	};
	
	var ThirdEyeExampleVisualization = function () {
	  //* node - a CST node
	  //* simplified - a node in the simplified CST
	  //* dom - a node in the reified DOM
	
	  function ThirdEyeExampleVisualization(domNode, _ref) {
	    var semantics = _ref.semantics;
	    var match = _ref.match;
	    var keywordTags = _ref.keywordTags;
	    var actions = _ref.actions;
	
	    _classCallCheck(this, ThirdEyeExampleVisualization);
	
	    this.actions = actions;
	    this.domNode = domNode;
	
	    this.match = match;
	    this.semmatch = semantics(match);
	
	    //3. the simplified cst
	    this.nodeToSimplified = new Map();
	    this.simplifiedCST = this.semmatch.simplifyCST(null, this.nodeToSimplified);
	    this.nodeToResults = new Map();
	
	    var thirdEyeActions = {
	      split: this.split.bind(this),
	      join: this.join.bind(this),
	      highlight: this.highlight.bind(this),
	      unHighlight: this.unHighlight.bind(this)
	    };
	
	    this.exampleView = new ExampleView(this.domNode.querySelector('pre#example'), {
	      semantics: semantics, match: match,
	      nodeToSimplified: this.nodeToSimplified,
	      nodeToResults: this.nodeToResults,
	      keywordTags: keywordTags, actions: thirdEyeActions
	    });
	
	    this.treeView = new TreeView(this.domNode.querySelector("svg"), {
	      root: this.simplifiedCST,
	      actions: thirdEyeActions
	    });
	  }
	
	  _createClass(ThirdEyeExampleVisualization, [{
	    key: "updateSemanticResults",
	    value: function updateSemanticResults(newNodeToResults) {
	      // console.log('update', newNodeToResults);
	      this.nodeToResults = newNodeToResults;
	      this.exampleView.updateSemanticResults(newNodeToResults);
	      this.treeView.update();
	    }
	  }, {
	    key: "split",
	    value: function split(simplifiedCSTNode) {
	      var children = simplifiedCSTNode.originalChildren();
	
	      if (simplifiedCSTNode.splittable()) {
	        //make cst node's children current
	        simplifiedCSTNode.current = false;
	        children.forEach(function (child) {
	          return child.current = true;
	        });
	
	        //split tree visualization
	        this.exampleView.split(simplifiedCSTNode);
	        this.treeView.split(simplifiedCSTNode);
	      } else {
	        simplifiedCSTNode.leaf = true;
	        this.treeView.update();
	      }
	
	      this.actions.split(simplifiedCSTNode); //parent actions
	    }
	  }, {
	    key: "join",
	    value: function join(simplifiedCSTNode) {
	      var descendants = treeUtils.descendants(simplifiedCSTNode, function (child) {
	        return child.originalChildren();
	      });
	
	      descendants.forEach(function (child) {
	        return child.current = false;
	      });
	      simplifiedCSTNode.current = true;
	
	      this.exampleView.join(simplifiedCSTNode);
	      this.treeView.join(simplifiedCSTNode);
	      this.actions.join(simplifiedCSTNode);
	    }
	  }, {
	    key: "highlight",
	    value: function highlight(simplifiedCSTNode) {
	      this.actions.highlight(simplifiedCSTNode);
	      this.exampleView.highlight(simplifiedCSTNode);
	      this.treeView.highlight(simplifiedCSTNode);
	    }
	  }, {
	    key: "unHighlight",
	    value: function unHighlight(simplifiedCSTNode) {
	      this.actions.unHighlight(simplifiedCSTNode);
	      this.exampleView.unHighlight(simplifiedCSTNode);
	      this.treeView.unHighlight(simplifiedCSTNode);
	    }
	  }]);
	
	  return ThirdEyeExampleVisualization;
	}();
	
	var toExport = {
	  ThirdEyeExampleVisualization: ThirdEyeExampleVisualization
	};
	
	if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
	  module.exports = toExport;
	} else {
	  Object.assign(window, toExport);
	}

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * jQuery JavaScript Library v2.2.1
	 * http://jquery.com/
	 *
	 * Includes Sizzle.js
	 * http://sizzlejs.com/
	 *
	 * Copyright jQuery Foundation and other contributors
	 * Released under the MIT license
	 * http://jquery.org/license
	 *
	 * Date: 2016-02-22T19:11Z
	 */
	
	(function( global, factory ) {
	
		if ( typeof module === "object" && typeof module.exports === "object" ) {
			// For CommonJS and CommonJS-like environments where a proper `window`
			// is present, execute the factory and get jQuery.
			// For environments that do not have a `window` with a `document`
			// (such as Node.js), expose a factory as module.exports.
			// This accentuates the need for the creation of a real `window`.
			// e.g. var jQuery = require("jquery")(window);
			// See ticket #14549 for more info.
			module.exports = global.document ?
				factory( global, true ) :
				function( w ) {
					if ( !w.document ) {
						throw new Error( "jQuery requires a window with a document" );
					}
					return factory( w );
				};
		} else {
			factory( global );
		}
	
	// Pass this if window is not defined yet
	}(typeof window !== "undefined" ? window : this, function( window, noGlobal ) {
	
	// Support: Firefox 18+
	// Can't be in strict mode, several libs including ASP.NET trace
	// the stack via arguments.caller.callee and Firefox dies if
	// you try to trace through "use strict" call chains. (#13335)
	//"use strict";
	var arr = [];
	
	var document = window.document;
	
	var slice = arr.slice;
	
	var concat = arr.concat;
	
	var push = arr.push;
	
	var indexOf = arr.indexOf;
	
	var class2type = {};
	
	var toString = class2type.toString;
	
	var hasOwn = class2type.hasOwnProperty;
	
	var support = {};
	
	
	
	var
		version = "2.2.1",
	
		// Define a local copy of jQuery
		jQuery = function( selector, context ) {
	
			// The jQuery object is actually just the init constructor 'enhanced'
			// Need init if jQuery is called (just allow error to be thrown if not included)
			return new jQuery.fn.init( selector, context );
		},
	
		// Support: Android<4.1
		// Make sure we trim BOM and NBSP
		rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
	
		// Matches dashed string for camelizing
		rmsPrefix = /^-ms-/,
		rdashAlpha = /-([\da-z])/gi,
	
		// Used by jQuery.camelCase as callback to replace()
		fcamelCase = function( all, letter ) {
			return letter.toUpperCase();
		};
	
	jQuery.fn = jQuery.prototype = {
	
		// The current version of jQuery being used
		jquery: version,
	
		constructor: jQuery,
	
		// Start with an empty selector
		selector: "",
	
		// The default length of a jQuery object is 0
		length: 0,
	
		toArray: function() {
			return slice.call( this );
		},
	
		// Get the Nth element in the matched element set OR
		// Get the whole matched element set as a clean array
		get: function( num ) {
			return num != null ?
	
				// Return just the one element from the set
				( num < 0 ? this[ num + this.length ] : this[ num ] ) :
	
				// Return all the elements in a clean array
				slice.call( this );
		},
	
		// Take an array of elements and push it onto the stack
		// (returning the new matched element set)
		pushStack: function( elems ) {
	
			// Build a new jQuery matched element set
			var ret = jQuery.merge( this.constructor(), elems );
	
			// Add the old object onto the stack (as a reference)
			ret.prevObject = this;
			ret.context = this.context;
	
			// Return the newly-formed element set
			return ret;
		},
	
		// Execute a callback for every element in the matched set.
		each: function( callback ) {
			return jQuery.each( this, callback );
		},
	
		map: function( callback ) {
			return this.pushStack( jQuery.map( this, function( elem, i ) {
				return callback.call( elem, i, elem );
			} ) );
		},
	
		slice: function() {
			return this.pushStack( slice.apply( this, arguments ) );
		},
	
		first: function() {
			return this.eq( 0 );
		},
	
		last: function() {
			return this.eq( -1 );
		},
	
		eq: function( i ) {
			var len = this.length,
				j = +i + ( i < 0 ? len : 0 );
			return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
		},
	
		end: function() {
			return this.prevObject || this.constructor();
		},
	
		// For internal use only.
		// Behaves like an Array's method, not like a jQuery method.
		push: push,
		sort: arr.sort,
		splice: arr.splice
	};
	
	jQuery.extend = jQuery.fn.extend = function() {
		var options, name, src, copy, copyIsArray, clone,
			target = arguments[ 0 ] || {},
			i = 1,
			length = arguments.length,
			deep = false;
	
		// Handle a deep copy situation
		if ( typeof target === "boolean" ) {
			deep = target;
	
			// Skip the boolean and the target
			target = arguments[ i ] || {};
			i++;
		}
	
		// Handle case when target is a string or something (possible in deep copy)
		if ( typeof target !== "object" && !jQuery.isFunction( target ) ) {
			target = {};
		}
	
		// Extend jQuery itself if only one argument is passed
		if ( i === length ) {
			target = this;
			i--;
		}
	
		for ( ; i < length; i++ ) {
	
			// Only deal with non-null/undefined values
			if ( ( options = arguments[ i ] ) != null ) {
	
				// Extend the base object
				for ( name in options ) {
					src = target[ name ];
					copy = options[ name ];
	
					// Prevent never-ending loop
					if ( target === copy ) {
						continue;
					}
	
					// Recurse if we're merging plain objects or arrays
					if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
						( copyIsArray = jQuery.isArray( copy ) ) ) ) {
	
						if ( copyIsArray ) {
							copyIsArray = false;
							clone = src && jQuery.isArray( src ) ? src : [];
	
						} else {
							clone = src && jQuery.isPlainObject( src ) ? src : {};
						}
	
						// Never move original objects, clone them
						target[ name ] = jQuery.extend( deep, clone, copy );
	
					// Don't bring in undefined values
					} else if ( copy !== undefined ) {
						target[ name ] = copy;
					}
				}
			}
		}
	
		// Return the modified object
		return target;
	};
	
	jQuery.extend( {
	
		// Unique for each copy of jQuery on the page
		expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),
	
		// Assume jQuery is ready without the ready module
		isReady: true,
	
		error: function( msg ) {
			throw new Error( msg );
		},
	
		noop: function() {},
	
		isFunction: function( obj ) {
			return jQuery.type( obj ) === "function";
		},
	
		isArray: Array.isArray,
	
		isWindow: function( obj ) {
			return obj != null && obj === obj.window;
		},
	
		isNumeric: function( obj ) {
	
			// parseFloat NaNs numeric-cast false positives (null|true|false|"")
			// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
			// subtraction forces infinities to NaN
			// adding 1 corrects loss of precision from parseFloat (#15100)
			var realStringObj = obj && obj.toString();
			return !jQuery.isArray( obj ) && ( realStringObj - parseFloat( realStringObj ) + 1 ) >= 0;
		},
	
		isPlainObject: function( obj ) {
	
			// Not plain objects:
			// - Any object or value whose internal [[Class]] property is not "[object Object]"
			// - DOM nodes
			// - window
			if ( jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
				return false;
			}
	
			if ( obj.constructor &&
					!hasOwn.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
				return false;
			}
	
			// If the function hasn't returned already, we're confident that
			// |obj| is a plain object, created by {} or constructed with new Object
			return true;
		},
	
		isEmptyObject: function( obj ) {
			var name;
			for ( name in obj ) {
				return false;
			}
			return true;
		},
	
		type: function( obj ) {
			if ( obj == null ) {
				return obj + "";
			}
	
			// Support: Android<4.0, iOS<6 (functionish RegExp)
			return typeof obj === "object" || typeof obj === "function" ?
				class2type[ toString.call( obj ) ] || "object" :
				typeof obj;
		},
	
		// Evaluates a script in a global context
		globalEval: function( code ) {
			var script,
				indirect = eval;
	
			code = jQuery.trim( code );
	
			if ( code ) {
	
				// If the code includes a valid, prologue position
				// strict mode pragma, execute code by injecting a
				// script tag into the document.
				if ( code.indexOf( "use strict" ) === 1 ) {
					script = document.createElement( "script" );
					script.text = code;
					document.head.appendChild( script ).parentNode.removeChild( script );
				} else {
	
					// Otherwise, avoid the DOM node creation, insertion
					// and removal by using an indirect global eval
	
					indirect( code );
				}
			}
		},
	
		// Convert dashed to camelCase; used by the css and data modules
		// Support: IE9-11+
		// Microsoft forgot to hump their vendor prefix (#9572)
		camelCase: function( string ) {
			return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
		},
	
		nodeName: function( elem, name ) {
			return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
		},
	
		each: function( obj, callback ) {
			var length, i = 0;
	
			if ( isArrayLike( obj ) ) {
				length = obj.length;
				for ( ; i < length; i++ ) {
					if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
						break;
					}
				}
			}
	
			return obj;
		},
	
		// Support: Android<4.1
		trim: function( text ) {
			return text == null ?
				"" :
				( text + "" ).replace( rtrim, "" );
		},
	
		// results is for internal usage only
		makeArray: function( arr, results ) {
			var ret = results || [];
	
			if ( arr != null ) {
				if ( isArrayLike( Object( arr ) ) ) {
					jQuery.merge( ret,
						typeof arr === "string" ?
						[ arr ] : arr
					);
				} else {
					push.call( ret, arr );
				}
			}
	
			return ret;
		},
	
		inArray: function( elem, arr, i ) {
			return arr == null ? -1 : indexOf.call( arr, elem, i );
		},
	
		merge: function( first, second ) {
			var len = +second.length,
				j = 0,
				i = first.length;
	
			for ( ; j < len; j++ ) {
				first[ i++ ] = second[ j ];
			}
	
			first.length = i;
	
			return first;
		},
	
		grep: function( elems, callback, invert ) {
			var callbackInverse,
				matches = [],
				i = 0,
				length = elems.length,
				callbackExpect = !invert;
	
			// Go through the array, only saving the items
			// that pass the validator function
			for ( ; i < length; i++ ) {
				callbackInverse = !callback( elems[ i ], i );
				if ( callbackInverse !== callbackExpect ) {
					matches.push( elems[ i ] );
				}
			}
	
			return matches;
		},
	
		// arg is for internal usage only
		map: function( elems, callback, arg ) {
			var length, value,
				i = 0,
				ret = [];
	
			// Go through the array, translating each of the items to their new values
			if ( isArrayLike( elems ) ) {
				length = elems.length;
				for ( ; i < length; i++ ) {
					value = callback( elems[ i ], i, arg );
	
					if ( value != null ) {
						ret.push( value );
					}
				}
	
			// Go through every key on the object,
			} else {
				for ( i in elems ) {
					value = callback( elems[ i ], i, arg );
	
					if ( value != null ) {
						ret.push( value );
					}
				}
			}
	
			// Flatten any nested arrays
			return concat.apply( [], ret );
		},
	
		// A global GUID counter for objects
		guid: 1,
	
		// Bind a function to a context, optionally partially applying any
		// arguments.
		proxy: function( fn, context ) {
			var tmp, args, proxy;
	
			if ( typeof context === "string" ) {
				tmp = fn[ context ];
				context = fn;
				fn = tmp;
			}
	
			// Quick check to determine if target is callable, in the spec
			// this throws a TypeError, but we will just return undefined.
			if ( !jQuery.isFunction( fn ) ) {
				return undefined;
			}
	
			// Simulated bind
			args = slice.call( arguments, 2 );
			proxy = function() {
				return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
			};
	
			// Set the guid of unique handler to the same of original handler, so it can be removed
			proxy.guid = fn.guid = fn.guid || jQuery.guid++;
	
			return proxy;
		},
	
		now: Date.now,
	
		// jQuery.support is not used in Core but other projects attach their
		// properties to it so it needs to exist.
		support: support
	} );
	
	// JSHint would error on this code due to the Symbol not being defined in ES5.
	// Defining this global in .jshintrc would create a danger of using the global
	// unguarded in another place, it seems safer to just disable JSHint for these
	// three lines.
	/* jshint ignore: start */
	if ( typeof Symbol === "function" ) {
		jQuery.fn[ Symbol.iterator ] = arr[ Symbol.iterator ];
	}
	/* jshint ignore: end */
	
	// Populate the class2type map
	jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
	function( i, name ) {
		class2type[ "[object " + name + "]" ] = name.toLowerCase();
	} );
	
	function isArrayLike( obj ) {
	
		// Support: iOS 8.2 (not reproducible in simulator)
		// `in` check used to prevent JIT error (gh-2145)
		// hasOwn isn't used here due to false negatives
		// regarding Nodelist length in IE
		var length = !!obj && "length" in obj && obj.length,
			type = jQuery.type( obj );
	
		if ( type === "function" || jQuery.isWindow( obj ) ) {
			return false;
		}
	
		return type === "array" || length === 0 ||
			typeof length === "number" && length > 0 && ( length - 1 ) in obj;
	}
	var Sizzle =
	/*!
	 * Sizzle CSS Selector Engine v2.2.1
	 * http://sizzlejs.com/
	 *
	 * Copyright jQuery Foundation and other contributors
	 * Released under the MIT license
	 * http://jquery.org/license
	 *
	 * Date: 2015-10-17
	 */
	(function( window ) {
	
	var i,
		support,
		Expr,
		getText,
		isXML,
		tokenize,
		compile,
		select,
		outermostContext,
		sortInput,
		hasDuplicate,
	
		// Local document vars
		setDocument,
		document,
		docElem,
		documentIsHTML,
		rbuggyQSA,
		rbuggyMatches,
		matches,
		contains,
	
		// Instance-specific data
		expando = "sizzle" + 1 * new Date(),
		preferredDoc = window.document,
		dirruns = 0,
		done = 0,
		classCache = createCache(),
		tokenCache = createCache(),
		compilerCache = createCache(),
		sortOrder = function( a, b ) {
			if ( a === b ) {
				hasDuplicate = true;
			}
			return 0;
		},
	
		// General-purpose constants
		MAX_NEGATIVE = 1 << 31,
	
		// Instance methods
		hasOwn = ({}).hasOwnProperty,
		arr = [],
		pop = arr.pop,
		push_native = arr.push,
		push = arr.push,
		slice = arr.slice,
		// Use a stripped-down indexOf as it's faster than native
		// http://jsperf.com/thor-indexof-vs-for/5
		indexOf = function( list, elem ) {
			var i = 0,
				len = list.length;
			for ( ; i < len; i++ ) {
				if ( list[i] === elem ) {
					return i;
				}
			}
			return -1;
		},
	
		booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",
	
		// Regular expressions
	
		// http://www.w3.org/TR/css3-selectors/#whitespace
		whitespace = "[\\x20\\t\\r\\n\\f]",
	
		// http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
		identifier = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",
	
		// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
		attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +
			// Operator (capture 2)
			"*([*^$|!~]?=)" + whitespace +
			// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
			"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
			"*\\]",
	
		pseudos = ":(" + identifier + ")(?:\\((" +
			// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
			// 1. quoted (capture 3; capture 4 or capture 5)
			"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
			// 2. simple (capture 6)
			"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
			// 3. anything else (capture 2)
			".*" +
			")\\)|)",
	
		// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
		rwhitespace = new RegExp( whitespace + "+", "g" ),
		rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),
	
		rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
		rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),
	
		rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),
	
		rpseudo = new RegExp( pseudos ),
		ridentifier = new RegExp( "^" + identifier + "$" ),
	
		matchExpr = {
			"ID": new RegExp( "^#(" + identifier + ")" ),
			"CLASS": new RegExp( "^\\.(" + identifier + ")" ),
			"TAG": new RegExp( "^(" + identifier + "|[*])" ),
			"ATTR": new RegExp( "^" + attributes ),
			"PSEUDO": new RegExp( "^" + pseudos ),
			"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
				"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
				"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
			"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
			// For use in libraries implementing .is()
			// We use this for POS matching in `select`
			"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
				whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
		},
	
		rinputs = /^(?:input|select|textarea|button)$/i,
		rheader = /^h\d$/i,
	
		rnative = /^[^{]+\{\s*\[native \w/,
	
		// Easily-parseable/retrievable ID or TAG or CLASS selectors
		rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
	
		rsibling = /[+~]/,
		rescape = /'|\\/g,
	
		// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
		runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
		funescape = function( _, escaped, escapedWhitespace ) {
			var high = "0x" + escaped - 0x10000;
			// NaN means non-codepoint
			// Support: Firefox<24
			// Workaround erroneous numeric interpretation of +"0x"
			return high !== high || escapedWhitespace ?
				escaped :
				high < 0 ?
					// BMP codepoint
					String.fromCharCode( high + 0x10000 ) :
					// Supplemental Plane codepoint (surrogate pair)
					String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
		},
	
		// Used for iframes
		// See setDocument()
		// Removing the function wrapper causes a "Permission Denied"
		// error in IE
		unloadHandler = function() {
			setDocument();
		};
	
	// Optimize for push.apply( _, NodeList )
	try {
		push.apply(
			(arr = slice.call( preferredDoc.childNodes )),
			preferredDoc.childNodes
		);
		// Support: Android<4.0
		// Detect silently failing push.apply
		arr[ preferredDoc.childNodes.length ].nodeType;
	} catch ( e ) {
		push = { apply: arr.length ?
	
			// Leverage slice if possible
			function( target, els ) {
				push_native.apply( target, slice.call(els) );
			} :
	
			// Support: IE<9
			// Otherwise append directly
			function( target, els ) {
				var j = target.length,
					i = 0;
				// Can't trust NodeList.length
				while ( (target[j++] = els[i++]) ) {}
				target.length = j - 1;
			}
		};
	}
	
	function Sizzle( selector, context, results, seed ) {
		var m, i, elem, nid, nidselect, match, groups, newSelector,
			newContext = context && context.ownerDocument,
	
			// nodeType defaults to 9, since context defaults to document
			nodeType = context ? context.nodeType : 9;
	
		results = results || [];
	
		// Return early from calls with invalid selector or context
		if ( typeof selector !== "string" || !selector ||
			nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {
	
			return results;
		}
	
		// Try to shortcut find operations (as opposed to filters) in HTML documents
		if ( !seed ) {
	
			if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
				setDocument( context );
			}
			context = context || document;
	
			if ( documentIsHTML ) {
	
				// If the selector is sufficiently simple, try using a "get*By*" DOM method
				// (excepting DocumentFragment context, where the methods don't exist)
				if ( nodeType !== 11 && (match = rquickExpr.exec( selector )) ) {
	
					// ID selector
					if ( (m = match[1]) ) {
	
						// Document context
						if ( nodeType === 9 ) {
							if ( (elem = context.getElementById( m )) ) {
	
								// Support: IE, Opera, Webkit
								// TODO: identify versions
								// getElementById can match elements by name instead of ID
								if ( elem.id === m ) {
									results.push( elem );
									return results;
								}
							} else {
								return results;
							}
	
						// Element context
						} else {
	
							// Support: IE, Opera, Webkit
							// TODO: identify versions
							// getElementById can match elements by name instead of ID
							if ( newContext && (elem = newContext.getElementById( m )) &&
								contains( context, elem ) &&
								elem.id === m ) {
	
								results.push( elem );
								return results;
							}
						}
	
					// Type selector
					} else if ( match[2] ) {
						push.apply( results, context.getElementsByTagName( selector ) );
						return results;
	
					// Class selector
					} else if ( (m = match[3]) && support.getElementsByClassName &&
						context.getElementsByClassName ) {
	
						push.apply( results, context.getElementsByClassName( m ) );
						return results;
					}
				}
	
				// Take advantage of querySelectorAll
				if ( support.qsa &&
					!compilerCache[ selector + " " ] &&
					(!rbuggyQSA || !rbuggyQSA.test( selector )) ) {
	
					if ( nodeType !== 1 ) {
						newContext = context;
						newSelector = selector;
	
					// qSA looks outside Element context, which is not what we want
					// Thanks to Andrew Dupont for this workaround technique
					// Support: IE <=8
					// Exclude object elements
					} else if ( context.nodeName.toLowerCase() !== "object" ) {
	
						// Capture the context ID, setting it first if necessary
						if ( (nid = context.getAttribute( "id" )) ) {
							nid = nid.replace( rescape, "\\$&" );
						} else {
							context.setAttribute( "id", (nid = expando) );
						}
	
						// Prefix every selector in the list
						groups = tokenize( selector );
						i = groups.length;
						nidselect = ridentifier.test( nid ) ? "#" + nid : "[id='" + nid + "']";
						while ( i-- ) {
							groups[i] = nidselect + " " + toSelector( groups[i] );
						}
						newSelector = groups.join( "," );
	
						// Expand context for sibling selectors
						newContext = rsibling.test( selector ) && testContext( context.parentNode ) ||
							context;
					}
	
					if ( newSelector ) {
						try {
							push.apply( results,
								newContext.querySelectorAll( newSelector )
							);
							return results;
						} catch ( qsaError ) {
						} finally {
							if ( nid === expando ) {
								context.removeAttribute( "id" );
							}
						}
					}
				}
			}
		}
	
		// All others
		return select( selector.replace( rtrim, "$1" ), context, results, seed );
	}
	
	/**
	 * Create key-value caches of limited size
	 * @returns {function(string, object)} Returns the Object data after storing it on itself with
	 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
	 *	deleting the oldest entry
	 */
	function createCache() {
		var keys = [];
	
		function cache( key, value ) {
			// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
			if ( keys.push( key + " " ) > Expr.cacheLength ) {
				// Only keep the most recent entries
				delete cache[ keys.shift() ];
			}
			return (cache[ key + " " ] = value);
		}
		return cache;
	}
	
	/**
	 * Mark a function for special use by Sizzle
	 * @param {Function} fn The function to mark
	 */
	function markFunction( fn ) {
		fn[ expando ] = true;
		return fn;
	}
	
	/**
	 * Support testing using an element
	 * @param {Function} fn Passed the created div and expects a boolean result
	 */
	function assert( fn ) {
		var div = document.createElement("div");
	
		try {
			return !!fn( div );
		} catch (e) {
			return false;
		} finally {
			// Remove from its parent by default
			if ( div.parentNode ) {
				div.parentNode.removeChild( div );
			}
			// release memory in IE
			div = null;
		}
	}
	
	/**
	 * Adds the same handler for all of the specified attrs
	 * @param {String} attrs Pipe-separated list of attributes
	 * @param {Function} handler The method that will be applied
	 */
	function addHandle( attrs, handler ) {
		var arr = attrs.split("|"),
			i = arr.length;
	
		while ( i-- ) {
			Expr.attrHandle[ arr[i] ] = handler;
		}
	}
	
	/**
	 * Checks document order of two siblings
	 * @param {Element} a
	 * @param {Element} b
	 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
	 */
	function siblingCheck( a, b ) {
		var cur = b && a,
			diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
				( ~b.sourceIndex || MAX_NEGATIVE ) -
				( ~a.sourceIndex || MAX_NEGATIVE );
	
		// Use IE sourceIndex if available on both nodes
		if ( diff ) {
			return diff;
		}
	
		// Check if b follows a
		if ( cur ) {
			while ( (cur = cur.nextSibling) ) {
				if ( cur === b ) {
					return -1;
				}
			}
		}
	
		return a ? 1 : -1;
	}
	
	/**
	 * Returns a function to use in pseudos for input types
	 * @param {String} type
	 */
	function createInputPseudo( type ) {
		return function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === type;
		};
	}
	
	/**
	 * Returns a function to use in pseudos for buttons
	 * @param {String} type
	 */
	function createButtonPseudo( type ) {
		return function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && elem.type === type;
		};
	}
	
	/**
	 * Returns a function to use in pseudos for positionals
	 * @param {Function} fn
	 */
	function createPositionalPseudo( fn ) {
		return markFunction(function( argument ) {
			argument = +argument;
			return markFunction(function( seed, matches ) {
				var j,
					matchIndexes = fn( [], seed.length, argument ),
					i = matchIndexes.length;
	
				// Match elements found at the specified indexes
				while ( i-- ) {
					if ( seed[ (j = matchIndexes[i]) ] ) {
						seed[j] = !(matches[j] = seed[j]);
					}
				}
			});
		});
	}
	
	/**
	 * Checks a node for validity as a Sizzle context
	 * @param {Element|Object=} context
	 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
	 */
	function testContext( context ) {
		return context && typeof context.getElementsByTagName !== "undefined" && context;
	}
	
	// Expose support vars for convenience
	support = Sizzle.support = {};
	
	/**
	 * Detects XML nodes
	 * @param {Element|Object} elem An element or a document
	 * @returns {Boolean} True iff elem is a non-HTML XML node
	 */
	isXML = Sizzle.isXML = function( elem ) {
		// documentElement is verified for cases where it doesn't yet exist
		// (such as loading iframes in IE - #4833)
		var documentElement = elem && (elem.ownerDocument || elem).documentElement;
		return documentElement ? documentElement.nodeName !== "HTML" : false;
	};
	
	/**
	 * Sets document-related variables once based on the current document
	 * @param {Element|Object} [doc] An element or document object to use to set the document
	 * @returns {Object} Returns the current document
	 */
	setDocument = Sizzle.setDocument = function( node ) {
		var hasCompare, parent,
			doc = node ? node.ownerDocument || node : preferredDoc;
	
		// Return early if doc is invalid or already selected
		if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
			return document;
		}
	
		// Update global variables
		document = doc;
		docElem = document.documentElement;
		documentIsHTML = !isXML( document );
	
		// Support: IE 9-11, Edge
		// Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
		if ( (parent = document.defaultView) && parent.top !== parent ) {
			// Support: IE 11
			if ( parent.addEventListener ) {
				parent.addEventListener( "unload", unloadHandler, false );
	
			// Support: IE 9 - 10 only
			} else if ( parent.attachEvent ) {
				parent.attachEvent( "onunload", unloadHandler );
			}
		}
	
		/* Attributes
		---------------------------------------------------------------------- */
	
		// Support: IE<8
		// Verify that getAttribute really returns attributes and not properties
		// (excepting IE8 booleans)
		support.attributes = assert(function( div ) {
			div.className = "i";
			return !div.getAttribute("className");
		});
	
		/* getElement(s)By*
		---------------------------------------------------------------------- */
	
		// Check if getElementsByTagName("*") returns only elements
		support.getElementsByTagName = assert(function( div ) {
			div.appendChild( document.createComment("") );
			return !div.getElementsByTagName("*").length;
		});
	
		// Support: IE<9
		support.getElementsByClassName = rnative.test( document.getElementsByClassName );
	
		// Support: IE<10
		// Check if getElementById returns elements by name
		// The broken getElementById methods don't pick up programatically-set names,
		// so use a roundabout getElementsByName test
		support.getById = assert(function( div ) {
			docElem.appendChild( div ).id = expando;
			return !document.getElementsByName || !document.getElementsByName( expando ).length;
		});
	
		// ID find and filter
		if ( support.getById ) {
			Expr.find["ID"] = function( id, context ) {
				if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
					var m = context.getElementById( id );
					return m ? [ m ] : [];
				}
			};
			Expr.filter["ID"] = function( id ) {
				var attrId = id.replace( runescape, funescape );
				return function( elem ) {
					return elem.getAttribute("id") === attrId;
				};
			};
		} else {
			// Support: IE6/7
			// getElementById is not reliable as a find shortcut
			delete Expr.find["ID"];
	
			Expr.filter["ID"] =  function( id ) {
				var attrId = id.replace( runescape, funescape );
				return function( elem ) {
					var node = typeof elem.getAttributeNode !== "undefined" &&
						elem.getAttributeNode("id");
					return node && node.value === attrId;
				};
			};
		}
	
		// Tag
		Expr.find["TAG"] = support.getElementsByTagName ?
			function( tag, context ) {
				if ( typeof context.getElementsByTagName !== "undefined" ) {
					return context.getElementsByTagName( tag );
	
				// DocumentFragment nodes don't have gEBTN
				} else if ( support.qsa ) {
					return context.querySelectorAll( tag );
				}
			} :
	
			function( tag, context ) {
				var elem,
					tmp = [],
					i = 0,
					// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
					results = context.getElementsByTagName( tag );
	
				// Filter out possible comments
				if ( tag === "*" ) {
					while ( (elem = results[i++]) ) {
						if ( elem.nodeType === 1 ) {
							tmp.push( elem );
						}
					}
	
					return tmp;
				}
				return results;
			};
	
		// Class
		Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
			if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
				return context.getElementsByClassName( className );
			}
		};
	
		/* QSA/matchesSelector
		---------------------------------------------------------------------- */
	
		// QSA and matchesSelector support
	
		// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
		rbuggyMatches = [];
	
		// qSa(:focus) reports false when true (Chrome 21)
		// We allow this because of a bug in IE8/9 that throws an error
		// whenever `document.activeElement` is accessed on an iframe
		// So, we allow :focus to pass through QSA all the time to avoid the IE error
		// See http://bugs.jquery.com/ticket/13378
		rbuggyQSA = [];
	
		if ( (support.qsa = rnative.test( document.querySelectorAll )) ) {
			// Build QSA regex
			// Regex strategy adopted from Diego Perini
			assert(function( div ) {
				// Select is set to empty string on purpose
				// This is to test IE's treatment of not explicitly
				// setting a boolean content attribute,
				// since its presence should be enough
				// http://bugs.jquery.com/ticket/12359
				docElem.appendChild( div ).innerHTML = "<a id='" + expando + "'></a>" +
					"<select id='" + expando + "-\r\\' msallowcapture=''>" +
					"<option selected=''></option></select>";
	
				// Support: IE8, Opera 11-12.16
				// Nothing should be selected when empty strings follow ^= or $= or *=
				// The test attribute must be unknown in Opera but "safe" for WinRT
				// http://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
				if ( div.querySelectorAll("[msallowcapture^='']").length ) {
					rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
				}
	
				// Support: IE8
				// Boolean attributes and "value" are not treated correctly
				if ( !div.querySelectorAll("[selected]").length ) {
					rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
				}
	
				// Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
				if ( !div.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
					rbuggyQSA.push("~=");
				}
	
				// Webkit/Opera - :checked should return selected option elements
				// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
				// IE8 throws error here and will not see later tests
				if ( !div.querySelectorAll(":checked").length ) {
					rbuggyQSA.push(":checked");
				}
	
				// Support: Safari 8+, iOS 8+
				// https://bugs.webkit.org/show_bug.cgi?id=136851
				// In-page `selector#id sibing-combinator selector` fails
				if ( !div.querySelectorAll( "a#" + expando + "+*" ).length ) {
					rbuggyQSA.push(".#.+[+~]");
				}
			});
	
			assert(function( div ) {
				// Support: Windows 8 Native Apps
				// The type and name attributes are restricted during .innerHTML assignment
				var input = document.createElement("input");
				input.setAttribute( "type", "hidden" );
				div.appendChild( input ).setAttribute( "name", "D" );
	
				// Support: IE8
				// Enforce case-sensitivity of name attribute
				if ( div.querySelectorAll("[name=d]").length ) {
					rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
				}
	
				// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
				// IE8 throws error here and will not see later tests
				if ( !div.querySelectorAll(":enabled").length ) {
					rbuggyQSA.push( ":enabled", ":disabled" );
				}
	
				// Opera 10-11 does not throw on post-comma invalid pseudos
				div.querySelectorAll("*,:x");
				rbuggyQSA.push(",.*:");
			});
		}
	
		if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
			docElem.webkitMatchesSelector ||
			docElem.mozMatchesSelector ||
			docElem.oMatchesSelector ||
			docElem.msMatchesSelector) )) ) {
	
			assert(function( div ) {
				// Check to see if it's possible to do matchesSelector
				// on a disconnected node (IE 9)
				support.disconnectedMatch = matches.call( div, "div" );
	
				// This should fail with an exception
				// Gecko does not error, returns false instead
				matches.call( div, "[s!='']:x" );
				rbuggyMatches.push( "!=", pseudos );
			});
		}
	
		rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
		rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );
	
		/* Contains
		---------------------------------------------------------------------- */
		hasCompare = rnative.test( docElem.compareDocumentPosition );
	
		// Element contains another
		// Purposefully self-exclusive
		// As in, an element does not contain itself
		contains = hasCompare || rnative.test( docElem.contains ) ?
			function( a, b ) {
				var adown = a.nodeType === 9 ? a.documentElement : a,
					bup = b && b.parentNode;
				return a === bup || !!( bup && bup.nodeType === 1 && (
					adown.contains ?
						adown.contains( bup ) :
						a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
				));
			} :
			function( a, b ) {
				if ( b ) {
					while ( (b = b.parentNode) ) {
						if ( b === a ) {
							return true;
						}
					}
				}
				return false;
			};
	
		/* Sorting
		---------------------------------------------------------------------- */
	
		// Document order sorting
		sortOrder = hasCompare ?
		function( a, b ) {
	
			// Flag for duplicate removal
			if ( a === b ) {
				hasDuplicate = true;
				return 0;
			}
	
			// Sort on method existence if only one input has compareDocumentPosition
			var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
			if ( compare ) {
				return compare;
			}
	
			// Calculate position if both inputs belong to the same document
			compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
				a.compareDocumentPosition( b ) :
	
				// Otherwise we know they are disconnected
				1;
	
			// Disconnected nodes
			if ( compare & 1 ||
				(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {
	
				// Choose the first element that is related to our preferred document
				if ( a === document || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
					return -1;
				}
				if ( b === document || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
					return 1;
				}
	
				// Maintain original order
				return sortInput ?
					( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
					0;
			}
	
			return compare & 4 ? -1 : 1;
		} :
		function( a, b ) {
			// Exit early if the nodes are identical
			if ( a === b ) {
				hasDuplicate = true;
				return 0;
			}
	
			var cur,
				i = 0,
				aup = a.parentNode,
				bup = b.parentNode,
				ap = [ a ],
				bp = [ b ];
	
			// Parentless nodes are either documents or disconnected
			if ( !aup || !bup ) {
				return a === document ? -1 :
					b === document ? 1 :
					aup ? -1 :
					bup ? 1 :
					sortInput ?
					( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
					0;
	
			// If the nodes are siblings, we can do a quick check
			} else if ( aup === bup ) {
				return siblingCheck( a, b );
			}
	
			// Otherwise we need full lists of their ancestors for comparison
			cur = a;
			while ( (cur = cur.parentNode) ) {
				ap.unshift( cur );
			}
			cur = b;
			while ( (cur = cur.parentNode) ) {
				bp.unshift( cur );
			}
	
			// Walk down the tree looking for a discrepancy
			while ( ap[i] === bp[i] ) {
				i++;
			}
	
			return i ?
				// Do a sibling check if the nodes have a common ancestor
				siblingCheck( ap[i], bp[i] ) :
	
				// Otherwise nodes in our document sort first
				ap[i] === preferredDoc ? -1 :
				bp[i] === preferredDoc ? 1 :
				0;
		};
	
		return document;
	};
	
	Sizzle.matches = function( expr, elements ) {
		return Sizzle( expr, null, null, elements );
	};
	
	Sizzle.matchesSelector = function( elem, expr ) {
		// Set document vars if needed
		if ( ( elem.ownerDocument || elem ) !== document ) {
			setDocument( elem );
		}
	
		// Make sure that attribute selectors are quoted
		expr = expr.replace( rattributeQuotes, "='$1']" );
	
		if ( support.matchesSelector && documentIsHTML &&
			!compilerCache[ expr + " " ] &&
			( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
			( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {
	
			try {
				var ret = matches.call( elem, expr );
	
				// IE 9's matchesSelector returns false on disconnected nodes
				if ( ret || support.disconnectedMatch ||
						// As well, disconnected nodes are said to be in a document
						// fragment in IE 9
						elem.document && elem.document.nodeType !== 11 ) {
					return ret;
				}
			} catch (e) {}
		}
	
		return Sizzle( expr, document, null, [ elem ] ).length > 0;
	};
	
	Sizzle.contains = function( context, elem ) {
		// Set document vars if needed
		if ( ( context.ownerDocument || context ) !== document ) {
			setDocument( context );
		}
		return contains( context, elem );
	};
	
	Sizzle.attr = function( elem, name ) {
		// Set document vars if needed
		if ( ( elem.ownerDocument || elem ) !== document ) {
			setDocument( elem );
		}
	
		var fn = Expr.attrHandle[ name.toLowerCase() ],
			// Don't get fooled by Object.prototype properties (jQuery #13807)
			val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
				fn( elem, name, !documentIsHTML ) :
				undefined;
	
		return val !== undefined ?
			val :
			support.attributes || !documentIsHTML ?
				elem.getAttribute( name ) :
				(val = elem.getAttributeNode(name)) && val.specified ?
					val.value :
					null;
	};
	
	Sizzle.error = function( msg ) {
		throw new Error( "Syntax error, unrecognized expression: " + msg );
	};
	
	/**
	 * Document sorting and removing duplicates
	 * @param {ArrayLike} results
	 */
	Sizzle.uniqueSort = function( results ) {
		var elem,
			duplicates = [],
			j = 0,
			i = 0;
	
		// Unless we *know* we can detect duplicates, assume their presence
		hasDuplicate = !support.detectDuplicates;
		sortInput = !support.sortStable && results.slice( 0 );
		results.sort( sortOrder );
	
		if ( hasDuplicate ) {
			while ( (elem = results[i++]) ) {
				if ( elem === results[ i ] ) {
					j = duplicates.push( i );
				}
			}
			while ( j-- ) {
				results.splice( duplicates[ j ], 1 );
			}
		}
	
		// Clear input after sorting to release objects
		// See https://github.com/jquery/sizzle/pull/225
		sortInput = null;
	
		return results;
	};
	
	/**
	 * Utility function for retrieving the text value of an array of DOM nodes
	 * @param {Array|Element} elem
	 */
	getText = Sizzle.getText = function( elem ) {
		var node,
			ret = "",
			i = 0,
			nodeType = elem.nodeType;
	
		if ( !nodeType ) {
			// If no nodeType, this is expected to be an array
			while ( (node = elem[i++]) ) {
				// Do not traverse comment nodes
				ret += getText( node );
			}
		} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
			// Use textContent for elements
			// innerText usage removed for consistency of new lines (jQuery #11153)
			if ( typeof elem.textContent === "string" ) {
				return elem.textContent;
			} else {
				// Traverse its children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
					ret += getText( elem );
				}
			}
		} else if ( nodeType === 3 || nodeType === 4 ) {
			return elem.nodeValue;
		}
		// Do not include comment or processing instruction nodes
	
		return ret;
	};
	
	Expr = Sizzle.selectors = {
	
		// Can be adjusted by the user
		cacheLength: 50,
	
		createPseudo: markFunction,
	
		match: matchExpr,
	
		attrHandle: {},
	
		find: {},
	
		relative: {
			">": { dir: "parentNode", first: true },
			" ": { dir: "parentNode" },
			"+": { dir: "previousSibling", first: true },
			"~": { dir: "previousSibling" }
		},
	
		preFilter: {
			"ATTR": function( match ) {
				match[1] = match[1].replace( runescape, funescape );
	
				// Move the given value to match[3] whether quoted or unquoted
				match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );
	
				if ( match[2] === "~=" ) {
					match[3] = " " + match[3] + " ";
				}
	
				return match.slice( 0, 4 );
			},
	
			"CHILD": function( match ) {
				/* matches from matchExpr["CHILD"]
					1 type (only|nth|...)
					2 what (child|of-type)
					3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
					4 xn-component of xn+y argument ([+-]?\d*n|)
					5 sign of xn-component
					6 x of xn-component
					7 sign of y-component
					8 y of y-component
				*/
				match[1] = match[1].toLowerCase();
	
				if ( match[1].slice( 0, 3 ) === "nth" ) {
					// nth-* requires argument
					if ( !match[3] ) {
						Sizzle.error( match[0] );
					}
	
					// numeric x and y parameters for Expr.filter.CHILD
					// remember that false/true cast respectively to 0/1
					match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
					match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );
	
				// other types prohibit arguments
				} else if ( match[3] ) {
					Sizzle.error( match[0] );
				}
	
				return match;
			},
	
			"PSEUDO": function( match ) {
				var excess,
					unquoted = !match[6] && match[2];
	
				if ( matchExpr["CHILD"].test( match[0] ) ) {
					return null;
				}
	
				// Accept quoted arguments as-is
				if ( match[3] ) {
					match[2] = match[4] || match[5] || "";
	
				// Strip excess characters from unquoted arguments
				} else if ( unquoted && rpseudo.test( unquoted ) &&
					// Get excess from tokenize (recursively)
					(excess = tokenize( unquoted, true )) &&
					// advance to the next closing parenthesis
					(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {
	
					// excess is a negative index
					match[0] = match[0].slice( 0, excess );
					match[2] = unquoted.slice( 0, excess );
				}
	
				// Return only captures needed by the pseudo filter method (type and argument)
				return match.slice( 0, 3 );
			}
		},
	
		filter: {
	
			"TAG": function( nodeNameSelector ) {
				var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
				return nodeNameSelector === "*" ?
					function() { return true; } :
					function( elem ) {
						return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
					};
			},
	
			"CLASS": function( className ) {
				var pattern = classCache[ className + " " ];
	
				return pattern ||
					(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
					classCache( className, function( elem ) {
						return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "" );
					});
			},
	
			"ATTR": function( name, operator, check ) {
				return function( elem ) {
					var result = Sizzle.attr( elem, name );
	
					if ( result == null ) {
						return operator === "!=";
					}
					if ( !operator ) {
						return true;
					}
	
					result += "";
	
					return operator === "=" ? result === check :
						operator === "!=" ? result !== check :
						operator === "^=" ? check && result.indexOf( check ) === 0 :
						operator === "*=" ? check && result.indexOf( check ) > -1 :
						operator === "$=" ? check && result.slice( -check.length ) === check :
						operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
						operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
						false;
				};
			},
	
			"CHILD": function( type, what, argument, first, last ) {
				var simple = type.slice( 0, 3 ) !== "nth",
					forward = type.slice( -4 ) !== "last",
					ofType = what === "of-type";
	
				return first === 1 && last === 0 ?
	
					// Shortcut for :nth-*(n)
					function( elem ) {
						return !!elem.parentNode;
					} :
	
					function( elem, context, xml ) {
						var cache, uniqueCache, outerCache, node, nodeIndex, start,
							dir = simple !== forward ? "nextSibling" : "previousSibling",
							parent = elem.parentNode,
							name = ofType && elem.nodeName.toLowerCase(),
							useCache = !xml && !ofType,
							diff = false;
	
						if ( parent ) {
	
							// :(first|last|only)-(child|of-type)
							if ( simple ) {
								while ( dir ) {
									node = elem;
									while ( (node = node[ dir ]) ) {
										if ( ofType ?
											node.nodeName.toLowerCase() === name :
											node.nodeType === 1 ) {
	
											return false;
										}
									}
									// Reverse direction for :only-* (if we haven't yet done so)
									start = dir = type === "only" && !start && "nextSibling";
								}
								return true;
							}
	
							start = [ forward ? parent.firstChild : parent.lastChild ];
	
							// non-xml :nth-child(...) stores cache data on `parent`
							if ( forward && useCache ) {
	
								// Seek `elem` from a previously-cached index
	
								// ...in a gzip-friendly way
								node = parent;
								outerCache = node[ expando ] || (node[ expando ] = {});
	
								// Support: IE <9 only
								// Defend against cloned attroperties (jQuery gh-1709)
								uniqueCache = outerCache[ node.uniqueID ] ||
									(outerCache[ node.uniqueID ] = {});
	
								cache = uniqueCache[ type ] || [];
								nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
								diff = nodeIndex && cache[ 2 ];
								node = nodeIndex && parent.childNodes[ nodeIndex ];
	
								while ( (node = ++nodeIndex && node && node[ dir ] ||
	
									// Fallback to seeking `elem` from the start
									(diff = nodeIndex = 0) || start.pop()) ) {
	
									// When found, cache indexes on `parent` and break
									if ( node.nodeType === 1 && ++diff && node === elem ) {
										uniqueCache[ type ] = [ dirruns, nodeIndex, diff ];
										break;
									}
								}
	
							} else {
								// Use previously-cached element index if available
								if ( useCache ) {
									// ...in a gzip-friendly way
									node = elem;
									outerCache = node[ expando ] || (node[ expando ] = {});
	
									// Support: IE <9 only
									// Defend against cloned attroperties (jQuery gh-1709)
									uniqueCache = outerCache[ node.uniqueID ] ||
										(outerCache[ node.uniqueID ] = {});
	
									cache = uniqueCache[ type ] || [];
									nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
									diff = nodeIndex;
								}
	
								// xml :nth-child(...)
								// or :nth-last-child(...) or :nth(-last)?-of-type(...)
								if ( diff === false ) {
									// Use the same loop as above to seek `elem` from the start
									while ( (node = ++nodeIndex && node && node[ dir ] ||
										(diff = nodeIndex = 0) || start.pop()) ) {
	
										if ( ( ofType ?
											node.nodeName.toLowerCase() === name :
											node.nodeType === 1 ) &&
											++diff ) {
	
											// Cache the index of each encountered element
											if ( useCache ) {
												outerCache = node[ expando ] || (node[ expando ] = {});
	
												// Support: IE <9 only
												// Defend against cloned attroperties (jQuery gh-1709)
												uniqueCache = outerCache[ node.uniqueID ] ||
													(outerCache[ node.uniqueID ] = {});
	
												uniqueCache[ type ] = [ dirruns, diff ];
											}
	
											if ( node === elem ) {
												break;
											}
										}
									}
								}
							}
	
							// Incorporate the offset, then check against cycle size
							diff -= last;
							return diff === first || ( diff % first === 0 && diff / first >= 0 );
						}
					};
			},
	
			"PSEUDO": function( pseudo, argument ) {
				// pseudo-class names are case-insensitive
				// http://www.w3.org/TR/selectors/#pseudo-classes
				// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
				// Remember that setFilters inherits from pseudos
				var args,
					fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
						Sizzle.error( "unsupported pseudo: " + pseudo );
	
				// The user may use createPseudo to indicate that
				// arguments are needed to create the filter function
				// just as Sizzle does
				if ( fn[ expando ] ) {
					return fn( argument );
				}
	
				// But maintain support for old signatures
				if ( fn.length > 1 ) {
					args = [ pseudo, pseudo, "", argument ];
					return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
						markFunction(function( seed, matches ) {
							var idx,
								matched = fn( seed, argument ),
								i = matched.length;
							while ( i-- ) {
								idx = indexOf( seed, matched[i] );
								seed[ idx ] = !( matches[ idx ] = matched[i] );
							}
						}) :
						function( elem ) {
							return fn( elem, 0, args );
						};
				}
	
				return fn;
			}
		},
	
		pseudos: {
			// Potentially complex pseudos
			"not": markFunction(function( selector ) {
				// Trim the selector passed to compile
				// to avoid treating leading and trailing
				// spaces as combinators
				var input = [],
					results = [],
					matcher = compile( selector.replace( rtrim, "$1" ) );
	
				return matcher[ expando ] ?
					markFunction(function( seed, matches, context, xml ) {
						var elem,
							unmatched = matcher( seed, null, xml, [] ),
							i = seed.length;
	
						// Match elements unmatched by `matcher`
						while ( i-- ) {
							if ( (elem = unmatched[i]) ) {
								seed[i] = !(matches[i] = elem);
							}
						}
					}) :
					function( elem, context, xml ) {
						input[0] = elem;
						matcher( input, null, xml, results );
						// Don't keep the element (issue #299)
						input[0] = null;
						return !results.pop();
					};
			}),
	
			"has": markFunction(function( selector ) {
				return function( elem ) {
					return Sizzle( selector, elem ).length > 0;
				};
			}),
	
			"contains": markFunction(function( text ) {
				text = text.replace( runescape, funescape );
				return function( elem ) {
					return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
				};
			}),
	
			// "Whether an element is represented by a :lang() selector
			// is based solely on the element's language value
			// being equal to the identifier C,
			// or beginning with the identifier C immediately followed by "-".
			// The matching of C against the element's language value is performed case-insensitively.
			// The identifier C does not have to be a valid language name."
			// http://www.w3.org/TR/selectors/#lang-pseudo
			"lang": markFunction( function( lang ) {
				// lang value must be a valid identifier
				if ( !ridentifier.test(lang || "") ) {
					Sizzle.error( "unsupported lang: " + lang );
				}
				lang = lang.replace( runescape, funescape ).toLowerCase();
				return function( elem ) {
					var elemLang;
					do {
						if ( (elemLang = documentIsHTML ?
							elem.lang :
							elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {
	
							elemLang = elemLang.toLowerCase();
							return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
						}
					} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
					return false;
				};
			}),
	
			// Miscellaneous
			"target": function( elem ) {
				var hash = window.location && window.location.hash;
				return hash && hash.slice( 1 ) === elem.id;
			},
	
			"root": function( elem ) {
				return elem === docElem;
			},
	
			"focus": function( elem ) {
				return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
			},
	
			// Boolean properties
			"enabled": function( elem ) {
				return elem.disabled === false;
			},
	
			"disabled": function( elem ) {
				return elem.disabled === true;
			},
	
			"checked": function( elem ) {
				// In CSS3, :checked should return both checked and selected elements
				// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
				var nodeName = elem.nodeName.toLowerCase();
				return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
			},
	
			"selected": function( elem ) {
				// Accessing this property makes selected-by-default
				// options in Safari work properly
				if ( elem.parentNode ) {
					elem.parentNode.selectedIndex;
				}
	
				return elem.selected === true;
			},
	
			// Contents
			"empty": function( elem ) {
				// http://www.w3.org/TR/selectors/#empty-pseudo
				// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
				//   but not by others (comment: 8; processing instruction: 7; etc.)
				// nodeType < 6 works because attributes (2) do not appear as children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
					if ( elem.nodeType < 6 ) {
						return false;
					}
				}
				return true;
			},
	
			"parent": function( elem ) {
				return !Expr.pseudos["empty"]( elem );
			},
	
			// Element/input types
			"header": function( elem ) {
				return rheader.test( elem.nodeName );
			},
	
			"input": function( elem ) {
				return rinputs.test( elem.nodeName );
			},
	
			"button": function( elem ) {
				var name = elem.nodeName.toLowerCase();
				return name === "input" && elem.type === "button" || name === "button";
			},
	
			"text": function( elem ) {
				var attr;
				return elem.nodeName.toLowerCase() === "input" &&
					elem.type === "text" &&
	
					// Support: IE<8
					// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
					( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
			},
	
			// Position-in-collection
			"first": createPositionalPseudo(function() {
				return [ 0 ];
			}),
	
			"last": createPositionalPseudo(function( matchIndexes, length ) {
				return [ length - 1 ];
			}),
	
			"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
				return [ argument < 0 ? argument + length : argument ];
			}),
	
			"even": createPositionalPseudo(function( matchIndexes, length ) {
				var i = 0;
				for ( ; i < length; i += 2 ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			}),
	
			"odd": createPositionalPseudo(function( matchIndexes, length ) {
				var i = 1;
				for ( ; i < length; i += 2 ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			}),
	
			"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
				var i = argument < 0 ? argument + length : argument;
				for ( ; --i >= 0; ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			}),
	
			"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
				var i = argument < 0 ? argument + length : argument;
				for ( ; ++i < length; ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			})
		}
	};
	
	Expr.pseudos["nth"] = Expr.pseudos["eq"];
	
	// Add button/input type pseudos
	for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
		Expr.pseudos[ i ] = createInputPseudo( i );
	}
	for ( i in { submit: true, reset: true } ) {
		Expr.pseudos[ i ] = createButtonPseudo( i );
	}
	
	// Easy API for creating new setFilters
	function setFilters() {}
	setFilters.prototype = Expr.filters = Expr.pseudos;
	Expr.setFilters = new setFilters();
	
	tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
		var matched, match, tokens, type,
			soFar, groups, preFilters,
			cached = tokenCache[ selector + " " ];
	
		if ( cached ) {
			return parseOnly ? 0 : cached.slice( 0 );
		}
	
		soFar = selector;
		groups = [];
		preFilters = Expr.preFilter;
	
		while ( soFar ) {
	
			// Comma and first run
			if ( !matched || (match = rcomma.exec( soFar )) ) {
				if ( match ) {
					// Don't consume trailing commas as valid
					soFar = soFar.slice( match[0].length ) || soFar;
				}
				groups.push( (tokens = []) );
			}
	
			matched = false;
	
			// Combinators
			if ( (match = rcombinators.exec( soFar )) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					// Cast descendant combinators to space
					type: match[0].replace( rtrim, " " )
				});
				soFar = soFar.slice( matched.length );
			}
	
			// Filters
			for ( type in Expr.filter ) {
				if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
					(match = preFilters[ type ]( match ))) ) {
					matched = match.shift();
					tokens.push({
						value: matched,
						type: type,
						matches: match
					});
					soFar = soFar.slice( matched.length );
				}
			}
	
			if ( !matched ) {
				break;
			}
		}
	
		// Return the length of the invalid excess
		// if we're just parsing
		// Otherwise, throw an error or return tokens
		return parseOnly ?
			soFar.length :
			soFar ?
				Sizzle.error( selector ) :
				// Cache the tokens
				tokenCache( selector, groups ).slice( 0 );
	};
	
	function toSelector( tokens ) {
		var i = 0,
			len = tokens.length,
			selector = "";
		for ( ; i < len; i++ ) {
			selector += tokens[i].value;
		}
		return selector;
	}
	
	function addCombinator( matcher, combinator, base ) {
		var dir = combinator.dir,
			checkNonElements = base && dir === "parentNode",
			doneName = done++;
	
		return combinator.first ?
			// Check against closest ancestor/preceding element
			function( elem, context, xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						return matcher( elem, context, xml );
					}
				}
			} :
	
			// Check against all ancestor/preceding elements
			function( elem, context, xml ) {
				var oldCache, uniqueCache, outerCache,
					newCache = [ dirruns, doneName ];
	
				// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
				if ( xml ) {
					while ( (elem = elem[ dir ]) ) {
						if ( elem.nodeType === 1 || checkNonElements ) {
							if ( matcher( elem, context, xml ) ) {
								return true;
							}
						}
					}
				} else {
					while ( (elem = elem[ dir ]) ) {
						if ( elem.nodeType === 1 || checkNonElements ) {
							outerCache = elem[ expando ] || (elem[ expando ] = {});
	
							// Support: IE <9 only
							// Defend against cloned attroperties (jQuery gh-1709)
							uniqueCache = outerCache[ elem.uniqueID ] || (outerCache[ elem.uniqueID ] = {});
	
							if ( (oldCache = uniqueCache[ dir ]) &&
								oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {
	
								// Assign to newCache so results back-propagate to previous elements
								return (newCache[ 2 ] = oldCache[ 2 ]);
							} else {
								// Reuse newcache so results back-propagate to previous elements
								uniqueCache[ dir ] = newCache;
	
								// A match means we're done; a fail means we have to keep checking
								if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
									return true;
								}
							}
						}
					}
				}
			};
	}
	
	function elementMatcher( matchers ) {
		return matchers.length > 1 ?
			function( elem, context, xml ) {
				var i = matchers.length;
				while ( i-- ) {
					if ( !matchers[i]( elem, context, xml ) ) {
						return false;
					}
				}
				return true;
			} :
			matchers[0];
	}
	
	function multipleContexts( selector, contexts, results ) {
		var i = 0,
			len = contexts.length;
		for ( ; i < len; i++ ) {
			Sizzle( selector, contexts[i], results );
		}
		return results;
	}
	
	function condense( unmatched, map, filter, context, xml ) {
		var elem,
			newUnmatched = [],
			i = 0,
			len = unmatched.length,
			mapped = map != null;
	
		for ( ; i < len; i++ ) {
			if ( (elem = unmatched[i]) ) {
				if ( !filter || filter( elem, context, xml ) ) {
					newUnmatched.push( elem );
					if ( mapped ) {
						map.push( i );
					}
				}
			}
		}
	
		return newUnmatched;
	}
	
	function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
		if ( postFilter && !postFilter[ expando ] ) {
			postFilter = setMatcher( postFilter );
		}
		if ( postFinder && !postFinder[ expando ] ) {
			postFinder = setMatcher( postFinder, postSelector );
		}
		return markFunction(function( seed, results, context, xml ) {
			var temp, i, elem,
				preMap = [],
				postMap = [],
				preexisting = results.length,
	
				// Get initial elements from seed or context
				elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),
	
				// Prefilter to get matcher input, preserving a map for seed-results synchronization
				matcherIn = preFilter && ( seed || !selector ) ?
					condense( elems, preMap, preFilter, context, xml ) :
					elems,
	
				matcherOut = matcher ?
					// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
					postFinder || ( seed ? preFilter : preexisting || postFilter ) ?
	
						// ...intermediate processing is necessary
						[] :
	
						// ...otherwise use results directly
						results :
					matcherIn;
	
			// Find primary matches
			if ( matcher ) {
				matcher( matcherIn, matcherOut, context, xml );
			}
	
			// Apply postFilter
			if ( postFilter ) {
				temp = condense( matcherOut, postMap );
				postFilter( temp, [], context, xml );
	
				// Un-match failing elements by moving them back to matcherIn
				i = temp.length;
				while ( i-- ) {
					if ( (elem = temp[i]) ) {
						matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
					}
				}
			}
	
			if ( seed ) {
				if ( postFinder || preFilter ) {
					if ( postFinder ) {
						// Get the final matcherOut by condensing this intermediate into postFinder contexts
						temp = [];
						i = matcherOut.length;
						while ( i-- ) {
							if ( (elem = matcherOut[i]) ) {
								// Restore matcherIn since elem is not yet a final match
								temp.push( (matcherIn[i] = elem) );
							}
						}
						postFinder( null, (matcherOut = []), temp, xml );
					}
	
					// Move matched elements from seed to results to keep them synchronized
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) &&
							(temp = postFinder ? indexOf( seed, elem ) : preMap[i]) > -1 ) {
	
							seed[temp] = !(results[temp] = elem);
						}
					}
				}
	
			// Add elements to results, through postFinder if defined
			} else {
				matcherOut = condense(
					matcherOut === results ?
						matcherOut.splice( preexisting, matcherOut.length ) :
						matcherOut
				);
				if ( postFinder ) {
					postFinder( null, results, matcherOut, xml );
				} else {
					push.apply( results, matcherOut );
				}
			}
		});
	}
	
	function matcherFromTokens( tokens ) {
		var checkContext, matcher, j,
			len = tokens.length,
			leadingRelative = Expr.relative[ tokens[0].type ],
			implicitRelative = leadingRelative || Expr.relative[" "],
			i = leadingRelative ? 1 : 0,
	
			// The foundational matcher ensures that elements are reachable from top-level context(s)
			matchContext = addCombinator( function( elem ) {
				return elem === checkContext;
			}, implicitRelative, true ),
			matchAnyContext = addCombinator( function( elem ) {
				return indexOf( checkContext, elem ) > -1;
			}, implicitRelative, true ),
			matchers = [ function( elem, context, xml ) {
				var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
					(checkContext = context).nodeType ?
						matchContext( elem, context, xml ) :
						matchAnyContext( elem, context, xml ) );
				// Avoid hanging onto element (issue #299)
				checkContext = null;
				return ret;
			} ];
	
		for ( ; i < len; i++ ) {
			if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
				matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
			} else {
				matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );
	
				// Return special upon seeing a positional matcher
				if ( matcher[ expando ] ) {
					// Find the next relative operator (if any) for proper handling
					j = ++i;
					for ( ; j < len; j++ ) {
						if ( Expr.relative[ tokens[j].type ] ) {
							break;
						}
					}
					return setMatcher(
						i > 1 && elementMatcher( matchers ),
						i > 1 && toSelector(
							// If the preceding token was a descendant combinator, insert an implicit any-element `*`
							tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
						).replace( rtrim, "$1" ),
						matcher,
						i < j && matcherFromTokens( tokens.slice( i, j ) ),
						j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
						j < len && toSelector( tokens )
					);
				}
				matchers.push( matcher );
			}
		}
	
		return elementMatcher( matchers );
	}
	
	function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
		var bySet = setMatchers.length > 0,
			byElement = elementMatchers.length > 0,
			superMatcher = function( seed, context, xml, results, outermost ) {
				var elem, j, matcher,
					matchedCount = 0,
					i = "0",
					unmatched = seed && [],
					setMatched = [],
					contextBackup = outermostContext,
					// We must always have either seed elements or outermost context
					elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
					// Use integer dirruns iff this is the outermost matcher
					dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
					len = elems.length;
	
				if ( outermost ) {
					outermostContext = context === document || context || outermost;
				}
	
				// Add elements passing elementMatchers directly to results
				// Support: IE<9, Safari
				// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
				for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
					if ( byElement && elem ) {
						j = 0;
						if ( !context && elem.ownerDocument !== document ) {
							setDocument( elem );
							xml = !documentIsHTML;
						}
						while ( (matcher = elementMatchers[j++]) ) {
							if ( matcher( elem, context || document, xml) ) {
								results.push( elem );
								break;
							}
						}
						if ( outermost ) {
							dirruns = dirrunsUnique;
						}
					}
	
					// Track unmatched elements for set filters
					if ( bySet ) {
						// They will have gone through all possible matchers
						if ( (elem = !matcher && elem) ) {
							matchedCount--;
						}
	
						// Lengthen the array for every element, matched or not
						if ( seed ) {
							unmatched.push( elem );
						}
					}
				}
	
				// `i` is now the count of elements visited above, and adding it to `matchedCount`
				// makes the latter nonnegative.
				matchedCount += i;
	
				// Apply set filters to unmatched elements
				// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
				// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
				// no element matchers and no seed.
				// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
				// case, which will result in a "00" `matchedCount` that differs from `i` but is also
				// numerically zero.
				if ( bySet && i !== matchedCount ) {
					j = 0;
					while ( (matcher = setMatchers[j++]) ) {
						matcher( unmatched, setMatched, context, xml );
					}
	
					if ( seed ) {
						// Reintegrate element matches to eliminate the need for sorting
						if ( matchedCount > 0 ) {
							while ( i-- ) {
								if ( !(unmatched[i] || setMatched[i]) ) {
									setMatched[i] = pop.call( results );
								}
							}
						}
	
						// Discard index placeholder values to get only actual matches
						setMatched = condense( setMatched );
					}
	
					// Add matches to results
					push.apply( results, setMatched );
	
					// Seedless set matches succeeding multiple successful matchers stipulate sorting
					if ( outermost && !seed && setMatched.length > 0 &&
						( matchedCount + setMatchers.length ) > 1 ) {
	
						Sizzle.uniqueSort( results );
					}
				}
	
				// Override manipulation of globals by nested matchers
				if ( outermost ) {
					dirruns = dirrunsUnique;
					outermostContext = contextBackup;
				}
	
				return unmatched;
			};
	
		return bySet ?
			markFunction( superMatcher ) :
			superMatcher;
	}
	
	compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
		var i,
			setMatchers = [],
			elementMatchers = [],
			cached = compilerCache[ selector + " " ];
	
		if ( !cached ) {
			// Generate a function of recursive functions that can be used to check each element
			if ( !match ) {
				match = tokenize( selector );
			}
			i = match.length;
			while ( i-- ) {
				cached = matcherFromTokens( match[i] );
				if ( cached[ expando ] ) {
					setMatchers.push( cached );
				} else {
					elementMatchers.push( cached );
				}
			}
	
			// Cache the compiled function
			cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );
	
			// Save selector and tokenization
			cached.selector = selector;
		}
		return cached;
	};
	
	/**
	 * A low-level selection function that works with Sizzle's compiled
	 *  selector functions
	 * @param {String|Function} selector A selector or a pre-compiled
	 *  selector function built with Sizzle.compile
	 * @param {Element} context
	 * @param {Array} [results]
	 * @param {Array} [seed] A set of elements to match against
	 */
	select = Sizzle.select = function( selector, context, results, seed ) {
		var i, tokens, token, type, find,
			compiled = typeof selector === "function" && selector,
			match = !seed && tokenize( (selector = compiled.selector || selector) );
	
		results = results || [];
	
		// Try to minimize operations if there is only one selector in the list and no seed
		// (the latter of which guarantees us context)
		if ( match.length === 1 ) {
	
			// Reduce context if the leading compound selector is an ID
			tokens = match[0] = match[0].slice( 0 );
			if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
					support.getById && context.nodeType === 9 && documentIsHTML &&
					Expr.relative[ tokens[1].type ] ) {
	
				context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
				if ( !context ) {
					return results;
	
				// Precompiled matchers will still verify ancestry, so step up a level
				} else if ( compiled ) {
					context = context.parentNode;
				}
	
				selector = selector.slice( tokens.shift().value.length );
			}
	
			// Fetch a seed set for right-to-left matching
			i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
			while ( i-- ) {
				token = tokens[i];
	
				// Abort if we hit a combinator
				if ( Expr.relative[ (type = token.type) ] ) {
					break;
				}
				if ( (find = Expr.find[ type ]) ) {
					// Search, expanding context for leading sibling combinators
					if ( (seed = find(
						token.matches[0].replace( runescape, funescape ),
						rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
					)) ) {
	
						// If seed is empty or no tokens remain, we can return early
						tokens.splice( i, 1 );
						selector = seed.length && toSelector( tokens );
						if ( !selector ) {
							push.apply( results, seed );
							return results;
						}
	
						break;
					}
				}
			}
		}
	
		// Compile and execute a filtering function if one is not provided
		// Provide `match` to avoid retokenization if we modified the selector above
		( compiled || compile( selector, match ) )(
			seed,
			context,
			!documentIsHTML,
			results,
			!context || rsibling.test( selector ) && testContext( context.parentNode ) || context
		);
		return results;
	};
	
	// One-time assignments
	
	// Sort stability
	support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;
	
	// Support: Chrome 14-35+
	// Always assume duplicates if they aren't passed to the comparison function
	support.detectDuplicates = !!hasDuplicate;
	
	// Initialize against the default document
	setDocument();
	
	// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
	// Detached nodes confoundingly follow *each other*
	support.sortDetached = assert(function( div1 ) {
		// Should return 1, but returns 4 (following)
		return div1.compareDocumentPosition( document.createElement("div") ) & 1;
	});
	
	// Support: IE<8
	// Prevent attribute/property "interpolation"
	// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
	if ( !assert(function( div ) {
		div.innerHTML = "<a href='#'></a>";
		return div.firstChild.getAttribute("href") === "#" ;
	}) ) {
		addHandle( "type|href|height|width", function( elem, name, isXML ) {
			if ( !isXML ) {
				return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
			}
		});
	}
	
	// Support: IE<9
	// Use defaultValue in place of getAttribute("value")
	if ( !support.attributes || !assert(function( div ) {
		div.innerHTML = "<input/>";
		div.firstChild.setAttribute( "value", "" );
		return div.firstChild.getAttribute( "value" ) === "";
	}) ) {
		addHandle( "value", function( elem, name, isXML ) {
			if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
				return elem.defaultValue;
			}
		});
	}
	
	// Support: IE<9
	// Use getAttributeNode to fetch booleans when getAttribute lies
	if ( !assert(function( div ) {
		return div.getAttribute("disabled") == null;
	}) ) {
		addHandle( booleans, function( elem, name, isXML ) {
			var val;
			if ( !isXML ) {
				return elem[ name ] === true ? name.toLowerCase() :
						(val = elem.getAttributeNode( name )) && val.specified ?
						val.value :
					null;
			}
		});
	}
	
	return Sizzle;
	
	})( window );
	
	
	
	jQuery.find = Sizzle;
	jQuery.expr = Sizzle.selectors;
	jQuery.expr[ ":" ] = jQuery.expr.pseudos;
	jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
	jQuery.text = Sizzle.getText;
	jQuery.isXMLDoc = Sizzle.isXML;
	jQuery.contains = Sizzle.contains;
	
	
	
	var dir = function( elem, dir, until ) {
		var matched = [],
			truncate = until !== undefined;
	
		while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
			if ( elem.nodeType === 1 ) {
				if ( truncate && jQuery( elem ).is( until ) ) {
					break;
				}
				matched.push( elem );
			}
		}
		return matched;
	};
	
	
	var siblings = function( n, elem ) {
		var matched = [];
	
		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				matched.push( n );
			}
		}
	
		return matched;
	};
	
	
	var rneedsContext = jQuery.expr.match.needsContext;
	
	var rsingleTag = ( /^<([\w-]+)\s*\/?>(?:<\/\1>|)$/ );
	
	
	
	var risSimple = /^.[^:#\[\.,]*$/;
	
	// Implement the identical functionality for filter and not
	function winnow( elements, qualifier, not ) {
		if ( jQuery.isFunction( qualifier ) ) {
			return jQuery.grep( elements, function( elem, i ) {
				/* jshint -W018 */
				return !!qualifier.call( elem, i, elem ) !== not;
			} );
	
		}
	
		if ( qualifier.nodeType ) {
			return jQuery.grep( elements, function( elem ) {
				return ( elem === qualifier ) !== not;
			} );
	
		}
	
		if ( typeof qualifier === "string" ) {
			if ( risSimple.test( qualifier ) ) {
				return jQuery.filter( qualifier, elements, not );
			}
	
			qualifier = jQuery.filter( qualifier, elements );
		}
	
		return jQuery.grep( elements, function( elem ) {
			return ( indexOf.call( qualifier, elem ) > -1 ) !== not;
		} );
	}
	
	jQuery.filter = function( expr, elems, not ) {
		var elem = elems[ 0 ];
	
		if ( not ) {
			expr = ":not(" + expr + ")";
		}
	
		return elems.length === 1 && elem.nodeType === 1 ?
			jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [] :
			jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
				return elem.nodeType === 1;
			} ) );
	};
	
	jQuery.fn.extend( {
		find: function( selector ) {
			var i,
				len = this.length,
				ret = [],
				self = this;
	
			if ( typeof selector !== "string" ) {
				return this.pushStack( jQuery( selector ).filter( function() {
					for ( i = 0; i < len; i++ ) {
						if ( jQuery.contains( self[ i ], this ) ) {
							return true;
						}
					}
				} ) );
			}
	
			for ( i = 0; i < len; i++ ) {
				jQuery.find( selector, self[ i ], ret );
			}
	
			// Needed because $( selector, context ) becomes $( context ).find( selector )
			ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
			ret.selector = this.selector ? this.selector + " " + selector : selector;
			return ret;
		},
		filter: function( selector ) {
			return this.pushStack( winnow( this, selector || [], false ) );
		},
		not: function( selector ) {
			return this.pushStack( winnow( this, selector || [], true ) );
		},
		is: function( selector ) {
			return !!winnow(
				this,
	
				// If this is a positional/relative selector, check membership in the returned set
				// so $("p:first").is("p:last") won't return true for a doc with two "p".
				typeof selector === "string" && rneedsContext.test( selector ) ?
					jQuery( selector ) :
					selector || [],
				false
			).length;
		}
	} );
	
	
	// Initialize a jQuery object
	
	
	// A central reference to the root jQuery(document)
	var rootjQuery,
	
		// A simple way to check for HTML strings
		// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
		// Strict HTML recognition (#11290: must start with <)
		rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,
	
		init = jQuery.fn.init = function( selector, context, root ) {
			var match, elem;
	
			// HANDLE: $(""), $(null), $(undefined), $(false)
			if ( !selector ) {
				return this;
			}
	
			// Method init() accepts an alternate rootjQuery
			// so migrate can support jQuery.sub (gh-2101)
			root = root || rootjQuery;
	
			// Handle HTML strings
			if ( typeof selector === "string" ) {
				if ( selector[ 0 ] === "<" &&
					selector[ selector.length - 1 ] === ">" &&
					selector.length >= 3 ) {
	
					// Assume that strings that start and end with <> are HTML and skip the regex check
					match = [ null, selector, null ];
	
				} else {
					match = rquickExpr.exec( selector );
				}
	
				// Match html or make sure no context is specified for #id
				if ( match && ( match[ 1 ] || !context ) ) {
	
					// HANDLE: $(html) -> $(array)
					if ( match[ 1 ] ) {
						context = context instanceof jQuery ? context[ 0 ] : context;
	
						// Option to run scripts is true for back-compat
						// Intentionally let the error be thrown if parseHTML is not present
						jQuery.merge( this, jQuery.parseHTML(
							match[ 1 ],
							context && context.nodeType ? context.ownerDocument || context : document,
							true
						) );
	
						// HANDLE: $(html, props)
						if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
							for ( match in context ) {
	
								// Properties of context are called as methods if possible
								if ( jQuery.isFunction( this[ match ] ) ) {
									this[ match ]( context[ match ] );
	
								// ...and otherwise set as attributes
								} else {
									this.attr( match, context[ match ] );
								}
							}
						}
	
						return this;
	
					// HANDLE: $(#id)
					} else {
						elem = document.getElementById( match[ 2 ] );
	
						// Support: Blackberry 4.6
						// gEBID returns nodes no longer in the document (#6963)
						if ( elem && elem.parentNode ) {
	
							// Inject the element directly into the jQuery object
							this.length = 1;
							this[ 0 ] = elem;
						}
	
						this.context = document;
						this.selector = selector;
						return this;
					}
	
				// HANDLE: $(expr, $(...))
				} else if ( !context || context.jquery ) {
					return ( context || root ).find( selector );
	
				// HANDLE: $(expr, context)
				// (which is just equivalent to: $(context).find(expr)
				} else {
					return this.constructor( context ).find( selector );
				}
	
			// HANDLE: $(DOMElement)
			} else if ( selector.nodeType ) {
				this.context = this[ 0 ] = selector;
				this.length = 1;
				return this;
	
			// HANDLE: $(function)
			// Shortcut for document ready
			} else if ( jQuery.isFunction( selector ) ) {
				return root.ready !== undefined ?
					root.ready( selector ) :
	
					// Execute immediately if ready is not present
					selector( jQuery );
			}
	
			if ( selector.selector !== undefined ) {
				this.selector = selector.selector;
				this.context = selector.context;
			}
	
			return jQuery.makeArray( selector, this );
		};
	
	// Give the init function the jQuery prototype for later instantiation
	init.prototype = jQuery.fn;
	
	// Initialize central reference
	rootjQuery = jQuery( document );
	
	
	var rparentsprev = /^(?:parents|prev(?:Until|All))/,
	
		// Methods guaranteed to produce a unique set when starting from a unique set
		guaranteedUnique = {
			children: true,
			contents: true,
			next: true,
			prev: true
		};
	
	jQuery.fn.extend( {
		has: function( target ) {
			var targets = jQuery( target, this ),
				l = targets.length;
	
			return this.filter( function() {
				var i = 0;
				for ( ; i < l; i++ ) {
					if ( jQuery.contains( this, targets[ i ] ) ) {
						return true;
					}
				}
			} );
		},
	
		closest: function( selectors, context ) {
			var cur,
				i = 0,
				l = this.length,
				matched = [],
				pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
					jQuery( selectors, context || this.context ) :
					0;
	
			for ( ; i < l; i++ ) {
				for ( cur = this[ i ]; cur && cur !== context; cur = cur.parentNode ) {
	
					// Always skip document fragments
					if ( cur.nodeType < 11 && ( pos ?
						pos.index( cur ) > -1 :
	
						// Don't pass non-elements to Sizzle
						cur.nodeType === 1 &&
							jQuery.find.matchesSelector( cur, selectors ) ) ) {
	
						matched.push( cur );
						break;
					}
				}
			}
	
			return this.pushStack( matched.length > 1 ? jQuery.uniqueSort( matched ) : matched );
		},
	
		// Determine the position of an element within the set
		index: function( elem ) {
	
			// No argument, return index in parent
			if ( !elem ) {
				return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
			}
	
			// Index in selector
			if ( typeof elem === "string" ) {
				return indexOf.call( jQuery( elem ), this[ 0 ] );
			}
	
			// Locate the position of the desired element
			return indexOf.call( this,
	
				// If it receives a jQuery object, the first element is used
				elem.jquery ? elem[ 0 ] : elem
			);
		},
	
		add: function( selector, context ) {
			return this.pushStack(
				jQuery.uniqueSort(
					jQuery.merge( this.get(), jQuery( selector, context ) )
				)
			);
		},
	
		addBack: function( selector ) {
			return this.add( selector == null ?
				this.prevObject : this.prevObject.filter( selector )
			);
		}
	} );
	
	function sibling( cur, dir ) {
		while ( ( cur = cur[ dir ] ) && cur.nodeType !== 1 ) {}
		return cur;
	}
	
	jQuery.each( {
		parent: function( elem ) {
			var parent = elem.parentNode;
			return parent && parent.nodeType !== 11 ? parent : null;
		},
		parents: function( elem ) {
			return dir( elem, "parentNode" );
		},
		parentsUntil: function( elem, i, until ) {
			return dir( elem, "parentNode", until );
		},
		next: function( elem ) {
			return sibling( elem, "nextSibling" );
		},
		prev: function( elem ) {
			return sibling( elem, "previousSibling" );
		},
		nextAll: function( elem ) {
			return dir( elem, "nextSibling" );
		},
		prevAll: function( elem ) {
			return dir( elem, "previousSibling" );
		},
		nextUntil: function( elem, i, until ) {
			return dir( elem, "nextSibling", until );
		},
		prevUntil: function( elem, i, until ) {
			return dir( elem, "previousSibling", until );
		},
		siblings: function( elem ) {
			return siblings( ( elem.parentNode || {} ).firstChild, elem );
		},
		children: function( elem ) {
			return siblings( elem.firstChild );
		},
		contents: function( elem ) {
			return elem.contentDocument || jQuery.merge( [], elem.childNodes );
		}
	}, function( name, fn ) {
		jQuery.fn[ name ] = function( until, selector ) {
			var matched = jQuery.map( this, fn, until );
	
			if ( name.slice( -5 ) !== "Until" ) {
				selector = until;
			}
	
			if ( selector && typeof selector === "string" ) {
				matched = jQuery.filter( selector, matched );
			}
	
			if ( this.length > 1 ) {
	
				// Remove duplicates
				if ( !guaranteedUnique[ name ] ) {
					jQuery.uniqueSort( matched );
				}
	
				// Reverse order for parents* and prev-derivatives
				if ( rparentsprev.test( name ) ) {
					matched.reverse();
				}
			}
	
			return this.pushStack( matched );
		};
	} );
	var rnotwhite = ( /\S+/g );
	
	
	
	// Convert String-formatted options into Object-formatted ones
	function createOptions( options ) {
		var object = {};
		jQuery.each( options.match( rnotwhite ) || [], function( _, flag ) {
			object[ flag ] = true;
		} );
		return object;
	}
	
	/*
	 * Create a callback list using the following parameters:
	 *
	 *	options: an optional list of space-separated options that will change how
	 *			the callback list behaves or a more traditional option object
	 *
	 * By default a callback list will act like an event callback list and can be
	 * "fired" multiple times.
	 *
	 * Possible options:
	 *
	 *	once:			will ensure the callback list can only be fired once (like a Deferred)
	 *
	 *	memory:			will keep track of previous values and will call any callback added
	 *					after the list has been fired right away with the latest "memorized"
	 *					values (like a Deferred)
	 *
	 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
	 *
	 *	stopOnFalse:	interrupt callings when a callback returns false
	 *
	 */
	jQuery.Callbacks = function( options ) {
	
		// Convert options from String-formatted to Object-formatted if needed
		// (we check in cache first)
		options = typeof options === "string" ?
			createOptions( options ) :
			jQuery.extend( {}, options );
	
		var // Flag to know if list is currently firing
			firing,
	
			// Last fire value for non-forgettable lists
			memory,
	
			// Flag to know if list was already fired
			fired,
	
			// Flag to prevent firing
			locked,
	
			// Actual callback list
			list = [],
	
			// Queue of execution data for repeatable lists
			queue = [],
	
			// Index of currently firing callback (modified by add/remove as needed)
			firingIndex = -1,
	
			// Fire callbacks
			fire = function() {
	
				// Enforce single-firing
				locked = options.once;
	
				// Execute callbacks for all pending executions,
				// respecting firingIndex overrides and runtime changes
				fired = firing = true;
				for ( ; queue.length; firingIndex = -1 ) {
					memory = queue.shift();
					while ( ++firingIndex < list.length ) {
	
						// Run callback and check for early termination
						if ( list[ firingIndex ].apply( memory[ 0 ], memory[ 1 ] ) === false &&
							options.stopOnFalse ) {
	
							// Jump to end and forget the data so .add doesn't re-fire
							firingIndex = list.length;
							memory = false;
						}
					}
				}
	
				// Forget the data if we're done with it
				if ( !options.memory ) {
					memory = false;
				}
	
				firing = false;
	
				// Clean up if we're done firing for good
				if ( locked ) {
	
					// Keep an empty list if we have data for future add calls
					if ( memory ) {
						list = [];
	
					// Otherwise, this object is spent
					} else {
						list = "";
					}
				}
			},
	
			// Actual Callbacks object
			self = {
	
				// Add a callback or a collection of callbacks to the list
				add: function() {
					if ( list ) {
	
						// If we have memory from a past run, we should fire after adding
						if ( memory && !firing ) {
							firingIndex = list.length - 1;
							queue.push( memory );
						}
	
						( function add( args ) {
							jQuery.each( args, function( _, arg ) {
								if ( jQuery.isFunction( arg ) ) {
									if ( !options.unique || !self.has( arg ) ) {
										list.push( arg );
									}
								} else if ( arg && arg.length && jQuery.type( arg ) !== "string" ) {
	
									// Inspect recursively
									add( arg );
								}
							} );
						} )( arguments );
	
						if ( memory && !firing ) {
							fire();
						}
					}
					return this;
				},
	
				// Remove a callback from the list
				remove: function() {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							list.splice( index, 1 );
	
							// Handle firing indexes
							if ( index <= firingIndex ) {
								firingIndex--;
							}
						}
					} );
					return this;
				},
	
				// Check if a given callback is in the list.
				// If no argument is given, return whether or not list has callbacks attached.
				has: function( fn ) {
					return fn ?
						jQuery.inArray( fn, list ) > -1 :
						list.length > 0;
				},
	
				// Remove all callbacks from the list
				empty: function() {
					if ( list ) {
						list = [];
					}
					return this;
				},
	
				// Disable .fire and .add
				// Abort any current/pending executions
				// Clear all callbacks and values
				disable: function() {
					locked = queue = [];
					list = memory = "";
					return this;
				},
				disabled: function() {
					return !list;
				},
	
				// Disable .fire
				// Also disable .add unless we have memory (since it would have no effect)
				// Abort any pending executions
				lock: function() {
					locked = queue = [];
					if ( !memory ) {
						list = memory = "";
					}
					return this;
				},
				locked: function() {
					return !!locked;
				},
	
				// Call all callbacks with the given context and arguments
				fireWith: function( context, args ) {
					if ( !locked ) {
						args = args || [];
						args = [ context, args.slice ? args.slice() : args ];
						queue.push( args );
						if ( !firing ) {
							fire();
						}
					}
					return this;
				},
	
				// Call all the callbacks with the given arguments
				fire: function() {
					self.fireWith( this, arguments );
					return this;
				},
	
				// To know if the callbacks have already been called at least once
				fired: function() {
					return !!fired;
				}
			};
	
		return self;
	};
	
	
	jQuery.extend( {
	
		Deferred: function( func ) {
			var tuples = [
	
					// action, add listener, listener list, final state
					[ "resolve", "done", jQuery.Callbacks( "once memory" ), "resolved" ],
					[ "reject", "fail", jQuery.Callbacks( "once memory" ), "rejected" ],
					[ "notify", "progress", jQuery.Callbacks( "memory" ) ]
				],
				state = "pending",
				promise = {
					state: function() {
						return state;
					},
					always: function() {
						deferred.done( arguments ).fail( arguments );
						return this;
					},
					then: function( /* fnDone, fnFail, fnProgress */ ) {
						var fns = arguments;
						return jQuery.Deferred( function( newDefer ) {
							jQuery.each( tuples, function( i, tuple ) {
								var fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];
	
								// deferred[ done | fail | progress ] for forwarding actions to newDefer
								deferred[ tuple[ 1 ] ]( function() {
									var returned = fn && fn.apply( this, arguments );
									if ( returned && jQuery.isFunction( returned.promise ) ) {
										returned.promise()
											.progress( newDefer.notify )
											.done( newDefer.resolve )
											.fail( newDefer.reject );
									} else {
										newDefer[ tuple[ 0 ] + "With" ](
											this === promise ? newDefer.promise() : this,
											fn ? [ returned ] : arguments
										);
									}
								} );
							} );
							fns = null;
						} ).promise();
					},
	
					// Get a promise for this deferred
					// If obj is provided, the promise aspect is added to the object
					promise: function( obj ) {
						return obj != null ? jQuery.extend( obj, promise ) : promise;
					}
				},
				deferred = {};
	
			// Keep pipe for back-compat
			promise.pipe = promise.then;
	
			// Add list-specific methods
			jQuery.each( tuples, function( i, tuple ) {
				var list = tuple[ 2 ],
					stateString = tuple[ 3 ];
	
				// promise[ done | fail | progress ] = list.add
				promise[ tuple[ 1 ] ] = list.add;
	
				// Handle state
				if ( stateString ) {
					list.add( function() {
	
						// state = [ resolved | rejected ]
						state = stateString;
	
					// [ reject_list | resolve_list ].disable; progress_list.lock
					}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
				}
	
				// deferred[ resolve | reject | notify ]
				deferred[ tuple[ 0 ] ] = function() {
					deferred[ tuple[ 0 ] + "With" ]( this === deferred ? promise : this, arguments );
					return this;
				};
				deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
			} );
	
			// Make the deferred a promise
			promise.promise( deferred );
	
			// Call given func if any
			if ( func ) {
				func.call( deferred, deferred );
			}
	
			// All done!
			return deferred;
		},
	
		// Deferred helper
		when: function( subordinate /* , ..., subordinateN */ ) {
			var i = 0,
				resolveValues = slice.call( arguments ),
				length = resolveValues.length,
	
				// the count of uncompleted subordinates
				remaining = length !== 1 ||
					( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,
	
				// the master Deferred.
				// If resolveValues consist of only a single Deferred, just use that.
				deferred = remaining === 1 ? subordinate : jQuery.Deferred(),
	
				// Update function for both resolve and progress values
				updateFunc = function( i, contexts, values ) {
					return function( value ) {
						contexts[ i ] = this;
						values[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
						if ( values === progressValues ) {
							deferred.notifyWith( contexts, values );
						} else if ( !( --remaining ) ) {
							deferred.resolveWith( contexts, values );
						}
					};
				},
	
				progressValues, progressContexts, resolveContexts;
	
			// Add listeners to Deferred subordinates; treat others as resolved
			if ( length > 1 ) {
				progressValues = new Array( length );
				progressContexts = new Array( length );
				resolveContexts = new Array( length );
				for ( ; i < length; i++ ) {
					if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
						resolveValues[ i ].promise()
							.progress( updateFunc( i, progressContexts, progressValues ) )
							.done( updateFunc( i, resolveContexts, resolveValues ) )
							.fail( deferred.reject );
					} else {
						--remaining;
					}
				}
			}
	
			// If we're not waiting on anything, resolve the master
			if ( !remaining ) {
				deferred.resolveWith( resolveContexts, resolveValues );
			}
	
			return deferred.promise();
		}
	} );
	
	
	// The deferred used on DOM ready
	var readyList;
	
	jQuery.fn.ready = function( fn ) {
	
		// Add the callback
		jQuery.ready.promise().done( fn );
	
		return this;
	};
	
	jQuery.extend( {
	
		// Is the DOM ready to be used? Set to true once it occurs.
		isReady: false,
	
		// A counter to track how many items to wait for before
		// the ready event fires. See #6781
		readyWait: 1,
	
		// Hold (or release) the ready event
		holdReady: function( hold ) {
			if ( hold ) {
				jQuery.readyWait++;
			} else {
				jQuery.ready( true );
			}
		},
	
		// Handle when the DOM is ready
		ready: function( wait ) {
	
			// Abort if there are pending holds or we're already ready
			if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
				return;
			}
	
			// Remember that the DOM is ready
			jQuery.isReady = true;
	
			// If a normal DOM Ready event fired, decrement, and wait if need be
			if ( wait !== true && --jQuery.readyWait > 0 ) {
				return;
			}
	
			// If there are functions bound, to execute
			readyList.resolveWith( document, [ jQuery ] );
	
			// Trigger any bound ready events
			if ( jQuery.fn.triggerHandler ) {
				jQuery( document ).triggerHandler( "ready" );
				jQuery( document ).off( "ready" );
			}
		}
	} );
	
	/**
	 * The ready event handler and self cleanup method
	 */
	function completed() {
		document.removeEventListener( "DOMContentLoaded", completed );
		window.removeEventListener( "load", completed );
		jQuery.ready();
	}
	
	jQuery.ready.promise = function( obj ) {
		if ( !readyList ) {
	
			readyList = jQuery.Deferred();
	
			// Catch cases where $(document).ready() is called
			// after the browser event has already occurred.
			// Support: IE9-10 only
			// Older IE sometimes signals "interactive" too soon
			if ( document.readyState === "complete" ||
				( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {
	
				// Handle it asynchronously to allow scripts the opportunity to delay ready
				window.setTimeout( jQuery.ready );
	
			} else {
	
				// Use the handy event callback
				document.addEventListener( "DOMContentLoaded", completed );
	
				// A fallback to window.onload, that will always work
				window.addEventListener( "load", completed );
			}
		}
		return readyList.promise( obj );
	};
	
	// Kick off the DOM ready check even if the user does not
	jQuery.ready.promise();
	
	
	
	
	// Multifunctional method to get and set values of a collection
	// The value/s can optionally be executed if it's a function
	var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
		var i = 0,
			len = elems.length,
			bulk = key == null;
	
		// Sets many values
		if ( jQuery.type( key ) === "object" ) {
			chainable = true;
			for ( i in key ) {
				access( elems, fn, i, key[ i ], true, emptyGet, raw );
			}
	
		// Sets one value
		} else if ( value !== undefined ) {
			chainable = true;
	
			if ( !jQuery.isFunction( value ) ) {
				raw = true;
			}
	
			if ( bulk ) {
	
				// Bulk operations run against the entire set
				if ( raw ) {
					fn.call( elems, value );
					fn = null;
	
				// ...except when executing function values
				} else {
					bulk = fn;
					fn = function( elem, key, value ) {
						return bulk.call( jQuery( elem ), value );
					};
				}
			}
	
			if ( fn ) {
				for ( ; i < len; i++ ) {
					fn(
						elems[ i ], key, raw ?
						value :
						value.call( elems[ i ], i, fn( elems[ i ], key ) )
					);
				}
			}
		}
	
		return chainable ?
			elems :
	
			// Gets
			bulk ?
				fn.call( elems ) :
				len ? fn( elems[ 0 ], key ) : emptyGet;
	};
	var acceptData = function( owner ) {
	
		// Accepts only:
		//  - Node
		//    - Node.ELEMENT_NODE
		//    - Node.DOCUMENT_NODE
		//  - Object
		//    - Any
		/* jshint -W018 */
		return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
	};
	
	
	
	
	function Data() {
		this.expando = jQuery.expando + Data.uid++;
	}
	
	Data.uid = 1;
	
	Data.prototype = {
	
		register: function( owner, initial ) {
			var value = initial || {};
	
			// If it is a node unlikely to be stringify-ed or looped over
			// use plain assignment
			if ( owner.nodeType ) {
				owner[ this.expando ] = value;
	
			// Otherwise secure it in a non-enumerable, non-writable property
			// configurability must be true to allow the property to be
			// deleted with the delete operator
			} else {
				Object.defineProperty( owner, this.expando, {
					value: value,
					writable: true,
					configurable: true
				} );
			}
			return owner[ this.expando ];
		},
		cache: function( owner ) {
	
			// We can accept data for non-element nodes in modern browsers,
			// but we should not, see #8335.
			// Always return an empty object.
			if ( !acceptData( owner ) ) {
				return {};
			}
	
			// Check if the owner object already has a cache
			var value = owner[ this.expando ];
	
			// If not, create one
			if ( !value ) {
				value = {};
	
				// We can accept data for non-element nodes in modern browsers,
				// but we should not, see #8335.
				// Always return an empty object.
				if ( acceptData( owner ) ) {
	
					// If it is a node unlikely to be stringify-ed or looped over
					// use plain assignment
					if ( owner.nodeType ) {
						owner[ this.expando ] = value;
	
					// Otherwise secure it in a non-enumerable property
					// configurable must be true to allow the property to be
					// deleted when data is removed
					} else {
						Object.defineProperty( owner, this.expando, {
							value: value,
							configurable: true
						} );
					}
				}
			}
	
			return value;
		},
		set: function( owner, data, value ) {
			var prop,
				cache = this.cache( owner );
	
			// Handle: [ owner, key, value ] args
			if ( typeof data === "string" ) {
				cache[ data ] = value;
	
			// Handle: [ owner, { properties } ] args
			} else {
	
				// Copy the properties one-by-one to the cache object
				for ( prop in data ) {
					cache[ prop ] = data[ prop ];
				}
			}
			return cache;
		},
		get: function( owner, key ) {
			return key === undefined ?
				this.cache( owner ) :
				owner[ this.expando ] && owner[ this.expando ][ key ];
		},
		access: function( owner, key, value ) {
			var stored;
	
			// In cases where either:
			//
			//   1. No key was specified
			//   2. A string key was specified, but no value provided
			//
			// Take the "read" path and allow the get method to determine
			// which value to return, respectively either:
			//
			//   1. The entire cache object
			//   2. The data stored at the key
			//
			if ( key === undefined ||
					( ( key && typeof key === "string" ) && value === undefined ) ) {
	
				stored = this.get( owner, key );
	
				return stored !== undefined ?
					stored : this.get( owner, jQuery.camelCase( key ) );
			}
	
			// When the key is not a string, or both a key and value
			// are specified, set or extend (existing objects) with either:
			//
			//   1. An object of properties
			//   2. A key and value
			//
			this.set( owner, key, value );
	
			// Since the "set" path can have two possible entry points
			// return the expected data based on which path was taken[*]
			return value !== undefined ? value : key;
		},
		remove: function( owner, key ) {
			var i, name, camel,
				cache = owner[ this.expando ];
	
			if ( cache === undefined ) {
				return;
			}
	
			if ( key === undefined ) {
				this.register( owner );
	
			} else {
	
				// Support array or space separated string of keys
				if ( jQuery.isArray( key ) ) {
	
					// If "name" is an array of keys...
					// When data is initially created, via ("key", "val") signature,
					// keys will be converted to camelCase.
					// Since there is no way to tell _how_ a key was added, remove
					// both plain key and camelCase key. #12786
					// This will only penalize the array argument path.
					name = key.concat( key.map( jQuery.camelCase ) );
				} else {
					camel = jQuery.camelCase( key );
	
					// Try the string as a key before any manipulation
					if ( key in cache ) {
						name = [ key, camel ];
					} else {
	
						// If a key with the spaces exists, use it.
						// Otherwise, create an array by matching non-whitespace
						name = camel;
						name = name in cache ?
							[ name ] : ( name.match( rnotwhite ) || [] );
					}
				}
	
				i = name.length;
	
				while ( i-- ) {
					delete cache[ name[ i ] ];
				}
			}
	
			// Remove the expando if there's no more data
			if ( key === undefined || jQuery.isEmptyObject( cache ) ) {
	
				// Support: Chrome <= 35-45+
				// Webkit & Blink performance suffers when deleting properties
				// from DOM nodes, so set to undefined instead
				// https://code.google.com/p/chromium/issues/detail?id=378607
				if ( owner.nodeType ) {
					owner[ this.expando ] = undefined;
				} else {
					delete owner[ this.expando ];
				}
			}
		},
		hasData: function( owner ) {
			var cache = owner[ this.expando ];
			return cache !== undefined && !jQuery.isEmptyObject( cache );
		}
	};
	var dataPriv = new Data();
	
	var dataUser = new Data();
	
	
	
	//	Implementation Summary
	//
	//	1. Enforce API surface and semantic compatibility with 1.9.x branch
	//	2. Improve the module's maintainability by reducing the storage
	//		paths to a single mechanism.
	//	3. Use the same single mechanism to support "private" and "user" data.
	//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
	//	5. Avoid exposing implementation details on user objects (eg. expando properties)
	//	6. Provide a clear path for implementation upgrade to WeakMap in 2014
	
	var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
		rmultiDash = /[A-Z]/g;
	
	function dataAttr( elem, key, data ) {
		var name;
	
		// If nothing was found internally, try to fetch any
		// data from the HTML5 data-* attribute
		if ( data === undefined && elem.nodeType === 1 ) {
			name = "data-" + key.replace( rmultiDash, "-$&" ).toLowerCase();
			data = elem.getAttribute( name );
	
			if ( typeof data === "string" ) {
				try {
					data = data === "true" ? true :
						data === "false" ? false :
						data === "null" ? null :
	
						// Only convert to a number if it doesn't change the string
						+data + "" === data ? +data :
						rbrace.test( data ) ? jQuery.parseJSON( data ) :
						data;
				} catch ( e ) {}
	
				// Make sure we set the data so it isn't changed later
				dataUser.set( elem, key, data );
			} else {
				data = undefined;
			}
		}
		return data;
	}
	
	jQuery.extend( {
		hasData: function( elem ) {
			return dataUser.hasData( elem ) || dataPriv.hasData( elem );
		},
	
		data: function( elem, name, data ) {
			return dataUser.access( elem, name, data );
		},
	
		removeData: function( elem, name ) {
			dataUser.remove( elem, name );
		},
	
		// TODO: Now that all calls to _data and _removeData have been replaced
		// with direct calls to dataPriv methods, these can be deprecated.
		_data: function( elem, name, data ) {
			return dataPriv.access( elem, name, data );
		},
	
		_removeData: function( elem, name ) {
			dataPriv.remove( elem, name );
		}
	} );
	
	jQuery.fn.extend( {
		data: function( key, value ) {
			var i, name, data,
				elem = this[ 0 ],
				attrs = elem && elem.attributes;
	
			// Gets all values
			if ( key === undefined ) {
				if ( this.length ) {
					data = dataUser.get( elem );
	
					if ( elem.nodeType === 1 && !dataPriv.get( elem, "hasDataAttrs" ) ) {
						i = attrs.length;
						while ( i-- ) {
	
							// Support: IE11+
							// The attrs elements can be null (#14894)
							if ( attrs[ i ] ) {
								name = attrs[ i ].name;
								if ( name.indexOf( "data-" ) === 0 ) {
									name = jQuery.camelCase( name.slice( 5 ) );
									dataAttr( elem, name, data[ name ] );
								}
							}
						}
						dataPriv.set( elem, "hasDataAttrs", true );
					}
				}
	
				return data;
			}
	
			// Sets multiple values
			if ( typeof key === "object" ) {
				return this.each( function() {
					dataUser.set( this, key );
				} );
			}
	
			return access( this, function( value ) {
				var data, camelKey;
	
				// The calling jQuery object (element matches) is not empty
				// (and therefore has an element appears at this[ 0 ]) and the
				// `value` parameter was not undefined. An empty jQuery object
				// will result in `undefined` for elem = this[ 0 ] which will
				// throw an exception if an attempt to read a data cache is made.
				if ( elem && value === undefined ) {
	
					// Attempt to get data from the cache
					// with the key as-is
					data = dataUser.get( elem, key ) ||
	
						// Try to find dashed key if it exists (gh-2779)
						// This is for 2.2.x only
						dataUser.get( elem, key.replace( rmultiDash, "-$&" ).toLowerCase() );
	
					if ( data !== undefined ) {
						return data;
					}
	
					camelKey = jQuery.camelCase( key );
	
					// Attempt to get data from the cache
					// with the key camelized
					data = dataUser.get( elem, camelKey );
					if ( data !== undefined ) {
						return data;
					}
	
					// Attempt to "discover" the data in
					// HTML5 custom data-* attrs
					data = dataAttr( elem, camelKey, undefined );
					if ( data !== undefined ) {
						return data;
					}
	
					// We tried really hard, but the data doesn't exist.
					return;
				}
	
				// Set the data...
				camelKey = jQuery.camelCase( key );
				this.each( function() {
	
					// First, attempt to store a copy or reference of any
					// data that might've been store with a camelCased key.
					var data = dataUser.get( this, camelKey );
	
					// For HTML5 data-* attribute interop, we have to
					// store property names with dashes in a camelCase form.
					// This might not apply to all properties...*
					dataUser.set( this, camelKey, value );
	
					// *... In the case of properties that might _actually_
					// have dashes, we need to also store a copy of that
					// unchanged property.
					if ( key.indexOf( "-" ) > -1 && data !== undefined ) {
						dataUser.set( this, key, value );
					}
				} );
			}, null, value, arguments.length > 1, null, true );
		},
	
		removeData: function( key ) {
			return this.each( function() {
				dataUser.remove( this, key );
			} );
		}
	} );
	
	
	jQuery.extend( {
		queue: function( elem, type, data ) {
			var queue;
	
			if ( elem ) {
				type = ( type || "fx" ) + "queue";
				queue = dataPriv.get( elem, type );
	
				// Speed up dequeue by getting out quickly if this is just a lookup
				if ( data ) {
					if ( !queue || jQuery.isArray( data ) ) {
						queue = dataPriv.access( elem, type, jQuery.makeArray( data ) );
					} else {
						queue.push( data );
					}
				}
				return queue || [];
			}
		},
	
		dequeue: function( elem, type ) {
			type = type || "fx";
	
			var queue = jQuery.queue( elem, type ),
				startLength = queue.length,
				fn = queue.shift(),
				hooks = jQuery._queueHooks( elem, type ),
				next = function() {
					jQuery.dequeue( elem, type );
				};
	
			// If the fx queue is dequeued, always remove the progress sentinel
			if ( fn === "inprogress" ) {
				fn = queue.shift();
				startLength--;
			}
	
			if ( fn ) {
	
				// Add a progress sentinel to prevent the fx queue from being
				// automatically dequeued
				if ( type === "fx" ) {
					queue.unshift( "inprogress" );
				}
	
				// Clear up the last queue stop function
				delete hooks.stop;
				fn.call( elem, next, hooks );
			}
	
			if ( !startLength && hooks ) {
				hooks.empty.fire();
			}
		},
	
		// Not public - generate a queueHooks object, or return the current one
		_queueHooks: function( elem, type ) {
			var key = type + "queueHooks";
			return dataPriv.get( elem, key ) || dataPriv.access( elem, key, {
				empty: jQuery.Callbacks( "once memory" ).add( function() {
					dataPriv.remove( elem, [ type + "queue", key ] );
				} )
			} );
		}
	} );
	
	jQuery.fn.extend( {
		queue: function( type, data ) {
			var setter = 2;
	
			if ( typeof type !== "string" ) {
				data = type;
				type = "fx";
				setter--;
			}
	
			if ( arguments.length < setter ) {
				return jQuery.queue( this[ 0 ], type );
			}
	
			return data === undefined ?
				this :
				this.each( function() {
					var queue = jQuery.queue( this, type, data );
	
					// Ensure a hooks for this queue
					jQuery._queueHooks( this, type );
	
					if ( type === "fx" && queue[ 0 ] !== "inprogress" ) {
						jQuery.dequeue( this, type );
					}
				} );
		},
		dequeue: function( type ) {
			return this.each( function() {
				jQuery.dequeue( this, type );
			} );
		},
		clearQueue: function( type ) {
			return this.queue( type || "fx", [] );
		},
	
		// Get a promise resolved when queues of a certain type
		// are emptied (fx is the type by default)
		promise: function( type, obj ) {
			var tmp,
				count = 1,
				defer = jQuery.Deferred(),
				elements = this,
				i = this.length,
				resolve = function() {
					if ( !( --count ) ) {
						defer.resolveWith( elements, [ elements ] );
					}
				};
	
			if ( typeof type !== "string" ) {
				obj = type;
				type = undefined;
			}
			type = type || "fx";
	
			while ( i-- ) {
				tmp = dataPriv.get( elements[ i ], type + "queueHooks" );
				if ( tmp && tmp.empty ) {
					count++;
					tmp.empty.add( resolve );
				}
			}
			resolve();
			return defer.promise( obj );
		}
	} );
	var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;
	
	var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );
	
	
	var cssExpand = [ "Top", "Right", "Bottom", "Left" ];
	
	var isHidden = function( elem, el ) {
	
			// isHidden might be called from jQuery#filter function;
			// in that case, element will be second argument
			elem = el || elem;
			return jQuery.css( elem, "display" ) === "none" ||
				!jQuery.contains( elem.ownerDocument, elem );
		};
	
	
	
	function adjustCSS( elem, prop, valueParts, tween ) {
		var adjusted,
			scale = 1,
			maxIterations = 20,
			currentValue = tween ?
				function() { return tween.cur(); } :
				function() { return jQuery.css( elem, prop, "" ); },
			initial = currentValue(),
			unit = valueParts && valueParts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),
	
			// Starting value computation is required for potential unit mismatches
			initialInUnit = ( jQuery.cssNumber[ prop ] || unit !== "px" && +initial ) &&
				rcssNum.exec( jQuery.css( elem, prop ) );
	
		if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {
	
			// Trust units reported by jQuery.css
			unit = unit || initialInUnit[ 3 ];
	
			// Make sure we update the tween properties later on
			valueParts = valueParts || [];
	
			// Iteratively approximate from a nonzero starting point
			initialInUnit = +initial || 1;
	
			do {
	
				// If previous iteration zeroed out, double until we get *something*.
				// Use string for doubling so we don't accidentally see scale as unchanged below
				scale = scale || ".5";
	
				// Adjust and apply
				initialInUnit = initialInUnit / scale;
				jQuery.style( elem, prop, initialInUnit + unit );
	
			// Update scale, tolerating zero or NaN from tween.cur()
			// Break the loop if scale is unchanged or perfect, or if we've just had enough.
			} while (
				scale !== ( scale = currentValue() / initial ) && scale !== 1 && --maxIterations
			);
		}
	
		if ( valueParts ) {
			initialInUnit = +initialInUnit || +initial || 0;
	
			// Apply relative offset (+=/-=) if specified
			adjusted = valueParts[ 1 ] ?
				initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
				+valueParts[ 2 ];
			if ( tween ) {
				tween.unit = unit;
				tween.start = initialInUnit;
				tween.end = adjusted;
			}
		}
		return adjusted;
	}
	var rcheckableType = ( /^(?:checkbox|radio)$/i );
	
	var rtagName = ( /<([\w:-]+)/ );
	
	var rscriptType = ( /^$|\/(?:java|ecma)script/i );
	
	
	
	// We have to close these tags to support XHTML (#13200)
	var wrapMap = {
	
		// Support: IE9
		option: [ 1, "<select multiple='multiple'>", "</select>" ],
	
		// XHTML parsers do not magically insert elements in the
		// same way that tag soup parsers do. So we cannot shorten
		// this by omitting <tbody> or other required elements.
		thead: [ 1, "<table>", "</table>" ],
		col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
	
		_default: [ 0, "", "" ]
	};
	
	// Support: IE9
	wrapMap.optgroup = wrapMap.option;
	
	wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
	wrapMap.th = wrapMap.td;
	
	
	function getAll( context, tag ) {
	
		// Support: IE9-11+
		// Use typeof to avoid zero-argument method invocation on host objects (#15151)
		var ret = typeof context.getElementsByTagName !== "undefined" ?
				context.getElementsByTagName( tag || "*" ) :
				typeof context.querySelectorAll !== "undefined" ?
					context.querySelectorAll( tag || "*" ) :
				[];
	
		return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
			jQuery.merge( [ context ], ret ) :
			ret;
	}
	
	
	// Mark scripts as having already been evaluated
	function setGlobalEval( elems, refElements ) {
		var i = 0,
			l = elems.length;
	
		for ( ; i < l; i++ ) {
			dataPriv.set(
				elems[ i ],
				"globalEval",
				!refElements || dataPriv.get( refElements[ i ], "globalEval" )
			);
		}
	}
	
	
	var rhtml = /<|&#?\w+;/;
	
	function buildFragment( elems, context, scripts, selection, ignored ) {
		var elem, tmp, tag, wrap, contains, j,
			fragment = context.createDocumentFragment(),
			nodes = [],
			i = 0,
			l = elems.length;
	
		for ( ; i < l; i++ ) {
			elem = elems[ i ];
	
			if ( elem || elem === 0 ) {
	
				// Add nodes directly
				if ( jQuery.type( elem ) === "object" ) {
	
					// Support: Android<4.1, PhantomJS<2
					// push.apply(_, arraylike) throws on ancient WebKit
					jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );
	
				// Convert non-html into a text node
				} else if ( !rhtml.test( elem ) ) {
					nodes.push( context.createTextNode( elem ) );
	
				// Convert html into DOM nodes
				} else {
					tmp = tmp || fragment.appendChild( context.createElement( "div" ) );
	
					// Deserialize a standard representation
					tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
					wrap = wrapMap[ tag ] || wrapMap._default;
					tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];
	
					// Descend through wrappers to the right content
					j = wrap[ 0 ];
					while ( j-- ) {
						tmp = tmp.lastChild;
					}
	
					// Support: Android<4.1, PhantomJS<2
					// push.apply(_, arraylike) throws on ancient WebKit
					jQuery.merge( nodes, tmp.childNodes );
	
					// Remember the top-level container
					tmp = fragment.firstChild;
	
					// Ensure the created nodes are orphaned (#12392)
					tmp.textContent = "";
				}
			}
		}
	
		// Remove wrapper from fragment
		fragment.textContent = "";
	
		i = 0;
		while ( ( elem = nodes[ i++ ] ) ) {
	
			// Skip elements already in the context collection (trac-4087)
			if ( selection && jQuery.inArray( elem, selection ) > -1 ) {
				if ( ignored ) {
					ignored.push( elem );
				}
				continue;
			}
	
			contains = jQuery.contains( elem.ownerDocument, elem );
	
			// Append to fragment
			tmp = getAll( fragment.appendChild( elem ), "script" );
	
			// Preserve script evaluation history
			if ( contains ) {
				setGlobalEval( tmp );
			}
	
			// Capture executables
			if ( scripts ) {
				j = 0;
				while ( ( elem = tmp[ j++ ] ) ) {
					if ( rscriptType.test( elem.type || "" ) ) {
						scripts.push( elem );
					}
				}
			}
		}
	
		return fragment;
	}
	
	
	( function() {
		var fragment = document.createDocumentFragment(),
			div = fragment.appendChild( document.createElement( "div" ) ),
			input = document.createElement( "input" );
	
		// Support: Android 4.0-4.3, Safari<=5.1
		// Check state lost if the name is set (#11217)
		// Support: Windows Web Apps (WWA)
		// `name` and `type` must use .setAttribute for WWA (#14901)
		input.setAttribute( "type", "radio" );
		input.setAttribute( "checked", "checked" );
		input.setAttribute( "name", "t" );
	
		div.appendChild( input );
	
		// Support: Safari<=5.1, Android<4.2
		// Older WebKit doesn't clone checked state correctly in fragments
		support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;
	
		// Support: IE<=11+
		// Make sure textarea (and checkbox) defaultValue is properly cloned
		div.innerHTML = "<textarea>x</textarea>";
		support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;
	} )();
	
	
	var
		rkeyEvent = /^key/,
		rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
		rtypenamespace = /^([^.]*)(?:\.(.+)|)/;
	
	function returnTrue() {
		return true;
	}
	
	function returnFalse() {
		return false;
	}
	
	// Support: IE9
	// See #13393 for more info
	function safeActiveElement() {
		try {
			return document.activeElement;
		} catch ( err ) { }
	}
	
	function on( elem, types, selector, data, fn, one ) {
		var origFn, type;
	
		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {
	
			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) {
	
				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				on( elem, type, selector, data, types[ type ], one );
			}
			return elem;
		}
	
		if ( data == null && fn == null ) {
	
			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {
	
				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {
	
				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return elem;
		}
	
		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {
	
				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};
	
			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return elem.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		} );
	}
	
	/*
	 * Helper functions for managing events -- not part of the public interface.
	 * Props to Dean Edwards' addEvent library for many of the ideas.
	 */
	jQuery.event = {
	
		global: {},
	
		add: function( elem, types, handler, data, selector ) {
	
			var handleObjIn, eventHandle, tmp,
				events, t, handleObj,
				special, handlers, type, namespaces, origType,
				elemData = dataPriv.get( elem );
	
			// Don't attach events to noData or text/comment nodes (but allow plain objects)
			if ( !elemData ) {
				return;
			}
	
			// Caller can pass in an object of custom data in lieu of the handler
			if ( handler.handler ) {
				handleObjIn = handler;
				handler = handleObjIn.handler;
				selector = handleObjIn.selector;
			}
	
			// Make sure that the handler has a unique ID, used to find/remove it later
			if ( !handler.guid ) {
				handler.guid = jQuery.guid++;
			}
	
			// Init the element's event structure and main handler, if this is the first
			if ( !( events = elemData.events ) ) {
				events = elemData.events = {};
			}
			if ( !( eventHandle = elemData.handle ) ) {
				eventHandle = elemData.handle = function( e ) {
	
					// Discard the second event of a jQuery.event.trigger() and
					// when an event is called after a page has unloaded
					return typeof jQuery !== "undefined" && jQuery.event.triggered !== e.type ?
						jQuery.event.dispatch.apply( elem, arguments ) : undefined;
				};
			}
	
			// Handle multiple events separated by a space
			types = ( types || "" ).match( rnotwhite ) || [ "" ];
			t = types.length;
			while ( t-- ) {
				tmp = rtypenamespace.exec( types[ t ] ) || [];
				type = origType = tmp[ 1 ];
				namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();
	
				// There *must* be a type, no attaching namespace-only handlers
				if ( !type ) {
					continue;
				}
	
				// If event changes its type, use the special event handlers for the changed type
				special = jQuery.event.special[ type ] || {};
	
				// If selector defined, determine special event api type, otherwise given type
				type = ( selector ? special.delegateType : special.bindType ) || type;
	
				// Update special based on newly reset type
				special = jQuery.event.special[ type ] || {};
	
				// handleObj is passed to all event handlers
				handleObj = jQuery.extend( {
					type: type,
					origType: origType,
					data: data,
					handler: handler,
					guid: handler.guid,
					selector: selector,
					needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
					namespace: namespaces.join( "." )
				}, handleObjIn );
	
				// Init the event handler queue if we're the first
				if ( !( handlers = events[ type ] ) ) {
					handlers = events[ type ] = [];
					handlers.delegateCount = 0;
	
					// Only use addEventListener if the special events handler returns false
					if ( !special.setup ||
						special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
	
						if ( elem.addEventListener ) {
							elem.addEventListener( type, eventHandle );
						}
					}
				}
	
				if ( special.add ) {
					special.add.call( elem, handleObj );
	
					if ( !handleObj.handler.guid ) {
						handleObj.handler.guid = handler.guid;
					}
				}
	
				// Add to the element's handler list, delegates in front
				if ( selector ) {
					handlers.splice( handlers.delegateCount++, 0, handleObj );
				} else {
					handlers.push( handleObj );
				}
	
				// Keep track of which events have ever been used, for event optimization
				jQuery.event.global[ type ] = true;
			}
	
		},
	
		// Detach an event or set of events from an element
		remove: function( elem, types, handler, selector, mappedTypes ) {
	
			var j, origCount, tmp,
				events, t, handleObj,
				special, handlers, type, namespaces, origType,
				elemData = dataPriv.hasData( elem ) && dataPriv.get( elem );
	
			if ( !elemData || !( events = elemData.events ) ) {
				return;
			}
	
			// Once for each type.namespace in types; type may be omitted
			types = ( types || "" ).match( rnotwhite ) || [ "" ];
			t = types.length;
			while ( t-- ) {
				tmp = rtypenamespace.exec( types[ t ] ) || [];
				type = origType = tmp[ 1 ];
				namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();
	
				// Unbind all events (on this namespace, if provided) for the element
				if ( !type ) {
					for ( type in events ) {
						jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
					}
					continue;
				}
	
				special = jQuery.event.special[ type ] || {};
				type = ( selector ? special.delegateType : special.bindType ) || type;
				handlers = events[ type ] || [];
				tmp = tmp[ 2 ] &&
					new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );
	
				// Remove matching events
				origCount = j = handlers.length;
				while ( j-- ) {
					handleObj = handlers[ j ];
	
					if ( ( mappedTypes || origType === handleObj.origType ) &&
						( !handler || handler.guid === handleObj.guid ) &&
						( !tmp || tmp.test( handleObj.namespace ) ) &&
						( !selector || selector === handleObj.selector ||
							selector === "**" && handleObj.selector ) ) {
						handlers.splice( j, 1 );
	
						if ( handleObj.selector ) {
							handlers.delegateCount--;
						}
						if ( special.remove ) {
							special.remove.call( elem, handleObj );
						}
					}
				}
	
				// Remove generic event handler if we removed something and no more handlers exist
				// (avoids potential for endless recursion during removal of special event handlers)
				if ( origCount && !handlers.length ) {
					if ( !special.teardown ||
						special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
	
						jQuery.removeEvent( elem, type, elemData.handle );
					}
	
					delete events[ type ];
				}
			}
	
			// Remove data and the expando if it's no longer used
			if ( jQuery.isEmptyObject( events ) ) {
				dataPriv.remove( elem, "handle events" );
			}
		},
	
		dispatch: function( event ) {
	
			// Make a writable jQuery.Event from the native event object
			event = jQuery.event.fix( event );
	
			var i, j, ret, matched, handleObj,
				handlerQueue = [],
				args = slice.call( arguments ),
				handlers = ( dataPriv.get( this, "events" ) || {} )[ event.type ] || [],
				special = jQuery.event.special[ event.type ] || {};
	
			// Use the fix-ed jQuery.Event rather than the (read-only) native event
			args[ 0 ] = event;
			event.delegateTarget = this;
	
			// Call the preDispatch hook for the mapped type, and let it bail if desired
			if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
				return;
			}
	
			// Determine handlers
			handlerQueue = jQuery.event.handlers.call( this, event, handlers );
	
			// Run delegates first; they may want to stop propagation beneath us
			i = 0;
			while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
				event.currentTarget = matched.elem;
	
				j = 0;
				while ( ( handleObj = matched.handlers[ j++ ] ) &&
					!event.isImmediatePropagationStopped() ) {
	
					// Triggered event must either 1) have no namespace, or 2) have namespace(s)
					// a subset or equal to those in the bound event (both can have no namespace).
					if ( !event.rnamespace || event.rnamespace.test( handleObj.namespace ) ) {
	
						event.handleObj = handleObj;
						event.data = handleObj.data;
	
						ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
							handleObj.handler ).apply( matched.elem, args );
	
						if ( ret !== undefined ) {
							if ( ( event.result = ret ) === false ) {
								event.preventDefault();
								event.stopPropagation();
							}
						}
					}
				}
			}
	
			// Call the postDispatch hook for the mapped type
			if ( special.postDispatch ) {
				special.postDispatch.call( this, event );
			}
	
			return event.result;
		},
	
		handlers: function( event, handlers ) {
			var i, matches, sel, handleObj,
				handlerQueue = [],
				delegateCount = handlers.delegateCount,
				cur = event.target;
	
			// Support (at least): Chrome, IE9
			// Find delegate handlers
			// Black-hole SVG <use> instance trees (#13180)
			//
			// Support: Firefox<=42+
			// Avoid non-left-click in FF but don't block IE radio events (#3861, gh-2343)
			if ( delegateCount && cur.nodeType &&
				( event.type !== "click" || isNaN( event.button ) || event.button < 1 ) ) {
	
				for ( ; cur !== this; cur = cur.parentNode || this ) {
	
					// Don't check non-elements (#13208)
					// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
					if ( cur.nodeType === 1 && ( cur.disabled !== true || event.type !== "click" ) ) {
						matches = [];
						for ( i = 0; i < delegateCount; i++ ) {
							handleObj = handlers[ i ];
	
							// Don't conflict with Object.prototype properties (#13203)
							sel = handleObj.selector + " ";
	
							if ( matches[ sel ] === undefined ) {
								matches[ sel ] = handleObj.needsContext ?
									jQuery( sel, this ).index( cur ) > -1 :
									jQuery.find( sel, this, null, [ cur ] ).length;
							}
							if ( matches[ sel ] ) {
								matches.push( handleObj );
							}
						}
						if ( matches.length ) {
							handlerQueue.push( { elem: cur, handlers: matches } );
						}
					}
				}
			}
	
			// Add the remaining (directly-bound) handlers
			if ( delegateCount < handlers.length ) {
				handlerQueue.push( { elem: this, handlers: handlers.slice( delegateCount ) } );
			}
	
			return handlerQueue;
		},
	
		// Includes some event props shared by KeyEvent and MouseEvent
		props: ( "altKey bubbles cancelable ctrlKey currentTarget detail eventPhase " +
			"metaKey relatedTarget shiftKey target timeStamp view which" ).split( " " ),
	
		fixHooks: {},
	
		keyHooks: {
			props: "char charCode key keyCode".split( " " ),
			filter: function( event, original ) {
	
				// Add which for key events
				if ( event.which == null ) {
					event.which = original.charCode != null ? original.charCode : original.keyCode;
				}
	
				return event;
			}
		},
	
		mouseHooks: {
			props: ( "button buttons clientX clientY offsetX offsetY pageX pageY " +
				"screenX screenY toElement" ).split( " " ),
			filter: function( event, original ) {
				var eventDoc, doc, body,
					button = original.button;
	
				// Calculate pageX/Y if missing and clientX/Y available
				if ( event.pageX == null && original.clientX != null ) {
					eventDoc = event.target.ownerDocument || document;
					doc = eventDoc.documentElement;
					body = eventDoc.body;
	
					event.pageX = original.clientX +
						( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) -
						( doc && doc.clientLeft || body && body.clientLeft || 0 );
					event.pageY = original.clientY +
						( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) -
						( doc && doc.clientTop  || body && body.clientTop  || 0 );
				}
	
				// Add which for click: 1 === left; 2 === middle; 3 === right
				// Note: button is not normalized, so don't use it
				if ( !event.which && button !== undefined ) {
					event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
				}
	
				return event;
			}
		},
	
		fix: function( event ) {
			if ( event[ jQuery.expando ] ) {
				return event;
			}
	
			// Create a writable copy of the event object and normalize some properties
			var i, prop, copy,
				type = event.type,
				originalEvent = event,
				fixHook = this.fixHooks[ type ];
	
			if ( !fixHook ) {
				this.fixHooks[ type ] = fixHook =
					rmouseEvent.test( type ) ? this.mouseHooks :
					rkeyEvent.test( type ) ? this.keyHooks :
					{};
			}
			copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;
	
			event = new jQuery.Event( originalEvent );
	
			i = copy.length;
			while ( i-- ) {
				prop = copy[ i ];
				event[ prop ] = originalEvent[ prop ];
			}
	
			// Support: Cordova 2.5 (WebKit) (#13255)
			// All events should have a target; Cordova deviceready doesn't
			if ( !event.target ) {
				event.target = document;
			}
	
			// Support: Safari 6.0+, Chrome<28
			// Target should not be a text node (#504, #13143)
			if ( event.target.nodeType === 3 ) {
				event.target = event.target.parentNode;
			}
	
			return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
		},
	
		special: {
			load: {
	
				// Prevent triggered image.load events from bubbling to window.load
				noBubble: true
			},
			focus: {
	
				// Fire native event if possible so blur/focus sequence is correct
				trigger: function() {
					if ( this !== safeActiveElement() && this.focus ) {
						this.focus();
						return false;
					}
				},
				delegateType: "focusin"
			},
			blur: {
				trigger: function() {
					if ( this === safeActiveElement() && this.blur ) {
						this.blur();
						return false;
					}
				},
				delegateType: "focusout"
			},
			click: {
	
				// For checkbox, fire native event so checked state will be right
				trigger: function() {
					if ( this.type === "checkbox" && this.click && jQuery.nodeName( this, "input" ) ) {
						this.click();
						return false;
					}
				},
	
				// For cross-browser consistency, don't fire native .click() on links
				_default: function( event ) {
					return jQuery.nodeName( event.target, "a" );
				}
			},
	
			beforeunload: {
				postDispatch: function( event ) {
	
					// Support: Firefox 20+
					// Firefox doesn't alert if the returnValue field is not set.
					if ( event.result !== undefined && event.originalEvent ) {
						event.originalEvent.returnValue = event.result;
					}
				}
			}
		}
	};
	
	jQuery.removeEvent = function( elem, type, handle ) {
	
		// This "if" is needed for plain objects
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle );
		}
	};
	
	jQuery.Event = function( src, props ) {
	
		// Allow instantiation without the 'new' keyword
		if ( !( this instanceof jQuery.Event ) ) {
			return new jQuery.Event( src, props );
		}
	
		// Event object
		if ( src && src.type ) {
			this.originalEvent = src;
			this.type = src.type;
	
			// Events bubbling up the document may have been marked as prevented
			// by a handler lower down the tree; reflect the correct value.
			this.isDefaultPrevented = src.defaultPrevented ||
					src.defaultPrevented === undefined &&
	
					// Support: Android<4.0
					src.returnValue === false ?
				returnTrue :
				returnFalse;
	
		// Event type
		} else {
			this.type = src;
		}
	
		// Put explicitly provided properties onto the event object
		if ( props ) {
			jQuery.extend( this, props );
		}
	
		// Create a timestamp if incoming event doesn't have one
		this.timeStamp = src && src.timeStamp || jQuery.now();
	
		// Mark it as fixed
		this[ jQuery.expando ] = true;
	};
	
	// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
	// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
	jQuery.Event.prototype = {
		constructor: jQuery.Event,
		isDefaultPrevented: returnFalse,
		isPropagationStopped: returnFalse,
		isImmediatePropagationStopped: returnFalse,
	
		preventDefault: function() {
			var e = this.originalEvent;
	
			this.isDefaultPrevented = returnTrue;
	
			if ( e ) {
				e.preventDefault();
			}
		},
		stopPropagation: function() {
			var e = this.originalEvent;
	
			this.isPropagationStopped = returnTrue;
	
			if ( e ) {
				e.stopPropagation();
			}
		},
		stopImmediatePropagation: function() {
			var e = this.originalEvent;
	
			this.isImmediatePropagationStopped = returnTrue;
	
			if ( e ) {
				e.stopImmediatePropagation();
			}
	
			this.stopPropagation();
		}
	};
	
	// Create mouseenter/leave events using mouseover/out and event-time checks
	// so that event delegation works in jQuery.
	// Do the same for pointerenter/pointerleave and pointerover/pointerout
	//
	// Support: Safari 7 only
	// Safari sends mouseenter too often; see:
	// https://code.google.com/p/chromium/issues/detail?id=470258
	// for the description of the bug (it existed in older Chrome versions as well).
	jQuery.each( {
		mouseenter: "mouseover",
		mouseleave: "mouseout",
		pointerenter: "pointerover",
		pointerleave: "pointerout"
	}, function( orig, fix ) {
		jQuery.event.special[ orig ] = {
			delegateType: fix,
			bindType: fix,
	
			handle: function( event ) {
				var ret,
					target = this,
					related = event.relatedTarget,
					handleObj = event.handleObj;
	
				// For mouseenter/leave call the handler if related is outside the target.
				// NB: No relatedTarget if the mouse left/entered the browser window
				if ( !related || ( related !== target && !jQuery.contains( target, related ) ) ) {
					event.type = handleObj.origType;
					ret = handleObj.handler.apply( this, arguments );
					event.type = fix;
				}
				return ret;
			}
		};
	} );
	
	jQuery.fn.extend( {
		on: function( types, selector, data, fn ) {
			return on( this, types, selector, data, fn );
		},
		one: function( types, selector, data, fn ) {
			return on( this, types, selector, data, fn, 1 );
		},
		off: function( types, selector, fn ) {
			var handleObj, type;
			if ( types && types.preventDefault && types.handleObj ) {
	
				// ( event )  dispatched jQuery.Event
				handleObj = types.handleObj;
				jQuery( types.delegateTarget ).off(
					handleObj.namespace ?
						handleObj.origType + "." + handleObj.namespace :
						handleObj.origType,
					handleObj.selector,
					handleObj.handler
				);
				return this;
			}
			if ( typeof types === "object" ) {
	
				// ( types-object [, selector] )
				for ( type in types ) {
					this.off( type, selector, types[ type ] );
				}
				return this;
			}
			if ( selector === false || typeof selector === "function" ) {
	
				// ( types [, fn] )
				fn = selector;
				selector = undefined;
			}
			if ( fn === false ) {
				fn = returnFalse;
			}
			return this.each( function() {
				jQuery.event.remove( this, types, fn, selector );
			} );
		}
	} );
	
	
	var
		rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi,
	
		// Support: IE 10-11, Edge 10240+
		// In IE/Edge using regex groups here causes severe slowdowns.
		// See https://connect.microsoft.com/IE/feedback/details/1736512/
		rnoInnerhtml = /<script|<style|<link/i,
	
		// checked="checked" or checked
		rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
		rscriptTypeMasked = /^true\/(.*)/,
		rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;
	
	// Manipulating tables requires a tbody
	function manipulationTarget( elem, content ) {
		return jQuery.nodeName( elem, "table" ) &&
			jQuery.nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ?
	
			elem.getElementsByTagName( "tbody" )[ 0 ] ||
				elem.appendChild( elem.ownerDocument.createElement( "tbody" ) ) :
			elem;
	}
	
	// Replace/restore the type attribute of script elements for safe DOM manipulation
	function disableScript( elem ) {
		elem.type = ( elem.getAttribute( "type" ) !== null ) + "/" + elem.type;
		return elem;
	}
	function restoreScript( elem ) {
		var match = rscriptTypeMasked.exec( elem.type );
	
		if ( match ) {
			elem.type = match[ 1 ];
		} else {
			elem.removeAttribute( "type" );
		}
	
		return elem;
	}
	
	function cloneCopyEvent( src, dest ) {
		var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;
	
		if ( dest.nodeType !== 1 ) {
			return;
		}
	
		// 1. Copy private data: events, handlers, etc.
		if ( dataPriv.hasData( src ) ) {
			pdataOld = dataPriv.access( src );
			pdataCur = dataPriv.set( dest, pdataOld );
			events = pdataOld.events;
	
			if ( events ) {
				delete pdataCur.handle;
				pdataCur.events = {};
	
				for ( type in events ) {
					for ( i = 0, l = events[ type ].length; i < l; i++ ) {
						jQuery.event.add( dest, type, events[ type ][ i ] );
					}
				}
			}
		}
	
		// 2. Copy user data
		if ( dataUser.hasData( src ) ) {
			udataOld = dataUser.access( src );
			udataCur = jQuery.extend( {}, udataOld );
	
			dataUser.set( dest, udataCur );
		}
	}
	
	// Fix IE bugs, see support tests
	function fixInput( src, dest ) {
		var nodeName = dest.nodeName.toLowerCase();
	
		// Fails to persist the checked state of a cloned checkbox or radio button.
		if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
			dest.checked = src.checked;
	
		// Fails to return the selected option to the default selected state when cloning options
		} else if ( nodeName === "input" || nodeName === "textarea" ) {
			dest.defaultValue = src.defaultValue;
		}
	}
	
	function domManip( collection, args, callback, ignored ) {
	
		// Flatten any nested arrays
		args = concat.apply( [], args );
	
		var fragment, first, scripts, hasScripts, node, doc,
			i = 0,
			l = collection.length,
			iNoClone = l - 1,
			value = args[ 0 ],
			isFunction = jQuery.isFunction( value );
	
		// We can't cloneNode fragments that contain checked, in WebKit
		if ( isFunction ||
				( l > 1 && typeof value === "string" &&
					!support.checkClone && rchecked.test( value ) ) ) {
			return collection.each( function( index ) {
				var self = collection.eq( index );
				if ( isFunction ) {
					args[ 0 ] = value.call( this, index, self.html() );
				}
				domManip( self, args, callback, ignored );
			} );
		}
	
		if ( l ) {
			fragment = buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored );
			first = fragment.firstChild;
	
			if ( fragment.childNodes.length === 1 ) {
				fragment = first;
			}
	
			// Require either new content or an interest in ignored elements to invoke the callback
			if ( first || ignored ) {
				scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
				hasScripts = scripts.length;
	
				// Use the original fragment for the last item
				// instead of the first because it can end up
				// being emptied incorrectly in certain situations (#8070).
				for ( ; i < l; i++ ) {
					node = fragment;
	
					if ( i !== iNoClone ) {
						node = jQuery.clone( node, true, true );
	
						// Keep references to cloned scripts for later restoration
						if ( hasScripts ) {
	
							// Support: Android<4.1, PhantomJS<2
							// push.apply(_, arraylike) throws on ancient WebKit
							jQuery.merge( scripts, getAll( node, "script" ) );
						}
					}
	
					callback.call( collection[ i ], node, i );
				}
	
				if ( hasScripts ) {
					doc = scripts[ scripts.length - 1 ].ownerDocument;
	
					// Reenable scripts
					jQuery.map( scripts, restoreScript );
	
					// Evaluate executable scripts on first document insertion
					for ( i = 0; i < hasScripts; i++ ) {
						node = scripts[ i ];
						if ( rscriptType.test( node.type || "" ) &&
							!dataPriv.access( node, "globalEval" ) &&
							jQuery.contains( doc, node ) ) {
	
							if ( node.src ) {
	
								// Optional AJAX dependency, but won't run scripts if not present
								if ( jQuery._evalUrl ) {
									jQuery._evalUrl( node.src );
								}
							} else {
								jQuery.globalEval( node.textContent.replace( rcleanScript, "" ) );
							}
						}
					}
				}
			}
		}
	
		return collection;
	}
	
	function remove( elem, selector, keepData ) {
		var node,
			nodes = selector ? jQuery.filter( selector, elem ) : elem,
			i = 0;
	
		for ( ; ( node = nodes[ i ] ) != null; i++ ) {
			if ( !keepData && node.nodeType === 1 ) {
				jQuery.cleanData( getAll( node ) );
			}
	
			if ( node.parentNode ) {
				if ( keepData && jQuery.contains( node.ownerDocument, node ) ) {
					setGlobalEval( getAll( node, "script" ) );
				}
				node.parentNode.removeChild( node );
			}
		}
	
		return elem;
	}
	
	jQuery.extend( {
		htmlPrefilter: function( html ) {
			return html.replace( rxhtmlTag, "<$1></$2>" );
		},
	
		clone: function( elem, dataAndEvents, deepDataAndEvents ) {
			var i, l, srcElements, destElements,
				clone = elem.cloneNode( true ),
				inPage = jQuery.contains( elem.ownerDocument, elem );
	
			// Fix IE cloning issues
			if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
					!jQuery.isXMLDoc( elem ) ) {
	
				// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
				destElements = getAll( clone );
				srcElements = getAll( elem );
	
				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					fixInput( srcElements[ i ], destElements[ i ] );
				}
			}
	
			// Copy the events from the original to the clone
			if ( dataAndEvents ) {
				if ( deepDataAndEvents ) {
					srcElements = srcElements || getAll( elem );
					destElements = destElements || getAll( clone );
	
					for ( i = 0, l = srcElements.length; i < l; i++ ) {
						cloneCopyEvent( srcElements[ i ], destElements[ i ] );
					}
				} else {
					cloneCopyEvent( elem, clone );
				}
			}
	
			// Preserve script evaluation history
			destElements = getAll( clone, "script" );
			if ( destElements.length > 0 ) {
				setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
			}
	
			// Return the cloned set
			return clone;
		},
	
		cleanData: function( elems ) {
			var data, elem, type,
				special = jQuery.event.special,
				i = 0;
	
			for ( ; ( elem = elems[ i ] ) !== undefined; i++ ) {
				if ( acceptData( elem ) ) {
					if ( ( data = elem[ dataPriv.expando ] ) ) {
						if ( data.events ) {
							for ( type in data.events ) {
								if ( special[ type ] ) {
									jQuery.event.remove( elem, type );
	
								// This is a shortcut to avoid jQuery.event.remove's overhead
								} else {
									jQuery.removeEvent( elem, type, data.handle );
								}
							}
						}
	
						// Support: Chrome <= 35-45+
						// Assign undefined instead of using delete, see Data#remove
						elem[ dataPriv.expando ] = undefined;
					}
					if ( elem[ dataUser.expando ] ) {
	
						// Support: Chrome <= 35-45+
						// Assign undefined instead of using delete, see Data#remove
						elem[ dataUser.expando ] = undefined;
					}
				}
			}
		}
	} );
	
	jQuery.fn.extend( {
	
		// Keep domManip exposed until 3.0 (gh-2225)
		domManip: domManip,
	
		detach: function( selector ) {
			return remove( this, selector, true );
		},
	
		remove: function( selector ) {
			return remove( this, selector );
		},
	
		text: function( value ) {
			return access( this, function( value ) {
				return value === undefined ?
					jQuery.text( this ) :
					this.empty().each( function() {
						if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
							this.textContent = value;
						}
					} );
			}, null, value, arguments.length );
		},
	
		append: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
					var target = manipulationTarget( this, elem );
					target.appendChild( elem );
				}
			} );
		},
	
		prepend: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
					var target = manipulationTarget( this, elem );
					target.insertBefore( elem, target.firstChild );
				}
			} );
		},
	
		before: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.parentNode ) {
					this.parentNode.insertBefore( elem, this );
				}
			} );
		},
	
		after: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.parentNode ) {
					this.parentNode.insertBefore( elem, this.nextSibling );
				}
			} );
		},
	
		empty: function() {
			var elem,
				i = 0;
	
			for ( ; ( elem = this[ i ] ) != null; i++ ) {
				if ( elem.nodeType === 1 ) {
	
					// Prevent memory leaks
					jQuery.cleanData( getAll( elem, false ) );
	
					// Remove any remaining nodes
					elem.textContent = "";
				}
			}
	
			return this;
		},
	
		clone: function( dataAndEvents, deepDataAndEvents ) {
			dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
			deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;
	
			return this.map( function() {
				return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
			} );
		},
	
		html: function( value ) {
			return access( this, function( value ) {
				var elem = this[ 0 ] || {},
					i = 0,
					l = this.length;
	
				if ( value === undefined && elem.nodeType === 1 ) {
					return elem.innerHTML;
				}
	
				// See if we can take a shortcut and just use innerHTML
				if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
					!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {
	
					value = jQuery.htmlPrefilter( value );
	
					try {
						for ( ; i < l; i++ ) {
							elem = this[ i ] || {};
	
							// Remove element nodes and prevent memory leaks
							if ( elem.nodeType === 1 ) {
								jQuery.cleanData( getAll( elem, false ) );
								elem.innerHTML = value;
							}
						}
	
						elem = 0;
	
					// If using innerHTML throws an exception, use the fallback method
					} catch ( e ) {}
				}
	
				if ( elem ) {
					this.empty().append( value );
				}
			}, null, value, arguments.length );
		},
	
		replaceWith: function() {
			var ignored = [];
	
			// Make the changes, replacing each non-ignored context element with the new content
			return domManip( this, arguments, function( elem ) {
				var parent = this.parentNode;
	
				if ( jQuery.inArray( this, ignored ) < 0 ) {
					jQuery.cleanData( getAll( this ) );
					if ( parent ) {
						parent.replaceChild( elem, this );
					}
				}
	
			// Force callback invocation
			}, ignored );
		}
	} );
	
	jQuery.each( {
		appendTo: "append",
		prependTo: "prepend",
		insertBefore: "before",
		insertAfter: "after",
		replaceAll: "replaceWith"
	}, function( name, original ) {
		jQuery.fn[ name ] = function( selector ) {
			var elems,
				ret = [],
				insert = jQuery( selector ),
				last = insert.length - 1,
				i = 0;
	
			for ( ; i <= last; i++ ) {
				elems = i === last ? this : this.clone( true );
				jQuery( insert[ i ] )[ original ]( elems );
	
				// Support: QtWebKit
				// .get() because push.apply(_, arraylike) throws
				push.apply( ret, elems.get() );
			}
	
			return this.pushStack( ret );
		};
	} );
	
	
	var iframe,
		elemdisplay = {
	
			// Support: Firefox
			// We have to pre-define these values for FF (#10227)
			HTML: "block",
			BODY: "block"
		};
	
	/**
	 * Retrieve the actual display of a element
	 * @param {String} name nodeName of the element
	 * @param {Object} doc Document object
	 */
	
	// Called only from within defaultDisplay
	function actualDisplay( name, doc ) {
		var elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),
	
			display = jQuery.css( elem[ 0 ], "display" );
	
		// We don't have any data stored on the element,
		// so use "detach" method as fast way to get rid of the element
		elem.detach();
	
		return display;
	}
	
	/**
	 * Try to determine the default display value of an element
	 * @param {String} nodeName
	 */
	function defaultDisplay( nodeName ) {
		var doc = document,
			display = elemdisplay[ nodeName ];
	
		if ( !display ) {
			display = actualDisplay( nodeName, doc );
	
			// If the simple way fails, read from inside an iframe
			if ( display === "none" || !display ) {
	
				// Use the already-created iframe if possible
				iframe = ( iframe || jQuery( "<iframe frameborder='0' width='0' height='0'/>" ) )
					.appendTo( doc.documentElement );
	
				// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
				doc = iframe[ 0 ].contentDocument;
	
				// Support: IE
				doc.write();
				doc.close();
	
				display = actualDisplay( nodeName, doc );
				iframe.detach();
			}
	
			// Store the correct default display
			elemdisplay[ nodeName ] = display;
		}
	
		return display;
	}
	var rmargin = ( /^margin/ );
	
	var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );
	
	var getStyles = function( elem ) {
	
			// Support: IE<=11+, Firefox<=30+ (#15098, #14150)
			// IE throws on elements created in popups
			// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
			var view = elem.ownerDocument.defaultView;
	
			if ( !view || !view.opener ) {
				view = window;
			}
	
			return view.getComputedStyle( elem );
		};
	
	var swap = function( elem, options, callback, args ) {
		var ret, name,
			old = {};
	
		// Remember the old values, and insert the new ones
		for ( name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}
	
		ret = callback.apply( elem, args || [] );
	
		// Revert the old values
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}
	
		return ret;
	};
	
	
	var documentElement = document.documentElement;
	
	
	
	( function() {
		var pixelPositionVal, boxSizingReliableVal, pixelMarginRightVal, reliableMarginLeftVal,
			container = document.createElement( "div" ),
			div = document.createElement( "div" );
	
		// Finish early in limited (non-browser) environments
		if ( !div.style ) {
			return;
		}
	
		// Support: IE9-11+
		// Style of cloned element affects source element cloned (#8908)
		div.style.backgroundClip = "content-box";
		div.cloneNode( true ).style.backgroundClip = "";
		support.clearCloneStyle = div.style.backgroundClip === "content-box";
	
		container.style.cssText = "border:0;width:8px;height:0;top:0;left:-9999px;" +
			"padding:0;margin-top:1px;position:absolute";
		container.appendChild( div );
	
		// Executing both pixelPosition & boxSizingReliable tests require only one layout
		// so they're executed at the same time to save the second computation.
		function computeStyleTests() {
			div.style.cssText =
	
				// Support: Firefox<29, Android 2.3
				// Vendor-prefix box-sizing
				"-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;" +
				"position:relative;display:block;" +
				"margin:auto;border:1px;padding:1px;" +
				"top:1%;width:50%";
			div.innerHTML = "";
			documentElement.appendChild( container );
	
			var divStyle = window.getComputedStyle( div );
			pixelPositionVal = divStyle.top !== "1%";
			reliableMarginLeftVal = divStyle.marginLeft === "2px";
			boxSizingReliableVal = divStyle.width === "4px";
	
			// Support: Android 4.0 - 4.3 only
			// Some styles come back with percentage values, even though they shouldn't
			div.style.marginRight = "50%";
			pixelMarginRightVal = divStyle.marginRight === "4px";
	
			documentElement.removeChild( container );
		}
	
		jQuery.extend( support, {
			pixelPosition: function() {
	
				// This test is executed only once but we still do memoizing
				// since we can use the boxSizingReliable pre-computing.
				// No need to check if the test was already performed, though.
				computeStyleTests();
				return pixelPositionVal;
			},
			boxSizingReliable: function() {
				if ( boxSizingReliableVal == null ) {
					computeStyleTests();
				}
				return boxSizingReliableVal;
			},
			pixelMarginRight: function() {
	
				// Support: Android 4.0-4.3
				// We're checking for boxSizingReliableVal here instead of pixelMarginRightVal
				// since that compresses better and they're computed together anyway.
				if ( boxSizingReliableVal == null ) {
					computeStyleTests();
				}
				return pixelMarginRightVal;
			},
			reliableMarginLeft: function() {
	
				// Support: IE <=8 only, Android 4.0 - 4.3 only, Firefox <=3 - 37
				if ( boxSizingReliableVal == null ) {
					computeStyleTests();
				}
				return reliableMarginLeftVal;
			},
			reliableMarginRight: function() {
	
				// Support: Android 2.3
				// Check if div with explicit width and no margin-right incorrectly
				// gets computed margin-right based on width of container. (#3333)
				// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
				// This support function is only executed once so no memoizing is needed.
				var ret,
					marginDiv = div.appendChild( document.createElement( "div" ) );
	
				// Reset CSS: box-sizing; display; margin; border; padding
				marginDiv.style.cssText = div.style.cssText =
	
					// Support: Android 2.3
					// Vendor-prefix box-sizing
					"-webkit-box-sizing:content-box;box-sizing:content-box;" +
					"display:block;margin:0;border:0;padding:0";
				marginDiv.style.marginRight = marginDiv.style.width = "0";
				div.style.width = "1px";
				documentElement.appendChild( container );
	
				ret = !parseFloat( window.getComputedStyle( marginDiv ).marginRight );
	
				documentElement.removeChild( container );
				div.removeChild( marginDiv );
	
				return ret;
			}
		} );
	} )();
	
	
	function curCSS( elem, name, computed ) {
		var width, minWidth, maxWidth, ret,
			style = elem.style;
	
		computed = computed || getStyles( elem );
		ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined;
	
		// Support: Opera 12.1x only
		// Fall back to style even without computed
		// computed is undefined for elems on document fragments
		if ( ( ret === "" || ret === undefined ) && !jQuery.contains( elem.ownerDocument, elem ) ) {
			ret = jQuery.style( elem, name );
		}
	
		// Support: IE9
		// getPropertyValue is only needed for .css('filter') (#12537)
		if ( computed ) {
	
			// A tribute to the "awesome hack by Dean Edwards"
			// Android Browser returns percentage for some values,
			// but width seems to be reliably pixels.
			// This is against the CSSOM draft spec:
			// http://dev.w3.org/csswg/cssom/#resolved-values
			if ( !support.pixelMarginRight() && rnumnonpx.test( ret ) && rmargin.test( name ) ) {
	
				// Remember the original values
				width = style.width;
				minWidth = style.minWidth;
				maxWidth = style.maxWidth;
	
				// Put in the new values to get a computed value out
				style.minWidth = style.maxWidth = style.width = ret;
				ret = computed.width;
	
				// Revert the changed values
				style.width = width;
				style.minWidth = minWidth;
				style.maxWidth = maxWidth;
			}
		}
	
		return ret !== undefined ?
	
			// Support: IE9-11+
			// IE returns zIndex value as an integer.
			ret + "" :
			ret;
	}
	
	
	function addGetHookIf( conditionFn, hookFn ) {
	
		// Define the hook, we'll check on the first run if it's really needed.
		return {
			get: function() {
				if ( conditionFn() ) {
	
					// Hook not needed (or it's not possible to use it due
					// to missing dependency), remove it.
					delete this.get;
					return;
				}
	
				// Hook needed; redefine it so that the support test is not executed again.
				return ( this.get = hookFn ).apply( this, arguments );
			}
		};
	}
	
	
	var
	
		// Swappable if display is none or starts with table
		// except "table", "table-cell", or "table-caption"
		// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
		rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	
		cssShow = { position: "absolute", visibility: "hidden", display: "block" },
		cssNormalTransform = {
			letterSpacing: "0",
			fontWeight: "400"
		},
	
		cssPrefixes = [ "Webkit", "O", "Moz", "ms" ],
		emptyStyle = document.createElement( "div" ).style;
	
	// Return a css property mapped to a potentially vendor prefixed property
	function vendorPropName( name ) {
	
		// Shortcut for names that are not vendor prefixed
		if ( name in emptyStyle ) {
			return name;
		}
	
		// Check for vendor prefixed names
		var capName = name[ 0 ].toUpperCase() + name.slice( 1 ),
			i = cssPrefixes.length;
	
		while ( i-- ) {
			name = cssPrefixes[ i ] + capName;
			if ( name in emptyStyle ) {
				return name;
			}
		}
	}
	
	function setPositiveNumber( elem, value, subtract ) {
	
		// Any relative (+/-) values have already been
		// normalized at this point
		var matches = rcssNum.exec( value );
		return matches ?
	
			// Guard against undefined "subtract", e.g., when used as in cssHooks
			Math.max( 0, matches[ 2 ] - ( subtract || 0 ) ) + ( matches[ 3 ] || "px" ) :
			value;
	}
	
	function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
		var i = extra === ( isBorderBox ? "border" : "content" ) ?
	
			// If we already have the right measurement, avoid augmentation
			4 :
	
			// Otherwise initialize for horizontal or vertical properties
			name === "width" ? 1 : 0,
	
			val = 0;
	
		for ( ; i < 4; i += 2 ) {
	
			// Both box models exclude margin, so add it if we want it
			if ( extra === "margin" ) {
				val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
			}
	
			if ( isBorderBox ) {
	
				// border-box includes padding, so remove it if we want content
				if ( extra === "content" ) {
					val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
				}
	
				// At this point, extra isn't border nor margin, so remove border
				if ( extra !== "margin" ) {
					val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
				}
			} else {
	
				// At this point, extra isn't content, so add padding
				val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
	
				// At this point, extra isn't content nor padding, so add border
				if ( extra !== "padding" ) {
					val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
				}
			}
		}
	
		return val;
	}
	
	function getWidthOrHeight( elem, name, extra ) {
	
		// Start with offset property, which is equivalent to the border-box value
		var valueIsBorderBox = true,
			val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
			styles = getStyles( elem ),
			isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box";
	
		// Support: IE11 only
		// In IE 11 fullscreen elements inside of an iframe have
		// 100x too small dimensions (gh-1764).
		if ( document.msFullscreenElement && window.top !== window ) {
	
			// Support: IE11 only
			// Running getBoundingClientRect on a disconnected node
			// in IE throws an error.
			if ( elem.getClientRects().length ) {
				val = Math.round( elem.getBoundingClientRect()[ name ] * 100 );
			}
		}
	
		// Some non-html elements return undefined for offsetWidth, so check for null/undefined
		// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
		// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
		if ( val <= 0 || val == null ) {
	
			// Fall back to computed then uncomputed css if necessary
			val = curCSS( elem, name, styles );
			if ( val < 0 || val == null ) {
				val = elem.style[ name ];
			}
	
			// Computed unit is not pixels. Stop here and return.
			if ( rnumnonpx.test( val ) ) {
				return val;
			}
	
			// Check for style in case a browser which returns unreliable values
			// for getComputedStyle silently falls back to the reliable elem.style
			valueIsBorderBox = isBorderBox &&
				( support.boxSizingReliable() || val === elem.style[ name ] );
	
			// Normalize "", auto, and prepare for extra
			val = parseFloat( val ) || 0;
		}
	
		// Use the active box-sizing model to add/subtract irrelevant styles
		return ( val +
			augmentWidthOrHeight(
				elem,
				name,
				extra || ( isBorderBox ? "border" : "content" ),
				valueIsBorderBox,
				styles
			)
		) + "px";
	}
	
	function showHide( elements, show ) {
		var display, elem, hidden,
			values = [],
			index = 0,
			length = elements.length;
	
		for ( ; index < length; index++ ) {
			elem = elements[ index ];
			if ( !elem.style ) {
				continue;
			}
	
			values[ index ] = dataPriv.get( elem, "olddisplay" );
			display = elem.style.display;
			if ( show ) {
	
				// Reset the inline display of this element to learn if it is
				// being hidden by cascaded rules or not
				if ( !values[ index ] && display === "none" ) {
					elem.style.display = "";
				}
	
				// Set elements which have been overridden with display: none
				// in a stylesheet to whatever the default browser style is
				// for such an element
				if ( elem.style.display === "" && isHidden( elem ) ) {
					values[ index ] = dataPriv.access(
						elem,
						"olddisplay",
						defaultDisplay( elem.nodeName )
					);
				}
			} else {
				hidden = isHidden( elem );
	
				if ( display !== "none" || !hidden ) {
					dataPriv.set(
						elem,
						"olddisplay",
						hidden ? display : jQuery.css( elem, "display" )
					);
				}
			}
		}
	
		// Set the display of most of the elements in a second loop
		// to avoid the constant reflow
		for ( index = 0; index < length; index++ ) {
			elem = elements[ index ];
			if ( !elem.style ) {
				continue;
			}
			if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
				elem.style.display = show ? values[ index ] || "" : "none";
			}
		}
	
		return elements;
	}
	
	jQuery.extend( {
	
		// Add in style property hooks for overriding the default
		// behavior of getting and setting a style property
		cssHooks: {
			opacity: {
				get: function( elem, computed ) {
					if ( computed ) {
	
						// We should always get a number back from opacity
						var ret = curCSS( elem, "opacity" );
						return ret === "" ? "1" : ret;
					}
				}
			}
		},
	
		// Don't automatically add "px" to these possibly-unitless properties
		cssNumber: {
			"animationIterationCount": true,
			"columnCount": true,
			"fillOpacity": true,
			"flexGrow": true,
			"flexShrink": true,
			"fontWeight": true,
			"lineHeight": true,
			"opacity": true,
			"order": true,
			"orphans": true,
			"widows": true,
			"zIndex": true,
			"zoom": true
		},
	
		// Add in properties whose names you wish to fix before
		// setting or getting the value
		cssProps: {
			"float": "cssFloat"
		},
	
		// Get and set the style property on a DOM Node
		style: function( elem, name, value, extra ) {
	
			// Don't set styles on text and comment nodes
			if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
				return;
			}
	
			// Make sure that we're working with the right name
			var ret, type, hooks,
				origName = jQuery.camelCase( name ),
				style = elem.style;
	
			name = jQuery.cssProps[ origName ] ||
				( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );
	
			// Gets hook for the prefixed version, then unprefixed version
			hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];
	
			// Check if we're setting a value
			if ( value !== undefined ) {
				type = typeof value;
	
				// Convert "+=" or "-=" to relative numbers (#7345)
				if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
					value = adjustCSS( elem, name, ret );
	
					// Fixes bug #9237
					type = "number";
				}
	
				// Make sure that null and NaN values aren't set (#7116)
				if ( value == null || value !== value ) {
					return;
				}
	
				// If a number was passed in, add the unit (except for certain CSS properties)
				if ( type === "number" ) {
					value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
				}
	
				// Support: IE9-11+
				// background-* props affect original clone's values
				if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
					style[ name ] = "inherit";
				}
	
				// If a hook was provided, use that value, otherwise just set the specified value
				if ( !hooks || !( "set" in hooks ) ||
					( value = hooks.set( elem, value, extra ) ) !== undefined ) {
	
					style[ name ] = value;
				}
	
			} else {
	
				// If a hook was provided get the non-computed value from there
				if ( hooks && "get" in hooks &&
					( ret = hooks.get( elem, false, extra ) ) !== undefined ) {
	
					return ret;
				}
	
				// Otherwise just get the value from the style object
				return style[ name ];
			}
		},
	
		css: function( elem, name, extra, styles ) {
			var val, num, hooks,
				origName = jQuery.camelCase( name );
	
			// Make sure that we're working with the right name
			name = jQuery.cssProps[ origName ] ||
				( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );
	
			// Try prefixed name followed by the unprefixed name
			hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];
	
			// If a hook was provided get the computed value from there
			if ( hooks && "get" in hooks ) {
				val = hooks.get( elem, true, extra );
			}
	
			// Otherwise, if a way to get the computed value exists, use that
			if ( val === undefined ) {
				val = curCSS( elem, name, styles );
			}
	
			// Convert "normal" to computed value
			if ( val === "normal" && name in cssNormalTransform ) {
				val = cssNormalTransform[ name ];
			}
	
			// Make numeric if forced or a qualifier was provided and val looks numeric
			if ( extra === "" || extra ) {
				num = parseFloat( val );
				return extra === true || isFinite( num ) ? num || 0 : val;
			}
			return val;
		}
	} );
	
	jQuery.each( [ "height", "width" ], function( i, name ) {
		jQuery.cssHooks[ name ] = {
			get: function( elem, computed, extra ) {
				if ( computed ) {
	
					// Certain elements can have dimension info if we invisibly show them
					// but it must have a current display style that would benefit
					return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&
						elem.offsetWidth === 0 ?
							swap( elem, cssShow, function() {
								return getWidthOrHeight( elem, name, extra );
							} ) :
							getWidthOrHeight( elem, name, extra );
				}
			},
	
			set: function( elem, value, extra ) {
				var matches,
					styles = extra && getStyles( elem ),
					subtract = extra && augmentWidthOrHeight(
						elem,
						name,
						extra,
						jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
						styles
					);
	
				// Convert to pixels if value adjustment is needed
				if ( subtract && ( matches = rcssNum.exec( value ) ) &&
					( matches[ 3 ] || "px" ) !== "px" ) {
	
					elem.style[ name ] = value;
					value = jQuery.css( elem, name );
				}
	
				return setPositiveNumber( elem, value, subtract );
			}
		};
	} );
	
	jQuery.cssHooks.marginLeft = addGetHookIf( support.reliableMarginLeft,
		function( elem, computed ) {
			if ( computed ) {
				return ( parseFloat( curCSS( elem, "marginLeft" ) ) ||
					elem.getBoundingClientRect().left -
						swap( elem, { marginLeft: 0 }, function() {
							return elem.getBoundingClientRect().left;
						} )
					) + "px";
			}
		}
	);
	
	// Support: Android 2.3
	jQuery.cssHooks.marginRight = addGetHookIf( support.reliableMarginRight,
		function( elem, computed ) {
			if ( computed ) {
				return swap( elem, { "display": "inline-block" },
					curCSS, [ elem, "marginRight" ] );
			}
		}
	);
	
	// These hooks are used by animate to expand properties
	jQuery.each( {
		margin: "",
		padding: "",
		border: "Width"
	}, function( prefix, suffix ) {
		jQuery.cssHooks[ prefix + suffix ] = {
			expand: function( value ) {
				var i = 0,
					expanded = {},
	
					// Assumes a single number if not a string
					parts = typeof value === "string" ? value.split( " " ) : [ value ];
	
				for ( ; i < 4; i++ ) {
					expanded[ prefix + cssExpand[ i ] + suffix ] =
						parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
				}
	
				return expanded;
			}
		};
	
		if ( !rmargin.test( prefix ) ) {
			jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
		}
	} );
	
	jQuery.fn.extend( {
		css: function( name, value ) {
			return access( this, function( elem, name, value ) {
				var styles, len,
					map = {},
					i = 0;
	
				if ( jQuery.isArray( name ) ) {
					styles = getStyles( elem );
					len = name.length;
	
					for ( ; i < len; i++ ) {
						map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
					}
	
					return map;
				}
	
				return value !== undefined ?
					jQuery.style( elem, name, value ) :
					jQuery.css( elem, name );
			}, name, value, arguments.length > 1 );
		},
		show: function() {
			return showHide( this, true );
		},
		hide: function() {
			return showHide( this );
		},
		toggle: function( state ) {
			if ( typeof state === "boolean" ) {
				return state ? this.show() : this.hide();
			}
	
			return this.each( function() {
				if ( isHidden( this ) ) {
					jQuery( this ).show();
				} else {
					jQuery( this ).hide();
				}
			} );
		}
	} );
	
	
	function Tween( elem, options, prop, end, easing ) {
		return new Tween.prototype.init( elem, options, prop, end, easing );
	}
	jQuery.Tween = Tween;
	
	Tween.prototype = {
		constructor: Tween,
		init: function( elem, options, prop, end, easing, unit ) {
			this.elem = elem;
			this.prop = prop;
			this.easing = easing || jQuery.easing._default;
			this.options = options;
			this.start = this.now = this.cur();
			this.end = end;
			this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
		},
		cur: function() {
			var hooks = Tween.propHooks[ this.prop ];
	
			return hooks && hooks.get ?
				hooks.get( this ) :
				Tween.propHooks._default.get( this );
		},
		run: function( percent ) {
			var eased,
				hooks = Tween.propHooks[ this.prop ];
	
			if ( this.options.duration ) {
				this.pos = eased = jQuery.easing[ this.easing ](
					percent, this.options.duration * percent, 0, 1, this.options.duration
				);
			} else {
				this.pos = eased = percent;
			}
			this.now = ( this.end - this.start ) * eased + this.start;
	
			if ( this.options.step ) {
				this.options.step.call( this.elem, this.now, this );
			}
	
			if ( hooks && hooks.set ) {
				hooks.set( this );
			} else {
				Tween.propHooks._default.set( this );
			}
			return this;
		}
	};
	
	Tween.prototype.init.prototype = Tween.prototype;
	
	Tween.propHooks = {
		_default: {
			get: function( tween ) {
				var result;
	
				// Use a property on the element directly when it is not a DOM element,
				// or when there is no matching style property that exists.
				if ( tween.elem.nodeType !== 1 ||
					tween.elem[ tween.prop ] != null && tween.elem.style[ tween.prop ] == null ) {
					return tween.elem[ tween.prop ];
				}
	
				// Passing an empty string as a 3rd parameter to .css will automatically
				// attempt a parseFloat and fallback to a string if the parse fails.
				// Simple values such as "10px" are parsed to Float;
				// complex values such as "rotate(1rad)" are returned as-is.
				result = jQuery.css( tween.elem, tween.prop, "" );
	
				// Empty strings, null, undefined and "auto" are converted to 0.
				return !result || result === "auto" ? 0 : result;
			},
			set: function( tween ) {
	
				// Use step hook for back compat.
				// Use cssHook if its there.
				// Use .style if available and use plain properties where available.
				if ( jQuery.fx.step[ tween.prop ] ) {
					jQuery.fx.step[ tween.prop ]( tween );
				} else if ( tween.elem.nodeType === 1 &&
					( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null ||
						jQuery.cssHooks[ tween.prop ] ) ) {
					jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
				} else {
					tween.elem[ tween.prop ] = tween.now;
				}
			}
		}
	};
	
	// Support: IE9
	// Panic based approach to setting things on disconnected nodes
	Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
		set: function( tween ) {
			if ( tween.elem.nodeType && tween.elem.parentNode ) {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	};
	
	jQuery.easing = {
		linear: function( p ) {
			return p;
		},
		swing: function( p ) {
			return 0.5 - Math.cos( p * Math.PI ) / 2;
		},
		_default: "swing"
	};
	
	jQuery.fx = Tween.prototype.init;
	
	// Back Compat <1.8 extension point
	jQuery.fx.step = {};
	
	
	
	
	var
		fxNow, timerId,
		rfxtypes = /^(?:toggle|show|hide)$/,
		rrun = /queueHooks$/;
	
	// Animations created synchronously will run synchronously
	function createFxNow() {
		window.setTimeout( function() {
			fxNow = undefined;
		} );
		return ( fxNow = jQuery.now() );
	}
	
	// Generate parameters to create a standard animation
	function genFx( type, includeWidth ) {
		var which,
			i = 0,
			attrs = { height: type };
	
		// If we include width, step value is 1 to do all cssExpand values,
		// otherwise step value is 2 to skip over Left and Right
		includeWidth = includeWidth ? 1 : 0;
		for ( ; i < 4 ; i += 2 - includeWidth ) {
			which = cssExpand[ i ];
			attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
		}
	
		if ( includeWidth ) {
			attrs.opacity = attrs.width = type;
		}
	
		return attrs;
	}
	
	function createTween( value, prop, animation ) {
		var tween,
			collection = ( Animation.tweeners[ prop ] || [] ).concat( Animation.tweeners[ "*" ] ),
			index = 0,
			length = collection.length;
		for ( ; index < length; index++ ) {
			if ( ( tween = collection[ index ].call( animation, prop, value ) ) ) {
	
				// We're done with this property
				return tween;
			}
		}
	}
	
	function defaultPrefilter( elem, props, opts ) {
		/* jshint validthis: true */
		var prop, value, toggle, tween, hooks, oldfire, display, checkDisplay,
			anim = this,
			orig = {},
			style = elem.style,
			hidden = elem.nodeType && isHidden( elem ),
			dataShow = dataPriv.get( elem, "fxshow" );
	
		// Handle queue: false promises
		if ( !opts.queue ) {
			hooks = jQuery._queueHooks( elem, "fx" );
			if ( hooks.unqueued == null ) {
				hooks.unqueued = 0;
				oldfire = hooks.empty.fire;
				hooks.empty.fire = function() {
					if ( !hooks.unqueued ) {
						oldfire();
					}
				};
			}
			hooks.unqueued++;
	
			anim.always( function() {
	
				// Ensure the complete handler is called before this completes
				anim.always( function() {
					hooks.unqueued--;
					if ( !jQuery.queue( elem, "fx" ).length ) {
						hooks.empty.fire();
					}
				} );
			} );
		}
	
		// Height/width overflow pass
		if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {
	
			// Make sure that nothing sneaks out
			// Record all 3 overflow attributes because IE9-10 do not
			// change the overflow attribute when overflowX and
			// overflowY are set to the same value
			opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];
	
			// Set display property to inline-block for height/width
			// animations on inline elements that are having width/height animated
			display = jQuery.css( elem, "display" );
	
			// Test default display if display is currently "none"
			checkDisplay = display === "none" ?
				dataPriv.get( elem, "olddisplay" ) || defaultDisplay( elem.nodeName ) : display;
	
			if ( checkDisplay === "inline" && jQuery.css( elem, "float" ) === "none" ) {
				style.display = "inline-block";
			}
		}
	
		if ( opts.overflow ) {
			style.overflow = "hidden";
			anim.always( function() {
				style.overflow = opts.overflow[ 0 ];
				style.overflowX = opts.overflow[ 1 ];
				style.overflowY = opts.overflow[ 2 ];
			} );
		}
	
		// show/hide pass
		for ( prop in props ) {
			value = props[ prop ];
			if ( rfxtypes.exec( value ) ) {
				delete props[ prop ];
				toggle = toggle || value === "toggle";
				if ( value === ( hidden ? "hide" : "show" ) ) {
	
					// If there is dataShow left over from a stopped hide or show
					// and we are going to proceed with show, we should pretend to be hidden
					if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
						hidden = true;
					} else {
						continue;
					}
				}
				orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );
	
			// Any non-fx value stops us from restoring the original display value
			} else {
				display = undefined;
			}
		}
	
		if ( !jQuery.isEmptyObject( orig ) ) {
			if ( dataShow ) {
				if ( "hidden" in dataShow ) {
					hidden = dataShow.hidden;
				}
			} else {
				dataShow = dataPriv.access( elem, "fxshow", {} );
			}
	
			// Store state if its toggle - enables .stop().toggle() to "reverse"
			if ( toggle ) {
				dataShow.hidden = !hidden;
			}
			if ( hidden ) {
				jQuery( elem ).show();
			} else {
				anim.done( function() {
					jQuery( elem ).hide();
				} );
			}
			anim.done( function() {
				var prop;
	
				dataPriv.remove( elem, "fxshow" );
				for ( prop in orig ) {
					jQuery.style( elem, prop, orig[ prop ] );
				}
			} );
			for ( prop in orig ) {
				tween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );
	
				if ( !( prop in dataShow ) ) {
					dataShow[ prop ] = tween.start;
					if ( hidden ) {
						tween.end = tween.start;
						tween.start = prop === "width" || prop === "height" ? 1 : 0;
					}
				}
			}
	
		// If this is a noop like .hide().hide(), restore an overwritten display value
		} else if ( ( display === "none" ? defaultDisplay( elem.nodeName ) : display ) === "inline" ) {
			style.display = display;
		}
	}
	
	function propFilter( props, specialEasing ) {
		var index, name, easing, value, hooks;
	
		// camelCase, specialEasing and expand cssHook pass
		for ( index in props ) {
			name = jQuery.camelCase( index );
			easing = specialEasing[ name ];
			value = props[ index ];
			if ( jQuery.isArray( value ) ) {
				easing = value[ 1 ];
				value = props[ index ] = value[ 0 ];
			}
	
			if ( index !== name ) {
				props[ name ] = value;
				delete props[ index ];
			}
	
			hooks = jQuery.cssHooks[ name ];
			if ( hooks && "expand" in hooks ) {
				value = hooks.expand( value );
				delete props[ name ];
	
				// Not quite $.extend, this won't overwrite existing keys.
				// Reusing 'index' because we have the correct "name"
				for ( index in value ) {
					if ( !( index in props ) ) {
						props[ index ] = value[ index ];
						specialEasing[ index ] = easing;
					}
				}
			} else {
				specialEasing[ name ] = easing;
			}
		}
	}
	
	function Animation( elem, properties, options ) {
		var result,
			stopped,
			index = 0,
			length = Animation.prefilters.length,
			deferred = jQuery.Deferred().always( function() {
	
				// Don't match elem in the :animated selector
				delete tick.elem;
			} ),
			tick = function() {
				if ( stopped ) {
					return false;
				}
				var currentTime = fxNow || createFxNow(),
					remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),
	
					// Support: Android 2.3
					// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
					temp = remaining / animation.duration || 0,
					percent = 1 - temp,
					index = 0,
					length = animation.tweens.length;
	
				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( percent );
				}
	
				deferred.notifyWith( elem, [ animation, percent, remaining ] );
	
				if ( percent < 1 && length ) {
					return remaining;
				} else {
					deferred.resolveWith( elem, [ animation ] );
					return false;
				}
			},
			animation = deferred.promise( {
				elem: elem,
				props: jQuery.extend( {}, properties ),
				opts: jQuery.extend( true, {
					specialEasing: {},
					easing: jQuery.easing._default
				}, options ),
				originalProperties: properties,
				originalOptions: options,
				startTime: fxNow || createFxNow(),
				duration: options.duration,
				tweens: [],
				createTween: function( prop, end ) {
					var tween = jQuery.Tween( elem, animation.opts, prop, end,
							animation.opts.specialEasing[ prop ] || animation.opts.easing );
					animation.tweens.push( tween );
					return tween;
				},
				stop: function( gotoEnd ) {
					var index = 0,
	
						// If we are going to the end, we want to run all the tweens
						// otherwise we skip this part
						length = gotoEnd ? animation.tweens.length : 0;
					if ( stopped ) {
						return this;
					}
					stopped = true;
					for ( ; index < length ; index++ ) {
						animation.tweens[ index ].run( 1 );
					}
	
					// Resolve when we played the last frame; otherwise, reject
					if ( gotoEnd ) {
						deferred.notifyWith( elem, [ animation, 1, 0 ] );
						deferred.resolveWith( elem, [ animation, gotoEnd ] );
					} else {
						deferred.rejectWith( elem, [ animation, gotoEnd ] );
					}
					return this;
				}
			} ),
			props = animation.props;
	
		propFilter( props, animation.opts.specialEasing );
	
		for ( ; index < length ; index++ ) {
			result = Animation.prefilters[ index ].call( animation, elem, props, animation.opts );
			if ( result ) {
				if ( jQuery.isFunction( result.stop ) ) {
					jQuery._queueHooks( animation.elem, animation.opts.queue ).stop =
						jQuery.proxy( result.stop, result );
				}
				return result;
			}
		}
	
		jQuery.map( props, createTween, animation );
	
		if ( jQuery.isFunction( animation.opts.start ) ) {
			animation.opts.start.call( elem, animation );
		}
	
		jQuery.fx.timer(
			jQuery.extend( tick, {
				elem: elem,
				anim: animation,
				queue: animation.opts.queue
			} )
		);
	
		// attach callbacks from options
		return animation.progress( animation.opts.progress )
			.done( animation.opts.done, animation.opts.complete )
			.fail( animation.opts.fail )
			.always( animation.opts.always );
	}
	
	jQuery.Animation = jQuery.extend( Animation, {
		tweeners: {
			"*": [ function( prop, value ) {
				var tween = this.createTween( prop, value );
				adjustCSS( tween.elem, prop, rcssNum.exec( value ), tween );
				return tween;
			} ]
		},
	
		tweener: function( props, callback ) {
			if ( jQuery.isFunction( props ) ) {
				callback = props;
				props = [ "*" ];
			} else {
				props = props.match( rnotwhite );
			}
	
			var prop,
				index = 0,
				length = props.length;
	
			for ( ; index < length ; index++ ) {
				prop = props[ index ];
				Animation.tweeners[ prop ] = Animation.tweeners[ prop ] || [];
				Animation.tweeners[ prop ].unshift( callback );
			}
		},
	
		prefilters: [ defaultPrefilter ],
	
		prefilter: function( callback, prepend ) {
			if ( prepend ) {
				Animation.prefilters.unshift( callback );
			} else {
				Animation.prefilters.push( callback );
			}
		}
	} );
	
	jQuery.speed = function( speed, easing, fn ) {
		var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
			complete: fn || !fn && easing ||
				jQuery.isFunction( speed ) && speed,
			duration: speed,
			easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
		};
	
		opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ?
			opt.duration : opt.duration in jQuery.fx.speeds ?
				jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;
	
		// Normalize opt.queue - true/undefined/null -> "fx"
		if ( opt.queue == null || opt.queue === true ) {
			opt.queue = "fx";
		}
	
		// Queueing
		opt.old = opt.complete;
	
		opt.complete = function() {
			if ( jQuery.isFunction( opt.old ) ) {
				opt.old.call( this );
			}
	
			if ( opt.queue ) {
				jQuery.dequeue( this, opt.queue );
			}
		};
	
		return opt;
	};
	
	jQuery.fn.extend( {
		fadeTo: function( speed, to, easing, callback ) {
	
			// Show any hidden elements after setting opacity to 0
			return this.filter( isHidden ).css( "opacity", 0 ).show()
	
				// Animate to the value specified
				.end().animate( { opacity: to }, speed, easing, callback );
		},
		animate: function( prop, speed, easing, callback ) {
			var empty = jQuery.isEmptyObject( prop ),
				optall = jQuery.speed( speed, easing, callback ),
				doAnimation = function() {
	
					// Operate on a copy of prop so per-property easing won't be lost
					var anim = Animation( this, jQuery.extend( {}, prop ), optall );
	
					// Empty animations, or finishing resolves immediately
					if ( empty || dataPriv.get( this, "finish" ) ) {
						anim.stop( true );
					}
				};
				doAnimation.finish = doAnimation;
	
			return empty || optall.queue === false ?
				this.each( doAnimation ) :
				this.queue( optall.queue, doAnimation );
		},
		stop: function( type, clearQueue, gotoEnd ) {
			var stopQueue = function( hooks ) {
				var stop = hooks.stop;
				delete hooks.stop;
				stop( gotoEnd );
			};
	
			if ( typeof type !== "string" ) {
				gotoEnd = clearQueue;
				clearQueue = type;
				type = undefined;
			}
			if ( clearQueue && type !== false ) {
				this.queue( type || "fx", [] );
			}
	
			return this.each( function() {
				var dequeue = true,
					index = type != null && type + "queueHooks",
					timers = jQuery.timers,
					data = dataPriv.get( this );
	
				if ( index ) {
					if ( data[ index ] && data[ index ].stop ) {
						stopQueue( data[ index ] );
					}
				} else {
					for ( index in data ) {
						if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
							stopQueue( data[ index ] );
						}
					}
				}
	
				for ( index = timers.length; index--; ) {
					if ( timers[ index ].elem === this &&
						( type == null || timers[ index ].queue === type ) ) {
	
						timers[ index ].anim.stop( gotoEnd );
						dequeue = false;
						timers.splice( index, 1 );
					}
				}
	
				// Start the next in the queue if the last step wasn't forced.
				// Timers currently will call their complete callbacks, which
				// will dequeue but only if they were gotoEnd.
				if ( dequeue || !gotoEnd ) {
					jQuery.dequeue( this, type );
				}
			} );
		},
		finish: function( type ) {
			if ( type !== false ) {
				type = type || "fx";
			}
			return this.each( function() {
				var index,
					data = dataPriv.get( this ),
					queue = data[ type + "queue" ],
					hooks = data[ type + "queueHooks" ],
					timers = jQuery.timers,
					length = queue ? queue.length : 0;
	
				// Enable finishing flag on private data
				data.finish = true;
	
				// Empty the queue first
				jQuery.queue( this, type, [] );
	
				if ( hooks && hooks.stop ) {
					hooks.stop.call( this, true );
				}
	
				// Look for any active animations, and finish them
				for ( index = timers.length; index--; ) {
					if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
						timers[ index ].anim.stop( true );
						timers.splice( index, 1 );
					}
				}
	
				// Look for any animations in the old queue and finish them
				for ( index = 0; index < length; index++ ) {
					if ( queue[ index ] && queue[ index ].finish ) {
						queue[ index ].finish.call( this );
					}
				}
	
				// Turn off finishing flag
				delete data.finish;
			} );
		}
	} );
	
	jQuery.each( [ "toggle", "show", "hide" ], function( i, name ) {
		var cssFn = jQuery.fn[ name ];
		jQuery.fn[ name ] = function( speed, easing, callback ) {
			return speed == null || typeof speed === "boolean" ?
				cssFn.apply( this, arguments ) :
				this.animate( genFx( name, true ), speed, easing, callback );
		};
	} );
	
	// Generate shortcuts for custom animations
	jQuery.each( {
		slideDown: genFx( "show" ),
		slideUp: genFx( "hide" ),
		slideToggle: genFx( "toggle" ),
		fadeIn: { opacity: "show" },
		fadeOut: { opacity: "hide" },
		fadeToggle: { opacity: "toggle" }
	}, function( name, props ) {
		jQuery.fn[ name ] = function( speed, easing, callback ) {
			return this.animate( props, speed, easing, callback );
		};
	} );
	
	jQuery.timers = [];
	jQuery.fx.tick = function() {
		var timer,
			i = 0,
			timers = jQuery.timers;
	
		fxNow = jQuery.now();
	
		for ( ; i < timers.length; i++ ) {
			timer = timers[ i ];
	
			// Checks the timer has not already been removed
			if ( !timer() && timers[ i ] === timer ) {
				timers.splice( i--, 1 );
			}
		}
	
		if ( !timers.length ) {
			jQuery.fx.stop();
		}
		fxNow = undefined;
	};
	
	jQuery.fx.timer = function( timer ) {
		jQuery.timers.push( timer );
		if ( timer() ) {
			jQuery.fx.start();
		} else {
			jQuery.timers.pop();
		}
	};
	
	jQuery.fx.interval = 13;
	jQuery.fx.start = function() {
		if ( !timerId ) {
			timerId = window.setInterval( jQuery.fx.tick, jQuery.fx.interval );
		}
	};
	
	jQuery.fx.stop = function() {
		window.clearInterval( timerId );
	
		timerId = null;
	};
	
	jQuery.fx.speeds = {
		slow: 600,
		fast: 200,
	
		// Default speed
		_default: 400
	};
	
	
	// Based off of the plugin by Clint Helfers, with permission.
	// http://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
	jQuery.fn.delay = function( time, type ) {
		time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
		type = type || "fx";
	
		return this.queue( type, function( next, hooks ) {
			var timeout = window.setTimeout( next, time );
			hooks.stop = function() {
				window.clearTimeout( timeout );
			};
		} );
	};
	
	
	( function() {
		var input = document.createElement( "input" ),
			select = document.createElement( "select" ),
			opt = select.appendChild( document.createElement( "option" ) );
	
		input.type = "checkbox";
	
		// Support: iOS<=5.1, Android<=4.2+
		// Default value for a checkbox should be "on"
		support.checkOn = input.value !== "";
	
		// Support: IE<=11+
		// Must access selectedIndex to make default options select
		support.optSelected = opt.selected;
	
		// Support: Android<=2.3
		// Options inside disabled selects are incorrectly marked as disabled
		select.disabled = true;
		support.optDisabled = !opt.disabled;
	
		// Support: IE<=11+
		// An input loses its value after becoming a radio
		input = document.createElement( "input" );
		input.value = "t";
		input.type = "radio";
		support.radioValue = input.value === "t";
	} )();
	
	
	var boolHook,
		attrHandle = jQuery.expr.attrHandle;
	
	jQuery.fn.extend( {
		attr: function( name, value ) {
			return access( this, jQuery.attr, name, value, arguments.length > 1 );
		},
	
		removeAttr: function( name ) {
			return this.each( function() {
				jQuery.removeAttr( this, name );
			} );
		}
	} );
	
	jQuery.extend( {
		attr: function( elem, name, value ) {
			var ret, hooks,
				nType = elem.nodeType;
	
			// Don't get/set attributes on text, comment and attribute nodes
			if ( nType === 3 || nType === 8 || nType === 2 ) {
				return;
			}
	
			// Fallback to prop when attributes are not supported
			if ( typeof elem.getAttribute === "undefined" ) {
				return jQuery.prop( elem, name, value );
			}
	
			// All attributes are lowercase
			// Grab necessary hook if one is defined
			if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
				name = name.toLowerCase();
				hooks = jQuery.attrHooks[ name ] ||
					( jQuery.expr.match.bool.test( name ) ? boolHook : undefined );
			}
	
			if ( value !== undefined ) {
				if ( value === null ) {
					jQuery.removeAttr( elem, name );
					return;
				}
	
				if ( hooks && "set" in hooks &&
					( ret = hooks.set( elem, value, name ) ) !== undefined ) {
					return ret;
				}
	
				elem.setAttribute( name, value + "" );
				return value;
			}
	
			if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
				return ret;
			}
	
			ret = jQuery.find.attr( elem, name );
	
			// Non-existent attributes return null, we normalize to undefined
			return ret == null ? undefined : ret;
		},
	
		attrHooks: {
			type: {
				set: function( elem, value ) {
					if ( !support.radioValue && value === "radio" &&
						jQuery.nodeName( elem, "input" ) ) {
						var val = elem.value;
						elem.setAttribute( "type", value );
						if ( val ) {
							elem.value = val;
						}
						return value;
					}
				}
			}
		},
	
		removeAttr: function( elem, value ) {
			var name, propName,
				i = 0,
				attrNames = value && value.match( rnotwhite );
	
			if ( attrNames && elem.nodeType === 1 ) {
				while ( ( name = attrNames[ i++ ] ) ) {
					propName = jQuery.propFix[ name ] || name;
	
					// Boolean attributes get special treatment (#10870)
					if ( jQuery.expr.match.bool.test( name ) ) {
	
						// Set corresponding property to false
						elem[ propName ] = false;
					}
	
					elem.removeAttribute( name );
				}
			}
		}
	} );
	
	// Hooks for boolean attributes
	boolHook = {
		set: function( elem, value, name ) {
			if ( value === false ) {
	
				// Remove boolean attributes when set to false
				jQuery.removeAttr( elem, name );
			} else {
				elem.setAttribute( name, name );
			}
			return name;
		}
	};
	jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
		var getter = attrHandle[ name ] || jQuery.find.attr;
	
		attrHandle[ name ] = function( elem, name, isXML ) {
			var ret, handle;
			if ( !isXML ) {
	
				// Avoid an infinite loop by temporarily removing this function from the getter
				handle = attrHandle[ name ];
				attrHandle[ name ] = ret;
				ret = getter( elem, name, isXML ) != null ?
					name.toLowerCase() :
					null;
				attrHandle[ name ] = handle;
			}
			return ret;
		};
	} );
	
	
	
	
	var rfocusable = /^(?:input|select|textarea|button)$/i,
		rclickable = /^(?:a|area)$/i;
	
	jQuery.fn.extend( {
		prop: function( name, value ) {
			return access( this, jQuery.prop, name, value, arguments.length > 1 );
		},
	
		removeProp: function( name ) {
			return this.each( function() {
				delete this[ jQuery.propFix[ name ] || name ];
			} );
		}
	} );
	
	jQuery.extend( {
		prop: function( elem, name, value ) {
			var ret, hooks,
				nType = elem.nodeType;
	
			// Don't get/set properties on text, comment and attribute nodes
			if ( nType === 3 || nType === 8 || nType === 2 ) {
				return;
			}
	
			if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
	
				// Fix name and attach hooks
				name = jQuery.propFix[ name ] || name;
				hooks = jQuery.propHooks[ name ];
			}
	
			if ( value !== undefined ) {
				if ( hooks && "set" in hooks &&
					( ret = hooks.set( elem, value, name ) ) !== undefined ) {
					return ret;
				}
	
				return ( elem[ name ] = value );
			}
	
			if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
				return ret;
			}
	
			return elem[ name ];
		},
	
		propHooks: {
			tabIndex: {
				get: function( elem ) {
	
					// elem.tabIndex doesn't always return the
					// correct value when it hasn't been explicitly set
					// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
					// Use proper attribute retrieval(#12072)
					var tabindex = jQuery.find.attr( elem, "tabindex" );
	
					return tabindex ?
						parseInt( tabindex, 10 ) :
						rfocusable.test( elem.nodeName ) ||
							rclickable.test( elem.nodeName ) && elem.href ?
								0 :
								-1;
				}
			}
		},
	
		propFix: {
			"for": "htmlFor",
			"class": "className"
		}
	} );
	
	if ( !support.optSelected ) {
		jQuery.propHooks.selected = {
			get: function( elem ) {
				var parent = elem.parentNode;
				if ( parent && parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
				return null;
			}
		};
	}
	
	jQuery.each( [
		"tabIndex",
		"readOnly",
		"maxLength",
		"cellSpacing",
		"cellPadding",
		"rowSpan",
		"colSpan",
		"useMap",
		"frameBorder",
		"contentEditable"
	], function() {
		jQuery.propFix[ this.toLowerCase() ] = this;
	} );
	
	
	
	
	var rclass = /[\t\r\n\f]/g;
	
	function getClass( elem ) {
		return elem.getAttribute && elem.getAttribute( "class" ) || "";
	}
	
	jQuery.fn.extend( {
		addClass: function( value ) {
			var classes, elem, cur, curValue, clazz, j, finalValue,
				i = 0;
	
			if ( jQuery.isFunction( value ) ) {
				return this.each( function( j ) {
					jQuery( this ).addClass( value.call( this, j, getClass( this ) ) );
				} );
			}
	
			if ( typeof value === "string" && value ) {
				classes = value.match( rnotwhite ) || [];
	
				while ( ( elem = this[ i++ ] ) ) {
					curValue = getClass( elem );
					cur = elem.nodeType === 1 &&
						( " " + curValue + " " ).replace( rclass, " " );
	
					if ( cur ) {
						j = 0;
						while ( ( clazz = classes[ j++ ] ) ) {
							if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
								cur += clazz + " ";
							}
						}
	
						// Only assign if different to avoid unneeded rendering.
						finalValue = jQuery.trim( cur );
						if ( curValue !== finalValue ) {
							elem.setAttribute( "class", finalValue );
						}
					}
				}
			}
	
			return this;
		},
	
		removeClass: function( value ) {
			var classes, elem, cur, curValue, clazz, j, finalValue,
				i = 0;
	
			if ( jQuery.isFunction( value ) ) {
				return this.each( function( j ) {
					jQuery( this ).removeClass( value.call( this, j, getClass( this ) ) );
				} );
			}
	
			if ( !arguments.length ) {
				return this.attr( "class", "" );
			}
	
			if ( typeof value === "string" && value ) {
				classes = value.match( rnotwhite ) || [];
	
				while ( ( elem = this[ i++ ] ) ) {
					curValue = getClass( elem );
	
					// This expression is here for better compressibility (see addClass)
					cur = elem.nodeType === 1 &&
						( " " + curValue + " " ).replace( rclass, " " );
	
					if ( cur ) {
						j = 0;
						while ( ( clazz = classes[ j++ ] ) ) {
	
							// Remove *all* instances
							while ( cur.indexOf( " " + clazz + " " ) > -1 ) {
								cur = cur.replace( " " + clazz + " ", " " );
							}
						}
	
						// Only assign if different to avoid unneeded rendering.
						finalValue = jQuery.trim( cur );
						if ( curValue !== finalValue ) {
							elem.setAttribute( "class", finalValue );
						}
					}
				}
			}
	
			return this;
		},
	
		toggleClass: function( value, stateVal ) {
			var type = typeof value;
	
			if ( typeof stateVal === "boolean" && type === "string" ) {
				return stateVal ? this.addClass( value ) : this.removeClass( value );
			}
	
			if ( jQuery.isFunction( value ) ) {
				return this.each( function( i ) {
					jQuery( this ).toggleClass(
						value.call( this, i, getClass( this ), stateVal ),
						stateVal
					);
				} );
			}
	
			return this.each( function() {
				var className, i, self, classNames;
	
				if ( type === "string" ) {
	
					// Toggle individual class names
					i = 0;
					self = jQuery( this );
					classNames = value.match( rnotwhite ) || [];
	
					while ( ( className = classNames[ i++ ] ) ) {
	
						// Check each className given, space separated list
						if ( self.hasClass( className ) ) {
							self.removeClass( className );
						} else {
							self.addClass( className );
						}
					}
	
				// Toggle whole class name
				} else if ( value === undefined || type === "boolean" ) {
					className = getClass( this );
					if ( className ) {
	
						// Store className if set
						dataPriv.set( this, "__className__", className );
					}
	
					// If the element has a class name or if we're passed `false`,
					// then remove the whole classname (if there was one, the above saved it).
					// Otherwise bring back whatever was previously saved (if anything),
					// falling back to the empty string if nothing was stored.
					if ( this.setAttribute ) {
						this.setAttribute( "class",
							className || value === false ?
							"" :
							dataPriv.get( this, "__className__" ) || ""
						);
					}
				}
			} );
		},
	
		hasClass: function( selector ) {
			var className, elem,
				i = 0;
	
			className = " " + selector + " ";
			while ( ( elem = this[ i++ ] ) ) {
				if ( elem.nodeType === 1 &&
					( " " + getClass( elem ) + " " ).replace( rclass, " " )
						.indexOf( className ) > -1
				) {
					return true;
				}
			}
	
			return false;
		}
	} );
	
	
	
	
	var rreturn = /\r/g;
	
	jQuery.fn.extend( {
		val: function( value ) {
			var hooks, ret, isFunction,
				elem = this[ 0 ];
	
			if ( !arguments.length ) {
				if ( elem ) {
					hooks = jQuery.valHooks[ elem.type ] ||
						jQuery.valHooks[ elem.nodeName.toLowerCase() ];
	
					if ( hooks &&
						"get" in hooks &&
						( ret = hooks.get( elem, "value" ) ) !== undefined
					) {
						return ret;
					}
	
					ret = elem.value;
	
					return typeof ret === "string" ?
	
						// Handle most common string cases
						ret.replace( rreturn, "" ) :
	
						// Handle cases where value is null/undef or number
						ret == null ? "" : ret;
				}
	
				return;
			}
	
			isFunction = jQuery.isFunction( value );
	
			return this.each( function( i ) {
				var val;
	
				if ( this.nodeType !== 1 ) {
					return;
				}
	
				if ( isFunction ) {
					val = value.call( this, i, jQuery( this ).val() );
				} else {
					val = value;
				}
	
				// Treat null/undefined as ""; convert numbers to string
				if ( val == null ) {
					val = "";
	
				} else if ( typeof val === "number" ) {
					val += "";
	
				} else if ( jQuery.isArray( val ) ) {
					val = jQuery.map( val, function( value ) {
						return value == null ? "" : value + "";
					} );
				}
	
				hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];
	
				// If set returns undefined, fall back to normal setting
				if ( !hooks || !( "set" in hooks ) || hooks.set( this, val, "value" ) === undefined ) {
					this.value = val;
				}
			} );
		}
	} );
	
	jQuery.extend( {
		valHooks: {
			option: {
				get: function( elem ) {
	
					// Support: IE<11
					// option.value not trimmed (#14858)
					return jQuery.trim( elem.value );
				}
			},
			select: {
				get: function( elem ) {
					var value, option,
						options = elem.options,
						index = elem.selectedIndex,
						one = elem.type === "select-one" || index < 0,
						values = one ? null : [],
						max = one ? index + 1 : options.length,
						i = index < 0 ?
							max :
							one ? index : 0;
	
					// Loop through all the selected options
					for ( ; i < max; i++ ) {
						option = options[ i ];
	
						// IE8-9 doesn't update selected after form reset (#2551)
						if ( ( option.selected || i === index ) &&
	
								// Don't return options that are disabled or in a disabled optgroup
								( support.optDisabled ?
									!option.disabled : option.getAttribute( "disabled" ) === null ) &&
								( !option.parentNode.disabled ||
									!jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {
	
							// Get the specific value for the option
							value = jQuery( option ).val();
	
							// We don't need an array for one selects
							if ( one ) {
								return value;
							}
	
							// Multi-Selects return an array
							values.push( value );
						}
					}
	
					return values;
				},
	
				set: function( elem, value ) {
					var optionSet, option,
						options = elem.options,
						values = jQuery.makeArray( value ),
						i = options.length;
	
					while ( i-- ) {
						option = options[ i ];
						if ( option.selected =
								jQuery.inArray( jQuery.valHooks.option.get( option ), values ) > -1
						) {
							optionSet = true;
						}
					}
	
					// Force browsers to behave consistently when non-matching value is set
					if ( !optionSet ) {
						elem.selectedIndex = -1;
					}
					return values;
				}
			}
		}
	} );
	
	// Radios and checkboxes getter/setter
	jQuery.each( [ "radio", "checkbox" ], function() {
		jQuery.valHooks[ this ] = {
			set: function( elem, value ) {
				if ( jQuery.isArray( value ) ) {
					return ( elem.checked = jQuery.inArray( jQuery( elem ).val(), value ) > -1 );
				}
			}
		};
		if ( !support.checkOn ) {
			jQuery.valHooks[ this ].get = function( elem ) {
				return elem.getAttribute( "value" ) === null ? "on" : elem.value;
			};
		}
	} );
	
	
	
	
	// Return jQuery for attributes-only inclusion
	
	
	var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/;
	
	jQuery.extend( jQuery.event, {
	
		trigger: function( event, data, elem, onlyHandlers ) {
	
			var i, cur, tmp, bubbleType, ontype, handle, special,
				eventPath = [ elem || document ],
				type = hasOwn.call( event, "type" ) ? event.type : event,
				namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split( "." ) : [];
	
			cur = tmp = elem = elem || document;
	
			// Don't do events on text and comment nodes
			if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
				return;
			}
	
			// focus/blur morphs to focusin/out; ensure we're not firing them right now
			if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
				return;
			}
	
			if ( type.indexOf( "." ) > -1 ) {
	
				// Namespaced trigger; create a regexp to match event type in handle()
				namespaces = type.split( "." );
				type = namespaces.shift();
				namespaces.sort();
			}
			ontype = type.indexOf( ":" ) < 0 && "on" + type;
	
			// Caller can pass in a jQuery.Event object, Object, or just an event type string
			event = event[ jQuery.expando ] ?
				event :
				new jQuery.Event( type, typeof event === "object" && event );
	
			// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
			event.isTrigger = onlyHandlers ? 2 : 3;
			event.namespace = namespaces.join( "." );
			event.rnamespace = event.namespace ?
				new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" ) :
				null;
	
			// Clean up the event in case it is being reused
			event.result = undefined;
			if ( !event.target ) {
				event.target = elem;
			}
	
			// Clone any incoming data and prepend the event, creating the handler arg list
			data = data == null ?
				[ event ] :
				jQuery.makeArray( data, [ event ] );
	
			// Allow special events to draw outside the lines
			special = jQuery.event.special[ type ] || {};
			if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
				return;
			}
	
			// Determine event propagation path in advance, per W3C events spec (#9951)
			// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
			if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {
	
				bubbleType = special.delegateType || type;
				if ( !rfocusMorph.test( bubbleType + type ) ) {
					cur = cur.parentNode;
				}
				for ( ; cur; cur = cur.parentNode ) {
					eventPath.push( cur );
					tmp = cur;
				}
	
				// Only add window if we got to document (e.g., not plain obj or detached DOM)
				if ( tmp === ( elem.ownerDocument || document ) ) {
					eventPath.push( tmp.defaultView || tmp.parentWindow || window );
				}
			}
	
			// Fire handlers on the event path
			i = 0;
			while ( ( cur = eventPath[ i++ ] ) && !event.isPropagationStopped() ) {
	
				event.type = i > 1 ?
					bubbleType :
					special.bindType || type;
	
				// jQuery handler
				handle = ( dataPriv.get( cur, "events" ) || {} )[ event.type ] &&
					dataPriv.get( cur, "handle" );
				if ( handle ) {
					handle.apply( cur, data );
				}
	
				// Native handler
				handle = ontype && cur[ ontype ];
				if ( handle && handle.apply && acceptData( cur ) ) {
					event.result = handle.apply( cur, data );
					if ( event.result === false ) {
						event.preventDefault();
					}
				}
			}
			event.type = type;
	
			// If nobody prevented the default action, do it now
			if ( !onlyHandlers && !event.isDefaultPrevented() ) {
	
				if ( ( !special._default ||
					special._default.apply( eventPath.pop(), data ) === false ) &&
					acceptData( elem ) ) {
	
					// Call a native DOM method on the target with the same name name as the event.
					// Don't do default actions on window, that's where global variables be (#6170)
					if ( ontype && jQuery.isFunction( elem[ type ] ) && !jQuery.isWindow( elem ) ) {
	
						// Don't re-trigger an onFOO event when we call its FOO() method
						tmp = elem[ ontype ];
	
						if ( tmp ) {
							elem[ ontype ] = null;
						}
	
						// Prevent re-triggering of the same event, since we already bubbled it above
						jQuery.event.triggered = type;
						elem[ type ]();
						jQuery.event.triggered = undefined;
	
						if ( tmp ) {
							elem[ ontype ] = tmp;
						}
					}
				}
			}
	
			return event.result;
		},
	
		// Piggyback on a donor event to simulate a different one
		simulate: function( type, elem, event ) {
			var e = jQuery.extend(
				new jQuery.Event(),
				event,
				{
					type: type,
					isSimulated: true
	
					// Previously, `originalEvent: {}` was set here, so stopPropagation call
					// would not be triggered on donor event, since in our own
					// jQuery.event.stopPropagation function we had a check for existence of
					// originalEvent.stopPropagation method, so, consequently it would be a noop.
					//
					// But now, this "simulate" function is used only for events
					// for which stopPropagation() is noop, so there is no need for that anymore.
					//
					// For the 1.x branch though, guard for "click" and "submit"
					// events is still used, but was moved to jQuery.event.stopPropagation function
					// because `originalEvent` should point to the original event for the constancy
					// with other events and for more focused logic
				}
			);
	
			jQuery.event.trigger( e, null, elem );
	
			if ( e.isDefaultPrevented() ) {
				event.preventDefault();
			}
		}
	
	} );
	
	jQuery.fn.extend( {
	
		trigger: function( type, data ) {
			return this.each( function() {
				jQuery.event.trigger( type, data, this );
			} );
		},
		triggerHandler: function( type, data ) {
			var elem = this[ 0 ];
			if ( elem ) {
				return jQuery.event.trigger( type, data, elem, true );
			}
		}
	} );
	
	
	jQuery.each( ( "blur focus focusin focusout load resize scroll unload click dblclick " +
		"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
		"change select submit keydown keypress keyup error contextmenu" ).split( " " ),
		function( i, name ) {
	
		// Handle event binding
		jQuery.fn[ name ] = function( data, fn ) {
			return arguments.length > 0 ?
				this.on( name, null, data, fn ) :
				this.trigger( name );
		};
	} );
	
	jQuery.fn.extend( {
		hover: function( fnOver, fnOut ) {
			return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
		}
	} );
	
	
	
	
	support.focusin = "onfocusin" in window;
	
	
	// Support: Firefox
	// Firefox doesn't have focus(in | out) events
	// Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
	//
	// Support: Chrome, Safari
	// focus(in | out) events fire after focus & blur events,
	// which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
	// Related ticket - https://code.google.com/p/chromium/issues/detail?id=449857
	if ( !support.focusin ) {
		jQuery.each( { focus: "focusin", blur: "focusout" }, function( orig, fix ) {
	
			// Attach a single capturing handler on the document while someone wants focusin/focusout
			var handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ) );
			};
	
			jQuery.event.special[ fix ] = {
				setup: function() {
					var doc = this.ownerDocument || this,
						attaches = dataPriv.access( doc, fix );
	
					if ( !attaches ) {
						doc.addEventListener( orig, handler, true );
					}
					dataPriv.access( doc, fix, ( attaches || 0 ) + 1 );
				},
				teardown: function() {
					var doc = this.ownerDocument || this,
						attaches = dataPriv.access( doc, fix ) - 1;
	
					if ( !attaches ) {
						doc.removeEventListener( orig, handler, true );
						dataPriv.remove( doc, fix );
	
					} else {
						dataPriv.access( doc, fix, attaches );
					}
				}
			};
		} );
	}
	var location = window.location;
	
	var nonce = jQuery.now();
	
	var rquery = ( /\?/ );
	
	
	
	// Support: Android 2.3
	// Workaround failure to string-cast null input
	jQuery.parseJSON = function( data ) {
		return JSON.parse( data + "" );
	};
	
	
	// Cross-browser xml parsing
	jQuery.parseXML = function( data ) {
		var xml;
		if ( !data || typeof data !== "string" ) {
			return null;
		}
	
		// Support: IE9
		try {
			xml = ( new window.DOMParser() ).parseFromString( data, "text/xml" );
		} catch ( e ) {
			xml = undefined;
		}
	
		if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
			jQuery.error( "Invalid XML: " + data );
		}
		return xml;
	};
	
	
	var
		rhash = /#.*$/,
		rts = /([?&])_=[^&]*/,
		rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,
	
		// #7653, #8125, #8152: local protocol detection
		rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
		rnoContent = /^(?:GET|HEAD)$/,
		rprotocol = /^\/\//,
	
		/* Prefilters
		 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
		 * 2) These are called:
		 *    - BEFORE asking for a transport
		 *    - AFTER param serialization (s.data is a string if s.processData is true)
		 * 3) key is the dataType
		 * 4) the catchall symbol "*" can be used
		 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
		 */
		prefilters = {},
	
		/* Transports bindings
		 * 1) key is the dataType
		 * 2) the catchall symbol "*" can be used
		 * 3) selection will start with transport dataType and THEN go to "*" if needed
		 */
		transports = {},
	
		// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
		allTypes = "*/".concat( "*" ),
	
		// Anchor tag for parsing the document origin
		originAnchor = document.createElement( "a" );
		originAnchor.href = location.href;
	
	// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
	function addToPrefiltersOrTransports( structure ) {
	
		// dataTypeExpression is optional and defaults to "*"
		return function( dataTypeExpression, func ) {
	
			if ( typeof dataTypeExpression !== "string" ) {
				func = dataTypeExpression;
				dataTypeExpression = "*";
			}
	
			var dataType,
				i = 0,
				dataTypes = dataTypeExpression.toLowerCase().match( rnotwhite ) || [];
	
			if ( jQuery.isFunction( func ) ) {
	
				// For each dataType in the dataTypeExpression
				while ( ( dataType = dataTypes[ i++ ] ) ) {
	
					// Prepend if requested
					if ( dataType[ 0 ] === "+" ) {
						dataType = dataType.slice( 1 ) || "*";
						( structure[ dataType ] = structure[ dataType ] || [] ).unshift( func );
	
					// Otherwise append
					} else {
						( structure[ dataType ] = structure[ dataType ] || [] ).push( func );
					}
				}
			}
		};
	}
	
	// Base inspection function for prefilters and transports
	function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {
	
		var inspected = {},
			seekingTransport = ( structure === transports );
	
		function inspect( dataType ) {
			var selected;
			inspected[ dataType ] = true;
			jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
				var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
				if ( typeof dataTypeOrTransport === "string" &&
					!seekingTransport && !inspected[ dataTypeOrTransport ] ) {
	
					options.dataTypes.unshift( dataTypeOrTransport );
					inspect( dataTypeOrTransport );
					return false;
				} else if ( seekingTransport ) {
					return !( selected = dataTypeOrTransport );
				}
			} );
			return selected;
		}
	
		return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
	}
	
	// A special extend for ajax options
	// that takes "flat" options (not to be deep extended)
	// Fixes #9887
	function ajaxExtend( target, src ) {
		var key, deep,
			flatOptions = jQuery.ajaxSettings.flatOptions || {};
	
		for ( key in src ) {
			if ( src[ key ] !== undefined ) {
				( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
			}
		}
		if ( deep ) {
			jQuery.extend( true, target, deep );
		}
	
		return target;
	}
	
	/* Handles responses to an ajax request:
	 * - finds the right dataType (mediates between content-type and expected dataType)
	 * - returns the corresponding response
	 */
	function ajaxHandleResponses( s, jqXHR, responses ) {
	
		var ct, type, finalDataType, firstDataType,
			contents = s.contents,
			dataTypes = s.dataTypes;
	
		// Remove auto dataType and get content-type in the process
		while ( dataTypes[ 0 ] === "*" ) {
			dataTypes.shift();
			if ( ct === undefined ) {
				ct = s.mimeType || jqXHR.getResponseHeader( "Content-Type" );
			}
		}
	
		// Check if we're dealing with a known content-type
		if ( ct ) {
			for ( type in contents ) {
				if ( contents[ type ] && contents[ type ].test( ct ) ) {
					dataTypes.unshift( type );
					break;
				}
			}
		}
	
		// Check to see if we have a response for the expected dataType
		if ( dataTypes[ 0 ] in responses ) {
			finalDataType = dataTypes[ 0 ];
		} else {
	
			// Try convertible dataTypes
			for ( type in responses ) {
				if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[ 0 ] ] ) {
					finalDataType = type;
					break;
				}
				if ( !firstDataType ) {
					firstDataType = type;
				}
			}
	
			// Or just use first one
			finalDataType = finalDataType || firstDataType;
		}
	
		// If we found a dataType
		// We add the dataType to the list if needed
		// and return the corresponding response
		if ( finalDataType ) {
			if ( finalDataType !== dataTypes[ 0 ] ) {
				dataTypes.unshift( finalDataType );
			}
			return responses[ finalDataType ];
		}
	}
	
	/* Chain conversions given the request and the original response
	 * Also sets the responseXXX fields on the jqXHR instance
	 */
	function ajaxConvert( s, response, jqXHR, isSuccess ) {
		var conv2, current, conv, tmp, prev,
			converters = {},
	
			// Work with a copy of dataTypes in case we need to modify it for conversion
			dataTypes = s.dataTypes.slice();
	
		// Create converters map with lowercased keys
		if ( dataTypes[ 1 ] ) {
			for ( conv in s.converters ) {
				converters[ conv.toLowerCase() ] = s.converters[ conv ];
			}
		}
	
		current = dataTypes.shift();
	
		// Convert to each sequential dataType
		while ( current ) {
	
			if ( s.responseFields[ current ] ) {
				jqXHR[ s.responseFields[ current ] ] = response;
			}
	
			// Apply the dataFilter if provided
			if ( !prev && isSuccess && s.dataFilter ) {
				response = s.dataFilter( response, s.dataType );
			}
	
			prev = current;
			current = dataTypes.shift();
	
			if ( current ) {
	
			// There's only work to do if current dataType is non-auto
				if ( current === "*" ) {
	
					current = prev;
	
				// Convert response if prev dataType is non-auto and differs from current
				} else if ( prev !== "*" && prev !== current ) {
	
					// Seek a direct converter
					conv = converters[ prev + " " + current ] || converters[ "* " + current ];
	
					// If none found, seek a pair
					if ( !conv ) {
						for ( conv2 in converters ) {
	
							// If conv2 outputs current
							tmp = conv2.split( " " );
							if ( tmp[ 1 ] === current ) {
	
								// If prev can be converted to accepted input
								conv = converters[ prev + " " + tmp[ 0 ] ] ||
									converters[ "* " + tmp[ 0 ] ];
								if ( conv ) {
	
									// Condense equivalence converters
									if ( conv === true ) {
										conv = converters[ conv2 ];
	
									// Otherwise, insert the intermediate dataType
									} else if ( converters[ conv2 ] !== true ) {
										current = tmp[ 0 ];
										dataTypes.unshift( tmp[ 1 ] );
									}
									break;
								}
							}
						}
					}
	
					// Apply converter (if not an equivalence)
					if ( conv !== true ) {
	
						// Unless errors are allowed to bubble, catch and return them
						if ( conv && s.throws ) {
							response = conv( response );
						} else {
							try {
								response = conv( response );
							} catch ( e ) {
								return {
									state: "parsererror",
									error: conv ? e : "No conversion from " + prev + " to " + current
								};
							}
						}
					}
				}
			}
		}
	
		return { state: "success", data: response };
	}
	
	jQuery.extend( {
	
		// Counter for holding the number of active queries
		active: 0,
	
		// Last-Modified header cache for next request
		lastModified: {},
		etag: {},
	
		ajaxSettings: {
			url: location.href,
			type: "GET",
			isLocal: rlocalProtocol.test( location.protocol ),
			global: true,
			processData: true,
			async: true,
			contentType: "application/x-www-form-urlencoded; charset=UTF-8",
			/*
			timeout: 0,
			data: null,
			dataType: null,
			username: null,
			password: null,
			cache: null,
			throws: false,
			traditional: false,
			headers: {},
			*/
	
			accepts: {
				"*": allTypes,
				text: "text/plain",
				html: "text/html",
				xml: "application/xml, text/xml",
				json: "application/json, text/javascript"
			},
	
			contents: {
				xml: /\bxml\b/,
				html: /\bhtml/,
				json: /\bjson\b/
			},
	
			responseFields: {
				xml: "responseXML",
				text: "responseText",
				json: "responseJSON"
			},
	
			// Data converters
			// Keys separate source (or catchall "*") and destination types with a single space
			converters: {
	
				// Convert anything to text
				"* text": String,
	
				// Text to html (true = no transformation)
				"text html": true,
	
				// Evaluate text as a json expression
				"text json": jQuery.parseJSON,
	
				// Parse text as xml
				"text xml": jQuery.parseXML
			},
	
			// For options that shouldn't be deep extended:
			// you can add your own custom options here if
			// and when you create one that shouldn't be
			// deep extended (see ajaxExtend)
			flatOptions: {
				url: true,
				context: true
			}
		},
	
		// Creates a full fledged settings object into target
		// with both ajaxSettings and settings fields.
		// If target is omitted, writes into ajaxSettings.
		ajaxSetup: function( target, settings ) {
			return settings ?
	
				// Building a settings object
				ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :
	
				// Extending ajaxSettings
				ajaxExtend( jQuery.ajaxSettings, target );
		},
	
		ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
		ajaxTransport: addToPrefiltersOrTransports( transports ),
	
		// Main method
		ajax: function( url, options ) {
	
			// If url is an object, simulate pre-1.5 signature
			if ( typeof url === "object" ) {
				options = url;
				url = undefined;
			}
	
			// Force options to be an object
			options = options || {};
	
			var transport,
	
				// URL without anti-cache param
				cacheURL,
	
				// Response headers
				responseHeadersString,
				responseHeaders,
	
				// timeout handle
				timeoutTimer,
	
				// Url cleanup var
				urlAnchor,
	
				// To know if global events are to be dispatched
				fireGlobals,
	
				// Loop variable
				i,
	
				// Create the final options object
				s = jQuery.ajaxSetup( {}, options ),
	
				// Callbacks context
				callbackContext = s.context || s,
	
				// Context for global events is callbackContext if it is a DOM node or jQuery collection
				globalEventContext = s.context &&
					( callbackContext.nodeType || callbackContext.jquery ) ?
						jQuery( callbackContext ) :
						jQuery.event,
	
				// Deferreds
				deferred = jQuery.Deferred(),
				completeDeferred = jQuery.Callbacks( "once memory" ),
	
				// Status-dependent callbacks
				statusCode = s.statusCode || {},
	
				// Headers (they are sent all at once)
				requestHeaders = {},
				requestHeadersNames = {},
	
				// The jqXHR state
				state = 0,
	
				// Default abort message
				strAbort = "canceled",
	
				// Fake xhr
				jqXHR = {
					readyState: 0,
	
					// Builds headers hashtable if needed
					getResponseHeader: function( key ) {
						var match;
						if ( state === 2 ) {
							if ( !responseHeaders ) {
								responseHeaders = {};
								while ( ( match = rheaders.exec( responseHeadersString ) ) ) {
									responseHeaders[ match[ 1 ].toLowerCase() ] = match[ 2 ];
								}
							}
							match = responseHeaders[ key.toLowerCase() ];
						}
						return match == null ? null : match;
					},
	
					// Raw string
					getAllResponseHeaders: function() {
						return state === 2 ? responseHeadersString : null;
					},
	
					// Caches the header
					setRequestHeader: function( name, value ) {
						var lname = name.toLowerCase();
						if ( !state ) {
							name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
							requestHeaders[ name ] = value;
						}
						return this;
					},
	
					// Overrides response content-type header
					overrideMimeType: function( type ) {
						if ( !state ) {
							s.mimeType = type;
						}
						return this;
					},
	
					// Status-dependent callbacks
					statusCode: function( map ) {
						var code;
						if ( map ) {
							if ( state < 2 ) {
								for ( code in map ) {
	
									// Lazy-add the new callback in a way that preserves old ones
									statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
								}
							} else {
	
								// Execute the appropriate callbacks
								jqXHR.always( map[ jqXHR.status ] );
							}
						}
						return this;
					},
	
					// Cancel the request
					abort: function( statusText ) {
						var finalText = statusText || strAbort;
						if ( transport ) {
							transport.abort( finalText );
						}
						done( 0, finalText );
						return this;
					}
				};
	
			// Attach deferreds
			deferred.promise( jqXHR ).complete = completeDeferred.add;
			jqXHR.success = jqXHR.done;
			jqXHR.error = jqXHR.fail;
	
			// Remove hash character (#7531: and string promotion)
			// Add protocol if not provided (prefilters might expect it)
			// Handle falsy url in the settings object (#10093: consistency with old signature)
			// We also use the url parameter if available
			s.url = ( ( url || s.url || location.href ) + "" ).replace( rhash, "" )
				.replace( rprotocol, location.protocol + "//" );
	
			// Alias method option to type as per ticket #12004
			s.type = options.method || options.type || s.method || s.type;
	
			// Extract dataTypes list
			s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( rnotwhite ) || [ "" ];
	
			// A cross-domain request is in order when the origin doesn't match the current origin.
			if ( s.crossDomain == null ) {
				urlAnchor = document.createElement( "a" );
	
				// Support: IE8-11+
				// IE throws exception if url is malformed, e.g. http://example.com:80x/
				try {
					urlAnchor.href = s.url;
	
					// Support: IE8-11+
					// Anchor's host property isn't correctly set when s.url is relative
					urlAnchor.href = urlAnchor.href;
					s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !==
						urlAnchor.protocol + "//" + urlAnchor.host;
				} catch ( e ) {
	
					// If there is an error parsing the URL, assume it is crossDomain,
					// it can be rejected by the transport if it is invalid
					s.crossDomain = true;
				}
			}
	
			// Convert data if not already a string
			if ( s.data && s.processData && typeof s.data !== "string" ) {
				s.data = jQuery.param( s.data, s.traditional );
			}
	
			// Apply prefilters
			inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );
	
			// If request was aborted inside a prefilter, stop there
			if ( state === 2 ) {
				return jqXHR;
			}
	
			// We can fire global events as of now if asked to
			// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
			fireGlobals = jQuery.event && s.global;
	
			// Watch for a new set of requests
			if ( fireGlobals && jQuery.active++ === 0 ) {
				jQuery.event.trigger( "ajaxStart" );
			}
	
			// Uppercase the type
			s.type = s.type.toUpperCase();
	
			// Determine if request has content
			s.hasContent = !rnoContent.test( s.type );
	
			// Save the URL in case we're toying with the If-Modified-Since
			// and/or If-None-Match header later on
			cacheURL = s.url;
	
			// More options handling for requests with no content
			if ( !s.hasContent ) {
	
				// If data is available, append data to url
				if ( s.data ) {
					cacheURL = ( s.url += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data );
	
					// #9682: remove data so that it's not used in an eventual retry
					delete s.data;
				}
	
				// Add anti-cache in url if needed
				if ( s.cache === false ) {
					s.url = rts.test( cacheURL ) ?
	
						// If there is already a '_' parameter, set its value
						cacheURL.replace( rts, "$1_=" + nonce++ ) :
	
						// Otherwise add one to the end
						cacheURL + ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + nonce++;
				}
			}
	
			// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
			if ( s.ifModified ) {
				if ( jQuery.lastModified[ cacheURL ] ) {
					jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
				}
				if ( jQuery.etag[ cacheURL ] ) {
					jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
				}
			}
	
			// Set the correct header, if data is being sent
			if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
				jqXHR.setRequestHeader( "Content-Type", s.contentType );
			}
	
			// Set the Accepts header for the server, depending on the dataType
			jqXHR.setRequestHeader(
				"Accept",
				s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[ 0 ] ] ?
					s.accepts[ s.dataTypes[ 0 ] ] +
						( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
					s.accepts[ "*" ]
			);
	
			// Check for headers option
			for ( i in s.headers ) {
				jqXHR.setRequestHeader( i, s.headers[ i ] );
			}
	
			// Allow custom headers/mimetypes and early abort
			if ( s.beforeSend &&
				( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
	
				// Abort if not done already and return
				return jqXHR.abort();
			}
	
			// Aborting is no longer a cancellation
			strAbort = "abort";
	
			// Install callbacks on deferreds
			for ( i in { success: 1, error: 1, complete: 1 } ) {
				jqXHR[ i ]( s[ i ] );
			}
	
			// Get transport
			transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );
	
			// If no transport, we auto-abort
			if ( !transport ) {
				done( -1, "No Transport" );
			} else {
				jqXHR.readyState = 1;
	
				// Send global event
				if ( fireGlobals ) {
					globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
				}
	
				// If request was aborted inside ajaxSend, stop there
				if ( state === 2 ) {
					return jqXHR;
				}
	
				// Timeout
				if ( s.async && s.timeout > 0 ) {
					timeoutTimer = window.setTimeout( function() {
						jqXHR.abort( "timeout" );
					}, s.timeout );
				}
	
				try {
					state = 1;
					transport.send( requestHeaders, done );
				} catch ( e ) {
	
					// Propagate exception as error if not done
					if ( state < 2 ) {
						done( -1, e );
	
					// Simply rethrow otherwise
					} else {
						throw e;
					}
				}
			}
	
			// Callback for when everything is done
			function done( status, nativeStatusText, responses, headers ) {
				var isSuccess, success, error, response, modified,
					statusText = nativeStatusText;
	
				// Called once
				if ( state === 2 ) {
					return;
				}
	
				// State is "done" now
				state = 2;
	
				// Clear timeout if it exists
				if ( timeoutTimer ) {
					window.clearTimeout( timeoutTimer );
				}
	
				// Dereference transport for early garbage collection
				// (no matter how long the jqXHR object will be used)
				transport = undefined;
	
				// Cache response headers
				responseHeadersString = headers || "";
	
				// Set readyState
				jqXHR.readyState = status > 0 ? 4 : 0;
	
				// Determine if successful
				isSuccess = status >= 200 && status < 300 || status === 304;
	
				// Get response data
				if ( responses ) {
					response = ajaxHandleResponses( s, jqXHR, responses );
				}
	
				// Convert no matter what (that way responseXXX fields are always set)
				response = ajaxConvert( s, response, jqXHR, isSuccess );
	
				// If successful, handle type chaining
				if ( isSuccess ) {
	
					// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
					if ( s.ifModified ) {
						modified = jqXHR.getResponseHeader( "Last-Modified" );
						if ( modified ) {
							jQuery.lastModified[ cacheURL ] = modified;
						}
						modified = jqXHR.getResponseHeader( "etag" );
						if ( modified ) {
							jQuery.etag[ cacheURL ] = modified;
						}
					}
	
					// if no content
					if ( status === 204 || s.type === "HEAD" ) {
						statusText = "nocontent";
	
					// if not modified
					} else if ( status === 304 ) {
						statusText = "notmodified";
	
					// If we have data, let's convert it
					} else {
						statusText = response.state;
						success = response.data;
						error = response.error;
						isSuccess = !error;
					}
				} else {
	
					// Extract error from statusText and normalize for non-aborts
					error = statusText;
					if ( status || !statusText ) {
						statusText = "error";
						if ( status < 0 ) {
							status = 0;
						}
					}
				}
	
				// Set data for the fake xhr object
				jqXHR.status = status;
				jqXHR.statusText = ( nativeStatusText || statusText ) + "";
	
				// Success/Error
				if ( isSuccess ) {
					deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
				} else {
					deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
				}
	
				// Status-dependent callbacks
				jqXHR.statusCode( statusCode );
				statusCode = undefined;
	
				if ( fireGlobals ) {
					globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
						[ jqXHR, s, isSuccess ? success : error ] );
				}
	
				// Complete
				completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );
	
				if ( fireGlobals ) {
					globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
	
					// Handle the global AJAX counter
					if ( !( --jQuery.active ) ) {
						jQuery.event.trigger( "ajaxStop" );
					}
				}
			}
	
			return jqXHR;
		},
	
		getJSON: function( url, data, callback ) {
			return jQuery.get( url, data, callback, "json" );
		},
	
		getScript: function( url, callback ) {
			return jQuery.get( url, undefined, callback, "script" );
		}
	} );
	
	jQuery.each( [ "get", "post" ], function( i, method ) {
		jQuery[ method ] = function( url, data, callback, type ) {
	
			// Shift arguments if data argument was omitted
			if ( jQuery.isFunction( data ) ) {
				type = type || callback;
				callback = data;
				data = undefined;
			}
	
			// The url can be an options object (which then must have .url)
			return jQuery.ajax( jQuery.extend( {
				url: url,
				type: method,
				dataType: type,
				data: data,
				success: callback
			}, jQuery.isPlainObject( url ) && url ) );
		};
	} );
	
	
	jQuery._evalUrl = function( url ) {
		return jQuery.ajax( {
			url: url,
	
			// Make this explicit, since user can override this through ajaxSetup (#11264)
			type: "GET",
			dataType: "script",
			async: false,
			global: false,
			"throws": true
		} );
	};
	
	
	jQuery.fn.extend( {
		wrapAll: function( html ) {
			var wrap;
	
			if ( jQuery.isFunction( html ) ) {
				return this.each( function( i ) {
					jQuery( this ).wrapAll( html.call( this, i ) );
				} );
			}
	
			if ( this[ 0 ] ) {
	
				// The elements to wrap the target around
				wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );
	
				if ( this[ 0 ].parentNode ) {
					wrap.insertBefore( this[ 0 ] );
				}
	
				wrap.map( function() {
					var elem = this;
	
					while ( elem.firstElementChild ) {
						elem = elem.firstElementChild;
					}
	
					return elem;
				} ).append( this );
			}
	
			return this;
		},
	
		wrapInner: function( html ) {
			if ( jQuery.isFunction( html ) ) {
				return this.each( function( i ) {
					jQuery( this ).wrapInner( html.call( this, i ) );
				} );
			}
	
			return this.each( function() {
				var self = jQuery( this ),
					contents = self.contents();
	
				if ( contents.length ) {
					contents.wrapAll( html );
	
				} else {
					self.append( html );
				}
			} );
		},
	
		wrap: function( html ) {
			var isFunction = jQuery.isFunction( html );
	
			return this.each( function( i ) {
				jQuery( this ).wrapAll( isFunction ? html.call( this, i ) : html );
			} );
		},
	
		unwrap: function() {
			return this.parent().each( function() {
				if ( !jQuery.nodeName( this, "body" ) ) {
					jQuery( this ).replaceWith( this.childNodes );
				}
			} ).end();
		}
	} );
	
	
	jQuery.expr.filters.hidden = function( elem ) {
		return !jQuery.expr.filters.visible( elem );
	};
	jQuery.expr.filters.visible = function( elem ) {
	
		// Support: Opera <= 12.12
		// Opera reports offsetWidths and offsetHeights less than zero on some elements
		// Use OR instead of AND as the element is not visible if either is true
		// See tickets #10406 and #13132
		return elem.offsetWidth > 0 || elem.offsetHeight > 0 || elem.getClientRects().length > 0;
	};
	
	
	
	
	var r20 = /%20/g,
		rbracket = /\[\]$/,
		rCRLF = /\r?\n/g,
		rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
		rsubmittable = /^(?:input|select|textarea|keygen)/i;
	
	function buildParams( prefix, obj, traditional, add ) {
		var name;
	
		if ( jQuery.isArray( obj ) ) {
	
			// Serialize array item.
			jQuery.each( obj, function( i, v ) {
				if ( traditional || rbracket.test( prefix ) ) {
	
					// Treat each array item as a scalar.
					add( prefix, v );
	
				} else {
	
					// Item is non-scalar (array or object), encode its numeric index.
					buildParams(
						prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
						v,
						traditional,
						add
					);
				}
			} );
	
		} else if ( !traditional && jQuery.type( obj ) === "object" ) {
	
			// Serialize object item.
			for ( name in obj ) {
				buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
			}
	
		} else {
	
			// Serialize scalar item.
			add( prefix, obj );
		}
	}
	
	// Serialize an array of form elements or a set of
	// key/values into a query string
	jQuery.param = function( a, traditional ) {
		var prefix,
			s = [],
			add = function( key, value ) {
	
				// If value is a function, invoke it and return its value
				value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
				s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
			};
	
		// Set traditional to true for jQuery <= 1.3.2 behavior.
		if ( traditional === undefined ) {
			traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
		}
	
		// If an array was passed in, assume that it is an array of form elements.
		if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
	
			// Serialize the form elements
			jQuery.each( a, function() {
				add( this.name, this.value );
			} );
	
		} else {
	
			// If traditional, encode the "old" way (the way 1.3.2 or older
			// did it), otherwise encode params recursively.
			for ( prefix in a ) {
				buildParams( prefix, a[ prefix ], traditional, add );
			}
		}
	
		// Return the resulting serialization
		return s.join( "&" ).replace( r20, "+" );
	};
	
	jQuery.fn.extend( {
		serialize: function() {
			return jQuery.param( this.serializeArray() );
		},
		serializeArray: function() {
			return this.map( function() {
	
				// Can add propHook for "elements" to filter or add form elements
				var elements = jQuery.prop( this, "elements" );
				return elements ? jQuery.makeArray( elements ) : this;
			} )
			.filter( function() {
				var type = this.type;
	
				// Use .is( ":disabled" ) so that fieldset[disabled] works
				return this.name && !jQuery( this ).is( ":disabled" ) &&
					rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
					( this.checked || !rcheckableType.test( type ) );
			} )
			.map( function( i, elem ) {
				var val = jQuery( this ).val();
	
				return val == null ?
					null :
					jQuery.isArray( val ) ?
						jQuery.map( val, function( val ) {
							return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
						} ) :
						{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
			} ).get();
		}
	} );
	
	
	jQuery.ajaxSettings.xhr = function() {
		try {
			return new window.XMLHttpRequest();
		} catch ( e ) {}
	};
	
	var xhrSuccessStatus = {
	
			// File protocol always yields status code 0, assume 200
			0: 200,
	
			// Support: IE9
			// #1450: sometimes IE returns 1223 when it should be 204
			1223: 204
		},
		xhrSupported = jQuery.ajaxSettings.xhr();
	
	support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
	support.ajax = xhrSupported = !!xhrSupported;
	
	jQuery.ajaxTransport( function( options ) {
		var callback, errorCallback;
	
		// Cross domain only allowed if supported through XMLHttpRequest
		if ( support.cors || xhrSupported && !options.crossDomain ) {
			return {
				send: function( headers, complete ) {
					var i,
						xhr = options.xhr();
	
					xhr.open(
						options.type,
						options.url,
						options.async,
						options.username,
						options.password
					);
	
					// Apply custom fields if provided
					if ( options.xhrFields ) {
						for ( i in options.xhrFields ) {
							xhr[ i ] = options.xhrFields[ i ];
						}
					}
	
					// Override mime type if needed
					if ( options.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( options.mimeType );
					}
	
					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
						headers[ "X-Requested-With" ] = "XMLHttpRequest";
					}
	
					// Set headers
					for ( i in headers ) {
						xhr.setRequestHeader( i, headers[ i ] );
					}
	
					// Callback
					callback = function( type ) {
						return function() {
							if ( callback ) {
								callback = errorCallback = xhr.onload =
									xhr.onerror = xhr.onabort = xhr.onreadystatechange = null;
	
								if ( type === "abort" ) {
									xhr.abort();
								} else if ( type === "error" ) {
	
									// Support: IE9
									// On a manual native abort, IE9 throws
									// errors on any property access that is not readyState
									if ( typeof xhr.status !== "number" ) {
										complete( 0, "error" );
									} else {
										complete(
	
											// File: protocol always yields status 0; see #8605, #14207
											xhr.status,
											xhr.statusText
										);
									}
								} else {
									complete(
										xhrSuccessStatus[ xhr.status ] || xhr.status,
										xhr.statusText,
	
										// Support: IE9 only
										// IE9 has no XHR2 but throws on binary (trac-11426)
										// For XHR2 non-text, let the caller handle it (gh-2498)
										( xhr.responseType || "text" ) !== "text"  ||
										typeof xhr.responseText !== "string" ?
											{ binary: xhr.response } :
											{ text: xhr.responseText },
										xhr.getAllResponseHeaders()
									);
								}
							}
						};
					};
	
					// Listen to events
					xhr.onload = callback();
					errorCallback = xhr.onerror = callback( "error" );
	
					// Support: IE9
					// Use onreadystatechange to replace onabort
					// to handle uncaught aborts
					if ( xhr.onabort !== undefined ) {
						xhr.onabort = errorCallback;
					} else {
						xhr.onreadystatechange = function() {
	
							// Check readyState before timeout as it changes
							if ( xhr.readyState === 4 ) {
	
								// Allow onerror to be called first,
								// but that will not handle a native abort
								// Also, save errorCallback to a variable
								// as xhr.onerror cannot be accessed
								window.setTimeout( function() {
									if ( callback ) {
										errorCallback();
									}
								} );
							}
						};
					}
	
					// Create the abort callback
					callback = callback( "abort" );
	
					try {
	
						// Do send the request (this may raise an exception)
						xhr.send( options.hasContent && options.data || null );
					} catch ( e ) {
	
						// #14683: Only rethrow if this hasn't been notified as an error yet
						if ( callback ) {
							throw e;
						}
					}
				},
	
				abort: function() {
					if ( callback ) {
						callback();
					}
				}
			};
		}
	} );
	
	
	
	
	// Install script dataType
	jQuery.ajaxSetup( {
		accepts: {
			script: "text/javascript, application/javascript, " +
				"application/ecmascript, application/x-ecmascript"
		},
		contents: {
			script: /\b(?:java|ecma)script\b/
		},
		converters: {
			"text script": function( text ) {
				jQuery.globalEval( text );
				return text;
			}
		}
	} );
	
	// Handle cache's special case and crossDomain
	jQuery.ajaxPrefilter( "script", function( s ) {
		if ( s.cache === undefined ) {
			s.cache = false;
		}
		if ( s.crossDomain ) {
			s.type = "GET";
		}
	} );
	
	// Bind script tag hack transport
	jQuery.ajaxTransport( "script", function( s ) {
	
		// This transport only deals with cross domain requests
		if ( s.crossDomain ) {
			var script, callback;
			return {
				send: function( _, complete ) {
					script = jQuery( "<script>" ).prop( {
						charset: s.scriptCharset,
						src: s.url
					} ).on(
						"load error",
						callback = function( evt ) {
							script.remove();
							callback = null;
							if ( evt ) {
								complete( evt.type === "error" ? 404 : 200, evt.type );
							}
						}
					);
	
					// Use native DOM manipulation to avoid our domManip AJAX trickery
					document.head.appendChild( script[ 0 ] );
				},
				abort: function() {
					if ( callback ) {
						callback();
					}
				}
			};
		}
	} );
	
	
	
	
	var oldCallbacks = [],
		rjsonp = /(=)\?(?=&|$)|\?\?/;
	
	// Default jsonp settings
	jQuery.ajaxSetup( {
		jsonp: "callback",
		jsonpCallback: function() {
			var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
			this[ callback ] = true;
			return callback;
		}
	} );
	
	// Detect, normalize options and install callbacks for jsonp requests
	jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {
	
		var callbackName, overwritten, responseContainer,
			jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
				"url" :
				typeof s.data === "string" &&
					( s.contentType || "" )
						.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
					rjsonp.test( s.data ) && "data"
			);
	
		// Handle iff the expected data type is "jsonp" or we have a parameter to set
		if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {
	
			// Get callback name, remembering preexisting value associated with it
			callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
				s.jsonpCallback() :
				s.jsonpCallback;
	
			// Insert callback into url or form data
			if ( jsonProp ) {
				s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
			} else if ( s.jsonp !== false ) {
				s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
			}
	
			// Use data converter to retrieve json after script execution
			s.converters[ "script json" ] = function() {
				if ( !responseContainer ) {
					jQuery.error( callbackName + " was not called" );
				}
				return responseContainer[ 0 ];
			};
	
			// Force json dataType
			s.dataTypes[ 0 ] = "json";
	
			// Install callback
			overwritten = window[ callbackName ];
			window[ callbackName ] = function() {
				responseContainer = arguments;
			};
	
			// Clean-up function (fires after converters)
			jqXHR.always( function() {
	
				// If previous value didn't exist - remove it
				if ( overwritten === undefined ) {
					jQuery( window ).removeProp( callbackName );
	
				// Otherwise restore preexisting value
				} else {
					window[ callbackName ] = overwritten;
				}
	
				// Save back as free
				if ( s[ callbackName ] ) {
	
					// Make sure that re-using the options doesn't screw things around
					s.jsonpCallback = originalSettings.jsonpCallback;
	
					// Save the callback name for future use
					oldCallbacks.push( callbackName );
				}
	
				// Call if it was a function and we have a response
				if ( responseContainer && jQuery.isFunction( overwritten ) ) {
					overwritten( responseContainer[ 0 ] );
				}
	
				responseContainer = overwritten = undefined;
			} );
	
			// Delegate to script
			return "script";
		}
	} );
	
	
	
	
	// Support: Safari 8+
	// In Safari 8 documents created via document.implementation.createHTMLDocument
	// collapse sibling forms: the second one becomes a child of the first one.
	// Because of that, this security measure has to be disabled in Safari 8.
	// https://bugs.webkit.org/show_bug.cgi?id=137337
	support.createHTMLDocument = ( function() {
		var body = document.implementation.createHTMLDocument( "" ).body;
		body.innerHTML = "<form></form><form></form>";
		return body.childNodes.length === 2;
	} )();
	
	
	// Argument "data" should be string of html
	// context (optional): If specified, the fragment will be created in this context,
	// defaults to document
	// keepScripts (optional): If true, will include scripts passed in the html string
	jQuery.parseHTML = function( data, context, keepScripts ) {
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		if ( typeof context === "boolean" ) {
			keepScripts = context;
			context = false;
		}
	
		// Stop scripts or inline event handlers from being executed immediately
		// by using document.implementation
		context = context || ( support.createHTMLDocument ?
			document.implementation.createHTMLDocument( "" ) :
			document );
	
		var parsed = rsingleTag.exec( data ),
			scripts = !keepScripts && [];
	
		// Single tag
		if ( parsed ) {
			return [ context.createElement( parsed[ 1 ] ) ];
		}
	
		parsed = buildFragment( [ data ], context, scripts );
	
		if ( scripts && scripts.length ) {
			jQuery( scripts ).remove();
		}
	
		return jQuery.merge( [], parsed.childNodes );
	};
	
	
	// Keep a copy of the old load method
	var _load = jQuery.fn.load;
	
	/**
	 * Load a url into a page
	 */
	jQuery.fn.load = function( url, params, callback ) {
		if ( typeof url !== "string" && _load ) {
			return _load.apply( this, arguments );
		}
	
		var selector, type, response,
			self = this,
			off = url.indexOf( " " );
	
		if ( off > -1 ) {
			selector = jQuery.trim( url.slice( off ) );
			url = url.slice( 0, off );
		}
	
		// If it's a function
		if ( jQuery.isFunction( params ) ) {
	
			// We assume that it's the callback
			callback = params;
			params = undefined;
	
		// Otherwise, build a param string
		} else if ( params && typeof params === "object" ) {
			type = "POST";
		}
	
		// If we have elements to modify, make the request
		if ( self.length > 0 ) {
			jQuery.ajax( {
				url: url,
	
				// If "type" variable is undefined, then "GET" method will be used.
				// Make value of this field explicit since
				// user can override it through ajaxSetup method
				type: type || "GET",
				dataType: "html",
				data: params
			} ).done( function( responseText ) {
	
				// Save response for use in complete callback
				response = arguments;
	
				self.html( selector ?
	
					// If a selector was specified, locate the right elements in a dummy div
					// Exclude scripts to avoid IE 'Permission Denied' errors
					jQuery( "<div>" ).append( jQuery.parseHTML( responseText ) ).find( selector ) :
	
					// Otherwise use the full result
					responseText );
	
			// If the request succeeds, this function gets "data", "status", "jqXHR"
			// but they are ignored because response was set above.
			// If it fails, this function gets "jqXHR", "status", "error"
			} ).always( callback && function( jqXHR, status ) {
				self.each( function() {
					callback.apply( self, response || [ jqXHR.responseText, status, jqXHR ] );
				} );
			} );
		}
	
		return this;
	};
	
	
	
	
	// Attach a bunch of functions for handling common AJAX events
	jQuery.each( [
		"ajaxStart",
		"ajaxStop",
		"ajaxComplete",
		"ajaxError",
		"ajaxSuccess",
		"ajaxSend"
	], function( i, type ) {
		jQuery.fn[ type ] = function( fn ) {
			return this.on( type, fn );
		};
	} );
	
	
	
	
	jQuery.expr.filters.animated = function( elem ) {
		return jQuery.grep( jQuery.timers, function( fn ) {
			return elem === fn.elem;
		} ).length;
	};
	
	
	
	
	/**
	 * Gets a window from an element
	 */
	function getWindow( elem ) {
		return jQuery.isWindow( elem ) ? elem : elem.nodeType === 9 && elem.defaultView;
	}
	
	jQuery.offset = {
		setOffset: function( elem, options, i ) {
			var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
				position = jQuery.css( elem, "position" ),
				curElem = jQuery( elem ),
				props = {};
	
			// Set position first, in-case top/left are set even on static elem
			if ( position === "static" ) {
				elem.style.position = "relative";
			}
	
			curOffset = curElem.offset();
			curCSSTop = jQuery.css( elem, "top" );
			curCSSLeft = jQuery.css( elem, "left" );
			calculatePosition = ( position === "absolute" || position === "fixed" ) &&
				( curCSSTop + curCSSLeft ).indexOf( "auto" ) > -1;
	
			// Need to be able to calculate position if either
			// top or left is auto and position is either absolute or fixed
			if ( calculatePosition ) {
				curPosition = curElem.position();
				curTop = curPosition.top;
				curLeft = curPosition.left;
	
			} else {
				curTop = parseFloat( curCSSTop ) || 0;
				curLeft = parseFloat( curCSSLeft ) || 0;
			}
	
			if ( jQuery.isFunction( options ) ) {
	
				// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
				options = options.call( elem, i, jQuery.extend( {}, curOffset ) );
			}
	
			if ( options.top != null ) {
				props.top = ( options.top - curOffset.top ) + curTop;
			}
			if ( options.left != null ) {
				props.left = ( options.left - curOffset.left ) + curLeft;
			}
	
			if ( "using" in options ) {
				options.using.call( elem, props );
	
			} else {
				curElem.css( props );
			}
		}
	};
	
	jQuery.fn.extend( {
		offset: function( options ) {
			if ( arguments.length ) {
				return options === undefined ?
					this :
					this.each( function( i ) {
						jQuery.offset.setOffset( this, options, i );
					} );
			}
	
			var docElem, win,
				elem = this[ 0 ],
				box = { top: 0, left: 0 },
				doc = elem && elem.ownerDocument;
	
			if ( !doc ) {
				return;
			}
	
			docElem = doc.documentElement;
	
			// Make sure it's not a disconnected DOM node
			if ( !jQuery.contains( docElem, elem ) ) {
				return box;
			}
	
			box = elem.getBoundingClientRect();
			win = getWindow( doc );
			return {
				top: box.top + win.pageYOffset - docElem.clientTop,
				left: box.left + win.pageXOffset - docElem.clientLeft
			};
		},
	
		position: function() {
			if ( !this[ 0 ] ) {
				return;
			}
	
			var offsetParent, offset,
				elem = this[ 0 ],
				parentOffset = { top: 0, left: 0 };
	
			// Fixed elements are offset from window (parentOffset = {top:0, left: 0},
			// because it is its only offset parent
			if ( jQuery.css( elem, "position" ) === "fixed" ) {
	
				// Assume getBoundingClientRect is there when computed position is fixed
				offset = elem.getBoundingClientRect();
	
			} else {
	
				// Get *real* offsetParent
				offsetParent = this.offsetParent();
	
				// Get correct offsets
				offset = this.offset();
				if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
					parentOffset = offsetParent.offset();
				}
	
				// Add offsetParent borders
				parentOffset.top += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
				parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
			}
	
			// Subtract parent offsets and element margins
			return {
				top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
				left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
			};
		},
	
		// This method will return documentElement in the following cases:
		// 1) For the element inside the iframe without offsetParent, this method will return
		//    documentElement of the parent window
		// 2) For the hidden or detached element
		// 3) For body or html element, i.e. in case of the html node - it will return itself
		//
		// but those exceptions were never presented as a real life use-cases
		// and might be considered as more preferable results.
		//
		// This logic, however, is not guaranteed and can change at any point in the future
		offsetParent: function() {
			return this.map( function() {
				var offsetParent = this.offsetParent;
	
				while ( offsetParent && jQuery.css( offsetParent, "position" ) === "static" ) {
					offsetParent = offsetParent.offsetParent;
				}
	
				return offsetParent || documentElement;
			} );
		}
	} );
	
	// Create scrollLeft and scrollTop methods
	jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
		var top = "pageYOffset" === prop;
	
		jQuery.fn[ method ] = function( val ) {
			return access( this, function( elem, method, val ) {
				var win = getWindow( elem );
	
				if ( val === undefined ) {
					return win ? win[ prop ] : elem[ method ];
				}
	
				if ( win ) {
					win.scrollTo(
						!top ? val : win.pageXOffset,
						top ? val : win.pageYOffset
					);
	
				} else {
					elem[ method ] = val;
				}
			}, method, val, arguments.length );
		};
	} );
	
	// Support: Safari<7-8+, Chrome<37-44+
	// Add the top/left cssHooks using jQuery.fn.position
	// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
	// Blink bug: https://code.google.com/p/chromium/issues/detail?id=229280
	// getComputedStyle returns percent when specified for top/left/bottom/right;
	// rather than make the css module depend on the offset module, just check for it here
	jQuery.each( [ "top", "left" ], function( i, prop ) {
		jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
			function( elem, computed ) {
				if ( computed ) {
					computed = curCSS( elem, prop );
	
					// If curCSS returns percentage, fallback to offset
					return rnumnonpx.test( computed ) ?
						jQuery( elem ).position()[ prop ] + "px" :
						computed;
				}
			}
		);
	} );
	
	
	// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
	jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
		jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name },
			function( defaultExtra, funcName ) {
	
			// Margin is only for outerHeight, outerWidth
			jQuery.fn[ funcName ] = function( margin, value ) {
				var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
					extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );
	
				return access( this, function( elem, type, value ) {
					var doc;
	
					if ( jQuery.isWindow( elem ) ) {
	
						// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
						// isn't a whole lot we can do. See pull request at this URL for discussion:
						// https://github.com/jquery/jquery/pull/764
						return elem.document.documentElement[ "client" + name ];
					}
	
					// Get document width or height
					if ( elem.nodeType === 9 ) {
						doc = elem.documentElement;
	
						// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
						// whichever is greatest
						return Math.max(
							elem.body[ "scroll" + name ], doc[ "scroll" + name ],
							elem.body[ "offset" + name ], doc[ "offset" + name ],
							doc[ "client" + name ]
						);
					}
	
					return value === undefined ?
	
						// Get width or height on the element, requesting but not forcing parseFloat
						jQuery.css( elem, type, extra ) :
	
						// Set width or height on the element
						jQuery.style( elem, type, value, extra );
				}, type, chainable ? margin : undefined, chainable, null );
			};
		} );
	} );
	
	
	jQuery.fn.extend( {
	
		bind: function( types, data, fn ) {
			return this.on( types, null, data, fn );
		},
		unbind: function( types, fn ) {
			return this.off( types, null, fn );
		},
	
		delegate: function( selector, types, data, fn ) {
			return this.on( types, selector, data, fn );
		},
		undelegate: function( selector, types, fn ) {
	
			// ( namespace ) or ( selector, types [, fn] )
			return arguments.length === 1 ?
				this.off( selector, "**" ) :
				this.off( types, selector || "**", fn );
		},
		size: function() {
			return this.length;
		}
	} );
	
	jQuery.fn.andSelf = jQuery.fn.addBack;
	
	
	
	
	// Register as a named AMD module, since jQuery can be concatenated with other
	// files that may use define, but not via a proper concatenation script that
	// understands anonymous AMD modules. A named AMD is safest and most robust
	// way to register. Lowercase jquery is used because AMD module names are
	// derived from file names, and jQuery is normally delivered in a lowercase
	// file name. Do this after creating the global so that if an AMD module wants
	// to call noConflict to hide this version of jQuery, it will work.
	
	// Note that for maximum portability, libraries that are not jQuery should
	// declare themselves as anonymous modules, and avoid setting a global if an
	// AMD loader is present. jQuery is a special case. For more information, see
	// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon
	
	if ( true ) {
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
			return jQuery;
		}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}
	
	
	
	var
	
		// Map over jQuery in case of overwrite
		_jQuery = window.jQuery,
	
		// Map over the $ in case of overwrite
		_$ = window.$;
	
	jQuery.noConflict = function( deep ) {
		if ( window.$ === jQuery ) {
			window.$ = _$;
		}
	
		if ( deep && window.jQuery === jQuery ) {
			window.jQuery = _jQuery;
		}
	
		return jQuery;
	};
	
	// Expose jQuery and $ identifiers, even in AMD
	// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
	// and CommonJS for browser emulators (#13566)
	if ( !noGlobal ) {
		window.jQuery = window.$ = jQuery;
	}
	
	return jQuery;
	}));


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var textures = __webpack_require__(5),
	    chroma = __webpack_require__(7);
	
	var treeUtils = __webpack_require__(9),
	    utils = __webpack_require__(10);
	
	var duration = 100;
	var curId = 1;
	
	var gray = chroma.hsl(0, 0, 0.55).brighten(0.5),
	    red = chroma.hsl(6, 0.98, 0.69).brighten(0.5),
	    green = chroma.hsl(156, 0.88, 0.37).brighten(0.5);
	
	var inactiveRed = chroma(red).darken(1),
	    //.desaturate(),
	inactiveGreen = chroma(green).darken(1),
	    inactiveGray = chroma(gray).darken(1); //.desaturate();
	
	function fillColor(n) {
	  if (n.landmark) {
	    return n.leaf ? inactiveGray : gray;
	  } else if (n.cstNodes[0].result instanceof Error) {
	    return n.leaf ? inactiveRed.css() : red.css();
	  } else if (n.cstNodes[0].result) {
	    return n.leaf ? inactiveGreen.css() : green.css();
	  } else {
	    return n.leaf ? inactiveGray : gray;
	  }
	}
	
	function radius(n) {
	  if (n.landmark || n.keyword) {
	    return 5;
	  } else {
	    return 4;
	  }
	}
	
	var TreeView = function () {
	  function TreeView(svg, _ref) {
	    var root = _ref.root;
	    var actions = _ref.actions;
	
	    _classCallCheck(this, TreeView);
	
	    this.actions = actions;
	
	    this.svg = d3.select(svg);
	    this.svg = this.svg.append("g").attr("transform", "translate(10, 0)");
	
	    var boundingRect = svg.getBoundingClientRect();
	    this.width = boundingRect.width - 50;
	    this.height = boundingRect.height - 10;
	
	    this.tree = d3.layout.tree().children(function (node) {
	      var children = node.originalChildren();
	      var descendants = treeUtils.descendants(node, function (x) {
	        return x.originalChildren();
	      });
	
	      if (node.splittable() //only show children when some descendants are current
	       && descendants.reduce(function (a, b) {
	        return a || b.current;
	      }, false)) {
	        return children;
	      }
	
	      return null;
	    }).size([this.height, this.width]).separation(function separation(a, b) {
	      var divisor = Math.pow(1.07, a.depth === 0 ? 1 : a.depth);
	      return (a.parent == b.parent ? 1 : 2) / divisor;
	    });
	
	    this.diagonal = d3.svg.diagonal().projection(function (diag) {
	      return [diag.y, diag.x];
	    });
	
	    this.voronoi = d3.geom.voronoi().x(function (node) {
	      return node.y;
	    }).y(function (node) {
	      return node.x;
	    }).clipExtent([[-10, -10], [this.width, this.height]]);
	
	    this.root = root;
	    this.root.x0 = this.height / 2;
	    this.root.y0 = 0;
	
	    this.update(root);
	  }
	
	  _createClass(TreeView, [{
	    key: "update",
	    value: function update() {
	      var _this = this;
	
	      var parent = arguments.length <= 0 || arguments[0] === undefined ? this.root : arguments[0];
	
	      var nodes = this.tree.nodes(this.root),
	          //.reverse(),
	      links = this.tree.links(nodes);
	      var treeviz = this;
	
	      //simple manipulations of position to produce outward expansion behaviour
	      var maxDepth = nodes.reduce(function (md, n) {
	        return n.depth > md ? n.depth : md;
	      }, -1);
	      if (20 * maxDepth < this.width) {
	        nodes.forEach(function (d) {
	          d.y = d.depth * 20;
	        });
	      }
	      //left to right behaviour
	      nodes.forEach(function (n) {
	        n.y = Math.min(_this.width, 20 * maxDepth) - n.y;
	      });
	
	      //process nodes
	      var svgNode = this.svg.selectAll("g.node").data(nodes, function (d) {
	        //assign each object an id since d3 can't do object equality apparently :/
	        if (d.id) {
	          return d.id;
	        } else {
	          d.id = curId++;
	          return d.id;
	        }
	      });
	
	      //TODO: this section makes no sense. rework
	      var svgNodeEnter = svgNode.enter().append("g").attr("class", "node").attr("transform", "translate(" + parent.y0 + ", " + parent.x0 + ")").attr("id", function (d) {
	        return d.id;
	      }).each(function (d) {
	        var group = d3.select(this);
	
	        group.append("svg:title").text(function (d) {
	          return d.ctorName;
	        });
	
	        var highlight = group.append("circle").attr("class", "highlight").style("stroke", fillColor(d)).style("stroke-width", 1).style("fill", "none").style("opacity", 0).attr("r", radius(d) + 2);
	
	        var main = group.append("circle").attr("class", "mainCircle").attr("r", radius);
	      });
	
	      var svgNodeUpdate = svgNode.on("mouseover", function (datum) {
	        treeviz.actions.highlight(datum);
	      }, false).on("mouseout", function (datum) {
	        treeviz.actions.unHighlight(datum);
	      }, false).on("click", function (datum) {
	        if (d3.event.altKey || d3.event.ctrlKey) {
	          treeviz.actions.join(datum);
	        } else if (datum.current) {
	          treeviz.actions.split(datum);
	        }
	      }, true).transition().duration(duration).attr("transform", function (n) {
	        return "translate(" + n.y + ", " + n.x + ")";
	      }).style("fill", fillColor);
	
	      svgNode.select("title").text(function (d) {
	        return d.ctorName;
	      });
	      svgNode.select("circle.mainCircle").attr("fill", fillColor);
	
	      var svgNodeExit = svgNode.exit().transition().duration(duration).attr("transform", function (n) {
	        return "translate(" + parent.y0 + ", " + parent.x0 + ")";
	      }).remove();
	
	      //handle the links
	      var link = this.svg.selectAll("path.link").data(links, function (d) {
	        return d.target.id;
	      });
	
	      var polygon = function polygon(d) {
	        return "M" + d.join("L") + "Z";
	      };
	
	      link.enter().insert("path", "g").attr("class", "link").attr("d", function (d) {
	        var o = { x: parent.x0, y: parent.y0 };
	        return _this.diagonal({ source: o, target: o });
	      }).style("stroke", "hsla(0, 0%, 0%, 0.07)").style("fill", "none");
	
	      // Transition links to their new position.
	      link.transition().duration(duration).attr("d", this.diagonal);
	
	      // Transition exiting nodes to the parent's new position.
	      link.exit().transition().duration(duration).attr("d", function (d) {
	        var o = { x: parent.x, y: parent.y };
	        return _this.diagonal({ source: o, target: o });
	      }).remove();
	
	      //handle the Voronoi overlay
	      var paths = this.svg.selectAll("path.voronoi").data(this.voronoi(nodes));
	
	      paths.enter().append("path").attr("class", "voronoi").append("svg:title").text(function (d) {
	        return d.ctorName;
	      });
	      paths.exit().remove();
	
	      paths.attr("d", function (d, i) {
	        return "M" + d.join("L") + "Z";
	      }).datum(function (d, i) {
	        return d.point;
	      })
	      // .style("stroke", "#2074A0") //If you want to look at the cells
	      .style("fill", "none").style("pointer-events", "all").on("mouseover", function (datum) {
	        treeviz.actions.highlight(datum);
	      }, false).on("mouseout", function (datum) {
	        treeviz.actions.unHighlight(datum);
	      }, false).on("click", function (datum) {
	        if (d3.event.altKey || d3.event.ctrlKey) {
	          treeviz.actions.join(datum);
	        } else if (datum.current) {
	          treeviz.actions.split(datum);
	        }
	      }, true).select("title").text(function (d) {
	        return d.ctorName;
	      });
	
	      nodes.forEach(function (n) {
	        n.x0 = n.x;
	        n.y0 = n.y;
	      });
	    }
	  }, {
	    key: "refresh",
	    value: function refresh() {
	      this.update(this.root);
	    }
	  }, {
	    key: "split",
	    value: function split(node) {
	      //TODO: simulate mouseout behaviour
	      this.update(node);
	    }
	  }, {
	    key: "join",
	    value: function join(node) {
	      this.update(node);
	    }
	  }, {
	    key: "highlight",
	    value: function highlight(node) {
	      d3.select("g.node[id=\"" + node.id + "\"]").selectAll("circle.highlight").transition().duration(duration).style("opacity", 1);
	    }
	  }, {
	    key: "unHighlight",
	    value: function unHighlight(node) {
	      d3.select("g.node[id=\"" + node.id + "\"]").selectAll("circle.highlight").transition().duration(duration).style("opacity", 0);
	    }
	  }]);
	
	  return TreeView;
	}();
	
	var toExport = {
	  TreeView: TreeView
	};
	
	if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
	  module.exports = toExport;
	} else {
	  Object.assign(window, toExport);
	}

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(6)


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	// Generated by CoffeeScript 1.9.1
	(function() {
	  var rand, umd,
	    slice = [].slice;
	
	  rand = function() {
	    return ((Math.random().toString(36)) + "00000000000000000").replace(/[^a-z]+/g, "").slice(0, 5);
	  };
	
	  umd = function(factory) {
	    if (true) {
	      return module.exports = factory();
	    } else if (typeof define === 'function' && define.amd) {
	      return define([], factory);
	    } else {
	      return this.textures = factory();
	    }
	  };
	
	  umd(function() {
	    return {
	      circles: function() {
	        var background, circles, complement, fill, id, radius, size, stroke, strokeWidth;
	        size = 20;
	        background = "";
	        radius = 2;
	        complement = false;
	        fill = "#343434";
	        stroke = "#343434";
	        strokeWidth = 0;
	        id = rand();
	        circles = function() {
	          var corner, g, i, len, ref, results;
	          g = this.append("defs").append("pattern").attr({
	            id: id,
	            patternUnits: "userSpaceOnUse",
	            width: size,
	            height: size
	          });
	          if (background) {
	            g.append("rect").attr({
	              width: size,
	              height: size,
	              fill: background
	            });
	          }
	          g.append("circle").attr({
	            cx: size / 2,
	            cy: size / 2,
	            r: radius,
	            fill: fill,
	            stroke: stroke,
	            "stroke-width": strokeWidth
	          });
	          if (complement) {
	            ref = [[0, 0], [0, size], [size, 0], [size, size]];
	            results = [];
	            for (i = 0, len = ref.length; i < len; i++) {
	              corner = ref[i];
	              results.push(g.append("circle").attr({
	                cx: corner[0],
	                cy: corner[1],
	                r: radius,
	                fill: fill,
	                stroke: stroke,
	                "stroke-width": strokeWidth
	              }));
	            }
	            return results;
	          }
	        };
	        circles.heavier = function(_) {
	          if (!arguments.length) {
	            radius = radius * 2;
	          } else {
	            radius = _ ? radius * 2 * _ : radius * 2;
	          }
	          return circles;
	        };
	        circles.lighter = function(_) {
	          if (!arguments.length) {
	            radius = radius / 2;
	          } else {
	            radius = _ ? radius / (2 * _) : radius / 2;
	          }
	          return circles;
	        };
	        circles.thinner = function(_) {
	          if (!arguments.length) {
	            size = size * 2;
	          } else {
	            size = _ ? size * 2 * _ : size * 2;
	          }
	          return circles;
	        };
	        circles.thicker = function(_) {
	          if (!arguments.length) {
	            size = size / 2;
	          } else {
	            size = _ ? size / (2 * _) : size / 2;
	          }
	          return circles;
	        };
	        circles.background = function(_) {
	          background = _;
	          return circles;
	        };
	        circles.size = function(_) {
	          size = _;
	          return circles;
	        };
	        circles.complement = function() {
	          complement = true;
	          return circles;
	        };
	        circles.radius = function(_) {
	          radius = _;
	          return circles;
	        };
	        circles.fill = function(_) {
	          fill = _;
	          return circles;
	        };
	        circles.stroke = function(_) {
	          stroke = _;
	          return circles;
	        };
	        circles.strokeWidth = function(_) {
	          strokeWidth = _;
	          return circles;
	        };
	        circles.id = function(_) {
	          if (!arguments.length) {
	            return id;
	          } else {
	            id = _;
	            return circles;
	          }
	        };
	        circles.url = function() {
	          return "url(#" + id + ")";
	        };
	        return circles;
	      },
	      lines: function() {
	        var background, id, lines, orientation, path, shapeRendering, size, stroke, strokeWidth;
	        size = 20;
	        strokeWidth = 2;
	        stroke = "#343434";
	        id = rand();
	        background = "";
	        orientation = ["diagonal"];
	        shapeRendering = "auto";
	        path = function(orientation) {
	          switch (orientation) {
	            case "0/8":
	              return (function(s) {
	                return "M " + (s / 2) + ", 0 l 0, " + s;
	              })(size);
	            case "vertical":
	              return (function(s) {
	                return "M " + (s / 2) + ", 0 l 0, " + s;
	              })(size);
	            case "1/8":
	              return (function(s) {
	                return "M " + (s / 4) + ",0 l " + (s / 2) + "," + s + " M " + (-s / 4) + ",0 l " + (s / 2) + "," + s + "\nM " + (s * 3 / 4) + ",0 l " + (s / 2) + "," + s;
	              })(size);
	            case "2/8":
	              return (function(s) {
	                return "M 0," + s + " l " + s + "," + (-s) + " M " + (-s / 4) + "," + (s / 4) + " l " + (s / 2) + "," + (-s / 2) + "\nM " + (3 / 4 * s) + "," + (5 / 4 * s) + " l " + (s / 2) + "," + (-s / 2);
	              })(size);
	            case "diagonal":
	              return (function(s) {
	                return "M 0," + s + " l " + s + "," + (-s) + " M " + (-s / 4) + "," + (s / 4) + " l " + (s / 2) + "," + (-s / 2) + "\nM " + (3 / 4 * s) + "," + (5 / 4 * s) + " l " + (s / 2) + "," + (-s / 2);
	              })(size);
	            case "3/8":
	              return (function(s) {
	                return "M 0," + (3 / 4 * s) + " l " + s + "," + (-s / 2) + " M 0," + (s / 4) + " l " + s + "," + (-s / 2) + "\nM 0," + (s * 5 / 4) + " l " + s + "," + (-s / 2);
	              })(size);
	            case "4/8":
	              return (function(s) {
	                return "M 0," + (s / 2) + " l " + s + ",0";
	              })(size);
	            case "horizontal":
	              return (function(s) {
	                return "M 0," + (s / 2) + " l " + s + ",0";
	              })(size);
	            case "5/8":
	              return (function(s) {
	                return "M 0," + (-s / 4) + " l " + s + "," + (s / 2) + "M 0," + (s / 4) + " l " + s + "," + (s / 2) + "\nM 0," + (s * 3 / 4) + " l " + s + "," + (s / 2);
	              })(size);
	            case "6/8":
	              return (function(s) {
	                return "M 0,0 l " + s + "," + s + " M " + (-s / 4) + "," + (3 / 4 * s) + " l " + (s / 2) + "," + (s / 2) + "\nM " + (s * 3 / 4) + "," + (-s / 4) + " l " + (s / 2) + "," + (s / 2);
	              })(size);
	            case "7/8":
	              return (function(s) {
	                return "M " + (-s / 4) + ",0 l " + (s / 2) + "," + s + " M " + (s / 4) + ",0 l " + (s / 2) + "," + s + "\nM " + (s * 3 / 4) + ",0 l " + (s / 2) + "," + s;
	              })(size);
	            default:
	              return (function(s) {
	                return "M " + (s / 2) + ", 0 l 0, " + s;
	              })(size);
	          }
	        };
	        lines = function() {
	          var g, i, len, o, results;
	          g = this.append("defs").append("pattern").attr({
	            id: id,
	            patternUnits: "userSpaceOnUse",
	            width: size,
	            height: size
	          });
	          if (background) {
	            g.append("rect").attr({
	              width: size,
	              height: size,
	              fill: background
	            });
	          }
	          results = [];
	          for (i = 0, len = orientation.length; i < len; i++) {
	            o = orientation[i];
	            results.push(g.append("path").attr({
	              d: path(o),
	              "stroke-width": strokeWidth,
	              "shape-rendering": shapeRendering,
	              stroke: stroke,
	              "stroke-linecap": "square"
	            }));
	          }
	          return results;
	        };
	        lines.background = function(_) {
	          background = _;
	          return lines;
	        };
	        lines.shapeRendering = function(_) {
	          shapeRendering = _;
	          return lines;
	        };
	        lines.heavier = function(_) {
	          if (!arguments.length) {
	            strokeWidth = strokeWidth * 2;
	          } else {
	            strokeWidth = _ ? strokeWidth * 2 * _ : strokeWidth * 2;
	          }
	          return lines;
	        };
	        lines.lighter = function(_) {
	          if (!arguments.length) {
	            strokeWidth = strokeWidth / 2;
	          } else {
	            strokeWidth = _ ? strokeWidth / (2 * _) : strokeWidth / 2;
	          }
	          return lines;
	        };
	        lines.thinner = function(_) {
	          if (!arguments.length) {
	            size = size * 2;
	          } else {
	            size = _ ? size * 2 * _ : size * 2;
	          }
	          return lines;
	        };
	        lines.thicker = function(_) {
	          if (!arguments.length) {
	            size = size / 2;
	          } else {
	            size = _ ? size / (2 * _) : size / 2;
	          }
	          return lines;
	        };
	        lines.orientation = function() {
	          var args;
	          args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
	          orientation = args;
	          return lines;
	        };
	        lines.size = function(_) {
	          size = _;
	          return lines;
	        };
	        lines.stroke = function(_) {
	          stroke = _;
	          return lines;
	        };
	        lines.strokeWidth = function(_) {
	          strokeWidth = _;
	          return lines;
	        };
	        lines.id = function(_) {
	          if (!arguments.length) {
	            return id;
	          } else {
	            id = _;
	            return lines;
	          }
	        };
	        lines.url = function() {
	          return "url(#" + id + ")";
	        };
	        return lines;
	      },
	      paths: function() {
	        var background, d, fill, height, id, paths, shapeRendering, size, stroke, strokeWidth, svgPath, width;
	        size = 20;
	        height = 1;
	        width = 1;
	        strokeWidth = 2;
	        stroke = "#343434";
	        background = "";
	        d = "";
	        shapeRendering = "auto";
	        fill = "transparent";
	        id = void 0;
	        svgPath = function(_) {
	          switch (_) {
	            case "squares":
	              return (function(s) {
	                return "M " + (s / 4) + " " + (s / 4) + " l " + (s / 2) + " 0 l 0 " + (s / 2) + " l " + (-s / 2) + " 0 Z";
	              })(size);
	            case "nylon":
	              return (function(s) {
	                return "M 0 " + (s / 4) + " l " + (s / 4) + " 0 l 0 " + (-s / 4) + " M " + (s * 3 / 4) + " " + s + " l 0 " + (-s / 4) + "\nl " + (s / 4) + " 0 M " + (s / 4) + " " + (s / 2) + " l 0 " + (s / 4) + " l " + (s / 4) + " 0 M " + (s / 2) + " " + (s / 4) + "\nl " + (s / 4) + " 0 l 0 " + (s / 4);
	              })(size);
	            case "waves":
	              return (function(s) {
	                return "M 0 " + (s / 2) + " c " + (s / 8) + " " + (-s / 4) + " , " + (s * 3 / 8) + " " + (-s / 4) + " , " + (s / 2) + " 0\nc " + (s / 8) + " " + (s / 4) + " , " + (s * 3 / 8) + " " + (s / 4) + " , " + (s / 2) + " 0 M " + (-s / 2) + " " + (s / 2) + "\nc " + (s / 8) + " " + (s / 4) + " , " + (s * 3 / 8) + " " + (s / 4) + " , " + (s / 2) + " 0 M " + s + " " + (s / 2) + "\nc " + (s / 8) + " " + (-s / 4) + " , " + (s * 3 / 8) + " " + (-s / 4) + " , " + (s / 2) + " 0";
	              })(size);
	            case "woven":
	              return (function(s) {
	                return "M " + (s / 4) + "," + (s / 4) + "l" + (s / 2) + "," + (s / 2) + "M" + (s * 3 / 4) + "," + (s / 4) + "l" + (s / 2) + "," + (-s / 2) + "\nM" + (s / 4) + "," + (s * 3 / 4) + "l" + (-s / 2) + "," + (s / 2) + "M" + (s * 3 / 4) + "," + (s * 5 / 4) + "l" + (s / 2) + "," + (-s / 2) + "\nM" + (-s / 4) + "," + (s / 4) + "l" + (s / 2) + "," + (-s / 2);
	              })(size);
	            case "crosses":
	              return (function(s) {
	                return "M " + (s / 4) + "," + (s / 4) + "l" + (s / 2) + "," + (s / 2) + "M" + (s / 4) + "," + (s * 3 / 4) + "l" + (s / 2) + "," + (-s / 2);
	              })(size);
	            case "caps":
	              return (function(s) {
	                return "M " + (s / 4) + "," + (s * 3 / 4) + "l" + (s / 4) + "," + (-s / 2) + "l" + (s / 4) + "," + (s / 2);
	              })(size);
	            case "hexagons":
	              return (function(s) {
	                width = 3;
	                height = Math.sqrt(3);
	                return "M " + s + ",0 l " + s + ",0 l " + (s / 2) + "," + (s * Math.sqrt(3) / 2) + "\nl " + (-s / 2) + "," + (s * Math.sqrt(3) / 2) + " l " + (-s) + ",0\nl " + (-s / 2) + "," + (-s * Math.sqrt(3) / 2) + " Z M 0," + (s * Math.sqrt(3) / 2) + "\nl " + (s / 2) + ",0 M " + (3 * s) + "," + (s * Math.sqrt(3) / 2) + " l " + (-s / 2) + ",0";
	              })(size);
	            default:
	              return _(size);
	          }
	        };
	        paths = function() {
	          var g, path;
	          path = svgPath(d);
	          id = rand();
	          g = this.append("defs").append("pattern").attr({
	            id: id,
	            patternUnits: "userSpaceOnUse",
	            width: size * width,
	            height: size * height
	          });
	          if (background) {
	            g.append("rect").attr({
	              width: size * width,
	              height: size * height,
	              fill: background
	            });
	          }
	          return g.append("path").attr({
	            d: path,
	            fill: fill,
	            "stroke-width": strokeWidth,
	            "shape-rendering": shapeRendering,
	            stroke: stroke,
	            "stroke-linecap": "square"
	          });
	        };
	        paths.background = function(_) {
	          background = _;
	          return paths;
	        };
	        paths.shapeRendering = function(_) {
	          shapeRendering = _;
	          return paths;
	        };
	        paths.heavier = function(_) {
	          if (!arguments.length) {
	            strokeWidth = strokeWidth * 2;
	          } else {
	            strokeWidth = _ ? strokeWidth * 2 * _ : strokeWidth * 2;
	          }
	          return paths;
	        };
	        paths.lighter = function(_) {
	          if (!arguments.length) {
	            strokeWidth = strokeWidth / 2;
	          } else {
	            strokeWidth = _ ? strokeWidth / (2 * _) : strokeWidth / 2;
	          }
	          return paths;
	        };
	        paths.thinner = function(_) {
	          if (!arguments.length) {
	            size = size * 2;
	          } else {
	            size = _ ? size * 2 * _ : size * 2;
	          }
	          return paths;
	        };
	        paths.thicker = function(_) {
	          if (!arguments.length) {
	            size = size / 2;
	          } else {
	            size = _ ? size / (2 * _) : size / 2;
	          }
	          return paths;
	        };
	        paths.d = function(_) {
	          d = _;
	          return paths;
	        };
	        paths.size = function(_) {
	          size = _;
	          return paths;
	        };
	        paths.stroke = function(_) {
	          stroke = _;
	          return paths;
	        };
	        paths.strokeWidth = function(_) {
	          strokeWidth = _;
	          return paths;
	        };
	        paths.id = function(_) {
	          if (!arguments.length) {
	            return id;
	          } else {
	            id = _;
	            return paths;
	          }
	        };
	        paths.url = function() {
	          return "url(#" + id + ")";
	        };
	        return paths;
	      }
	    };
	  });
	
	}).call(this);


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module) {
	/**
	 * @license
	 *
	 * chroma.js - JavaScript library for color conversions
	 * 
	 * Copyright (c) 2011-2015, Gregor Aisch
	 * All rights reserved.
	 * 
	 * Redistribution and use in source and binary forms, with or without
	 * modification, are permitted provided that the following conditions are met:
	 * 
	 * 1. Redistributions of source code must retain the above copyright notice, this
	 *    list of conditions and the following disclaimer.
	 * 
	 * 2. Redistributions in binary form must reproduce the above copyright notice,
	 *    this list of conditions and the following disclaimer in the documentation
	 *    and/or other materials provided with the distribution.
	 * 
	 * 3. The name Gregor Aisch may not be used to endorse or promote products
	 *    derived from this software without specific prior written permission.
	 * 
	 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
	 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
	 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
	 * DISCLAIMED. IN NO EVENT SHALL GREGOR AISCH OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
	 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
	 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
	 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
	 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 *
	 */
	
	(function() {
	  var Color, DEG2RAD, LAB_CONSTANTS, PI, PITHIRD, RAD2DEG, TWOPI, _guess_formats, _guess_formats_sorted, _input, _interpolators, abs, atan2, bezier, blend, blend_f, brewer, burn, chroma, clip_rgb, cmyk2rgb, colors, cos, css2rgb, darken, dodge, each, floor, hex2rgb, hsi2rgb, hsl2css, hsl2rgb, hsv2rgb, interpolate, interpolate_hsx, interpolate_lab, interpolate_num, interpolate_rgb, lab2lch, lab2rgb, lab_xyz, lch2lab, lch2rgb, lighten, limit, log, luminance_x, m, max, multiply, normal, num2rgb, overlay, pow, rgb2cmyk, rgb2css, rgb2hex, rgb2hsi, rgb2hsl, rgb2hsv, rgb2lab, rgb2lch, rgb2luminance, rgb2num, rgb2temperature, rgb2xyz, rgb_xyz, rnd, root, round, screen, sin, sqrt, temperature2rgb, type, unpack, w3cx11, xyz_lab, xyz_rgb,
	    slice = [].slice;
	
	  type = (function() {
	
	    /*
	    for browser-safe type checking+
	    ported from jQuery's $.type
	     */
	    var classToType, len, name, o, ref;
	    classToType = {};
	    ref = "Boolean Number String Function Array Date RegExp Undefined Null".split(" ");
	    for (o = 0, len = ref.length; o < len; o++) {
	      name = ref[o];
	      classToType["[object " + name + "]"] = name.toLowerCase();
	    }
	    return function(obj) {
	      var strType;
	      strType = Object.prototype.toString.call(obj);
	      return classToType[strType] || "object";
	    };
	  })();
	
	  limit = function(x, min, max) {
	    if (min == null) {
	      min = 0;
	    }
	    if (max == null) {
	      max = 1;
	    }
	    if (x < min) {
	      x = min;
	    }
	    if (x > max) {
	      x = max;
	    }
	    return x;
	  };
	
	  unpack = function(args) {
	    if (args.length >= 3) {
	      return [].slice.call(args);
	    } else {
	      return args[0];
	    }
	  };
	
	  clip_rgb = function(rgb) {
	    var i;
	    for (i in rgb) {
	      if (i < 3) {
	        if (rgb[i] < 0) {
	          rgb[i] = 0;
	        }
	        if (rgb[i] > 255) {
	          rgb[i] = 255;
	        }
	      } else if (i === 3) {
	        if (rgb[i] < 0) {
	          rgb[i] = 0;
	        }
	        if (rgb[i] > 1) {
	          rgb[i] = 1;
	        }
	      }
	    }
	    return rgb;
	  };
	
	  PI = Math.PI, round = Math.round, cos = Math.cos, floor = Math.floor, pow = Math.pow, log = Math.log, sin = Math.sin, sqrt = Math.sqrt, atan2 = Math.atan2, max = Math.max, abs = Math.abs;
	
	  TWOPI = PI * 2;
	
	  PITHIRD = PI / 3;
	
	  DEG2RAD = PI / 180;
	
	  RAD2DEG = 180 / PI;
	
	  chroma = function() {
	    if (arguments[0] instanceof Color) {
	      return arguments[0];
	    }
	    return (function(func, args, ctor) {
	      ctor.prototype = func.prototype;
	      var child = new ctor, result = func.apply(child, args);
	      return Object(result) === result ? result : child;
	    })(Color, arguments, function(){});
	  };
	
	  _interpolators = [];
	
	  if ((typeof module !== "undefined" && module !== null) && (module.exports != null)) {
	    module.exports = chroma;
	  }
	
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
	      return chroma;
	    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else {
	    root = typeof exports !== "undefined" && exports !== null ? exports : this;
	    root.chroma = chroma;
	  }
	
	  chroma.version = '1.1.1';
	
	
	  /**
	      chroma.js
	  
	      Copyright (c) 2011-2013, Gregor Aisch
	      All rights reserved.
	  
	      Redistribution and use in source and binary forms, with or without
	      modification, are permitted provided that the following conditions are met:
	  
	      * Redistributions of source code must retain the above copyright notice, this
	        list of conditions and the following disclaimer.
	  
	      * Redistributions in binary form must reproduce the above copyright notice,
	        this list of conditions and the following disclaimer in the documentation
	        and/or other materials provided with the distribution.
	  
	      * The name Gregor Aisch may not be used to endorse or promote products
	        derived from this software without specific prior written permission.
	  
	      THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
	      AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
	      IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
	      DISCLAIMED. IN NO EVENT SHALL GREGOR AISCH OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
	      INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
	      BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
	      DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
	      OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	      NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	      EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	  
	      @source: https://github.com/gka/chroma.js
	   */
	
	  _input = {};
	
	  _guess_formats = [];
	
	  _guess_formats_sorted = false;
	
	  Color = (function() {
	    function Color() {
	      var arg, args, chk, len, len1, me, mode, o, w;
	      me = this;
	      args = [];
	      for (o = 0, len = arguments.length; o < len; o++) {
	        arg = arguments[o];
	        if (arg != null) {
	          args.push(arg);
	        }
	      }
	      mode = args[args.length - 1];
	      if (_input[mode] != null) {
	        me._rgb = clip_rgb(_input[mode](unpack(args.slice(0, -1))));
	      } else {
	        if (!_guess_formats_sorted) {
	          _guess_formats = _guess_formats.sort(function(a, b) {
	            return b.p - a.p;
	          });
	          _guess_formats_sorted = true;
	        }
	        for (w = 0, len1 = _guess_formats.length; w < len1; w++) {
	          chk = _guess_formats[w];
	          mode = chk.test.apply(chk, args);
	          if (mode) {
	            break;
	          }
	        }
	        if (mode) {
	          me._rgb = clip_rgb(_input[mode].apply(_input, args));
	        }
	      }
	      if (me._rgb == null) {
	        console.warn('unknown format: ' + args);
	      }
	      if (me._rgb == null) {
	        me._rgb = [0, 0, 0];
	      }
	      if (me._rgb.length === 3) {
	        me._rgb.push(1);
	      }
	    }
	
	    Color.prototype.alpha = function(alpha) {
	      if (arguments.length) {
	        this._rgb[3] = alpha;
	        return this;
	      }
	      return this._rgb[3];
	    };
	
	    Color.prototype.toString = function() {
	      return this.name();
	    };
	
	    return Color;
	
	  })();
	
	  chroma._input = _input;
	
	
	  /**
	  	ColorBrewer colors for chroma.js
	  
	  	Copyright (c) 2002 Cynthia Brewer, Mark Harrower, and The 
	  	Pennsylvania State University.
	  
	  	Licensed under the Apache License, Version 2.0 (the "License"); 
	  	you may not use this file except in compliance with the License.
	  	You may obtain a copy of the License at	
	  	http://www.apache.org/licenses/LICENSE-2.0
	  
	  	Unless required by applicable law or agreed to in writing, software distributed
	  	under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
	  	CONDITIONS OF ANY KIND, either express or implied. See the License for the
	  	specific language governing permissions and limitations under the License.
	  
	      @preserve
	   */
	
	  chroma.brewer = brewer = {
	    OrRd: ['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#b30000', '#7f0000'],
	    PuBu: ['#fff7fb', '#ece7f2', '#d0d1e6', '#a6bddb', '#74a9cf', '#3690c0', '#0570b0', '#045a8d', '#023858'],
	    BuPu: ['#f7fcfd', '#e0ecf4', '#bfd3e6', '#9ebcda', '#8c96c6', '#8c6bb1', '#88419d', '#810f7c', '#4d004b'],
	    Oranges: ['#fff5eb', '#fee6ce', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#a63603', '#7f2704'],
	    BuGn: ['#f7fcfd', '#e5f5f9', '#ccece6', '#99d8c9', '#66c2a4', '#41ae76', '#238b45', '#006d2c', '#00441b'],
	    YlOrBr: ['#ffffe5', '#fff7bc', '#fee391', '#fec44f', '#fe9929', '#ec7014', '#cc4c02', '#993404', '#662506'],
	    YlGn: ['#ffffe5', '#f7fcb9', '#d9f0a3', '#addd8e', '#78c679', '#41ab5d', '#238443', '#006837', '#004529'],
	    Reds: ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d'],
	    RdPu: ['#fff7f3', '#fde0dd', '#fcc5c0', '#fa9fb5', '#f768a1', '#dd3497', '#ae017e', '#7a0177', '#49006a'],
	    Greens: ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'],
	    YlGnBu: ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'],
	    Purples: ['#fcfbfd', '#efedf5', '#dadaeb', '#bcbddc', '#9e9ac8', '#807dba', '#6a51a3', '#54278f', '#3f007d'],
	    GnBu: ['#f7fcf0', '#e0f3db', '#ccebc5', '#a8ddb5', '#7bccc4', '#4eb3d3', '#2b8cbe', '#0868ac', '#084081'],
	    Greys: ['#ffffff', '#f0f0f0', '#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252', '#252525', '#000000'],
	    YlOrRd: ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026'],
	    PuRd: ['#f7f4f9', '#e7e1ef', '#d4b9da', '#c994c7', '#df65b0', '#e7298a', '#ce1256', '#980043', '#67001f'],
	    Blues: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'],
	    PuBuGn: ['#fff7fb', '#ece2f0', '#d0d1e6', '#a6bddb', '#67a9cf', '#3690c0', '#02818a', '#016c59', '#014636'],
	    Spectral: ['#9e0142', '#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#e6f598', '#abdda4', '#66c2a5', '#3288bd', '#5e4fa2'],
	    RdYlGn: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850', '#006837'],
	    RdBu: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#f7f7f7', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac', '#053061'],
	    PiYG: ['#8e0152', '#c51b7d', '#de77ae', '#f1b6da', '#fde0ef', '#f7f7f7', '#e6f5d0', '#b8e186', '#7fbc41', '#4d9221', '#276419'],
	    PRGn: ['#40004b', '#762a83', '#9970ab', '#c2a5cf', '#e7d4e8', '#f7f7f7', '#d9f0d3', '#a6dba0', '#5aae61', '#1b7837', '#00441b'],
	    RdYlBu: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee090', '#ffffbf', '#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'],
	    BrBG: ['#543005', '#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#f5f5f5', '#c7eae5', '#80cdc1', '#35978f', '#01665e', '#003c30'],
	    RdGy: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#ffffff', '#e0e0e0', '#bababa', '#878787', '#4d4d4d', '#1a1a1a'],
	    PuOr: ['#7f3b08', '#b35806', '#e08214', '#fdb863', '#fee0b6', '#f7f7f7', '#d8daeb', '#b2abd2', '#8073ac', '#542788', '#2d004b'],
	    Set2: ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f', '#e5c494', '#b3b3b3'],
	    Accent: ['#7fc97f', '#beaed4', '#fdc086', '#ffff99', '#386cb0', '#f0027f', '#bf5b17', '#666666'],
	    Set1: ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999'],
	    Set3: ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd', '#ccebc5', '#ffed6f'],
	    Dark2: ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#a6761d', '#666666'],
	    Paired: ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'],
	    Pastel2: ['#b3e2cd', '#fdcdac', '#cbd5e8', '#f4cae4', '#e6f5c9', '#fff2ae', '#f1e2cc', '#cccccc'],
	    Pastel1: ['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc', '#e5d8bd', '#fddaec', '#f2f2f2']
	  };
	
	
	  /**
	  	X11 color names
	  
	  	http://www.w3.org/TR/css3-color/#svg-color
	   */
	
	  w3cx11 = {
	    indigo: "#4b0082",
	    gold: "#ffd700",
	    hotpink: "#ff69b4",
	    firebrick: "#b22222",
	    indianred: "#cd5c5c",
	    yellow: "#ffff00",
	    mistyrose: "#ffe4e1",
	    darkolivegreen: "#556b2f",
	    olive: "#808000",
	    darkseagreen: "#8fbc8f",
	    pink: "#ffc0cb",
	    tomato: "#ff6347",
	    lightcoral: "#f08080",
	    orangered: "#ff4500",
	    navajowhite: "#ffdead",
	    lime: "#00ff00",
	    palegreen: "#98fb98",
	    darkslategrey: "#2f4f4f",
	    greenyellow: "#adff2f",
	    burlywood: "#deb887",
	    seashell: "#fff5ee",
	    mediumspringgreen: "#00fa9a",
	    fuchsia: "#ff00ff",
	    papayawhip: "#ffefd5",
	    blanchedalmond: "#ffebcd",
	    chartreuse: "#7fff00",
	    dimgray: "#696969",
	    black: "#000000",
	    peachpuff: "#ffdab9",
	    springgreen: "#00ff7f",
	    aquamarine: "#7fffd4",
	    white: "#ffffff",
	    orange: "#ffa500",
	    lightsalmon: "#ffa07a",
	    darkslategray: "#2f4f4f",
	    brown: "#a52a2a",
	    ivory: "#fffff0",
	    dodgerblue: "#1e90ff",
	    peru: "#cd853f",
	    lawngreen: "#7cfc00",
	    chocolate: "#d2691e",
	    crimson: "#dc143c",
	    forestgreen: "#228b22",
	    darkgrey: "#a9a9a9",
	    lightseagreen: "#20b2aa",
	    cyan: "#00ffff",
	    mintcream: "#f5fffa",
	    silver: "#c0c0c0",
	    antiquewhite: "#faebd7",
	    mediumorchid: "#ba55d3",
	    skyblue: "#87ceeb",
	    gray: "#808080",
	    darkturquoise: "#00ced1",
	    goldenrod: "#daa520",
	    darkgreen: "#006400",
	    floralwhite: "#fffaf0",
	    darkviolet: "#9400d3",
	    darkgray: "#a9a9a9",
	    moccasin: "#ffe4b5",
	    saddlebrown: "#8b4513",
	    grey: "#808080",
	    darkslateblue: "#483d8b",
	    lightskyblue: "#87cefa",
	    lightpink: "#ffb6c1",
	    mediumvioletred: "#c71585",
	    slategrey: "#708090",
	    red: "#ff0000",
	    deeppink: "#ff1493",
	    limegreen: "#32cd32",
	    darkmagenta: "#8b008b",
	    palegoldenrod: "#eee8aa",
	    plum: "#dda0dd",
	    turquoise: "#40e0d0",
	    lightgrey: "#d3d3d3",
	    lightgoldenrodyellow: "#fafad2",
	    darkgoldenrod: "#b8860b",
	    lavender: "#e6e6fa",
	    maroon: "#800000",
	    yellowgreen: "#9acd32",
	    sandybrown: "#f4a460",
	    thistle: "#d8bfd8",
	    violet: "#ee82ee",
	    navy: "#000080",
	    magenta: "#ff00ff",
	    dimgrey: "#696969",
	    tan: "#d2b48c",
	    rosybrown: "#bc8f8f",
	    olivedrab: "#6b8e23",
	    blue: "#0000ff",
	    lightblue: "#add8e6",
	    ghostwhite: "#f8f8ff",
	    honeydew: "#f0fff0",
	    cornflowerblue: "#6495ed",
	    slateblue: "#6a5acd",
	    linen: "#faf0e6",
	    darkblue: "#00008b",
	    powderblue: "#b0e0e6",
	    seagreen: "#2e8b57",
	    darkkhaki: "#bdb76b",
	    snow: "#fffafa",
	    sienna: "#a0522d",
	    mediumblue: "#0000cd",
	    royalblue: "#4169e1",
	    lightcyan: "#e0ffff",
	    green: "#008000",
	    mediumpurple: "#9370db",
	    midnightblue: "#191970",
	    cornsilk: "#fff8dc",
	    paleturquoise: "#afeeee",
	    bisque: "#ffe4c4",
	    slategray: "#708090",
	    darkcyan: "#008b8b",
	    khaki: "#f0e68c",
	    wheat: "#f5deb3",
	    teal: "#008080",
	    darkorchid: "#9932cc",
	    deepskyblue: "#00bfff",
	    salmon: "#fa8072",
	    darkred: "#8b0000",
	    steelblue: "#4682b4",
	    palevioletred: "#db7093",
	    lightslategray: "#778899",
	    aliceblue: "#f0f8ff",
	    lightslategrey: "#778899",
	    lightgreen: "#90ee90",
	    orchid: "#da70d6",
	    gainsboro: "#dcdcdc",
	    mediumseagreen: "#3cb371",
	    lightgray: "#d3d3d3",
	    mediumturquoise: "#48d1cc",
	    lemonchiffon: "#fffacd",
	    cadetblue: "#5f9ea0",
	    lightyellow: "#ffffe0",
	    lavenderblush: "#fff0f5",
	    coral: "#ff7f50",
	    purple: "#800080",
	    aqua: "#00ffff",
	    whitesmoke: "#f5f5f5",
	    mediumslateblue: "#7b68ee",
	    darkorange: "#ff8c00",
	    mediumaquamarine: "#66cdaa",
	    darksalmon: "#e9967a",
	    beige: "#f5f5dc",
	    blueviolet: "#8a2be2",
	    azure: "#f0ffff",
	    lightsteelblue: "#b0c4de",
	    oldlace: "#fdf5e6",
	    rebeccapurple: "#663399"
	  };
	
	  chroma.colors = colors = w3cx11;
	
	  lab2rgb = function() {
	    var a, args, b, g, l, r, x, y, z;
	    args = unpack(arguments);
	    l = args[0], a = args[1], b = args[2];
	    y = (l + 16) / 116;
	    x = isNaN(a) ? y : y + a / 500;
	    z = isNaN(b) ? y : y - b / 200;
	    y = LAB_CONSTANTS.Yn * lab_xyz(y);
	    x = LAB_CONSTANTS.Xn * lab_xyz(x);
	    z = LAB_CONSTANTS.Zn * lab_xyz(z);
	    r = xyz_rgb(3.2404542 * x - 1.5371385 * y - 0.4985314 * z);
	    g = xyz_rgb(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z);
	    b = xyz_rgb(0.0556434 * x - 0.2040259 * y + 1.0572252 * z);
	    r = limit(r, 0, 255);
	    g = limit(g, 0, 255);
	    b = limit(b, 0, 255);
	    return [r, g, b, args.length > 3 ? args[3] : 1];
	  };
	
	  xyz_rgb = function(r) {
	    return round(255 * (r <= 0.00304 ? 12.92 * r : 1.055 * pow(r, 1 / 2.4) - 0.055));
	  };
	
	  lab_xyz = function(t) {
	    if (t > LAB_CONSTANTS.t1) {
	      return t * t * t;
	    } else {
	      return LAB_CONSTANTS.t2 * (t - LAB_CONSTANTS.t0);
	    }
	  };
	
	  LAB_CONSTANTS = {
	    Kn: 18,
	    Xn: 0.950470,
	    Yn: 1,
	    Zn: 1.088830,
	    t0: 0.137931034,
	    t1: 0.206896552,
	    t2: 0.12841855,
	    t3: 0.008856452
	  };
	
	  rgb2lab = function() {
	    var b, g, r, ref, ref1, x, y, z;
	    ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
	    ref1 = rgb2xyz(r, g, b), x = ref1[0], y = ref1[1], z = ref1[2];
	    return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
	  };
	
	  rgb_xyz = function(r) {
	    if ((r /= 255) <= 0.04045) {
	      return r / 12.92;
	    } else {
	      return pow((r + 0.055) / 1.055, 2.4);
	    }
	  };
	
	  xyz_lab = function(t) {
	    if (t > LAB_CONSTANTS.t3) {
	      return pow(t, 1 / 3);
	    } else {
	      return t / LAB_CONSTANTS.t2 + LAB_CONSTANTS.t0;
	    }
	  };
	
	  rgb2xyz = function() {
	    var b, g, r, ref, x, y, z;
	    ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
	    r = rgb_xyz(r);
	    g = rgb_xyz(g);
	    b = rgb_xyz(b);
	    x = xyz_lab((0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / LAB_CONSTANTS.Xn);
	    y = xyz_lab((0.2126729 * r + 0.7151522 * g + 0.0721750 * b) / LAB_CONSTANTS.Yn);
	    z = xyz_lab((0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / LAB_CONSTANTS.Zn);
	    return [x, y, z];
	  };
	
	  chroma.lab = function() {
	    return (function(func, args, ctor) {
	      ctor.prototype = func.prototype;
	      var child = new ctor, result = func.apply(child, args);
	      return Object(result) === result ? result : child;
	    })(Color, slice.call(arguments).concat(['lab']), function(){});
	  };
	
	  _input.lab = lab2rgb;
	
	  Color.prototype.lab = function() {
	    return rgb2lab(this._rgb);
	  };
	
	  bezier = function(colors) {
	    var I, I0, I1, c, lab0, lab1, lab2, lab3, ref, ref1, ref2;
	    colors = (function() {
	      var len, o, results;
	      results = [];
	      for (o = 0, len = colors.length; o < len; o++) {
	        c = colors[o];
	        results.push(chroma(c));
	      }
	      return results;
	    })();
	    if (colors.length === 2) {
	      ref = (function() {
	        var len, o, results;
	        results = [];
	        for (o = 0, len = colors.length; o < len; o++) {
	          c = colors[o];
	          results.push(c.lab());
	        }
	        return results;
	      })(), lab0 = ref[0], lab1 = ref[1];
	      I = function(t) {
	        var i, lab;
	        lab = (function() {
	          var o, results;
	          results = [];
	          for (i = o = 0; o <= 2; i = ++o) {
	            results.push(lab0[i] + t * (lab1[i] - lab0[i]));
	          }
	          return results;
	        })();
	        return chroma.lab.apply(chroma, lab);
	      };
	    } else if (colors.length === 3) {
	      ref1 = (function() {
	        var len, o, results;
	        results = [];
	        for (o = 0, len = colors.length; o < len; o++) {
	          c = colors[o];
	          results.push(c.lab());
	        }
	        return results;
	      })(), lab0 = ref1[0], lab1 = ref1[1], lab2 = ref1[2];
	      I = function(t) {
	        var i, lab;
	        lab = (function() {
	          var o, results;
	          results = [];
	          for (i = o = 0; o <= 2; i = ++o) {
	            results.push((1 - t) * (1 - t) * lab0[i] + 2 * (1 - t) * t * lab1[i] + t * t * lab2[i]);
	          }
	          return results;
	        })();
	        return chroma.lab.apply(chroma, lab);
	      };
	    } else if (colors.length === 4) {
	      ref2 = (function() {
	        var len, o, results;
	        results = [];
	        for (o = 0, len = colors.length; o < len; o++) {
	          c = colors[o];
	          results.push(c.lab());
	        }
	        return results;
	      })(), lab0 = ref2[0], lab1 = ref2[1], lab2 = ref2[2], lab3 = ref2[3];
	      I = function(t) {
	        var i, lab;
	        lab = (function() {
	          var o, results;
	          results = [];
	          for (i = o = 0; o <= 2; i = ++o) {
	            results.push((1 - t) * (1 - t) * (1 - t) * lab0[i] + 3 * (1 - t) * (1 - t) * t * lab1[i] + 3 * (1 - t) * t * t * lab2[i] + t * t * t * lab3[i]);
	          }
	          return results;
	        })();
	        return chroma.lab.apply(chroma, lab);
	      };
	    } else if (colors.length === 5) {
	      I0 = bezier(colors.slice(0, 3));
	      I1 = bezier(colors.slice(2, 5));
	      I = function(t) {
	        if (t < 0.5) {
	          return I0(t * 2);
	        } else {
	          return I1((t - 0.5) * 2);
	        }
	      };
	    }
	    return I;
	  };
	
	  chroma.bezier = function(colors) {
	    var f;
	    f = bezier(colors);
	    f.scale = function() {
	      return chroma.scale(f);
	    };
	    return f;
	  };
	
	
	  /*
	      chroma.js
	  
	      Copyright (c) 2011-2013, Gregor Aisch
	      All rights reserved.
	  
	      Redistribution and use in source and binary forms, with or without
	      modification, are permitted provided that the following conditions are met:
	  
	      * Redistributions of source code must retain the above copyright notice, this
	        list of conditions and the following disclaimer.
	  
	      * Redistributions in binary form must reproduce the above copyright notice,
	        this list of conditions and the following disclaimer in the documentation
	        and/or other materials provided with the distribution.
	  
	      * The name Gregor Aisch may not be used to endorse or promote products
	        derived from this software without specific prior written permission.
	  
	      THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
	      AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
	      IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
	      DISCLAIMED. IN NO EVENT SHALL GREGOR AISCH OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
	      INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
	      BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
	      DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
	      OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	      NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	      EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	  
	      @source: https://github.com/gka/chroma.js
	   */
	
	  chroma.cubehelix = function(start, rotations, hue, gamma, lightness) {
	    var dh, dl, f;
	    if (start == null) {
	      start = 300;
	    }
	    if (rotations == null) {
	      rotations = -1.5;
	    }
	    if (hue == null) {
	      hue = 1;
	    }
	    if (gamma == null) {
	      gamma = 1;
	    }
	    if (lightness == null) {
	      lightness = [0, 1];
	    }
	    dl = lightness[1] - lightness[0];
	    dh = 0;
	    f = function(fract) {
	      var a, amp, b, cos_a, g, h, l, r, sin_a;
	      a = TWOPI * ((start + 120) / 360 + rotations * fract);
	      l = pow(lightness[0] + dl * fract, gamma);
	      h = dh !== 0 ? hue[0] + fract * dh : hue;
	      amp = h * l * (1 - l) / 2;
	      cos_a = cos(a);
	      sin_a = sin(a);
	      r = l + amp * (-0.14861 * cos_a + 1.78277 * sin_a);
	      g = l + amp * (-0.29227 * cos_a - 0.90649 * sin_a);
	      b = l + amp * (+1.97294 * cos_a);
	      return chroma(clip_rgb([r * 255, g * 255, b * 255]));
	    };
	    f.start = function(s) {
	      if (s == null) {
	        return start;
	      }
	      start = s;
	      return f;
	    };
	    f.rotations = function(r) {
	      if (r == null) {
	        return rotations;
	      }
	      rotations = r;
	      return f;
	    };
	    f.gamma = function(g) {
	      if (g == null) {
	        return gamma;
	      }
	      gamma = g;
	      return f;
	    };
	    f.hue = function(h) {
	      if (h == null) {
	        return hue;
	      }
	      hue = h;
	      if (type(hue) === 'array') {
	        dh = hue[1] - hue[0];
	        if (dh === 0) {
	          hue = hue[1];
	        }
	      } else {
	        dh = 0;
	      }
	      return f;
	    };
	    f.lightness = function(h) {
	      if (h == null) {
	        return lightness;
	      }
	      lightness = h;
	      if (type(lightness) === 'array') {
	        dl = lightness[1] - lightness[0];
	        if (dl === 0) {
	          lightness = lightness[1];
	        }
	      } else {
	        dl = 0;
	      }
	      return f;
	    };
	    f.scale = function() {
	      return chroma.scale(f);
	    };
	    f.hue(hue);
	    return f;
	  };
	
	  chroma.random = function() {
	    var code, digits, i, o;
	    digits = '0123456789abcdef';
	    code = '#';
	    for (i = o = 0; o < 6; i = ++o) {
	      code += digits.charAt(floor(Math.random() * 16));
	    }
	    return new Color(code);
	  };
	
	  _input.rgb = function() {
	    var k, ref, results, v;
	    ref = unpack(arguments);
	    results = [];
	    for (k in ref) {
	      v = ref[k];
	      results.push(v);
	    }
	    return results;
	  };
	
	  chroma.rgb = function() {
	    return (function(func, args, ctor) {
	      ctor.prototype = func.prototype;
	      var child = new ctor, result = func.apply(child, args);
	      return Object(result) === result ? result : child;
	    })(Color, slice.call(arguments).concat(['rgb']), function(){});
	  };
	
	  Color.prototype.rgb = function() {
	    return this._rgb.slice(0, 3);
	  };
	
	  Color.prototype.rgba = function() {
	    return this._rgb;
	  };
	
	  _guess_formats.push({
	    p: 15,
	    test: function(n) {
	      var a;
	      a = unpack(arguments);
	      if (type(a) === 'array' && a.length === 3) {
	        return 'rgb';
	      }
	      if (a.length === 4 && type(a[3]) === "number" && a[3] >= 0 && a[3] <= 1) {
	        return 'rgb';
	      }
	    }
	  });
	
	  hex2rgb = function(hex) {
	    var a, b, g, r, rgb, u;
	    if (hex.match(/^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
	      if (hex.length === 4 || hex.length === 7) {
	        hex = hex.substr(1);
	      }
	      if (hex.length === 3) {
	        hex = hex.split("");
	        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
	      }
	      u = parseInt(hex, 16);
	      r = u >> 16;
	      g = u >> 8 & 0xFF;
	      b = u & 0xFF;
	      return [r, g, b, 1];
	    }
	    if (hex.match(/^#?([A-Fa-f0-9]{8})$/)) {
	      if (hex.length === 9) {
	        hex = hex.substr(1);
	      }
	      u = parseInt(hex, 16);
	      r = u >> 24 & 0xFF;
	      g = u >> 16 & 0xFF;
	      b = u >> 8 & 0xFF;
	      a = round((u & 0xFF) / 0xFF * 100) / 100;
	      return [r, g, b, a];
	    }
	    if ((_input.css != null) && (rgb = _input.css(hex))) {
	      return rgb;
	    }
	    throw "unknown color: " + hex;
	  };
	
	  rgb2hex = function(channels, mode) {
	    var a, b, g, hxa, r, str, u;
	    if (mode == null) {
	      mode = 'rgb';
	    }
	    r = channels[0], g = channels[1], b = channels[2], a = channels[3];
	    u = r << 16 | g << 8 | b;
	    str = "000000" + u.toString(16);
	    str = str.substr(str.length - 6);
	    hxa = '0' + round(a * 255).toString(16);
	    hxa = hxa.substr(hxa.length - 2);
	    return "#" + (function() {
	      switch (mode.toLowerCase()) {
	        case 'rgba':
	          return str + hxa;
	        case 'argb':
	          return hxa + str;
	        default:
	          return str;
	      }
	    })();
	  };
	
	  _input.hex = function(h) {
	    return hex2rgb(h);
	  };
	
	  chroma.hex = function() {
	    return (function(func, args, ctor) {
	      ctor.prototype = func.prototype;
	      var child = new ctor, result = func.apply(child, args);
	      return Object(result) === result ? result : child;
	    })(Color, slice.call(arguments).concat(['hex']), function(){});
	  };
	
	  Color.prototype.hex = function(mode) {
	    if (mode == null) {
	      mode = 'rgb';
	    }
	    return rgb2hex(this._rgb, mode);
	  };
	
	  _guess_formats.push({
	    p: 10,
	    test: function(n) {
	      if (arguments.length === 1 && type(n) === "string") {
	        return 'hex';
	      }
	    }
	  });
	
	  hsl2rgb = function() {
	    var args, b, c, g, h, i, l, o, r, ref, s, t1, t2, t3;
	    args = unpack(arguments);
	    h = args[0], s = args[1], l = args[2];
	    if (s === 0) {
	      r = g = b = l * 255;
	    } else {
	      t3 = [0, 0, 0];
	      c = [0, 0, 0];
	      t2 = l < 0.5 ? l * (1 + s) : l + s - l * s;
	      t1 = 2 * l - t2;
	      h /= 360;
	      t3[0] = h + 1 / 3;
	      t3[1] = h;
	      t3[2] = h - 1 / 3;
	      for (i = o = 0; o <= 2; i = ++o) {
	        if (t3[i] < 0) {
	          t3[i] += 1;
	        }
	        if (t3[i] > 1) {
	          t3[i] -= 1;
	        }
	        if (6 * t3[i] < 1) {
	          c[i] = t1 + (t2 - t1) * 6 * t3[i];
	        } else if (2 * t3[i] < 1) {
	          c[i] = t2;
	        } else if (3 * t3[i] < 2) {
	          c[i] = t1 + (t2 - t1) * ((2 / 3) - t3[i]) * 6;
	        } else {
	          c[i] = t1;
	        }
	      }
	      ref = [round(c[0] * 255), round(c[1] * 255), round(c[2] * 255)], r = ref[0], g = ref[1], b = ref[2];
	    }
	    if (args.length > 3) {
	      return [r, g, b, args[3]];
	    } else {
	      return [r, g, b];
	    }
	  };
	
	  rgb2hsl = function(r, g, b) {
	    var h, l, min, ref, s;
	    if (r !== void 0 && r.length >= 3) {
	      ref = r, r = ref[0], g = ref[1], b = ref[2];
	    }
	    r /= 255;
	    g /= 255;
	    b /= 255;
	    min = Math.min(r, g, b);
	    max = Math.max(r, g, b);
	    l = (max + min) / 2;
	    if (max === min) {
	      s = 0;
	      h = Number.NaN;
	    } else {
	      s = l < 0.5 ? (max - min) / (max + min) : (max - min) / (2 - max - min);
	    }
	    if (r === max) {
	      h = (g - b) / (max - min);
	    } else if (g === max) {
	      h = 2 + (b - r) / (max - min);
	    } else if (b === max) {
	      h = 4 + (r - g) / (max - min);
	    }
	    h *= 60;
	    if (h < 0) {
	      h += 360;
	    }
	    return [h, s, l];
	  };
	
	  chroma.hsl = function() {
	    return (function(func, args, ctor) {
	      ctor.prototype = func.prototype;
	      var child = new ctor, result = func.apply(child, args);
	      return Object(result) === result ? result : child;
	    })(Color, slice.call(arguments).concat(['hsl']), function(){});
	  };
	
	  _input.hsl = hsl2rgb;
	
	  Color.prototype.hsl = function() {
	    return rgb2hsl(this._rgb);
	  };
	
	  hsv2rgb = function() {
	    var args, b, f, g, h, i, p, q, r, ref, ref1, ref2, ref3, ref4, ref5, s, t, v;
	    args = unpack(arguments);
	    h = args[0], s = args[1], v = args[2];
	    v *= 255;
	    if (s === 0) {
	      r = g = b = v;
	    } else {
	      if (h === 360) {
	        h = 0;
	      }
	      if (h > 360) {
	        h -= 360;
	      }
	      if (h < 0) {
	        h += 360;
	      }
	      h /= 60;
	      i = floor(h);
	      f = h - i;
	      p = v * (1 - s);
	      q = v * (1 - s * f);
	      t = v * (1 - s * (1 - f));
	      switch (i) {
	        case 0:
	          ref = [v, t, p], r = ref[0], g = ref[1], b = ref[2];
	          break;
	        case 1:
	          ref1 = [q, v, p], r = ref1[0], g = ref1[1], b = ref1[2];
	          break;
	        case 2:
	          ref2 = [p, v, t], r = ref2[0], g = ref2[1], b = ref2[2];
	          break;
	        case 3:
	          ref3 = [p, q, v], r = ref3[0], g = ref3[1], b = ref3[2];
	          break;
	        case 4:
	          ref4 = [t, p, v], r = ref4[0], g = ref4[1], b = ref4[2];
	          break;
	        case 5:
	          ref5 = [v, p, q], r = ref5[0], g = ref5[1], b = ref5[2];
	      }
	    }
	    r = round(r);
	    g = round(g);
	    b = round(b);
	    return [r, g, b, args.length > 3 ? args[3] : 1];
	  };
	
	  rgb2hsv = function() {
	    var b, delta, g, h, min, r, ref, s, v;
	    ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
	    min = Math.min(r, g, b);
	    max = Math.max(r, g, b);
	    delta = max - min;
	    v = max / 255.0;
	    if (max === 0) {
	      h = Number.NaN;
	      s = 0;
	    } else {
	      s = delta / max;
	      if (r === max) {
	        h = (g - b) / delta;
	      }
	      if (g === max) {
	        h = 2 + (b - r) / delta;
	      }
	      if (b === max) {
	        h = 4 + (r - g) / delta;
	      }
	      h *= 60;
	      if (h < 0) {
	        h += 360;
	      }
	    }
	    return [h, s, v];
	  };
	
	  chroma.hsv = function() {
	    return (function(func, args, ctor) {
	      ctor.prototype = func.prototype;
	      var child = new ctor, result = func.apply(child, args);
	      return Object(result) === result ? result : child;
	    })(Color, slice.call(arguments).concat(['hsv']), function(){});
	  };
	
	  _input.hsv = hsv2rgb;
	
	  Color.prototype.hsv = function() {
	    return rgb2hsv(this._rgb);
	  };
	
	  num2rgb = function(num) {
	    var b, g, r;
	    if (type(num) === "number" && num >= 0 && num <= 0xFFFFFF) {
	      r = num >> 16;
	      g = (num >> 8) & 0xFF;
	      b = num & 0xFF;
	      return [r, g, b, 1];
	    }
	    console.warn("unknown num color: " + num);
	    return [0, 0, 0, 1];
	  };
	
	  rgb2num = function() {
	    var b, g, r, ref;
	    ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
	    return (r << 16) + (g << 8) + b;
	  };
	
	  chroma.num = function(num) {
	    return new Color(num, 'num');
	  };
	
	  Color.prototype.num = function(mode) {
	    if (mode == null) {
	      mode = 'rgb';
	    }
	    return rgb2num(this._rgb, mode);
	  };
	
	  _input.num = num2rgb;
	
	  _guess_formats.push({
	    p: 10,
	    test: function(n) {
	      if (arguments.length === 1 && type(n) === "number" && n >= 0 && n <= 0xFFFFFF) {
	        return 'num';
	      }
	    }
	  });
	
	  css2rgb = function(css) {
	    var aa, ab, hsl, i, m, o, rgb, w;
	    css = css.toLowerCase();
	    if ((chroma.colors != null) && chroma.colors[css]) {
	      return hex2rgb(chroma.colors[css]);
	    }
	    if (m = css.match(/rgb\(\s*(\-?\d+),\s*(\-?\d+)\s*,\s*(\-?\d+)\s*\)/)) {
	      rgb = m.slice(1, 4);
	      for (i = o = 0; o <= 2; i = ++o) {
	        rgb[i] = +rgb[i];
	      }
	      rgb[3] = 1;
	    } else if (m = css.match(/rgba\(\s*(\-?\d+),\s*(\-?\d+)\s*,\s*(\-?\d+)\s*,\s*([01]|[01]?\.\d+)\)/)) {
	      rgb = m.slice(1, 5);
	      for (i = w = 0; w <= 3; i = ++w) {
	        rgb[i] = +rgb[i];
	      }
	    } else if (m = css.match(/rgb\(\s*(\-?\d+(?:\.\d+)?)%,\s*(\-?\d+(?:\.\d+)?)%\s*,\s*(\-?\d+(?:\.\d+)?)%\s*\)/)) {
	      rgb = m.slice(1, 4);
	      for (i = aa = 0; aa <= 2; i = ++aa) {
	        rgb[i] = round(rgb[i] * 2.55);
	      }
	      rgb[3] = 1;
	    } else if (m = css.match(/rgba\(\s*(\-?\d+(?:\.\d+)?)%,\s*(\-?\d+(?:\.\d+)?)%\s*,\s*(\-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)/)) {
	      rgb = m.slice(1, 5);
	      for (i = ab = 0; ab <= 2; i = ++ab) {
	        rgb[i] = round(rgb[i] * 2.55);
	      }
	      rgb[3] = +rgb[3];
	    } else if (m = css.match(/hsl\(\s*(\-?\d+(?:\.\d+)?),\s*(\-?\d+(?:\.\d+)?)%\s*,\s*(\-?\d+(?:\.\d+)?)%\s*\)/)) {
	      hsl = m.slice(1, 4);
	      hsl[1] *= 0.01;
	      hsl[2] *= 0.01;
	      rgb = hsl2rgb(hsl);
	      rgb[3] = 1;
	    } else if (m = css.match(/hsla\(\s*(\-?\d+(?:\.\d+)?),\s*(\-?\d+(?:\.\d+)?)%\s*,\s*(\-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)/)) {
	      hsl = m.slice(1, 4);
	      hsl[1] *= 0.01;
	      hsl[2] *= 0.01;
	      rgb = hsl2rgb(hsl);
	      rgb[3] = +m[4];
	    }
	    return rgb;
	  };
	
	  rgb2css = function(rgba) {
	    var mode;
	    mode = rgba[3] < 1 ? 'rgba' : 'rgb';
	    if (mode === 'rgb') {
	      return mode + '(' + rgba.slice(0, 3).map(round).join(',') + ')';
	    } else if (mode === 'rgba') {
	      return mode + '(' + rgba.slice(0, 3).map(round).join(',') + ',' + rgba[3] + ')';
	    } else {
	
	    }
	  };
	
	  rnd = function(a) {
	    return round(a * 100) / 100;
	  };
	
	  hsl2css = function(hsl, alpha) {
	    var mode;
	    mode = alpha < 1 ? 'hsla' : 'hsl';
	    hsl[0] = rnd(hsl[0] || 0);
	    hsl[1] = rnd(hsl[1] * 100) + '%';
	    hsl[2] = rnd(hsl[2] * 100) + '%';
	    if (mode === 'hsla') {
	      hsl[3] = alpha;
	    }
	    return mode + '(' + hsl.join(',') + ')';
	  };
	
	  _input.css = function(h) {
	    return css2rgb(h);
	  };
	
	  chroma.css = function() {
	    return (function(func, args, ctor) {
	      ctor.prototype = func.prototype;
	      var child = new ctor, result = func.apply(child, args);
	      return Object(result) === result ? result : child;
	    })(Color, slice.call(arguments).concat(['css']), function(){});
	  };
	
	  Color.prototype.css = function(mode) {
	    if (mode == null) {
	      mode = 'rgb';
	    }
	    if (mode.slice(0, 3) === 'rgb') {
	      return rgb2css(this._rgb);
	    } else if (mode.slice(0, 3) === 'hsl') {
	      return hsl2css(this.hsl(), this.alpha());
	    }
	  };
	
	  _input.named = function(name) {
	    return hex2rgb(w3cx11[name]);
	  };
	
	  _guess_formats.push({
	    p: 20,
	    test: function(n) {
	      if (arguments.length === 1 && (w3cx11[n] != null)) {
	        return 'named';
	      }
	    }
	  });
	
	  Color.prototype.name = function(n) {
	    var h, k;
	    if (arguments.length) {
	      if (w3cx11[n]) {
	        this._rgb = hex2rgb(w3cx11[n]);
	      }
	      this._rgb[3] = 1;
	      this;
	    }
	    h = this.hex();
	    for (k in w3cx11) {
	      if (h === w3cx11[k]) {
	        return k;
	      }
	    }
	    return h;
	  };
	
	  lch2lab = function() {
	
	    /*
	    Convert from a qualitative parameter h and a quantitative parameter l to a 24-bit pixel.
	    These formulas were invented by David Dalrymple to obtain maximum contrast without going
	    out of gamut if the parameters are in the range 0-1.
	    
	    A saturation multiplier was added by Gregor Aisch
	     */
	    var c, h, l, ref;
	    ref = unpack(arguments), l = ref[0], c = ref[1], h = ref[2];
	    h = h * DEG2RAD;
	    return [l, cos(h) * c, sin(h) * c];
	  };
	
	  lch2rgb = function() {
	    var L, a, args, b, c, g, h, l, r, ref, ref1;
	    args = unpack(arguments);
	    l = args[0], c = args[1], h = args[2];
	    ref = lch2lab(l, c, h), L = ref[0], a = ref[1], b = ref[2];
	    ref1 = lab2rgb(L, a, b), r = ref1[0], g = ref1[1], b = ref1[2];
	    return [limit(r, 0, 255), limit(g, 0, 255), limit(b, 0, 255), args.length > 3 ? args[3] : 1];
	  };
	
	  lab2lch = function() {
	    var a, b, c, h, l, ref;
	    ref = unpack(arguments), l = ref[0], a = ref[1], b = ref[2];
	    c = sqrt(a * a + b * b);
	    h = (atan2(b, a) * RAD2DEG + 360) % 360;
	    if (round(c * 10000) === 0) {
	      h = Number.NaN;
	    }
	    return [l, c, h];
	  };
	
	  rgb2lch = function() {
	    var a, b, g, l, r, ref, ref1;
	    ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
	    ref1 = rgb2lab(r, g, b), l = ref1[0], a = ref1[1], b = ref1[2];
	    return lab2lch(l, a, b);
	  };
	
	  chroma.lch = function() {
	    var args;
	    args = unpack(arguments);
	    return new Color(args, 'lch');
	  };
	
	  chroma.hcl = function() {
	    var args;
	    args = unpack(arguments);
	    return new Color(args, 'hcl');
	  };
	
	  _input.lch = lch2rgb;
	
	  _input.hcl = function() {
	    var c, h, l, ref;
	    ref = unpack(arguments), h = ref[0], c = ref[1], l = ref[2];
	    return lch2rgb([l, c, h]);
	  };
	
	  Color.prototype.lch = function() {
	    return rgb2lch(this._rgb);
	  };
	
	  Color.prototype.hcl = function() {
	    return rgb2lch(this._rgb).reverse();
	  };
	
	  rgb2cmyk = function(mode) {
	    var b, c, f, g, k, m, r, ref, y;
	    if (mode == null) {
	      mode = 'rgb';
	    }
	    ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
	    r = r / 255;
	    g = g / 255;
	    b = b / 255;
	    k = 1 - Math.max(r, Math.max(g, b));
	    f = k < 1 ? 1 / (1 - k) : 0;
	    c = (1 - r - k) * f;
	    m = (1 - g - k) * f;
	    y = (1 - b - k) * f;
	    return [c, m, y, k];
	  };
	
	  cmyk2rgb = function() {
	    var alpha, args, b, c, g, k, m, r, y;
	    args = unpack(arguments);
	    c = args[0], m = args[1], y = args[2], k = args[3];
	    alpha = args.length > 4 ? args[4] : 1;
	    if (k === 1) {
	      return [0, 0, 0, alpha];
	    }
	    r = c >= 1 ? 0 : round(255 * (1 - c) * (1 - k));
	    g = m >= 1 ? 0 : round(255 * (1 - m) * (1 - k));
	    b = y >= 1 ? 0 : round(255 * (1 - y) * (1 - k));
	    return [r, g, b, alpha];
	  };
	
	  _input.cmyk = function() {
	    return cmyk2rgb(unpack(arguments));
	  };
	
	  chroma.cmyk = function() {
	    return (function(func, args, ctor) {
	      ctor.prototype = func.prototype;
	      var child = new ctor, result = func.apply(child, args);
	      return Object(result) === result ? result : child;
	    })(Color, slice.call(arguments).concat(['cmyk']), function(){});
	  };
	
	  Color.prototype.cmyk = function() {
	    return rgb2cmyk(this._rgb);
	  };
	
	  _input.gl = function() {
	    var i, k, o, rgb, v;
	    rgb = (function() {
	      var ref, results;
	      ref = unpack(arguments);
	      results = [];
	      for (k in ref) {
	        v = ref[k];
	        results.push(v);
	      }
	      return results;
	    }).apply(this, arguments);
	    for (i = o = 0; o <= 2; i = ++o) {
	      rgb[i] *= 255;
	    }
	    return rgb;
	  };
	
	  chroma.gl = function() {
	    return (function(func, args, ctor) {
	      ctor.prototype = func.prototype;
	      var child = new ctor, result = func.apply(child, args);
	      return Object(result) === result ? result : child;
	    })(Color, slice.call(arguments).concat(['gl']), function(){});
	  };
	
	  Color.prototype.gl = function() {
	    var rgb;
	    rgb = this._rgb;
	    return [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, rgb[3]];
	  };
	
	  rgb2luminance = function(r, g, b) {
	    var ref;
	    ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
	    r = luminance_x(r);
	    g = luminance_x(g);
	    b = luminance_x(b);
	    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
	  };
	
	  luminance_x = function(x) {
	    x /= 255;
	    if (x <= 0.03928) {
	      return x / 12.92;
	    } else {
	      return pow((x + 0.055) / 1.055, 2.4);
	    }
	  };
	
	  _interpolators = [];
	
	  interpolate = function(col1, col2, f, m) {
	    var interpol, len, o, res;
	    if (f == null) {
	      f = 0.5;
	    }
	    if (m == null) {
	      m = 'rgb';
	    }
	
	    /*
	    interpolates between colors
	    f = 0 --> me
	    f = 1 --> col
	     */
	    if (type(col1) !== 'object') {
	      col1 = chroma(col1);
	    }
	    if (type(col2) !== 'object') {
	      col2 = chroma(col2);
	    }
	    for (o = 0, len = _interpolators.length; o < len; o++) {
	      interpol = _interpolators[o];
	      if (m === interpol[0]) {
	        res = interpol[1](col1, col2, f, m);
	        break;
	      }
	    }
	    if (res == null) {
	      throw "color mode " + m + " is not supported";
	    }
	    res.alpha(col1.alpha() + f * (col2.alpha() - col1.alpha()));
	    return res;
	  };
	
	  chroma.interpolate = interpolate;
	
	  Color.prototype.interpolate = function(col2, f, m) {
	    return interpolate(this, col2, f, m);
	  };
	
	  chroma.mix = interpolate;
	
	  Color.prototype.mix = Color.prototype.interpolate;
	
	  interpolate_rgb = function(col1, col2, f, m) {
	    var xyz0, xyz1;
	    xyz0 = col1._rgb;
	    xyz1 = col2._rgb;
	    return new Color(xyz0[0] + f * (xyz1[0] - xyz0[0]), xyz0[1] + f * (xyz1[1] - xyz0[1]), xyz0[2] + f * (xyz1[2] - xyz0[2]), m);
	  };
	
	  _interpolators.push(['rgb', interpolate_rgb]);
	
	  Color.prototype.luminance = function(lum, mode) {
	    var cur_lum, eps, max_iter, test;
	    if (mode == null) {
	      mode = 'rgb';
	    }
	    if (!arguments.length) {
	      return rgb2luminance(this._rgb);
	    }
	    if (lum === 0) {
	      this._rgb = [0, 0, 0, this._rgb[3]];
	    } else if (lum === 1) {
	      this._rgb = [255, 255, 255, this._rgb[3]];
	    } else {
	      eps = 1e-7;
	      max_iter = 20;
	      test = function(l, h) {
	        var lm, m;
	        m = l.interpolate(h, 0.5, mode);
	        lm = m.luminance();
	        if (Math.abs(lum - lm) < eps || !max_iter--) {
	          return m;
	        }
	        if (lm > lum) {
	          return test(l, m);
	        }
	        return test(m, h);
	      };
	      cur_lum = rgb2luminance(this._rgb);
	      this._rgb = (cur_lum > lum ? test(chroma('black'), this) : test(this, chroma('white'))).rgba();
	    }
	    return this;
	  };
	
	  temperature2rgb = function(kelvin) {
	    var b, g, r, temp;
	    temp = kelvin / 100;
	    if (temp < 66) {
	      r = 255;
	      g = -155.25485562709179 - 0.44596950469579133 * (g = temp - 2) + 104.49216199393888 * log(g);
	      b = temp < 20 ? 0 : -254.76935184120902 + 0.8274096064007395 * (b = temp - 10) + 115.67994401066147 * log(b);
	    } else {
	      r = 351.97690566805693 + 0.114206453784165 * (r = temp - 55) - 40.25366309332127 * log(r);
	      g = 325.4494125711974 + 0.07943456536662342 * (g = temp - 50) - 28.0852963507957 * log(g);
	      b = 255;
	    }
	    return clip_rgb([r, g, b]);
	  };
	
	  rgb2temperature = function() {
	    var b, eps, g, maxTemp, minTemp, r, ref, rgb, temp;
	    ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
	    minTemp = 1000;
	    maxTemp = 40000;
	    eps = 0.4;
	    while (maxTemp - minTemp > eps) {
	      temp = (maxTemp + minTemp) * 0.5;
	      rgb = temperature2rgb(temp);
	      if ((rgb[2] / rgb[0]) >= (b / r)) {
	        maxTemp = temp;
	      } else {
	        minTemp = temp;
	      }
	    }
	    return round(temp);
	  };
	
	  chroma.temperature = chroma.kelvin = function() {
	    return (function(func, args, ctor) {
	      ctor.prototype = func.prototype;
	      var child = new ctor, result = func.apply(child, args);
	      return Object(result) === result ? result : child;
	    })(Color, slice.call(arguments).concat(['temperature']), function(){});
	  };
	
	  _input.temperature = _input.kelvin = _input.K = temperature2rgb;
	
	  Color.prototype.temperature = function() {
	    return rgb2temperature(this._rgb);
	  };
	
	  Color.prototype.kelvin = Color.prototype.temperature;
	
	  chroma.contrast = function(a, b) {
	    var l1, l2, ref, ref1;
	    if ((ref = type(a)) === 'string' || ref === 'number') {
	      a = new Color(a);
	    }
	    if ((ref1 = type(b)) === 'string' || ref1 === 'number') {
	      b = new Color(b);
	    }
	    l1 = a.luminance();
	    l2 = b.luminance();
	    if (l1 > l2) {
	      return (l1 + 0.05) / (l2 + 0.05);
	    } else {
	      return (l2 + 0.05) / (l1 + 0.05);
	    }
	  };
	
	  Color.prototype.get = function(modechan) {
	    var channel, i, me, mode, ref, src;
	    me = this;
	    ref = modechan.split('.'), mode = ref[0], channel = ref[1];
	    src = me[mode]();
	    if (channel) {
	      i = mode.indexOf(channel);
	      if (i > -1) {
	        return src[i];
	      } else {
	        return console.warn('unknown channel ' + channel + ' in mode ' + mode);
	      }
	    } else {
	      return src;
	    }
	  };
	
	  Color.prototype.set = function(modechan, value) {
	    var channel, i, me, mode, ref, src;
	    me = this;
	    ref = modechan.split('.'), mode = ref[0], channel = ref[1];
	    if (channel) {
	      src = me[mode]();
	      i = mode.indexOf(channel);
	      if (i > -1) {
	        if (type(value) === 'string') {
	          switch (value.charAt(0)) {
	            case '+':
	              src[i] += +value;
	              break;
	            case '-':
	              src[i] += +value;
	              break;
	            case '*':
	              src[i] *= +(value.substr(1));
	              break;
	            case '/':
	              src[i] /= +(value.substr(1));
	              break;
	            default:
	              src[i] = +value;
	          }
	        } else {
	          src[i] = value;
	        }
	      } else {
	        console.warn('unknown channel ' + channel + ' in mode ' + mode);
	      }
	    } else {
	      src = value;
	    }
	    me._rgb = chroma(src, mode).alpha(me.alpha())._rgb;
	    return me;
	  };
	
	  Color.prototype.darken = function(amount) {
	    var lab, me;
	    if (amount == null) {
	      amount = 1;
	    }
	    me = this;
	    lab = me.lab();
	    lab[0] -= LAB_CONSTANTS.Kn * amount;
	    return chroma.lab(lab).alpha(me.alpha());
	  };
	
	  Color.prototype.brighten = function(amount) {
	    if (amount == null) {
	      amount = 1;
	    }
	    return this.darken(-amount);
	  };
	
	  Color.prototype.darker = Color.prototype.darken;
	
	  Color.prototype.brighter = Color.prototype.brighten;
	
	  Color.prototype.saturate = function(amount) {
	    var lch, me;
	    if (amount == null) {
	      amount = 1;
	    }
	    me = this;
	    lch = me.lch();
	    lch[1] += amount * LAB_CONSTANTS.Kn;
	    if (lch[1] < 0) {
	      lch[1] = 0;
	    }
	    return chroma.lch(lch).alpha(me.alpha());
	  };
	
	  Color.prototype.desaturate = function(amount) {
	    if (amount == null) {
	      amount = 1;
	    }
	    return this.saturate(-amount);
	  };
	
	  Color.prototype.premultiply = function() {
	    var a, rgb;
	    rgb = this.rgb();
	    a = this.alpha();
	    return chroma(rgb[0] * a, rgb[1] * a, rgb[2] * a, a);
	  };
	
	  blend = function(bottom, top, mode) {
	    if (!blend[mode]) {
	      throw 'unknown blend mode ' + mode;
	    }
	    return blend[mode](bottom, top);
	  };
	
	  blend_f = function(f) {
	    return function(bottom, top) {
	      var c0, c1;
	      c0 = chroma(top).rgb();
	      c1 = chroma(bottom).rgb();
	      return chroma(f(c0, c1), 'rgb');
	    };
	  };
	
	  each = function(f) {
	    return function(c0, c1) {
	      var i, o, out;
	      out = [];
	      for (i = o = 0; o <= 3; i = ++o) {
	        out[i] = f(c0[i], c1[i]);
	      }
	      return out;
	    };
	  };
	
	  normal = function(a, b) {
	    return a;
	  };
	
	  multiply = function(a, b) {
	    return a * b / 255;
	  };
	
	  darken = function(a, b) {
	    if (a > b) {
	      return b;
	    } else {
	      return a;
	    }
	  };
	
	  lighten = function(a, b) {
	    if (a > b) {
	      return a;
	    } else {
	      return b;
	    }
	  };
	
	  screen = function(a, b) {
	    return 255 * (1 - (1 - a / 255) * (1 - b / 255));
	  };
	
	  overlay = function(a, b) {
	    if (b < 128) {
	      return 2 * a * b / 255;
	    } else {
	      return 255 * (1 - 2 * (1 - a / 255) * (1 - b / 255));
	    }
	  };
	
	  burn = function(a, b) {
	    return 255 * (1 - (1 - b / 255) / (a / 255));
	  };
	
	  dodge = function(a, b) {
	    if (a === 255) {
	      return 255;
	    }
	    a = 255 * (b / 255) / (1 - a / 255);
	    if (a > 255) {
	      return 255;
	    } else {
	      return a;
	    }
	  };
	
	  blend.normal = blend_f(each(normal));
	
	  blend.multiply = blend_f(each(multiply));
	
	  blend.screen = blend_f(each(screen));
	
	  blend.overlay = blend_f(each(overlay));
	
	  blend.darken = blend_f(each(darken));
	
	  blend.lighten = blend_f(each(lighten));
	
	  blend.dodge = blend_f(each(dodge));
	
	  blend.burn = blend_f(each(burn));
	
	  chroma.blend = blend;
	
	  chroma.analyze = function(data) {
	    var len, o, r, val;
	    r = {
	      min: Number.MAX_VALUE,
	      max: Number.MAX_VALUE * -1,
	      sum: 0,
	      values: [],
	      count: 0
	    };
	    for (o = 0, len = data.length; o < len; o++) {
	      val = data[o];
	      if ((val != null) && !isNaN(val)) {
	        r.values.push(val);
	        r.sum += val;
	        if (val < r.min) {
	          r.min = val;
	        }
	        if (val > r.max) {
	          r.max = val;
	        }
	        r.count += 1;
	      }
	    }
	    r.domain = [r.min, r.max];
	    r.limits = function(mode, num) {
	      return chroma.limits(r, mode, num);
	    };
	    return r;
	  };
	
	  chroma.scale = function(colors, positions) {
	    var _classes, _colorCache, _colors, _correctLightness, _domain, _fixed, _max, _min, _mode, _nacol, _out, _padding, _pos, _spread, classifyValue, f, getClass, getColor, resetCache, setColors, tmap;
	    _mode = 'rgb';
	    _nacol = chroma('#ccc');
	    _spread = 0;
	    _fixed = false;
	    _domain = [0, 1];
	    _pos = [];
	    _padding = [0, 0];
	    _classes = false;
	    _colors = [];
	    _out = false;
	    _min = 0;
	    _max = 1;
	    _correctLightness = false;
	    _colorCache = {};
	    setColors = function(colors) {
	      var c, col, o, ref, ref1, ref2, w;
	      if (colors == null) {
	        colors = ['#fff', '#000'];
	      }
	      if ((colors != null) && type(colors) === 'string' && (((ref = chroma.brewer) != null ? ref[colors] : void 0) != null)) {
	        colors = chroma.brewer[colors];
	      }
	      if (type(colors) === 'array') {
	        colors = colors.slice(0);
	        for (c = o = 0, ref1 = colors.length - 1; 0 <= ref1 ? o <= ref1 : o >= ref1; c = 0 <= ref1 ? ++o : --o) {
	          col = colors[c];
	          if (type(col) === "string") {
	            colors[c] = chroma(col);
	          }
	        }
	        _pos.length = 0;
	        for (c = w = 0, ref2 = colors.length - 1; 0 <= ref2 ? w <= ref2 : w >= ref2; c = 0 <= ref2 ? ++w : --w) {
	          _pos.push(c / (colors.length - 1));
	        }
	      }
	      resetCache();
	      return _colors = colors;
	    };
	    getClass = function(value) {
	      var i, n;
	      if (_classes != null) {
	        n = _classes.length - 1;
	        i = 0;
	        while (i < n && value >= _classes[i]) {
	          i++;
	        }
	        return i - 1;
	      }
	      return 0;
	    };
	    tmap = function(t) {
	      return t;
	    };
	    classifyValue = function(value) {
	      var i, maxc, minc, n, val;
	      val = value;
	      if (_classes.length > 2) {
	        n = _classes.length - 1;
	        i = getClass(value);
	        minc = _classes[0] + (_classes[1] - _classes[0]) * (0 + _spread * 0.5);
	        maxc = _classes[n - 1] + (_classes[n] - _classes[n - 1]) * (1 - _spread * 0.5);
	        val = _min + ((_classes[i] + (_classes[i + 1] - _classes[i]) * 0.5 - minc) / (maxc - minc)) * (_max - _min);
	      }
	      return val;
	    };
	    getColor = function(val, bypassMap) {
	      var c, col, i, k, o, p, ref, t;
	      if (bypassMap == null) {
	        bypassMap = false;
	      }
	      if (isNaN(val)) {
	        return _nacol;
	      }
	      if (!bypassMap) {
	        if (_classes && _classes.length > 2) {
	          c = getClass(val);
	          t = c / (_classes.length - 2);
	          t = _padding[0] + (t * (1 - _padding[0] - _padding[1]));
	        } else if (_max !== _min) {
	          t = (val - _min) / (_max - _min);
	          t = _padding[0] + (t * (1 - _padding[0] - _padding[1]));
	          t = Math.min(1, Math.max(0, t));
	        } else {
	          t = 1;
	        }
	      } else {
	        t = val;
	      }
	      if (!bypassMap) {
	        t = tmap(t);
	      }
	      k = Math.floor(t * 10000);
	      if (_colorCache[k]) {
	        col = _colorCache[k];
	      } else {
	        if (type(_colors) === 'array') {
	          for (i = o = 0, ref = _pos.length - 1; 0 <= ref ? o <= ref : o >= ref; i = 0 <= ref ? ++o : --o) {
	            p = _pos[i];
	            if (t <= p) {
	              col = _colors[i];
	              break;
	            }
	            if (t >= p && i === _pos.length - 1) {
	              col = _colors[i];
	              break;
	            }
	            if (t > p && t < _pos[i + 1]) {
	              t = (t - p) / (_pos[i + 1] - p);
	              col = chroma.interpolate(_colors[i], _colors[i + 1], t, _mode);
	              break;
	            }
	          }
	        } else if (type(_colors) === 'function') {
	          col = _colors(t);
	        }
	        _colorCache[k] = col;
	      }
	      return col;
	    };
	    resetCache = function() {
	      return _colorCache = {};
	    };
	    setColors(colors);
	    f = function(v) {
	      var c;
	      c = chroma(getColor(v));
	      if (_out && c[_out]) {
	        return c[_out]();
	      } else {
	        return c;
	      }
	    };
	    f.classes = function(classes) {
	      var d;
	      if (classes != null) {
	        if (type(classes) === 'array') {
	          _classes = classes;
	          _domain = [classes[0], classes[classes.length - 1]];
	        } else {
	          d = chroma.analyze(_domain);
	          if (classes === 0) {
	            _classes = [d.min, d.max];
	          } else {
	            _classes = chroma.limits(d, 'e', classes);
	          }
	        }
	        return f;
	      }
	      return _classes;
	    };
	    f.domain = function(domain) {
	      var c, d, k, len, o, ref, w;
	      if (!arguments.length) {
	        return _domain;
	      }
	      _min = domain[0];
	      _max = domain[domain.length - 1];
	      _pos = [];
	      k = _colors.length;
	      if (domain.length === k && _min !== _max) {
	        for (o = 0, len = domain.length; o < len; o++) {
	          d = domain[o];
	          _pos.push((d - _min) / (_max - _min));
	        }
	      } else {
	        for (c = w = 0, ref = k - 1; 0 <= ref ? w <= ref : w >= ref; c = 0 <= ref ? ++w : --w) {
	          _pos.push(c / (k - 1));
	        }
	      }
	      _domain = [_min, _max];
	      return f;
	    };
	    f.mode = function(_m) {
	      if (!arguments.length) {
	        return _mode;
	      }
	      _mode = _m;
	      resetCache();
	      return f;
	    };
	    f.range = function(colors, _pos) {
	      setColors(colors, _pos);
	      return f;
	    };
	    f.out = function(_o) {
	      _out = _o;
	      return f;
	    };
	    f.spread = function(val) {
	      if (!arguments.length) {
	        return _spread;
	      }
	      _spread = val;
	      return f;
	    };
	    f.correctLightness = function(v) {
	      if (v == null) {
	        v = true;
	      }
	      _correctLightness = v;
	      resetCache();
	      if (_correctLightness) {
	        tmap = function(t) {
	          var L0, L1, L_actual, L_diff, L_ideal, max_iter, pol, t0, t1;
	          L0 = getColor(0, true).lab()[0];
	          L1 = getColor(1, true).lab()[0];
	          pol = L0 > L1;
	          L_actual = getColor(t, true).lab()[0];
	          L_ideal = L0 + (L1 - L0) * t;
	          L_diff = L_actual - L_ideal;
	          t0 = 0;
	          t1 = 1;
	          max_iter = 20;
	          while (Math.abs(L_diff) > 1e-2 && max_iter-- > 0) {
	            (function() {
	              if (pol) {
	                L_diff *= -1;
	              }
	              if (L_diff < 0) {
	                t0 = t;
	                t += (t1 - t) * 0.5;
	              } else {
	                t1 = t;
	                t += (t0 - t) * 0.5;
	              }
	              L_actual = getColor(t, true).lab()[0];
	              return L_diff = L_actual - L_ideal;
	            })();
	          }
	          return t;
	        };
	      } else {
	        tmap = function(t) {
	          return t;
	        };
	      }
	      return f;
	    };
	    f.padding = function(p) {
	      if (p != null) {
	        if (type(p) === 'number') {
	          p = [p, p];
	        }
	        _padding = p;
	        return f;
	      } else {
	        return _padding;
	      }
	    };
	    f.colors = function() {
	      var dd, dm, i, numColors, o, out, ref, results, samples, w;
	      numColors = 0;
	      out = 'hex';
	      if (arguments.length === 1) {
	        if (type(arguments[0]) === 'string') {
	          out = arguments[0];
	        } else {
	          numColors = arguments[0];
	        }
	      }
	      if (arguments.length === 2) {
	        numColors = arguments[0], out = arguments[1];
	      }
	      if (numColors) {
	        dm = _domain[0];
	        dd = _domain[1] - dm;
	        return (function() {
	          results = [];
	          for (var o = 0; 0 <= numColors ? o < numColors : o > numColors; 0 <= numColors ? o++ : o--){ results.push(o); }
	          return results;
	        }).apply(this).map(function(i) {
	          return f(dm + i / (numColors - 1) * dd)[out]();
	        });
	      }
	      colors = [];
	      samples = [];
	      if (_classes && _classes.length > 2) {
	        for (i = w = 1, ref = _classes.length; 1 <= ref ? w < ref : w > ref; i = 1 <= ref ? ++w : --w) {
	          samples.push((_classes[i - 1] + _classes[i]) * 0.5);
	        }
	      } else {
	        samples = _domain;
	      }
	      return samples.map(function(v) {
	        return f(v)[out]();
	      });
	    };
	    return f;
	  };
	
	  if (chroma.scales == null) {
	    chroma.scales = {};
	  }
	
	  chroma.scales.cool = function() {
	    return chroma.scale([chroma.hsl(180, 1, .9), chroma.hsl(250, .7, .4)]);
	  };
	
	  chroma.scales.hot = function() {
	    return chroma.scale(['#000', '#f00', '#ff0', '#fff'], [0, .25, .75, 1]).mode('rgb');
	  };
	
	  chroma.analyze = function(data, key, filter) {
	    var add, k, len, o, r, val, visit;
	    r = {
	      min: Number.MAX_VALUE,
	      max: Number.MAX_VALUE * -1,
	      sum: 0,
	      values: [],
	      count: 0
	    };
	    if (filter == null) {
	      filter = function() {
	        return true;
	      };
	    }
	    add = function(val) {
	      if ((val != null) && !isNaN(val)) {
	        r.values.push(val);
	        r.sum += val;
	        if (val < r.min) {
	          r.min = val;
	        }
	        if (val > r.max) {
	          r.max = val;
	        }
	        r.count += 1;
	      }
	    };
	    visit = function(val, k) {
	      if (filter(val, k)) {
	        if ((key != null) && type(key) === 'function') {
	          return add(key(val));
	        } else if ((key != null) && type(key) === 'string' || type(key) === 'number') {
	          return add(val[key]);
	        } else {
	          return add(val);
	        }
	      }
	    };
	    if (type(data) === 'array') {
	      for (o = 0, len = data.length; o < len; o++) {
	        val = data[o];
	        visit(val);
	      }
	    } else {
	      for (k in data) {
	        val = data[k];
	        visit(val, k);
	      }
	    }
	    r.domain = [r.min, r.max];
	    r.limits = function(mode, num) {
	      return chroma.limits(r, mode, num);
	    };
	    return r;
	  };
	
	  chroma.limits = function(data, mode, num) {
	    var aa, ab, ac, ad, ae, af, ag, ah, ai, aj, ak, al, am, assignments, best, centroids, cluster, clusterSizes, dist, i, j, kClusters, limits, max_log, min, min_log, mindist, n, nb_iters, newCentroids, o, p, pb, pr, ref, ref1, ref10, ref11, ref12, ref13, ref14, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, repeat, sum, tmpKMeansBreaks, value, values, w;
	    if (mode == null) {
	      mode = 'equal';
	    }
	    if (num == null) {
	      num = 7;
	    }
	    if (type(data) === 'array') {
	      data = chroma.analyze(data);
	    }
	    min = data.min;
	    max = data.max;
	    sum = data.sum;
	    values = data.values.sort(function(a, b) {
	      return a - b;
	    });
	    limits = [];
	    if (mode.substr(0, 1) === 'c') {
	      limits.push(min);
	      limits.push(max);
	    }
	    if (mode.substr(0, 1) === 'e') {
	      limits.push(min);
	      for (i = o = 1, ref = num - 1; 1 <= ref ? o <= ref : o >= ref; i = 1 <= ref ? ++o : --o) {
	        limits.push(min + (i / num) * (max - min));
	      }
	      limits.push(max);
	    } else if (mode.substr(0, 1) === 'l') {
	      if (min <= 0) {
	        throw 'Logarithmic scales are only possible for values > 0';
	      }
	      min_log = Math.LOG10E * log(min);
	      max_log = Math.LOG10E * log(max);
	      limits.push(min);
	      for (i = w = 1, ref1 = num - 1; 1 <= ref1 ? w <= ref1 : w >= ref1; i = 1 <= ref1 ? ++w : --w) {
	        limits.push(pow(10, min_log + (i / num) * (max_log - min_log)));
	      }
	      limits.push(max);
	    } else if (mode.substr(0, 1) === 'q') {
	      limits.push(min);
	      for (i = aa = 1, ref2 = num - 1; 1 <= ref2 ? aa <= ref2 : aa >= ref2; i = 1 <= ref2 ? ++aa : --aa) {
	        p = values.length * i / num;
	        pb = floor(p);
	        if (pb === p) {
	          limits.push(values[pb]);
	        } else {
	          pr = p - pb;
	          limits.push(values[pb] * pr + values[pb + 1] * (1 - pr));
	        }
	      }
	      limits.push(max);
	    } else if (mode.substr(0, 1) === 'k') {
	
	      /*
	      implementation based on
	      http://code.google.com/p/figue/source/browse/trunk/figue.js#336
	      simplified for 1-d input values
	       */
	      n = values.length;
	      assignments = new Array(n);
	      clusterSizes = new Array(num);
	      repeat = true;
	      nb_iters = 0;
	      centroids = null;
	      centroids = [];
	      centroids.push(min);
	      for (i = ab = 1, ref3 = num - 1; 1 <= ref3 ? ab <= ref3 : ab >= ref3; i = 1 <= ref3 ? ++ab : --ab) {
	        centroids.push(min + (i / num) * (max - min));
	      }
	      centroids.push(max);
	      while (repeat) {
	        for (j = ac = 0, ref4 = num - 1; 0 <= ref4 ? ac <= ref4 : ac >= ref4; j = 0 <= ref4 ? ++ac : --ac) {
	          clusterSizes[j] = 0;
	        }
	        for (i = ad = 0, ref5 = n - 1; 0 <= ref5 ? ad <= ref5 : ad >= ref5; i = 0 <= ref5 ? ++ad : --ad) {
	          value = values[i];
	          mindist = Number.MAX_VALUE;
	          for (j = ae = 0, ref6 = num - 1; 0 <= ref6 ? ae <= ref6 : ae >= ref6; j = 0 <= ref6 ? ++ae : --ae) {
	            dist = abs(centroids[j] - value);
	            if (dist < mindist) {
	              mindist = dist;
	              best = j;
	            }
	          }
	          clusterSizes[best]++;
	          assignments[i] = best;
	        }
	        newCentroids = new Array(num);
	        for (j = af = 0, ref7 = num - 1; 0 <= ref7 ? af <= ref7 : af >= ref7; j = 0 <= ref7 ? ++af : --af) {
	          newCentroids[j] = null;
	        }
	        for (i = ag = 0, ref8 = n - 1; 0 <= ref8 ? ag <= ref8 : ag >= ref8; i = 0 <= ref8 ? ++ag : --ag) {
	          cluster = assignments[i];
	          if (newCentroids[cluster] === null) {
	            newCentroids[cluster] = values[i];
	          } else {
	            newCentroids[cluster] += values[i];
	          }
	        }
	        for (j = ah = 0, ref9 = num - 1; 0 <= ref9 ? ah <= ref9 : ah >= ref9; j = 0 <= ref9 ? ++ah : --ah) {
	          newCentroids[j] *= 1 / clusterSizes[j];
	        }
	        repeat = false;
	        for (j = ai = 0, ref10 = num - 1; 0 <= ref10 ? ai <= ref10 : ai >= ref10; j = 0 <= ref10 ? ++ai : --ai) {
	          if (newCentroids[j] !== centroids[i]) {
	            repeat = true;
	            break;
	          }
	        }
	        centroids = newCentroids;
	        nb_iters++;
	        if (nb_iters > 200) {
	          repeat = false;
	        }
	      }
	      kClusters = {};
	      for (j = aj = 0, ref11 = num - 1; 0 <= ref11 ? aj <= ref11 : aj >= ref11; j = 0 <= ref11 ? ++aj : --aj) {
	        kClusters[j] = [];
	      }
	      for (i = ak = 0, ref12 = n - 1; 0 <= ref12 ? ak <= ref12 : ak >= ref12; i = 0 <= ref12 ? ++ak : --ak) {
	        cluster = assignments[i];
	        kClusters[cluster].push(values[i]);
	      }
	      tmpKMeansBreaks = [];
	      for (j = al = 0, ref13 = num - 1; 0 <= ref13 ? al <= ref13 : al >= ref13; j = 0 <= ref13 ? ++al : --al) {
	        tmpKMeansBreaks.push(kClusters[j][0]);
	        tmpKMeansBreaks.push(kClusters[j][kClusters[j].length - 1]);
	      }
	      tmpKMeansBreaks = tmpKMeansBreaks.sort(function(a, b) {
	        return a - b;
	      });
	      limits.push(tmpKMeansBreaks[0]);
	      for (i = am = 1, ref14 = tmpKMeansBreaks.length - 1; am <= ref14; i = am += 2) {
	        if (!isNaN(tmpKMeansBreaks[i])) {
	          limits.push(tmpKMeansBreaks[i]);
	        }
	      }
	    }
	    return limits;
	  };
	
	  hsi2rgb = function(h, s, i) {
	
	    /*
	    borrowed from here:
	    http://hummer.stanford.edu/museinfo/doc/examples/humdrum/keyscape2/hsi2rgb.cpp
	     */
	    var args, b, g, r;
	    args = unpack(arguments);
	    h = args[0], s = args[1], i = args[2];
	    h /= 360;
	    if (h < 1 / 3) {
	      b = (1 - s) / 3;
	      r = (1 + s * cos(TWOPI * h) / cos(PITHIRD - TWOPI * h)) / 3;
	      g = 1 - (b + r);
	    } else if (h < 2 / 3) {
	      h -= 1 / 3;
	      r = (1 - s) / 3;
	      g = (1 + s * cos(TWOPI * h) / cos(PITHIRD - TWOPI * h)) / 3;
	      b = 1 - (r + g);
	    } else {
	      h -= 2 / 3;
	      g = (1 - s) / 3;
	      b = (1 + s * cos(TWOPI * h) / cos(PITHIRD - TWOPI * h)) / 3;
	      r = 1 - (g + b);
	    }
	    r = limit(i * r * 3);
	    g = limit(i * g * 3);
	    b = limit(i * b * 3);
	    return [r * 255, g * 255, b * 255, args.length > 3 ? args[3] : 1];
	  };
	
	  rgb2hsi = function() {
	
	    /*
	    borrowed from here:
	    http://hummer.stanford.edu/museinfo/doc/examples/humdrum/keyscape2/rgb2hsi.cpp
	     */
	    var b, g, h, i, min, r, ref, s;
	    ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
	    TWOPI = Math.PI * 2;
	    r /= 255;
	    g /= 255;
	    b /= 255;
	    min = Math.min(r, g, b);
	    i = (r + g + b) / 3;
	    s = 1 - min / i;
	    if (s === 0) {
	      h = 0;
	    } else {
	      h = ((r - g) + (r - b)) / 2;
	      h /= Math.sqrt((r - g) * (r - g) + (r - b) * (g - b));
	      h = Math.acos(h);
	      if (b > g) {
	        h = TWOPI - h;
	      }
	      h /= TWOPI;
	    }
	    return [h * 360, s, i];
	  };
	
	  chroma.hsi = function() {
	    return (function(func, args, ctor) {
	      ctor.prototype = func.prototype;
	      var child = new ctor, result = func.apply(child, args);
	      return Object(result) === result ? result : child;
	    })(Color, slice.call(arguments).concat(['hsi']), function(){});
	  };
	
	  _input.hsi = hsi2rgb;
	
	  Color.prototype.hsi = function() {
	    return rgb2hsi(this._rgb);
	  };
	
	  interpolate_hsx = function(col1, col2, f, m) {
	    var dh, hue, hue0, hue1, lbv, lbv0, lbv1, res, sat, sat0, sat1, xyz0, xyz1;
	    if (m === 'hsl') {
	      xyz0 = col1.hsl();
	      xyz1 = col2.hsl();
	    } else if (m === 'hsv') {
	      xyz0 = col1.hsv();
	      xyz1 = col2.hsv();
	    } else if (m === 'hsi') {
	      xyz0 = col1.hsi();
	      xyz1 = col2.hsi();
	    } else if (m === 'lch' || m === 'hcl') {
	      m = 'hcl';
	      xyz0 = col1.hcl();
	      xyz1 = col2.hcl();
	    }
	    if (m.substr(0, 1) === 'h') {
	      hue0 = xyz0[0], sat0 = xyz0[1], lbv0 = xyz0[2];
	      hue1 = xyz1[0], sat1 = xyz1[1], lbv1 = xyz1[2];
	    }
	    if (!isNaN(hue0) && !isNaN(hue1)) {
	      if (hue1 > hue0 && hue1 - hue0 > 180) {
	        dh = hue1 - (hue0 + 360);
	      } else if (hue1 < hue0 && hue0 - hue1 > 180) {
	        dh = hue1 + 360 - hue0;
	      } else {
	        dh = hue1 - hue0;
	      }
	      hue = hue0 + f * dh;
	    } else if (!isNaN(hue0)) {
	      hue = hue0;
	      if ((lbv1 === 1 || lbv1 === 0) && m !== 'hsv') {
	        sat = sat0;
	      }
	    } else if (!isNaN(hue1)) {
	      hue = hue1;
	      if ((lbv0 === 1 || lbv0 === 0) && m !== 'hsv') {
	        sat = sat1;
	      }
	    } else {
	      hue = Number.NaN;
	    }
	    if (sat == null) {
	      sat = sat0 + f * (sat1 - sat0);
	    }
	    lbv = lbv0 + f * (lbv1 - lbv0);
	    return res = chroma[m](hue, sat, lbv);
	  };
	
	  _interpolators = _interpolators.concat((function() {
	    var len, o, ref, results;
	    ref = ['hsv', 'hsl', 'hsi', 'hcl', 'lch'];
	    results = [];
	    for (o = 0, len = ref.length; o < len; o++) {
	      m = ref[o];
	      results.push([m, interpolate_hsx]);
	    }
	    return results;
	  })());
	
	  interpolate_num = function(col1, col2, f, m) {
	    var n1, n2;
	    n1 = col1.num();
	    n2 = col2.num();
	    return chroma.num(n1 + (n2 - n1) * f, 'num');
	  };
	
	  _interpolators.push(['num', interpolate_num]);
	
	  interpolate_lab = function(col1, col2, f, m) {
	    var res, xyz0, xyz1;
	    xyz0 = col1.lab();
	    xyz1 = col2.lab();
	    return res = new Color(xyz0[0] + f * (xyz1[0] - xyz0[0]), xyz0[1] + f * (xyz1[1] - xyz0[1]), xyz0[2] + f * (xyz1[2] - xyz0[2]), m);
	  };
	
	  _interpolators.push(['lab', interpolate_lab]);
	
	}).call(this);
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(8)(module)))

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 9 */
/***/ function(module, exports) {

	'use strict';
	
	var toExport = {
	  descendants: descendants,
	  root: root
	};
	
	if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
	  module.exports = toExport;
	} else {
	  Object.assign(window, toExport);
	}
	
	function descendants(node) {
	  var children = arguments.length <= 1 || arguments[1] === undefined ? function (n) {
	    return n.children;
	  } : arguments[1];
	
	  var childrenQueue = Array.prototype.slice.call(children(node));
	  var descendants = [];
	  while (childrenQueue.length > 0) {
	    var child = childrenQueue.shift();
	
	    descendants.push(child);
	    childrenQueue = childrenQueue.concat(children(child));
	  }
	
	  return descendants;
	};
	
	function root(node) {
	  var parent = arguments.length <= 1 || arguments[1] === undefined ? function (n) {
	    return n.parent;
	  } : arguments[1];
	
	  while (node.parent) {
	    node = node.parent;
	  }
	
	  return node;
	}

/***/ },
/* 10 */
/***/ function(module, exports) {

	"use strict";
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	var toExport = {
	  compare: compare,
	  getWithInit: getWithInit,
	  mapObject: mapObject,
	  mergeObjects: mergeObjects,
	  isLexical: isLexical,
	  memobind: memobind,
	  createElement: createElement
	};
	
	if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
	  module.exports = toExport;
	} else {
	  Object.assign(window, toExport);
	}
	
	function isLexical(name) {
	  return name[0].toLowerCase() === name[0];
	}
	
	function compare(a, b) {
	  if (a > b) {
	    return 1;
	  } else if (a < b) {
	    return -1;
	  } else {
	    return 0;
	  }
	}
	
	function getWithInit(object, key, defaultValue) {
	  if (!object.hasOwnProperty(key)) {
	    object[key] = defaultValue;
	  }
	
	  return object[key];
	}
	
	function mapObject(object, fun) {
	  var out = {};
	  Object.keys(object).forEach(function (key) {
	    out[key] = fun(object[key]);
	  });
	
	  return out;
	}
	
	function mergeObjects(a, b, fun) {
	  var out = {};
	  Object.keys(a).forEach(function (key) {
	    if (b.hasOwnProperty(key)) {
	      out[key] = fun(a[key], b[key]);
	    } else {
	      out[key] = a[key];
	    }
	  });
	
	  return Object.assign({}, b, out); //if conflict between b and out, prefer out.
	}
	
	//returns a function bound to an arg, and remembers return values, so comparison
	// using '===' works
	var memo = new Map();
	function memobind() {
	  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	    args[_key] = arguments[_key];
	  }
	
	  var argStack = args.slice();
	  var current = memo;
	  var currentItem = undefined;
	  while (argStack.length > 0 && current.has(argStack[0])) {
	    currentItem = argStack.shift();
	    current = current.get(currentItem);
	  }
	  if (argStack.length === 0) {
	    return current;
	  } else {
	    var _args$;
	
	    while (argStack.length > 1) {
	      currentItem = argStack.shift();
	      var nextCurrent = new Map();
	      current.set(currentItem, nextCurrent);
	      current = nextCurrent;
	    }
	    var bound = (_args$ = args[0]).bind.apply(_args$, _toConsumableArray(args.slice(1)));
	    current.set(argStack[0], bound);
	    return bound;
	  }
	}
	
	function createElement(sel, optContent) {
	  var parts = sel.split('.');
	  var tagName = parts[0];
	  if (tagName.length === 0) {
	    tagName = 'div';
	  }
	
	  var el = document.createElement(tagName);
	  el.className = parts.slice(1).join(' ');
	  if (optContent) {
	    el.textContent = optContent;
	  }
	  return el;
	}

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var reify = __webpack_require__(12),
	    utils = __webpack_require__(10),
	    treeUtils = __webpack_require__(9);
	
	var language = __webpack_require__(13);
	
	var ExampleView = function () {
	  function ExampleView(exampleNode, _ref) {
	    var _this = this;
	
	    var semantics = _ref.semantics;
	    var match = _ref.match;
	    var nodeToSimplified = _ref.nodeToSimplified;
	    var nodeToResults = _ref.nodeToResults;
	    var keywordTags = _ref.keywordTags;
	    var actions = _ref.actions;
	
	    _classCallCheck(this, ExampleView);
	
	    this.keywordTags = keywordTags;
	    this.actions = actions;
	    this.nodeToSimplified = nodeToSimplified;
	    this.nodeToResults = nodeToResults;
	
	    //2. the reified form of the CST
	    var reified = reify.reify(semantics, match);
	    this.DOM = reified[0];
	    this.domToOhm = reified[1];
	    this.ohmToDom = reified[2];
	
	    this.DOMNode = exampleNode;
	    this.DOMNode.textContent = "";
	    this.DOMNode.appendChild(this.DOM);
	
	    this.updateSemanticResults(this.nodeToResults);
	
	    //sets relevant flags/adds relevant attributes to the right structure(s)
	    var _iteratorNormalCompletion = true;
	    var _didIteratorError = false;
	    var _iteratorError = undefined;
	
	    try {
	      var _loop = function _loop() {
	        var key = _step.value;
	
	        var domNode = _this.ohmToDom.get(key);
	        var simplifiedNode = _this.nodeToSimplified.get(key);
	        var parent = domNode.parentNode;
	
	        _this.ohmToDom.get(simplifiedNode.cstNodes[0]).setAttribute("possibleCurrent", "true");
	        if (key.constructor.name === "TerminalNode") {
	          if (Array.prototype.slice.call(parent.children).find(function (child) {
	            return child.tagName.toLowerCase() !== "terminal";
	          })) {
	            parallelToggle("landmark", domNode, simplifiedNode);
	          }
	        } else {
	          if (_this.keywordTags.find(function (tag) {
	            return tag.toLowerCase() === domNode.tagName.toLowerCase();
	          })) {
	            parallelToggle("keyword", domNode, simplifiedNode);
	          }
	        }
	      };
	
	      for (var _iterator = this.ohmToDom.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	        _loop();
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
	
	    parallelToggle("current", this.DOM, this.nodeToSimplified.get(this.domToOhm.get(this.DOM)));
	
	    this.DOM.addEventListener("click", utils.memobind(this.onClick, this, this.DOM));
	    this.DOM.addEventListener("mouseover", utils.memobind(this.onMouseover, this, this.DOM));
	    this.DOM.addEventListener("mouseout", utils.memobind(this.onMouseout, this, this.DOM));
	  }
	
	  _createClass(ExampleView, [{
	    key: "updateSemanticResults",
	    value: function updateSemanticResults(newNodeToResults) {
	      this.nodeToResults = newNodeToResults;
	
	      var _iteratorNormalCompletion2 = true;
	      var _didIteratorError2 = false;
	      var _iteratorError2 = undefined;
	
	      try {
	        for (var _iterator2 = this.ohmToDom.keys()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	          var key = _step2.value;
	
	          var _domNode = this.ohmToDom.get(key);
	
	          if (key.constructor.name !== "TerminalNode" && this.nodeToResults.has(key)) {
	            var result = this.nodeToResults.get(key);
	            key.result = result;
	            _domNode.setAttribute("result", result instanceof Error ? "error" : "success");
	          }
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
	
	    //OPERATIONS
	
	  }, {
	    key: "makeCurrent",
	    value: function makeCurrent(node) {
	      var domNode = this.ohmToDom.get(node.cstNodes[0]);
	      domNode.classList.add("current");
	
	      domNode.addEventListener("click", utils.memobind(this.onClick, this, domNode));
	      domNode.addEventListener("mouseover", utils.memobind(this.onMouseover, this, domNode));
	      domNode.addEventListener("mouseout", utils.memobind(this.onMouseout, this, domNode));
	    }
	  }, {
	    key: "makeNonCurrent",
	    value: function makeNonCurrent(node) {
	      var domNode = this.ohmToDom.get(node.cstNodes[0]);
	      domNode.classList.remove("current");
	
	      domNode.removeEventListener("click", utils.memobind(this.onClick, this, domNode));
	      domNode.removeEventListener("mouseover", utils.memobind(this.onMouseover, this, domNode));
	      domNode.removeEventListener("mouseout", utils.memobind(this.onMouseout, this, domNode));
	
	      this.onMouseout(domNode);
	    }
	  }, {
	    key: "split",
	    value: function split(simplifiedCSTNode) {
	      var children = simplifiedCSTNode._children ? simplifiedCSTNode._children : simplifiedCSTNode.children;
	
	      this.makeNonCurrent(simplifiedCSTNode);
	      children.forEach(this.makeCurrent.bind(this));
	    }
	  }, {
	    key: "join",
	    value: function join(simplifiedCSTNode) {
	      var descendants = treeUtils.descendants(simplifiedCSTNode, function (child) {
	        return child._children ? child._children : child.children;
	      });
	
	      descendants.forEach(this.makeNonCurrent.bind(this));
	      this.makeCurrent(simplifiedCSTNode);
	    }
	  }, {
	    key: "highlight",
	    value: function highlight(node) {
	      //highlight corresponding dom node
	      var domNode = this.ohmToDom.get(node.cstNodes[0]);
	      domNode.classList.add("active");
	    }
	  }, {
	    key: "unHighlight",
	    value: function unHighlight(node) {
	      //unhighlight corresponding dom node
	      var domNode = this.ohmToDom.get(node.cstNodes[0]);
	      domNode.classList.remove("active");
	    }
	
	    //EVENT LISTENERS
	
	  }, {
	    key: "onClick",
	    value: function onClick(currentNode, event) {
	      var currentSimplified = this.nodeToSimplified.get(this.domToOhm.get(currentNode));
	      if (event.altKey || event.ctrlKey) {
	        currentSimplified = currentSimplified.parent || currentSimplified;
	        this.actions.join(currentSimplified);
	      } else {
	        this.actions.split(currentSimplified);
	      }
	      event.stopPropagation();
	    }
	  }, {
	    key: "onMouseover",
	    value: function onMouseover(currentNode, event) {
	      var currentSimplified = this.nodeToSimplified.get(this.domToOhm.get(currentNode));
	      this.actions.highlight(currentSimplified);
	    }
	  }, {
	    key: "onMouseout",
	    value: function onMouseout(currentNode, event) {
	      var currentSimplified = this.nodeToSimplified.get(this.domToOhm.get(currentNode));
	      this.actions.unHighlight(currentSimplified);
	    }
	  }]);
	
	  return ExampleView;
	}();
	
	var toExport = {
	  ExampleView: ExampleView
	};
	
	if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
	  module.exports = toExport;
	} else {
	  Object.assign(window, toExport);
	}
	
	//HELPER FUNCTIONS
	
	//sets/removes a flag in several objects/DOM nodes
	function parallelToggle(property) {
	  for (var _len = arguments.length, objects = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	    objects[_key - 1] = arguments[_key];
	  }
	
	  objects.forEach(function (object) {
	    if (object instanceof Node) {
	      if (object.classList.contains(property)) {
	        object.classList.remove(property);
	      } else {
	        object.classList.add(property);
	      }
	    } else {
	      if (object[property]) {
	        object[property] = false;
	      } else {
	        object[property] = true;
	      }
	    }
	  });
	}
	
	/** WEBPACK FOOTER **
	 ** ./src/components/exampleRepresentation/exampleView.js
	 **/

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var util = __webpack_require__(10);
	
	var getWithInit = util.getWithInit,
	    mapObject = util.mapObject,
	    mergeObjects = util.mergeObjects;
	
	var toExport = {
	  registerReifyActions: registerReifyActions,
	  reify: reify
	};
	
	if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
	  module.exports = toExport;
	} else {
	  Object.assign(window, toExport);
	}
	
	function closeTag(tagName) {
	  return "</" + tagName + ">";
	}
	
	function openTag(tagName) {
	  return "<" + tagName + ">";
	}
	
	function registerReifyActions(semantics) {
	  semantics.addOperation("reifyAST(tagPositions)", {
	    _nonterminal: function _nonterminal(children) {
	      var _this = this;
	
	      var start = this.interval.startIdx,
	          end = this.interval.endIdx;
	      var tagName = this._node.ctorName;
	
	      getWithInit(this.args.tagPositions, start, []).push(openTag(tagName));
	
	      for (var i = 0; i < children.length; i++) {
	        var child = children[i];
	        if (child._node.ctorName === "_iter") {
	          (function () {
	            var iters = [child];
	            while (children[i + 1] && children[i + 1]._node.ctorName === "_iter") {
	              if (children[i + 1].interval.contents === iters[0].interval.contents) {
	                iters.push(children[++i]);
	              } else {
	                break;
	              }
	            }
	
	            var iterChildren = iters.map(function (iter) {
	              return Array.prototype.slice.call(iter.children);
	            });
	            var interleavedChildren = [];
	            while (iterChildren[0].length > 0) {
	              iterChildren.forEach(function (iterC) {
	                interleavedChildren.push(iterC.shift());
	              });
	            }
	
	            interleavedChildren.forEach(function (child) {
	              return child.reifyAST(_this.args.tagPositions);
	            });
	          })();
	        } else {
	          child.reifyAST(this.args.tagPositions);
	        }
	      }
	
	      // children.forEach(child=> child.reifyAST(this.args.tagPositions));
	      getWithInit(this.args.tagPositions, end, []).push(closeTag(tagName));
	    },
	    _terminal: function _terminal() {
	      var start = this.interval.startIdx,
	          end = this.interval.endIdx;
	      var tagName = "terminal";
	
	      getWithInit(this.args.tagPositions, start, []).push(openTag(tagName));
	      getWithInit(this.args.tagPositions, end, []).push(closeTag(tagName));
	    }
	  });
	
	  semantics.addOperation("mapDOM(DOMNode, domToOhm, ohmToDom)", {
	    _nonterminal: function _nonterminal(children) {
	      var _this2 = this;
	
	      this.args.domToOhm.set(this.args.DOMNode, this._node);
	      this.args.ohmToDom.set(this._node, this.args.DOMNode);
	
	      var DOMChildren = Array.prototype.slice.apply(this.args.DOMNode.children);
	      for (var i = 0; i < children.length; i++) {
	        var child = children[i];
	        if (child._node.ctorName === "_iter") {
	          (function () {
	            var iters = [child];
	            while (children[i + 1] && children[i + 1]._node.ctorName === "_iter") {
	              if (children[i + 1].interval.contents === iters[0].interval.contents) {
	                iters.push(children[++i]);
	              } else {
	                break;
	              }
	            }
	
	            var numDOMChildrenCovered = iters.reduce(function (agg, b) {
	              return agg + b.children.length;
	            }, 0);
	            var DOMChildrenCovered = DOMChildren.slice(0, numDOMChildrenCovered);
	            DOMChildren = DOMChildren.slice(numDOMChildrenCovered);
	
	            var iterDOMChildren = iters.map(function () {
	              return [];
	            });
	            DOMChildrenCovered.forEach(function (domChild, i) {
	              iterDOMChildren[i % iterDOMChildren.length].push(domChild);
	            });
	
	            iterDOMChildren.forEach(function (domChildren, i) {
	              iters[i].mapDOM(domChildren, _this2.args.domToOhm, _this2.args.ohmToDom);
	            });
	          })();
	        } else {
	          child.mapDOM(DOMChildren.shift(), this.args.domToOhm, this.args.ohmToDom);
	        }
	      }
	    },
	    _iter: function _iter(children) {
	      var _this3 = this;
	
	      var DOMNodes = this.args.DOMNode;
	      if (children.length !== DOMNodes.length) {
	        throw new Error("ERROR: iterator node got a different number of dom nodes(" + DOMNodes.length + ") than children(" + children.length + ")");
	        return;
	      }
	
	      children.forEach(function (child, i) {
	        return child.mapDOM(DOMNodes[i], _this3.args.domToOhm, _this3.args.ohmToDom);
	      });
	    },
	    _terminal: function _terminal() {
	      this.args.domToOhm.set(this.args.DOMNode, this._node);
	      this.args.ohmToDom.set(this._node, this.args.DOMNode);
	    }
	  });
	}
	
	function reify(semantics, match) {
	  var tagPositions = {};
	  var domToOhm = new Map(),
	      ohmToDom = new Map();
	  var example = match._cst.interval.contents;
	
	  var semmatch = semantics(match);
	
	  semmatch.reifyAST(tagPositions);
	
	  tagPositions = mapObject(tagPositions, function (tags) {
	    return tags.join("");
	  });
	
	  var positionsToInsert = Object.keys(tagPositions);
	  var stringsToInsert = Object.keys(tagPositions).map(function (key) {
	    return tagPositions[key];
	  });
	
	  var start = 0,
	      end;
	  var splitExampleString = [];
	  while (positionsToInsert.length > 0) {
	    end = positionsToInsert.shift();
	    splitExampleString.push(example.substring(start, end));
	
	    start = end;
	  }
	  splitExampleString.push(example.substring(start));
	
	  var annotatedExamplePieces = [];
	  annotatedExamplePieces.push(splitExampleString.shift());
	  while (stringsToInsert.length > 0) {
	    annotatedExamplePieces.push(stringsToInsert.shift());
	    annotatedExamplePieces.push(splitExampleString.shift());
	  }
	  annotatedExamplePieces.push(splitExampleString.shift());
	
	  var annotatedExample = annotatedExamplePieces.join("");
	  var parser = new DOMParser();
	  var DOM = parser.parseFromString(annotatedExample, "text/html");
	  DOM = DOM.querySelector('body').children[0];
	
	  semmatch.mapDOM(DOM, domToOhm, ohmToDom);
	
	  return [DOM, domToOhm, ohmToDom];
	}

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var ohm = __webpack_require__(14);
	
	var toExport = {
	  grammar: grammar,
	  semantics: semantics,
	  grammarCST: grammarCST,
	  ohmSemantics: ohmSemantics
	};
	
	if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
	  module.exports = toExport;
	} else {
	  Object.assign(window, toExport);
	}
	
	var grammar = null,
	    semantics = null,
	    grammarCST = null,
	    ohmSemantics = null;
	
	document.addEventListener("DOMContentLoaded", function () {
	  var script = document.querySelector('script[type="text/ohm-js"]:not(#es5)');
	
	  toExport.grammar = ohm.grammarFromScriptElement(script);
	  toExport.semantics = toExport.grammar.semantics();
	  // toExport.grammarCST = ohm.ohmGrammar.match(script.textContent);
	  // toExport.ohmSemantics = ohm.ohmGrammar.semantics();
	
	  toExport.InferBraces = ohm.makeRecipe(function () {
	    var buildSuperGrammar = function buildSuperGrammar() {
	      var buildSuperGrammar = function buildSuperGrammar() {
	        return new this.newGrammar("ES5").withDefaultStartRule("Program").define("Program", [], this.seq(this.star(this.app("Directive")), this.star(this.app("SourceElement")))).define("sourceCharacter", [], this.app("any")).override("space", [], this.alt(this.app("whitespace"), this.app("lineTerminator"), this.app("comment"))).define("whitespace_verticalTab", [], this.prim("\u000b")).define("whitespace_formFeed", [], this.prim("\f")).define("whitespace_noBreakSpace", [], this.prim(" ")).define("whitespace_byteOrderMark", [], this.prim("﻿")).define("whitespace", [], this.alt(this.prim("\t"), this.app("whitespace_verticalTab"), this.app("whitespace_formFeed"), this.prim(" "), this.app("whitespace_noBreakSpace"), this.app("whitespace_byteOrderMark"), this.app("unicodeSpaceSeparator"))).define("lineTerminator", [], this.alt(this.prim("\n"), this.prim("\r"), this.prim("\u2028"), this.prim("\u2029"))).define("lineTerminatorSequence", [], this.alt(this.prim("\n"), this.seq(this.prim("\r"), this.not(this.prim("\n"))), this.prim("\u2028"), this.prim("\u2029"), this.prim("\r\n"))).define("comment", [], this.alt(this.app("multiLineComment"), this.app("singleLineComment"))).define("multiLineComment", [], this.seq(this.prim("/*"), this.star(this.seq(this.not(this.prim("*/")), this.app("sourceCharacter"))), this.prim("*/"))).define("singleLineComment", [], this.seq(this.prim("//"), this.star(this.seq(this.not(this.app("lineTerminator")), this.app("sourceCharacter"))))).define("identifier", [], this.seq(this.not(this.app("reservedWord")), this.app("identifierName")), "an indentifier").define("identifierName", [], this.seq(this.app("identifierStart"), this.star(this.app("identifierPart")))).define("identifierStart_escaped", [], this.seq(this.prim("\\"), this.app("unicodeEscapeSequence"))).define("identifierStart", [], this.alt(this.app("letter"), this.prim("$"), this.prim("_"), this.app("identifierStart_escaped"))).define("identifierPart", [], this.alt(this.app("identifierStart"), this.app("unicodeCombiningMark"), this.app("unicodeDigit"), this.app("unicodeConnectorPunctuation"), this.prim("‌"), this.prim("‍"))).extend("letter", [], this.app("unicodeCategoryNl")).define("unicodeCategoryNl", [], this.alt(this.range("Ⅰ", "ↂ"), this.prim("〇"), this.range("〡", "〩"))).define("unicodeDigit", [], this.alt(this.range("0", "9"), this.range("٠", "٩"), this.range("۰", "۹"), this.range("०", "९"), this.range("০", "৯"), this.range("੦", "੯"), this.range("૦", "૯"), this.range("୦", "୯"), this.range("௧", "௯"), this.range("౦", "౯"), this.range("೦", "೯"), this.range("൦", "൯"), this.range("๐", "๙"), this.range("໐", "໙"), this.range("༠", "༩"), this.range("０", "９")), "a digit").define("unicodeCombiningMark", [], this.alt(this.range("̀", "ͅ"), this.range("͠", "͡"), this.range("҃", "҆"), this.range("֑", "֡"), this.range("֣", "ֹ"), this.range("ֻ", "ֽ"), this.range("ֿ", "ֿ"), this.range("ׁ", "ׂ"), this.range("ׄ", "ׄ"), this.range("ً", "ْ"), this.range("ٰ", "ٰ"), this.range("ۖ", "ۜ"), this.range("۟", "ۤ"), this.range("ۧ", "ۨ"), this.range("۪", "ۭ"), this.range("ँ", "ं"), this.range("़", "़"), this.range("ु", "ै"), this.range("्", "्"), this.range("॑", "॔"), this.range("ॢ", "ॣ"), this.range("ঁ", "ঁ"), this.range("়", "়"), this.range("ু", "ৄ"), this.range("্", "্"), this.range("ৢ", "ৣ"), this.range("ਂ", "ਂ"), this.range("਼", "਼"), this.range("ੁ", "ੂ"), this.range("ੇ", "ੈ"), this.range("ੋ", "੍"), this.range("ੰ", "ੱ"), this.range("ઁ", "ં"), this.range("઼", "઼"), this.range("ુ", "ૅ"), this.range("ે", "ૈ"), this.range("્", "્"), this.range("ଁ", "ଁ"), this.range("଼", "଼"), this.range("ି", "ି"), this.range("ୁ", "ୃ"), this.range("୍", "୍"), this.range("ୖ", "ୖ"), this.range("ஂ", "ஂ"), this.range("ீ", "ீ"), this.range("்", "்"), this.range("ా", "ీ"), this.range("ె", "ై"), this.range("ొ", "్"), this.range("ౕ", "ౖ"), this.range("ಿ", "ಿ"), this.range("ೆ", "ೆ"), this.range("ೌ", "್"), this.range("ു", "ൃ"), this.range("്", "്"), this.range("ั", "ั"), this.range("ิ", "ฺ"), this.range("็", "๎"), this.range("ັ", "ັ"), this.range("ິ", "ູ"), this.range("ົ", "ຼ"), this.range("່", "ໍ"), this.range("༘", "༙"), this.range("༵", "༵"), this.range("༷", "༷"), this.range("༹", "༹"), this.range("ཱ", "ཾ"), this.range("ྀ", "྄"), this.range("྆", "྇"), this.range("ྐ", "ྕ"), this.range("ྗ", "ྗ"), this.range("ྙ", "ྭ"), this.range("ྱ", "ྷ"), this.range("ྐྵ", "ྐྵ"), this.range("⃐", "⃜"), this.range("⃡", "⃡"), this.range("〪", "〯"), this.range("゙", "゚"), this.range("ﬞ", "ﬞ"), this.range("︠", "︣")), "a Unicode combining mark").define("unicodeConnectorPunctuation", [], this.alt(this.prim("_"), this.range("‿", "⁀"), this.prim("・"), this.range("︳", "︴"), this.range("﹍", "﹏"), this.prim("＿"), this.prim("･"))).define("unicodeSpaceSeparator", [], this.alt(this.range(" ", "​"), this.prim("　"))).define("reservedWord", [], this.alt(this.app("keyword"), this.app("futureReservedWord"), this.app("nullLiteral"), this.app("booleanLiteral"))).define("keyword", [], this.alt(this.app("break"), this.app("do"), this.app("instanceof"), this.app("typeof"), this.app("case"), this.app("else"), this.app("new"), this.app("var"), this.app("catch"), this.app("finally"), this.app("return"), this.app("void"), this.app("continue"), this.app("for"), this.app("switch"), this.app("while"), this.app("debugger"), this.app("function"), this.app("this"), this.app("with"), this.app("default"), this.app("if"), this.app("throw"), this.app("delete"), this.app("in"), this.app("try"))).define("futureReservedWordLax", [], this.alt(this.app("class"), this.app("enum"), this.app("extends"), this.app("super"), this.app("const"), this.app("export"), this.app("import"))).define("futureReservedWordStrict", [], this.alt(this.app("futureReservedWordLax"), this.app("implements"), this.app("let"), this.app("private"), this.app("public"), this.app("interface"), this.app("package"), this.app("protected"), this.app("static"), this.app("yield"))).define("futureReservedWord", [], this.app("futureReservedWordStrict")).define("literal", [], this.alt(this.app("nullLiteral"), this.app("booleanLiteral"), this.app("numericLiteral"), this.app("stringLiteral"), this.app("regularExpressionLiteral"))).define("nullLiteral", [], this.seq(this.prim("null"), this.not(this.app("identifierPart")))).define("booleanLiteral", [], this.seq(this.alt(this.prim("true"), this.prim("false")), this.not(this.app("identifierPart")))).define("numericLiteral", [], this.alt(this.app("octalIntegerLiteral"), this.app("hexIntegerLiteral"), this.app("decimalLiteral"))).define("decimalLiteral_bothParts", [], this.seq(this.app("decimalIntegerLiteral"), this.prim("."), this.star(this.app("decimalDigit")), this.app("exponentPart"))).define("decimalLiteral_decimalsOnly", [], this.seq(this.prim("."), this.plus(this.app("decimalDigit")), this.app("exponentPart"))).define("decimalLiteral_integerOnly", [], this.seq(this.app("decimalIntegerLiteral"), this.app("exponentPart"))).define("decimalLiteral", [], this.alt(this.app("decimalLiteral_bothParts"), this.app("decimalLiteral_decimalsOnly"), this.app("decimalLiteral_integerOnly"))).define("decimalIntegerLiteral_nonZero", [], this.seq(this.app("nonZeroDigit"), this.star(this.app("decimalDigit")))).define("decimalIntegerLiteral_zero", [], this.prim("0")).define("decimalIntegerLiteral", [], this.alt(this.app("decimalIntegerLiteral_nonZero"), this.app("decimalIntegerLiteral_zero"))).define("decimalDigit", [], this.range("0", "9")).define("nonZeroDigit", [], this.range("1", "9")).define("exponentPart_present", [], this.seq(this.app("exponentIndicator"), this.app("signedInteger"))).define("exponentPart_absent", [], this.seq()).define("exponentPart", [], this.alt(this.app("exponentPart_present"), this.app("exponentPart_absent"))).define("exponentIndicator", [], this.alt(this.prim("e"), this.prim("E"))).define("signedInteger_positive", [], this.seq(this.prim("+"), this.star(this.app("decimalDigit")))).define("signedInteger_negative", [], this.seq(this.prim("-"), this.star(this.app("decimalDigit")))).define("signedInteger_noSign", [], this.plus(this.app("decimalDigit"))).define("signedInteger", [], this.alt(this.app("signedInteger_positive"), this.app("signedInteger_negative"), this.app("signedInteger_noSign"))).define("hexIntegerLiteral", [], this.alt(this.seq(this.prim("0x"), this.plus(this.app("hexDigit"))), this.seq(this.prim("0X"), this.plus(this.app("hexDigit"))))).define("octalIntegerLiteral", [], this.seq(this.prim("0"), this.plus(this.app("octalDigit")))).define("octalDigit", [], this.range("0", "7")).define("stringLiteral", [], this.alt(this.seq(this.prim("\""), this.star(this.app("doubleStringCharacter")), this.prim("\"")), this.seq(this.prim("'"), this.star(this.app("singleStringCharacter")), this.prim("'")))).define("doubleStringCharacter_nonEscaped", [], this.seq(this.not(this.alt(this.prim("\""), this.prim("\\"), this.app("lineTerminator"))), this.app("sourceCharacter"))).define("doubleStringCharacter_escaped", [], this.seq(this.prim("\\"), this.app("escapeSequence"))).define("doubleStringCharacter_lineContinuation", [], this.app("lineContinuation")).define("doubleStringCharacter", [], this.alt(this.app("doubleStringCharacter_nonEscaped"), this.app("doubleStringCharacter_escaped"), this.app("doubleStringCharacter_lineContinuation"))).define("singleStringCharacter_nonEscaped", [], this.seq(this.not(this.alt(this.prim("'"), this.prim("\\"), this.app("lineTerminator"))), this.app("sourceCharacter"))).define("singleStringCharacter_escaped", [], this.seq(this.prim("\\"), this.app("escapeSequence"))).define("singleStringCharacter_lineContinuation", [], this.app("lineContinuation")).define("singleStringCharacter", [], this.alt(this.app("singleStringCharacter_nonEscaped"), this.app("singleStringCharacter_escaped"), this.app("singleStringCharacter_lineContinuation"))).define("lineContinuation", [], this.seq(this.prim("\\"), this.app("lineTerminatorSequence"))).define("escapeSequence", [], this.alt(this.app("unicodeEscapeSequence"), this.app("hexEscapeSequence"), this.app("octalEscapeSequence"), this.app("characterEscapeSequence"))).define("characterEscapeSequence", [], this.alt(this.app("singleEscapeCharacter"), this.app("nonEscapeCharacter"))).define("singleEscapeCharacter", [], this.alt(this.prim("'"), this.prim("\""), this.prim("\\"), this.prim("b"), this.prim("f"), this.prim("n"), this.prim("r"), this.prim("t"), this.prim("v"))).define("nonEscapeCharacter", [], this.seq(this.not(this.alt(this.app("escapeCharacter"), this.app("lineTerminator"))), this.app("sourceCharacter"))).define("escapeCharacter", [], this.alt(this.app("singleEscapeCharacter"), this.app("decimalDigit"), this.prim("x"), this.prim("u"))).define("octalEscapeSequence_whole", [], this.seq(this.app("zeroToThree"), this.app("octalDigit"), this.app("octalDigit"))).define("octalEscapeSequence_eightTimesfourToSeven", [], this.seq(this.app("fourToSeven"), this.app("octalDigit"))).define("octalEscapeSequence_eightTimesZeroToThree", [], this.seq(this.app("zeroToThree"), this.app("octalDigit"), this.not(this.app("decimalDigit")))).define("octalEscapeSequence_octal", [], this.seq(this.app("octalDigit"), this.not(this.app("decimalDigit")))).define("octalEscapeSequence", [], this.alt(this.app("octalEscapeSequence_whole"), this.app("octalEscapeSequence_eightTimesfourToSeven"), this.app("octalEscapeSequence_eightTimesZeroToThree"), this.app("octalEscapeSequence_octal"))).define("hexEscapeSequence", [], this.seq(this.prim("x"), this.app("hexDigit"), this.app("hexDigit"))).define("unicodeEscapeSequence", [], this.seq(this.prim("u"), this.app("hexDigit"), this.app("hexDigit"), this.app("hexDigit"), this.app("hexDigit"))).define("zeroToThree", [], this.range("0", "3")).define("fourToSeven", [], this.range("4", "7")).define("regularExpressionLiteral", [], this.seq(this.prim("/"), this.app("regularExpressionBody"), this.prim("/"), this.app("regularExpressionFlags"))).define("regularExpressionBody", [], this.seq(this.app("regularExpressionFirstChar"), this.star(this.app("regularExpressionChar")))).define("regularExpressionFirstChar", [], this.alt(this.seq(this.not(this.alt(this.prim("*"), this.prim("\\"), this.prim("/"), this.prim("["))), this.app("regularExpressionNonTerminator")), this.app("regularExpressionBackslashSequence"), this.app("regularExpressionClass"))).define("regularExpressionChar", [], this.alt(this.seq(this.not(this.alt(this.prim("\\"), this.prim("/"), this.prim("["))), this.app("regularExpressionNonTerminator")), this.app("regularExpressionBackslashSequence"), this.app("regularExpressionClass"))).define("regularExpressionBackslashSequence", [], this.seq(this.prim("\\"), this.app("regularExpressionNonTerminator"))).define("regularExpressionNonTerminator", [], this.seq(this.not(this.app("lineTerminator")), this.app("sourceCharacter"))).define("regularExpressionClass", [], this.seq(this.prim("["), this.star(this.app("regularExpressionClassChar")), this.prim("]"))).define("regularExpressionClassChar", [], this.alt(this.seq(this.not(this.alt(this.prim("]"), this.prim("\\"))), this.app("regularExpressionNonTerminator")), this.app("regularExpressionBackslashSequence"))).define("regularExpressionFlags", [], this.star(this.app("identifierPart"))).define("multiLineCommentNoNL", [], this.seq(this.prim("/*"), this.star(this.seq(this.not(this.alt(this.prim("*/"), this.app("lineTerminator"))), this.app("sourceCharacter"))), this.prim("*/"))).define("spacesNoNL", [], this.star(this.alt(this.app("whitespace"), this.app("singleLineComment"), this.app("multiLineCommentNoNL")))).define("sc", [], this.alt(this.seq(this.star(this.app("space")), this.alt(this.prim(";"), this.app("end"))), this.seq(this.app("spacesNoNL"), this.alt(this.app("lineTerminator"), this.seq(this.not(this.app("multiLineCommentNoNL")), this.app("multiLineComment")), this.la(this.prim("}")))))).define("break", [], this.seq(this.prim("break"), this.not(this.app("identifierPart")))).define("do", [], this.seq(this.prim("do"), this.not(this.app("identifierPart")))).define("instanceof", [], this.seq(this.prim("instanceof"), this.not(this.app("identifierPart")))).define("typeof", [], this.seq(this.prim("typeof"), this.not(this.app("identifierPart")))).define("case", [], this.seq(this.prim("case"), this.not(this.app("identifierPart")))).define("else", [], this.seq(this.prim("else"), this.not(this.app("identifierPart")))).define("new", [], this.seq(this.prim("new"), this.not(this.app("identifierPart")))).define("var", [], this.seq(this.prim("var"), this.not(this.app("identifierPart")))).define("catch", [], this.seq(this.prim("catch"), this.not(this.app("identifierPart")))).define("finally", [], this.seq(this.prim("finally"), this.not(this.app("identifierPart")))).define("return", [], this.seq(this.prim("return"), this.not(this.app("identifierPart")))).define("void", [], this.seq(this.prim("void"), this.not(this.app("identifierPart")))).define("continue", [], this.seq(this.prim("continue"), this.not(this.app("identifierPart")))).define("for", [], this.seq(this.prim("for"), this.not(this.app("identifierPart")))).define("switch", [], this.seq(this.prim("switch"), this.not(this.app("identifierPart")))).define("while", [], this.seq(this.prim("while"), this.not(this.app("identifierPart")))).define("debugger", [], this.seq(this.prim("debugger"), this.not(this.app("identifierPart")))).define("function", [], this.seq(this.prim("function"), this.not(this.app("identifierPart")))).define("this", [], this.seq(this.prim("this"), this.not(this.app("identifierPart")))).define("with", [], this.seq(this.prim("with"), this.not(this.app("identifierPart")))).define("default", [], this.seq(this.prim("default"), this.not(this.app("identifierPart")))).define("if", [], this.seq(this.prim("if"), this.not(this.app("identifierPart")))).define("throw", [], this.seq(this.prim("throw"), this.not(this.app("identifierPart")))).define("delete", [], this.seq(this.prim("delete"), this.not(this.app("identifierPart")))).define("in", [], this.seq(this.prim("in"), this.not(this.app("identifierPart")))).define("try", [], this.seq(this.prim("try"), this.not(this.app("identifierPart")))).define("get", [], this.seq(this.prim("get"), this.not(this.app("identifierPart")))).define("set", [], this.seq(this.prim("set"), this.not(this.app("identifierPart")))).define("class", [], this.seq(this.prim("class"), this.not(this.app("identifierPart")))).define("enum", [], this.seq(this.prim("enum"), this.not(this.app("identifierPart")))).define("extends", [], this.seq(this.prim("extends"), this.not(this.app("identifierPart")))).define("super", [], this.seq(this.prim("super"), this.not(this.app("identifierPart")))).define("const", [], this.seq(this.prim("const"), this.not(this.app("identifierPart")))).define("export", [], this.seq(this.prim("export"), this.not(this.app("identifierPart")))).define("import", [], this.seq(this.prim("import"), this.not(this.app("identifierPart")))).define("implements", [], this.seq(this.prim("implements"), this.not(this.app("identifierPart")))).define("let", [], this.seq(this.prim("let"), this.not(this.app("identifierPart")))).define("private", [], this.seq(this.prim("private"), this.not(this.app("identifierPart")))).define("public", [], this.seq(this.prim("public"), this.not(this.app("identifierPart")))).define("interface", [], this.seq(this.prim("interface"), this.not(this.app("identifierPart")))).define("package", [], this.seq(this.prim("package"), this.not(this.app("identifierPart")))).define("protected", [], this.seq(this.prim("protected"), this.not(this.app("identifierPart")))).define("static", [], this.seq(this.prim("static"), this.not(this.app("identifierPart")))).define("yield", [], this.seq(this.prim("yield"), this.not(this.app("identifierPart")))).define("noIn", [], this.not(this.app("in"))).define("withIn", [], this.seq()).define("PrimaryExpression_parenExpr", [], this.seq(this.prim("("), this.app("Expression", [this.app("withIn")]), this.prim(")"))).define("PrimaryExpression", [], this.alt(this.app("this"), this.app("identifier"), this.app("literal"), this.app("ArrayLiteral"), this.app("ObjectLiteral"), this.app("PrimaryExpression_parenExpr"))).define("ArrayLiteral", [], this.seq(this.prim("["), this.app("ListOf", [this.app("AssignmentExpressionOrElision"), this.prim(",")]), this.prim("]"))).define("AssignmentExpressionOrElision_elision", [], this.seq()).define("AssignmentExpressionOrElision", [], this.alt(this.app("AssignmentExpression", [this.app("withIn")]), this.app("AssignmentExpressionOrElision_elision"))).define("ObjectLiteral_noTrailingComma", [], this.seq(this.prim("{"), this.app("ListOf", [this.app("PropertyAssignment"), this.prim(",")]), this.prim("}"))).define("ObjectLiteral_trailingComma", [], this.seq(this.prim("{"), this.app("NonemptyListOf", [this.app("PropertyAssignment"), this.prim(",")]), this.prim(","), this.prim("}"))).define("ObjectLiteral", [], this.alt(this.app("ObjectLiteral_noTrailingComma"), this.app("ObjectLiteral_trailingComma"))).define("PropertyAssignment_getter", [], this.seq(this.app("get"), this.app("PropertyName"), this.prim("("), this.prim(")"), this.prim("{"), this.app("FunctionBody"), this.prim("}"))).define("PropertyAssignment_setter", [], this.seq(this.app("set"), this.app("PropertyName"), this.prim("("), this.app("FormalParameter"), this.prim(")"), this.prim("{"), this.app("FunctionBody"), this.prim("}"))).define("PropertyAssignment_simple", [], this.seq(this.app("PropertyName"), this.prim(":"), this.app("AssignmentExpression", [this.app("withIn")]))).define("PropertyAssignment", [], this.alt(this.app("PropertyAssignment_getter"), this.app("PropertyAssignment_setter"), this.app("PropertyAssignment_simple"))).define("PropertyName", [], this.alt(this.app("identifierName"), this.app("stringLiteral"), this.app("numericLiteral"))).define("MemberExpression_arrayRefExp", [], this.seq(this.app("MemberExpression"), this.prim("["), this.app("Expression", [this.app("withIn")]), this.prim("]"))).define("MemberExpression_propRefExp", [], this.seq(this.app("MemberExpression"), this.prim("."), this.app("identifierName"))).define("MemberExpression_newExp", [], this.seq(this.app("new"), this.app("MemberExpression"), this.app("Arguments"))).define("MemberExpression", [], this.alt(this.app("MemberExpression_arrayRefExp"), this.app("MemberExpression_propRefExp"), this.app("MemberExpression_newExp"), this.app("FunctionExpression"), this.app("PrimaryExpression"))).define("NewExpression_newExp", [], this.seq(this.app("new"), this.app("NewExpression"))).define("NewExpression", [], this.alt(this.app("MemberExpression"), this.app("NewExpression_newExp"))).define("CallExpression_arrayRefExp", [], this.seq(this.app("CallExpression"), this.prim("["), this.app("Expression", [this.app("withIn")]), this.prim("]"))).define("CallExpression_propRefExp", [], this.seq(this.app("CallExpression"), this.prim("."), this.app("identifierName"))).define("CallExpression_callExpExp", [], this.seq(this.app("CallExpression"), this.app("Arguments"))).define("CallExpression_memberExpExp", [], this.seq(this.app("MemberExpression"), this.app("Arguments"))).define("CallExpression", [], this.alt(this.app("CallExpression_arrayRefExp"), this.app("CallExpression_propRefExp"), this.app("CallExpression_callExpExp"), this.app("CallExpression_memberExpExp"))).define("Arguments", [], this.seq(this.prim("("), this.app("ListOf", [this.app("AssignmentExpression", [this.app("withIn")]), this.prim(",")]), this.prim(")"))).define("LeftHandSideExpression", [], this.alt(this.app("CallExpression"), this.app("NewExpression"))).define("PostfixExpression_postIncrement", [], this.seq(this.app("LeftHandSideExpression"), this.lex(this.seq(this.app("spacesNoNL"), this.prim("++"))))).define("PostfixExpression_postDecrement", [], this.seq(this.app("LeftHandSideExpression"), this.lex(this.seq(this.app("spacesNoNL"), this.prim("--"))))).define("PostfixExpression", [], this.alt(this.app("PostfixExpression_postIncrement"), this.app("PostfixExpression_postDecrement"), this.app("LeftHandSideExpression"))).define("UnaryExpression_deleteExp", [], this.seq(this.app("delete"), this.app("UnaryExpression"))).define("UnaryExpression_voidExp", [], this.seq(this.app("void"), this.app("UnaryExpression"))).define("UnaryExpression_typeofExp", [], this.seq(this.app("typeof"), this.app("UnaryExpression"))).define("UnaryExpression_preIncrement", [], this.seq(this.prim("++"), this.app("UnaryExpression"))).define("UnaryExpression_preDecrement", [], this.seq(this.prim("--"), this.app("UnaryExpression"))).define("UnaryExpression_unaryPlus", [], this.seq(this.prim("+"), this.app("UnaryExpression"))).define("UnaryExpression_unaryMinus", [], this.seq(this.prim("-"), this.app("UnaryExpression"))).define("UnaryExpression_bnot", [], this.seq(this.prim("~"), this.app("UnaryExpression"))).define("UnaryExpression_lnot", [], this.seq(this.prim("!"), this.app("UnaryExpression"))).define("UnaryExpression", [], this.alt(this.app("UnaryExpression_deleteExp"), this.app("UnaryExpression_voidExp"), this.app("UnaryExpression_typeofExp"), this.app("UnaryExpression_preIncrement"), this.app("UnaryExpression_preDecrement"), this.app("UnaryExpression_unaryPlus"), this.app("UnaryExpression_unaryMinus"), this.app("UnaryExpression_bnot"), this.app("UnaryExpression_lnot"), this.app("PostfixExpression"))).define("MultiplicativeExpression_mul", [], this.seq(this.app("MultiplicativeExpression"), this.prim("*"), this.app("UnaryExpression"))).define("MultiplicativeExpression_div", [], this.seq(this.app("MultiplicativeExpression"), this.prim("/"), this.app("UnaryExpression"))).define("MultiplicativeExpression_mod", [], this.seq(this.app("MultiplicativeExpression"), this.prim("%"), this.app("UnaryExpression"))).define("MultiplicativeExpression", [], this.alt(this.app("MultiplicativeExpression_mul"), this.app("MultiplicativeExpression_div"), this.app("MultiplicativeExpression_mod"), this.app("UnaryExpression"))).define("AdditiveExpression_add", [], this.seq(this.app("AdditiveExpression"), this.prim("+"), this.app("MultiplicativeExpression"))).define("AdditiveExpression_sub", [], this.seq(this.app("AdditiveExpression"), this.prim("-"), this.app("MultiplicativeExpression"))).define("AdditiveExpression", [], this.alt(this.app("AdditiveExpression_add"), this.app("AdditiveExpression_sub"), this.app("MultiplicativeExpression"))).define("ShiftExpression_lsl", [], this.seq(this.app("ShiftExpression"), this.prim("<<"), this.app("AdditiveExpression"))).define("ShiftExpression_lsr", [], this.seq(this.app("ShiftExpression"), this.prim(">>>"), this.app("AdditiveExpression"))).define("ShiftExpression_asr", [], this.seq(this.app("ShiftExpression"), this.prim(">>"), this.app("AdditiveExpression"))).define("ShiftExpression", [], this.alt(this.app("ShiftExpression_lsl"), this.app("ShiftExpression_lsr"), this.app("ShiftExpression_asr"), this.app("AdditiveExpression"))).define("RelationalExpression_lt", ["guardIn"], this.seq(this.app("RelationalExpression", [this.param(0)]), this.prim("<"), this.app("ShiftExpression"))).define("RelationalExpression_gt", ["guardIn"], this.seq(this.app("RelationalExpression", [this.param(0)]), this.prim(">"), this.app("ShiftExpression"))).define("RelationalExpression_le", ["guardIn"], this.seq(this.app("RelationalExpression", [this.param(0)]), this.prim("<="), this.app("ShiftExpression"))).define("RelationalExpression_ge", ["guardIn"], this.seq(this.app("RelationalExpression", [this.param(0)]), this.prim(">="), this.app("ShiftExpression"))).define("RelationalExpression_instanceOfExp", ["guardIn"], this.seq(this.app("RelationalExpression", [this.param(0)]), this.prim("instanceof"), this.app("ShiftExpression"))).define("RelationalExpression_inExp", ["guardIn"], this.seq(this.app("RelationalExpression", [this.param(0)]), this.param(0), this.prim("in"), this.app("ShiftExpression"))).define("RelationalExpression", ["guardIn"], this.alt(this.app("RelationalExpression_lt", [this.app("guardIn")]), this.app("RelationalExpression_gt", [this.app("guardIn")]), this.app("RelationalExpression_le", [this.app("guardIn")]), this.app("RelationalExpression_ge", [this.app("guardIn")]), this.app("RelationalExpression_instanceOfExp", [this.app("guardIn")]), this.app("RelationalExpression_inExp", [this.app("guardIn")]), this.app("ShiftExpression"))).define("EqualityExpression_equal", ["guardIn"], this.seq(this.app("EqualityExpression", [this.param(0)]), this.prim("=="), this.app("RelationalExpression", [this.param(0)]))).define("EqualityExpression_notEqual", ["guardIn"], this.seq(this.app("EqualityExpression", [this.param(0)]), this.prim("!="), this.app("RelationalExpression", [this.param(0)]))).define("EqualityExpression_eq", ["guardIn"], this.seq(this.app("EqualityExpression", [this.param(0)]), this.prim("==="), this.app("RelationalExpression", [this.param(0)]))).define("EqualityExpression_notEq", ["guardIn"], this.seq(this.app("EqualityExpression", [this.param(0)]), this.prim("!=="), this.app("RelationalExpression", [this.param(0)]))).define("EqualityExpression", ["guardIn"], this.alt(this.app("EqualityExpression_equal", [this.app("guardIn")]), this.app("EqualityExpression_notEqual", [this.app("guardIn")]), this.app("EqualityExpression_eq", [this.app("guardIn")]), this.app("EqualityExpression_notEq", [this.app("guardIn")]), this.app("RelationalExpression", [this.param(0)]))).define("BitwiseANDExpression_band", ["guardIn"], this.seq(this.app("BitwiseANDExpression", [this.param(0)]), this.prim("&"), this.app("EqualityExpression", [this.param(0)]))).define("BitwiseANDExpression", ["guardIn"], this.alt(this.app("BitwiseANDExpression_band", [this.app("guardIn")]), this.app("EqualityExpression", [this.param(0)]))).define("BitwiseXORExpression_bxor", ["guardIn"], this.seq(this.app("BitwiseXORExpression", [this.param(0)]), this.prim("^"), this.app("BitwiseANDExpression", [this.param(0)]))).define("BitwiseXORExpression", ["guardIn"], this.alt(this.app("BitwiseXORExpression_bxor", [this.app("guardIn")]), this.app("BitwiseANDExpression", [this.param(0)]))).define("BitwiseORExpression_bor", ["guardIn"], this.seq(this.app("BitwiseORExpression", [this.param(0)]), this.prim("|"), this.app("BitwiseXORExpression", [this.param(0)]))).define("BitwiseORExpression", ["guardIn"], this.alt(this.app("BitwiseORExpression_bor", [this.app("guardIn")]), this.app("BitwiseXORExpression", [this.param(0)]))).define("LogicalANDExpression_land", ["guardIn"], this.seq(this.app("LogicalANDExpression", [this.param(0)]), this.prim("&&"), this.app("BitwiseORExpression", [this.param(0)]))).define("LogicalANDExpression", ["guardIn"], this.alt(this.app("LogicalANDExpression_land", [this.app("guardIn")]), this.app("BitwiseORExpression", [this.param(0)]))).define("LogicalORExpression_lor", ["guardIn"], this.seq(this.app("LogicalORExpression", [this.param(0)]), this.prim("||"), this.app("LogicalANDExpression", [this.param(0)]))).define("LogicalORExpression", ["guardIn"], this.alt(this.app("LogicalORExpression_lor", [this.app("guardIn")]), this.app("LogicalANDExpression", [this.param(0)]))).define("ConditionalExpression_conditional", ["guardIn"], this.seq(this.app("LogicalORExpression", [this.param(0)]), this.prim("?"), this.app("AssignmentExpression", [this.app("withIn")]), this.prim(":"), this.app("AssignmentExpression", [this.param(0)]))).define("ConditionalExpression", ["guardIn"], this.alt(this.app("ConditionalExpression_conditional", [this.app("guardIn")]), this.app("LogicalORExpression", [this.param(0)]))).define("AssignmentExpression_assignment", ["guardIn"], this.seq(this.app("LeftHandSideExpression"), this.app("AssignmentOperator"), this.app("AssignmentExpression", [this.param(0)]))).define("AssignmentExpression", ["guardIn"], this.alt(this.app("AssignmentExpression_assignment", [this.app("guardIn")]), this.app("ConditionalExpression", [this.param(0)]))).define("Expression_commaExp", ["guardIn"], this.seq(this.app("Expression", [this.param(0)]), this.prim(","), this.app("AssignmentExpression", [this.param(0)]))).define("Expression", ["guardIn"], this.alt(this.app("Expression_commaExp", [this.app("guardIn")]), this.app("AssignmentExpression", [this.param(0)])), "an expression").define("AssignmentOperator", [], this.alt(this.prim("="), this.prim(">>>="), this.prim("<<="), this.prim(">>="), this.prim("*="), this.prim("/="), this.prim("%="), this.prim("+="), this.prim("-="), this.prim("&="), this.prim("^="), this.prim("|="))).define("Statement", [], this.alt(this.app("Block"), this.app("VariableStatement"), this.app("EmptyStatement"), this.app("ExpressionStatement"), this.app("IfStatement"), this.app("IterationStatement"), this.app("ContinueStatement"), this.app("BreakStatement"), this.app("ReturnStatement"), this.app("WithStatement"), this.app("LabelledStatement"), this.app("SwitchStatement"), this.app("ThrowStatement"), this.app("TryStatement"), this.app("DebuggerStatement")), "a statement").define("Block", [], this.seq(this.prim("{"), this.app("StatementList"), this.prim("}"))).define("StatementList", [], this.star(this.app("Statement"))).define("VariableStatement", [], this.seq(this.app("var"), this.app("VariableDeclarationList", [this.app("withIn")]), this.lex(this.app("sc")))).define("VariableDeclarationList", ["guardIn"], this.app("NonemptyListOf", [this.app("VariableDeclaration", [this.param(0)]), this.prim(",")])).define("VariableDeclaration", ["guardIn"], this.seq(this.app("identifier"), this.opt(this.app("Initialiser", [this.param(0)])))).define("Initialiser", ["guardIn"], this.seq(this.prim("="), this.app("AssignmentExpression", [this.param(0)]))).define("EmptyStatement", [], this.prim(";")).define("ExpressionStatement", [], this.seq(this.not(this.alt(this.prim("{"), this.app("function"))), this.app("Expression", [this.app("withIn")]), this.lex(this.app("sc")))).define("IfStatement", [], this.seq(this.app("if"), this.prim("("), this.app("Expression", [this.app("withIn")]), this.prim(")"), this.app("Statement"), this.opt(this.seq(this.app("else"), this.app("Statement"))))).define("IterationStatement_doWhile", [], this.seq(this.app("do"), this.app("Statement"), this.app("while"), this.prim("("), this.app("Expression", [this.app("withIn")]), this.prim(")"), this.lex(this.app("sc")))).define("IterationStatement_whileDo", [], this.seq(this.app("while"), this.prim("("), this.app("Expression", [this.app("withIn")]), this.prim(")"), this.app("Statement"))).define("IterationStatement_for3", [], this.seq(this.app("for"), this.prim("("), this.opt(this.app("Expression", [this.app("noIn")])), this.prim(";"), this.opt(this.app("Expression", [this.app("withIn")])), this.prim(";"), this.opt(this.app("Expression", [this.app("withIn")])), this.prim(")"), this.app("Statement"))).define("IterationStatement_for3var", [], this.seq(this.app("for"), this.prim("("), this.app("var"), this.app("VariableDeclarationList", [this.app("noIn")]), this.prim(";"), this.opt(this.app("Expression", [this.app("withIn")])), this.prim(";"), this.opt(this.app("Expression", [this.app("withIn")])), this.prim(")"), this.app("Statement"))).define("IterationStatement_forIn", [], this.seq(this.app("for"), this.prim("("), this.app("LeftHandSideExpression"), this.app("in"), this.app("Expression", [this.app("withIn")]), this.prim(")"), this.app("Statement"))).define("IterationStatement_forInVar", [], this.seq(this.app("for"), this.prim("("), this.app("var"), this.app("VariableDeclaration", [this.app("noIn")]), this.app("in"), this.app("Expression", [this.app("withIn")]), this.prim(")"), this.app("Statement"))).define("IterationStatement", [], this.alt(this.app("IterationStatement_doWhile"), this.app("IterationStatement_whileDo"), this.app("IterationStatement_for3"), this.app("IterationStatement_for3var"), this.app("IterationStatement_forIn"), this.app("IterationStatement_forInVar"))).define("ContinueStatement", [], this.seq(this.app("continue"), this.lex(this.seq(this.opt(this.seq(this.app("spacesNoNL"), this.app("identifier"))), this.app("sc"))))).define("BreakStatement", [], this.seq(this.app("break"), this.lex(this.seq(this.opt(this.seq(this.app("spacesNoNL"), this.app("identifier"))), this.app("sc"))))).define("ReturnStatement", [], this.seq(this.app("return"), this.opt(this.seq(this.lex(this.seq(this.app("spacesNoNL"), this.not(this.app("space")))), this.app("Expression", [this.app("withIn")]))), this.lex(this.app("sc")))).define("WithStatement", [], this.seq(this.app("with"), this.prim("("), this.app("Expression", [this.app("withIn")]), this.prim(")"), this.app("Statement"))).define("SwitchStatement", [], this.seq(this.app("switch"), this.prim("("), this.app("Expression", [this.app("withIn")]), this.prim(")"), this.app("CaseBlock"))).define("CaseBlock_withDefault", [], this.seq(this.prim("{"), this.star(this.app("CaseClause")), this.app("DefaultClause"), this.star(this.app("CaseClause")), this.prim("}"))).define("CaseBlock_withoutDefault", [], this.seq(this.prim("{"), this.star(this.app("CaseClause")), this.prim("}"))).define("CaseBlock", [], this.alt(this.app("CaseBlock_withDefault"), this.app("CaseBlock_withoutDefault"))).define("CaseClause", [], this.seq(this.app("case"), this.app("Expression", [this.app("withIn")]), this.prim(":"), this.star(this.app("Statement")))).define("DefaultClause", [], this.seq(this.app("default"), this.prim(":"), this.star(this.app("Statement")))).define("LabelledStatement", [], this.seq(this.app("identifier"), this.prim(":"), this.app("Statement"))).define("ThrowStatement_throwExpr", [], this.seq(this.app("throw"), this.app("Expression", [this.app("withIn")]), this.lex(this.app("sc")))).define("ThrowStatement", [], this.app("ThrowStatement_throwExpr")).define("TryStatement_tryCatchFinally", [], this.seq(this.app("try"), this.app("Block"), this.app("Catch"), this.app("Finally"))).define("TryStatement_tryFinally", [], this.seq(this.app("try"), this.app("Block"), this.app("Finally"))).define("TryStatement_tryCatch", [], this.seq(this.app("try"), this.app("Block"), this.app("Catch"))).define("TryStatement", [], this.alt(this.app("TryStatement_tryCatchFinally"), this.app("TryStatement_tryFinally"), this.app("TryStatement_tryCatch"))).define("Catch", [], this.seq(this.app("catch"), this.prim("("), this.app("FormalParameter"), this.prim(")"), this.app("Block"))).define("Finally", [], this.seq(this.app("finally"), this.app("Block"))).define("DebuggerStatement", [], this.lex(this.seq(this.app("debugger"), this.app("sc")))).define("FunctionDeclaration", [], this.seq(this.app("function"), this.app("identifier"), this.prim("("), this.app("FormalParameterList"), this.prim(")"), this.prim("{"), this.app("FunctionBody"), this.prim("}"))).define("FunctionExpression_named", [], this.seq(this.app("function"), this.app("identifier"), this.prim("("), this.app("FormalParameterList"), this.prim(")"), this.prim("{"), this.app("FunctionBody"), this.prim("}"))).define("FunctionExpression_anonymous", [], this.seq(this.app("function"), this.prim("("), this.app("FormalParameterList"), this.prim(")"), this.prim("{"), this.app("FunctionBody"), this.prim("}"))).define("FunctionExpression", [], this.alt(this.app("FunctionExpression_named"), this.app("FunctionExpression_anonymous"))).define("FormalParameterList", [], this.app("ListOf", [this.app("FormalParameter"), this.prim(",")])).define("FormalParameter", [], this.app("identifier")).define("FunctionBody", [], this.seq(this.star(this.app("Directive")), this.star(this.app("SourceElement")))).define("SourceElement", [], this.alt(this.app("Declaration"), this.app("Statement"))).define("Declaration", [], this.app("FunctionDeclaration")).define("Directive", [], this.seq(this.app("stringLiteral"), this.lex(this.app("sc")))).build();
	      };
	      return new this.newGrammar("ES6").withSuperGrammar(buildSuperGrammar.call(this)).withDefaultStartRule("Program").override("AssignmentExpression_assignment", ["guardIn"], this.seq(this.app("LeftHandSideExpression"), this.app("AssignmentOperator"), this.app("AssignmentExpression", [this.param(0)]))).override("AssignmentExpression", ["guardIn"], this.alt(this.app("ArrowFunction", [this.param(0)]), this.app("AssignmentExpression_assignment", [this.app("guardIn")]), this.app("ConditionalExpression", [this.param(0)]))).define("ArrowFunction", ["guardIn"], this.seq(this.app("ArrowParameters", [this.param(0)]), this.lex(this.seq(this.app("spacesNoNL"), this.prim("=>"))), this.app("ConciseBody", [this.param(0)]))).define("ConciseBody_noBraces", ["guardIn"], this.seq(this.not(this.prim("{")), this.app("AssignmentExpression", [this.param(0)]))).define("ConciseBody_withBraces", ["guardIn"], this.seq(this.prim("{"), this.app("FunctionBody"), this.prim("}"))).define("ConciseBody", ["guardIn"], this.alt(this.app("ConciseBody_noBraces", [this.app("guardIn")]), this.app("ConciseBody_withBraces", [this.app("guardIn")]))).define("ArrowParameters_unparenthesized", ["guardIn"], this.app("BindingIdentifier", [this.param(0)])).define("ArrowParameters", ["guardIn"], this.alt(this.app("ArrowParameters_unparenthesized", [this.app("guardIn")]), this.app("CoverParenthesizedExpressionAndArrowParameterList", [this.param(0)]))).define("BindingIdentifier", ["guardIn"], this.app("identifier")).define("CoverParenthesizedExpressionAndArrowParameterList_expression", ["guardIn"], this.seq(this.prim("("), this.app("Expression", [this.param(0)]), this.prim(")"))).define("CoverParenthesizedExpressionAndArrowParameterList_parens", ["guardIn"], this.seq(this.prim("("), this.prim(")"))).define("CoverParenthesizedExpressionAndArrowParameterList_params", ["guardIn"], this.seq(this.prim("("), this.app("FormalParameterList"), this.prim(")"))).define("CoverParenthesizedExpressionAndArrowParameterList", ["guardIn"], this.alt(this.app("CoverParenthesizedExpressionAndArrowParameterList_expression", [this.app("guardIn")]), this.app("CoverParenthesizedExpressionAndArrowParameterList_parens", [this.app("guardIn")]), this.app("CoverParenthesizedExpressionAndArrowParameterList_params", [this.app("guardIn")]))).build();
	    };
	    return new this.newGrammar("InferBraces").withSuperGrammar(buildSuperGrammar.call(this)).withDefaultStartRule("Program").define("NoBraces", [], this.app("AssignmentExpression", [this.app("withIn")])).build();
	  });
	});

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var require;var require;(function(f){if(true){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ohm = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return require(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
	var ohm = require('..');
	module.exports = ohm.makeRecipe(function() {
	  var decl = this.newGrammar("BuiltInRules")
	    .withSource("BuiltInRules {\n\n  alnum  (an alpha-numeric character)\n    = letter\n    | digit\n\n  letter  (a letter)\n    = lower\n    | upper\n    | unicodeLtmo\n\n  digit  (a digit)\n    = \"0\"..\"9\"\n\n  hexDigit  (a hexadecimal digit)\n    = digit\n    | \"a\"..\"f\"\n    | \"A\"..\"F\"\n\n  ListOf<elem, sep>\n    = NonemptyListOf<elem, sep>\n    | EmptyListOf<elem, sep>\n\n  NonemptyListOf<elem, sep>\n    = elem (sep elem)*\n\n  EmptyListOf<elem, sep>\n    = /* nothing */\n\n  listOf<elem, sep>\n    = nonemptyListOf<elem, sep>\n    | emptyListOf<elem, sep>\n\n  nonemptyListOf<elem, sep>\n    = elem (sep elem)*\n\n  emptyListOf<elem, sep>\n    = /* nothing */\n\n}")
	  return decl
	    .define("alnum", [], this.alt(this.app("letter").withInterval(decl.sourceInterval(60, 66)), this.app("digit").withInterval(decl.sourceInterval(73, 78))).withInterval(decl.sourceInterval(60, 78)), "an alpha-numeric character")
	    .define("letter", [], this.alt(this.app("lower").withInterval(decl.sourceInterval(107, 112)), this.app("upper").withInterval(decl.sourceInterval(119, 124)), this.app("unicodeLtmo").withInterval(decl.sourceInterval(131, 142))).withInterval(decl.sourceInterval(107, 142)), "a letter")
	    .define("digit", [], this.range("0", "9").withInterval(decl.sourceInterval(169, 177)), "a digit")
	    .define("hexDigit", [], this.alt(this.app("digit").withInterval(decl.sourceInterval(219, 224)), this.range("a", "f").withInterval(decl.sourceInterval(231, 239)), this.range("A", "F").withInterval(decl.sourceInterval(246, 254))).withInterval(decl.sourceInterval(219, 254)), "a hexadecimal digit")
	    .define("ListOf", ["elem", "sep"], this.alt(this.app("NonemptyListOf", [this.param(0), this.param(1)]).withInterval(decl.sourceInterval(282, 307)), this.app("EmptyListOf", [this.param(0), this.param(1)]).withInterval(decl.sourceInterval(314, 336))).withInterval(decl.sourceInterval(282, 336)))
	    .define("NonemptyListOf", ["elem", "sep"], this.seq(this.param(0), this.star(this.seq(this.param(1), this.param(0)).withInterval(decl.sourceInterval(378, 386))).withInterval(decl.sourceInterval(377, 388))).withInterval(decl.sourceInterval(372, 388)))
	    .define("EmptyListOf", ["elem", "sep"], this.seq().withInterval(decl.sourceInterval(438, 438)))
	    .define("listOf", ["elem", "sep"], this.alt(this.app("nonemptyListOf", [this.param(0), this.param(1)]).withInterval(decl.sourceInterval(462, 487)), this.app("emptyListOf", [this.param(0), this.param(1)]).withInterval(decl.sourceInterval(494, 516))).withInterval(decl.sourceInterval(462, 516)))
	    .define("nonemptyListOf", ["elem", "sep"], this.seq(this.param(0), this.star(this.seq(this.param(1), this.param(0)).withInterval(decl.sourceInterval(558, 566))).withInterval(decl.sourceInterval(557, 568))).withInterval(decl.sourceInterval(552, 568)))
	    .define("emptyListOf", ["elem", "sep"], this.seq().withInterval(decl.sourceInterval(616, 616)))
	    .build();
	});
	
	
	},{"..":41}],2:[function(require,module,exports){
	var ohm = require('..');
	module.exports = ohm.makeRecipe(function() {
	  var decl = this.newGrammar("Ohm")
	    .withSource("Ohm {\n\n  Grammars\n    = Grammar*\n\n  Grammar\n    = ident SuperGrammar? \"{\" Rule* \"}\"\n\n  SuperGrammar\n    = \"<:\" ident\n\n  Rule\n    = ident Formals? ruleDescr? \"=\"  \"|\"? Alt  -- define\n    | ident Formals?            \":=\" \"|\"? Alt  -- override\n    | ident Formals?            \"+=\" \"|\"? Alt  -- extend\n\n  Formals\n    = \"<\" ListOf<ident, \",\"> \">\"\n\n  Params\n    = \"<\" ListOf<Seq, \",\"> \">\"\n\n  Alt\n    = Term (\"|\" Term)*\n\n  Term\n    = Seq caseName -- inline\n    | Seq\n\n  Seq\n    = Iter*\n\n  Iter\n    = Pred \"*\"  -- star\n    | Pred \"+\"  -- plus\n    | Pred \"?\"  -- opt\n    | Pred\n\n  Pred\n    = \"~\" Modifier  -- not\n    | \"&\" Modifier  -- lookahead\n    | Modifier\n\n  Modifier\n    = \"#\" Base  -- lex\n    | \"$\" Base  -- val\n    | Base\n\n  Base\n    = ident Params? ~(ruleDescr? \"=\" | \":=\" | \"+=\")  -- application\n    | Prim \"..\" Prim                                 -- range\n    | Prim                                           -- prim\n    | \"(\" Alt \")\"                                    -- paren\n    | \"[\" Alt \"]\"                                    -- arr\n    | \"{\" \"...\"? \"}\"                                 -- obj\n    | \"{\" Props (\",\" \"...\")? \"}\"                     -- objWithProps\n\n  Prim\n    = keyword\n    | string\n    | number\n\n  Props\n    = Prop (\",\" Prop)*\n\n  Prop\n    = (name | string) \":\" Alt\n\n  ruleDescr  (a rule description)\n    = \"(\" ruleDescrText \")\"\n\n  ruleDescrText\n    = (~\")\" any)*\n\n  caseName\n    = \"--\" (~\"\\n\" space)* name (~\"\\n\" space)* (\"\\n\" | &\"}\")\n\n  name  (a name)\n    = nameFirst nameRest*\n\n  nameFirst\n    = \"_\"\n    | letter\n\n  nameRest\n    = \"_\"\n    | alnum\n\n  ident  (an identifier)\n    = ~keyword name\n\n  keyword\n    = \"null\" ~nameRest   -- null\n    | \"true\" ~nameRest   -- true\n    | \"false\" ~nameRest  -- false\n\n  string\n    = \"\\\"\" strChar* \"\\\"\"\n\n  strChar\n    = escapeChar\n    | ~\"\\\\\" ~\"\\\"\" ~\"\\n\" any\n\n  escapeChar  (an escape sequence)\n    = \"\\\\\\\\\"                                     -- backslash\n    | \"\\\\\\\"\"                                     -- doubleQuote\n    | \"\\\\\\'\"                                     -- singleQuote\n    | \"\\\\b\"                                      -- backspace\n    | \"\\\\n\"                                      -- lineFeed\n    | \"\\\\r\"                                      -- carriageReturn\n    | \"\\\\t\"                                      -- tab\n    | \"\\\\u\" hexDigit hexDigit hexDigit hexDigit  -- unicodeEscape\n    | \"\\\\x\" hexDigit hexDigit                    -- hexEscape\n\n  number  (a number)\n    = \"-\"? digit+\n\n  space\n   += comment\n\n  comment\n    = \"//\" (~\"\\n\" any)* \"\\n\"  -- singleLine\n    | \"/*\" (~\"*/\" any)* \"*/\"  -- multiLine\n\n  tokens = token*\n\n  token = caseName | comment | ident | keyword | number | operator | punctuation | string | any\n\n  operator = \"<:\" | \"=\" | \":=\" | \"+=\" | \"*\" | \"+\" | \"?\" | \"~\" | \"&\"\n\n  punctuation = \"<\" | \">\" | \",\" | \"--\"\n}")
	    .withDefaultStartRule("Grammars")
	  return decl
	    .define("Grammars", [], this.star(this.app("Grammar").withInterval(decl.sourceInterval(24, 31))).withInterval(decl.sourceInterval(24, 32)))
	    .define("Grammar", [], this.seq(this.app("ident").withInterval(decl.sourceInterval(50, 55)), this.opt(this.app("SuperGrammar").withInterval(decl.sourceInterval(56, 68))).withInterval(decl.sourceInterval(56, 69)), this.prim("{").withInterval(decl.sourceInterval(70, 73)), this.star(this.app("Rule").withInterval(decl.sourceInterval(74, 78))).withInterval(decl.sourceInterval(74, 79)), this.prim("}").withInterval(decl.sourceInterval(80, 83))).withInterval(decl.sourceInterval(50, 83)))
	    .define("SuperGrammar", [], this.seq(this.prim("<:").withInterval(decl.sourceInterval(106, 110)), this.app("ident").withInterval(decl.sourceInterval(111, 116))).withInterval(decl.sourceInterval(106, 116)))
	    .define("Rule_define", [], this.seq(this.app("ident").withInterval(decl.sourceInterval(131, 136)), this.opt(this.app("Formals").withInterval(decl.sourceInterval(137, 144))).withInterval(decl.sourceInterval(137, 145)), this.opt(this.app("ruleDescr").withInterval(decl.sourceInterval(146, 155))).withInterval(decl.sourceInterval(146, 156)), this.prim("=").withInterval(decl.sourceInterval(157, 160)), this.opt(this.prim("|").withInterval(decl.sourceInterval(162, 165))).withInterval(decl.sourceInterval(162, 166)), this.app("Alt").withInterval(decl.sourceInterval(167, 170))).withInterval(decl.sourceInterval(131, 170)))
	    .define("Rule_override", [], this.seq(this.app("ident").withInterval(decl.sourceInterval(188, 193)), this.opt(this.app("Formals").withInterval(decl.sourceInterval(194, 201))).withInterval(decl.sourceInterval(194, 202)), this.prim(":=").withInterval(decl.sourceInterval(214, 218)), this.opt(this.prim("|").withInterval(decl.sourceInterval(219, 222))).withInterval(decl.sourceInterval(219, 223)), this.app("Alt").withInterval(decl.sourceInterval(224, 227))).withInterval(decl.sourceInterval(188, 227)))
	    .define("Rule_extend", [], this.seq(this.app("ident").withInterval(decl.sourceInterval(247, 252)), this.opt(this.app("Formals").withInterval(decl.sourceInterval(253, 260))).withInterval(decl.sourceInterval(253, 261)), this.prim("+=").withInterval(decl.sourceInterval(273, 277)), this.opt(this.prim("|").withInterval(decl.sourceInterval(278, 281))).withInterval(decl.sourceInterval(278, 282)), this.app("Alt").withInterval(decl.sourceInterval(283, 286))).withInterval(decl.sourceInterval(247, 286)))
	    .define("Rule", [], this.alt(this.app("Rule_define").withInterval(decl.sourceInterval(131, 170)), this.app("Rule_override").withInterval(decl.sourceInterval(188, 227)), this.app("Rule_extend").withInterval(decl.sourceInterval(247, 286))).withInterval(decl.sourceInterval(131, 297)))
	    .define("Formals", [], this.seq(this.prim("<").withInterval(decl.sourceInterval(315, 318)), this.app("ListOf", [this.app("ident").withInterval(decl.sourceInterval(326, 331)), this.prim(",").withInterval(decl.sourceInterval(333, 336))]).withInterval(decl.sourceInterval(319, 337)), this.prim(">").withInterval(decl.sourceInterval(338, 341))).withInterval(decl.sourceInterval(315, 341)))
	    .define("Params", [], this.seq(this.prim("<").withInterval(decl.sourceInterval(358, 361)), this.app("ListOf", [this.app("Seq").withInterval(decl.sourceInterval(369, 372)), this.prim(",").withInterval(decl.sourceInterval(374, 377))]).withInterval(decl.sourceInterval(362, 378)), this.prim(">").withInterval(decl.sourceInterval(379, 382))).withInterval(decl.sourceInterval(358, 382)))
	    .define("Alt", [], this.seq(this.app("Term").withInterval(decl.sourceInterval(396, 400)), this.star(this.seq(this.prim("|").withInterval(decl.sourceInterval(402, 405)), this.app("Term").withInterval(decl.sourceInterval(406, 410))).withInterval(decl.sourceInterval(402, 410))).withInterval(decl.sourceInterval(401, 412))).withInterval(decl.sourceInterval(396, 412)))
	    .define("Term_inline", [], this.seq(this.app("Seq").withInterval(decl.sourceInterval(427, 430)), this.app("caseName").withInterval(decl.sourceInterval(431, 439))).withInterval(decl.sourceInterval(427, 439)))
	    .define("Term", [], this.alt(this.app("Term_inline").withInterval(decl.sourceInterval(427, 439)), this.app("Seq").withInterval(decl.sourceInterval(456, 459))).withInterval(decl.sourceInterval(427, 459)))
	    .define("Seq", [], this.star(this.app("Iter").withInterval(decl.sourceInterval(473, 477))).withInterval(decl.sourceInterval(473, 478)))
	    .define("Iter_star", [], this.seq(this.app("Pred").withInterval(decl.sourceInterval(493, 497)), this.prim("*").withInterval(decl.sourceInterval(498, 501))).withInterval(decl.sourceInterval(493, 501)))
	    .define("Iter_plus", [], this.seq(this.app("Pred").withInterval(decl.sourceInterval(517, 521)), this.prim("+").withInterval(decl.sourceInterval(522, 525))).withInterval(decl.sourceInterval(517, 525)))
	    .define("Iter_opt", [], this.seq(this.app("Pred").withInterval(decl.sourceInterval(541, 545)), this.prim("?").withInterval(decl.sourceInterval(546, 549))).withInterval(decl.sourceInterval(541, 549)))
	    .define("Iter", [], this.alt(this.app("Iter_star").withInterval(decl.sourceInterval(493, 501)), this.app("Iter_plus").withInterval(decl.sourceInterval(517, 525)), this.app("Iter_opt").withInterval(decl.sourceInterval(541, 549)), this.app("Pred").withInterval(decl.sourceInterval(564, 568))).withInterval(decl.sourceInterval(493, 568)))
	    .define("Pred_not", [], this.seq(this.prim("~").withInterval(decl.sourceInterval(583, 586)), this.app("Modifier").withInterval(decl.sourceInterval(587, 595))).withInterval(decl.sourceInterval(583, 595)))
	    .define("Pred_lookahead", [], this.seq(this.prim("&").withInterval(decl.sourceInterval(610, 613)), this.app("Modifier").withInterval(decl.sourceInterval(614, 622))).withInterval(decl.sourceInterval(610, 622)))
	    .define("Pred", [], this.alt(this.app("Pred_not").withInterval(decl.sourceInterval(583, 595)), this.app("Pred_lookahead").withInterval(decl.sourceInterval(610, 622)), this.app("Modifier").withInterval(decl.sourceInterval(643, 651))).withInterval(decl.sourceInterval(583, 651)))
	    .define("Modifier_lex", [], this.seq(this.prim("#").withInterval(decl.sourceInterval(670, 673)), this.app("Base").withInterval(decl.sourceInterval(674, 678))).withInterval(decl.sourceInterval(670, 678)))
	    .define("Modifier_val", [], this.seq(this.prim("$").withInterval(decl.sourceInterval(693, 696)), this.app("Base").withInterval(decl.sourceInterval(697, 701))).withInterval(decl.sourceInterval(693, 701)))
	    .define("Modifier", [], this.alt(this.app("Modifier_lex").withInterval(decl.sourceInterval(670, 678)), this.app("Modifier_val").withInterval(decl.sourceInterval(693, 701)), this.app("Base").withInterval(decl.sourceInterval(716, 720))).withInterval(decl.sourceInterval(670, 720)))
	    .define("Base_application", [], this.seq(this.app("ident").withInterval(decl.sourceInterval(735, 740)), this.opt(this.app("Params").withInterval(decl.sourceInterval(741, 747))).withInterval(decl.sourceInterval(741, 748)), this.not(this.alt(this.seq(this.opt(this.app("ruleDescr").withInterval(decl.sourceInterval(751, 760))).withInterval(decl.sourceInterval(751, 761)), this.prim("=").withInterval(decl.sourceInterval(762, 765))).withInterval(decl.sourceInterval(751, 765)), this.prim(":=").withInterval(decl.sourceInterval(768, 772)), this.prim("+=").withInterval(decl.sourceInterval(775, 779))).withInterval(decl.sourceInterval(751, 779))).withInterval(decl.sourceInterval(749, 780))).withInterval(decl.sourceInterval(735, 780)))
	    .define("Base_range", [], this.seq(this.app("Prim").withInterval(decl.sourceInterval(803, 807)), this.prim("..").withInterval(decl.sourceInterval(808, 812)), this.app("Prim").withInterval(decl.sourceInterval(813, 817))).withInterval(decl.sourceInterval(803, 817)))
	    .define("Base_prim", [], this.app("Prim").withInterval(decl.sourceInterval(865, 869)))
	    .define("Base_paren", [], this.seq(this.prim("(").withInterval(decl.sourceInterval(926, 929)), this.app("Alt").withInterval(decl.sourceInterval(930, 933)), this.prim(")").withInterval(decl.sourceInterval(934, 937))).withInterval(decl.sourceInterval(926, 937)))
	    .define("Base_arr", [], this.seq(this.prim("[").withInterval(decl.sourceInterval(988, 991)), this.app("Alt").withInterval(decl.sourceInterval(992, 995)), this.prim("]").withInterval(decl.sourceInterval(996, 999))).withInterval(decl.sourceInterval(988, 999)))
	    .define("Base_obj", [], this.seq(this.prim("{").withInterval(decl.sourceInterval(1048, 1051)), this.opt(this.prim("...").withInterval(decl.sourceInterval(1052, 1057))).withInterval(decl.sourceInterval(1052, 1058)), this.prim("}").withInterval(decl.sourceInterval(1059, 1062))).withInterval(decl.sourceInterval(1048, 1062)))
	    .define("Base_objWithProps", [], this.seq(this.prim("{").withInterval(decl.sourceInterval(1108, 1111)), this.app("Props").withInterval(decl.sourceInterval(1112, 1117)), this.opt(this.seq(this.prim(",").withInterval(decl.sourceInterval(1119, 1122)), this.prim("...").withInterval(decl.sourceInterval(1123, 1128))).withInterval(decl.sourceInterval(1119, 1128))).withInterval(decl.sourceInterval(1118, 1130)), this.prim("}").withInterval(decl.sourceInterval(1131, 1134))).withInterval(decl.sourceInterval(1108, 1134)))
	    .define("Base", [], this.alt(this.app("Base_application").withInterval(decl.sourceInterval(735, 780)), this.app("Base_range").withInterval(decl.sourceInterval(803, 817)), this.app("Base_prim").withInterval(decl.sourceInterval(865, 869)), this.app("Base_paren").withInterval(decl.sourceInterval(926, 937)), this.app("Base_arr").withInterval(decl.sourceInterval(988, 999)), this.app("Base_obj").withInterval(decl.sourceInterval(1048, 1062)), this.app("Base_objWithProps").withInterval(decl.sourceInterval(1108, 1134))).withInterval(decl.sourceInterval(735, 1170)))
	    .define("Prim", [], this.alt(this.app("keyword").withInterval(decl.sourceInterval(1185, 1192)), this.app("string").withInterval(decl.sourceInterval(1199, 1205)), this.app("number").withInterval(decl.sourceInterval(1212, 1218))).withInterval(decl.sourceInterval(1185, 1218)))
	    .define("Props", [], this.seq(this.app("Prop").withInterval(decl.sourceInterval(1234, 1238)), this.star(this.seq(this.prim(",").withInterval(decl.sourceInterval(1240, 1243)), this.app("Prop").withInterval(decl.sourceInterval(1244, 1248))).withInterval(decl.sourceInterval(1240, 1248))).withInterval(decl.sourceInterval(1239, 1250))).withInterval(decl.sourceInterval(1234, 1250)))
	    .define("Prop", [], this.seq(this.alt(this.app("name").withInterval(decl.sourceInterval(1266, 1270)), this.app("string").withInterval(decl.sourceInterval(1273, 1279))).withInterval(decl.sourceInterval(1266, 1279)), this.prim(":").withInterval(decl.sourceInterval(1281, 1284)), this.app("Alt").withInterval(decl.sourceInterval(1285, 1288))).withInterval(decl.sourceInterval(1265, 1288)))
	    .define("ruleDescr", [], this.seq(this.prim("(").withInterval(decl.sourceInterval(1330, 1333)), this.app("ruleDescrText").withInterval(decl.sourceInterval(1334, 1347)), this.prim(")").withInterval(decl.sourceInterval(1348, 1351))).withInterval(decl.sourceInterval(1330, 1351)), "a rule description")
	    .define("ruleDescrText", [], this.star(this.seq(this.not(this.prim(")").withInterval(decl.sourceInterval(1377, 1380))).withInterval(decl.sourceInterval(1376, 1380)), this.app("any").withInterval(decl.sourceInterval(1381, 1384))).withInterval(decl.sourceInterval(1376, 1384))).withInterval(decl.sourceInterval(1375, 1386)))
	    .define("caseName", [], this.seq(this.prim("--").withInterval(decl.sourceInterval(1405, 1409)), this.star(this.seq(this.not(this.prim("\n").withInterval(decl.sourceInterval(1412, 1416))).withInterval(decl.sourceInterval(1411, 1416)), this.app("space").withInterval(decl.sourceInterval(1417, 1422))).withInterval(decl.sourceInterval(1411, 1422))).withInterval(decl.sourceInterval(1410, 1424)), this.app("name").withInterval(decl.sourceInterval(1425, 1429)), this.star(this.seq(this.not(this.prim("\n").withInterval(decl.sourceInterval(1432, 1436))).withInterval(decl.sourceInterval(1431, 1436)), this.app("space").withInterval(decl.sourceInterval(1437, 1442))).withInterval(decl.sourceInterval(1431, 1442))).withInterval(decl.sourceInterval(1430, 1444)), this.alt(this.prim("\n").withInterval(decl.sourceInterval(1446, 1450)), this.la(this.prim("}").withInterval(decl.sourceInterval(1454, 1457))).withInterval(decl.sourceInterval(1453, 1457))).withInterval(decl.sourceInterval(1446, 1457))).withInterval(decl.sourceInterval(1405, 1458)))
	    .define("name", [], this.seq(this.app("nameFirst").withInterval(decl.sourceInterval(1483, 1492)), this.star(this.app("nameRest").withInterval(decl.sourceInterval(1493, 1501))).withInterval(decl.sourceInterval(1493, 1502))).withInterval(decl.sourceInterval(1483, 1502)), "a name")
	    .define("nameFirst", [], this.alt(this.prim("_").withInterval(decl.sourceInterval(1522, 1525)), this.app("letter").withInterval(decl.sourceInterval(1532, 1538))).withInterval(decl.sourceInterval(1522, 1538)))
	    .define("nameRest", [], this.alt(this.prim("_").withInterval(decl.sourceInterval(1557, 1560)), this.app("alnum").withInterval(decl.sourceInterval(1567, 1572))).withInterval(decl.sourceInterval(1557, 1572)))
	    .define("ident", [], this.seq(this.not(this.app("keyword").withInterval(decl.sourceInterval(1606, 1613))).withInterval(decl.sourceInterval(1605, 1613)), this.app("name").withInterval(decl.sourceInterval(1614, 1618))).withInterval(decl.sourceInterval(1605, 1618)), "an identifier")
	    .define("keyword_null", [], this.seq(this.prim("null").withInterval(decl.sourceInterval(1636, 1642)), this.not(this.app("nameRest").withInterval(decl.sourceInterval(1644, 1652))).withInterval(decl.sourceInterval(1643, 1652))).withInterval(decl.sourceInterval(1636, 1652)))
	    .define("keyword_true", [], this.seq(this.prim("true").withInterval(decl.sourceInterval(1669, 1675)), this.not(this.app("nameRest").withInterval(decl.sourceInterval(1677, 1685))).withInterval(decl.sourceInterval(1676, 1685))).withInterval(decl.sourceInterval(1669, 1685)))
	    .define("keyword_false", [], this.seq(this.prim("false").withInterval(decl.sourceInterval(1702, 1709)), this.not(this.app("nameRest").withInterval(decl.sourceInterval(1711, 1719))).withInterval(decl.sourceInterval(1710, 1719))).withInterval(decl.sourceInterval(1702, 1719)))
	    .define("keyword", [], this.alt(this.app("keyword_null").withInterval(decl.sourceInterval(1636, 1652)), this.app("keyword_true").withInterval(decl.sourceInterval(1669, 1685)), this.app("keyword_false").withInterval(decl.sourceInterval(1702, 1719))).withInterval(decl.sourceInterval(1636, 1729)))
	    .define("string", [], this.seq(this.prim("\"").withInterval(decl.sourceInterval(1746, 1750)), this.star(this.app("strChar").withInterval(decl.sourceInterval(1751, 1758))).withInterval(decl.sourceInterval(1751, 1759)), this.prim("\"").withInterval(decl.sourceInterval(1760, 1764))).withInterval(decl.sourceInterval(1746, 1764)))
	    .define("strChar", [], this.alt(this.app("escapeChar").withInterval(decl.sourceInterval(1782, 1792)), this.seq(this.not(this.prim("\\").withInterval(decl.sourceInterval(1800, 1804))).withInterval(decl.sourceInterval(1799, 1804)), this.not(this.prim("\"").withInterval(decl.sourceInterval(1806, 1810))).withInterval(decl.sourceInterval(1805, 1810)), this.not(this.prim("\n").withInterval(decl.sourceInterval(1812, 1816))).withInterval(decl.sourceInterval(1811, 1816)), this.app("any").withInterval(decl.sourceInterval(1817, 1820))).withInterval(decl.sourceInterval(1799, 1820))).withInterval(decl.sourceInterval(1782, 1820)))
	    .define("escapeChar_backslash", [], this.prim("\\\\").withInterval(decl.sourceInterval(1863, 1869)))
	    .define("escapeChar_doubleQuote", [], this.prim("\\\"").withInterval(decl.sourceInterval(1925, 1931)))
	    .define("escapeChar_singleQuote", [], this.prim("\\'").withInterval(decl.sourceInterval(1989, 1995)))
	    .define("escapeChar_backspace", [], this.prim("\\b").withInterval(decl.sourceInterval(2053, 2058)))
	    .define("escapeChar_lineFeed", [], this.prim("\\n").withInterval(decl.sourceInterval(2115, 2120)))
	    .define("escapeChar_carriageReturn", [], this.prim("\\r").withInterval(decl.sourceInterval(2176, 2181)))
	    .define("escapeChar_tab", [], this.prim("\\t").withInterval(decl.sourceInterval(2243, 2248)))
	    .define("escapeChar_unicodeEscape", [], this.seq(this.prim("\\u").withInterval(decl.sourceInterval(2299, 2304)), this.app("hexDigit").withInterval(decl.sourceInterval(2305, 2313)), this.app("hexDigit").withInterval(decl.sourceInterval(2314, 2322)), this.app("hexDigit").withInterval(decl.sourceInterval(2323, 2331)), this.app("hexDigit").withInterval(decl.sourceInterval(2332, 2340))).withInterval(decl.sourceInterval(2299, 2340)))
	    .define("escapeChar_hexEscape", [], this.seq(this.prim("\\x").withInterval(decl.sourceInterval(2365, 2370)), this.app("hexDigit").withInterval(decl.sourceInterval(2371, 2379)), this.app("hexDigit").withInterval(decl.sourceInterval(2380, 2388))).withInterval(decl.sourceInterval(2365, 2388)))
	    .define("escapeChar", [], this.alt(this.app("escapeChar_backslash").withInterval(decl.sourceInterval(1863, 1869)), this.app("escapeChar_doubleQuote").withInterval(decl.sourceInterval(1925, 1931)), this.app("escapeChar_singleQuote").withInterval(decl.sourceInterval(1989, 1995)), this.app("escapeChar_backspace").withInterval(decl.sourceInterval(2053, 2058)), this.app("escapeChar_lineFeed").withInterval(decl.sourceInterval(2115, 2120)), this.app("escapeChar_carriageReturn").withInterval(decl.sourceInterval(2176, 2181)), this.app("escapeChar_tab").withInterval(decl.sourceInterval(2243, 2248)), this.app("escapeChar_unicodeEscape").withInterval(decl.sourceInterval(2299, 2340)), this.app("escapeChar_hexEscape").withInterval(decl.sourceInterval(2365, 2388))).withInterval(decl.sourceInterval(1863, 2420)), "an escape sequence")
	    .define("number", [], this.seq(this.opt(this.prim("-").withInterval(decl.sourceInterval(2449, 2452))).withInterval(decl.sourceInterval(2449, 2453)), this.plus(this.app("digit").withInterval(decl.sourceInterval(2454, 2459))).withInterval(decl.sourceInterval(2454, 2460))).withInterval(decl.sourceInterval(2449, 2460)), "a number")
	    .extend("space", [], this.app("comment").withInterval(decl.sourceInterval(2476, 2483)))
	    .define("comment_singleLine", [], this.seq(this.prim("//").withInterval(decl.sourceInterval(2501, 2505)), this.star(this.seq(this.not(this.prim("\n").withInterval(decl.sourceInterval(2508, 2512))).withInterval(decl.sourceInterval(2507, 2512)), this.app("any").withInterval(decl.sourceInterval(2513, 2516))).withInterval(decl.sourceInterval(2507, 2516))).withInterval(decl.sourceInterval(2506, 2518)), this.prim("\n").withInterval(decl.sourceInterval(2519, 2523))).withInterval(decl.sourceInterval(2501, 2523)))
	    .define("comment_multiLine", [], this.seq(this.prim("/*").withInterval(decl.sourceInterval(2545, 2549)), this.star(this.seq(this.not(this.prim("*/").withInterval(decl.sourceInterval(2552, 2556))).withInterval(decl.sourceInterval(2551, 2556)), this.app("any").withInterval(decl.sourceInterval(2557, 2560))).withInterval(decl.sourceInterval(2551, 2560))).withInterval(decl.sourceInterval(2550, 2562)), this.prim("*/").withInterval(decl.sourceInterval(2563, 2567))).withInterval(decl.sourceInterval(2545, 2567)))
	    .define("comment", [], this.alt(this.app("comment_singleLine").withInterval(decl.sourceInterval(2501, 2523)), this.app("comment_multiLine").withInterval(decl.sourceInterval(2545, 2567))).withInterval(decl.sourceInterval(2501, 2581)))
	    .define("tokens", [], this.star(this.app("token").withInterval(decl.sourceInterval(2594, 2599))).withInterval(decl.sourceInterval(2594, 2600)))
	    .define("token", [], this.alt(this.app("caseName").withInterval(decl.sourceInterval(2612, 2620)), this.app("comment").withInterval(decl.sourceInterval(2623, 2630)), this.app("ident").withInterval(decl.sourceInterval(2633, 2638)), this.app("keyword").withInterval(decl.sourceInterval(2641, 2648)), this.app("number").withInterval(decl.sourceInterval(2651, 2657)), this.app("operator").withInterval(decl.sourceInterval(2660, 2668)), this.app("punctuation").withInterval(decl.sourceInterval(2671, 2682)), this.app("string").withInterval(decl.sourceInterval(2685, 2691)), this.app("any").withInterval(decl.sourceInterval(2694, 2697))).withInterval(decl.sourceInterval(2612, 2697)))
	    .define("operator", [], this.alt(this.prim("<:").withInterval(decl.sourceInterval(2712, 2716)), this.prim("=").withInterval(decl.sourceInterval(2719, 2722)), this.prim(":=").withInterval(decl.sourceInterval(2725, 2729)), this.prim("+=").withInterval(decl.sourceInterval(2732, 2736)), this.prim("*").withInterval(decl.sourceInterval(2739, 2742)), this.prim("+").withInterval(decl.sourceInterval(2745, 2748)), this.prim("?").withInterval(decl.sourceInterval(2751, 2754)), this.prim("~").withInterval(decl.sourceInterval(2757, 2760)), this.prim("&").withInterval(decl.sourceInterval(2763, 2766))).withInterval(decl.sourceInterval(2712, 2766)))
	    .define("punctuation", [], this.alt(this.prim("<").withInterval(decl.sourceInterval(2784, 2787)), this.prim(">").withInterval(decl.sourceInterval(2790, 2793)), this.prim(",").withInterval(decl.sourceInterval(2796, 2799)), this.prim("--").withInterval(decl.sourceInterval(2802, 2806))).withInterval(decl.sourceInterval(2784, 2806)))
	    .build();
	});
	
	
	},{"..":41}],3:[function(require,module,exports){
	var ohm = require('..');
	module.exports = ohm.makeRecipe(function() {
	  var decl = this.newGrammar("OperationsAndAttributes")
	    .withSource("OperationsAndAttributes {\n\n  NameNoFormals =\n    name\n\n  NameAndFormals =\n    name Formals?\n\n  Formals\n    = \"(\" ListOf<name, \",\"> \")\"\n\n  name  (a name)\n    = nameFirst nameRest*\n\n  nameFirst\n    = \"_\"\n    | letter\n\n  nameRest\n    = \"_\"\n    | alnum\n\n}")
	    .withDefaultStartRule("NameNoFormals")
	  return decl
	    .define("NameNoFormals", [], this.app("name").withInterval(decl.sourceInterval(49, 53)))
	    .define("NameAndFormals", [], this.seq(this.app("name").withInterval(decl.sourceInterval(78, 82)), this.opt(this.app("Formals").withInterval(decl.sourceInterval(83, 90))).withInterval(decl.sourceInterval(83, 91))).withInterval(decl.sourceInterval(78, 91)))
	    .define("Formals", [], this.seq(this.prim("(").withInterval(decl.sourceInterval(109, 112)), this.app("ListOf", [this.app("name").withInterval(decl.sourceInterval(120, 124)), this.prim(",").withInterval(decl.sourceInterval(126, 129))]).withInterval(decl.sourceInterval(113, 130)), this.prim(")").withInterval(decl.sourceInterval(131, 134))).withInterval(decl.sourceInterval(109, 134)))
	    .define("name", [], this.seq(this.app("nameFirst").withInterval(decl.sourceInterval(159, 168)), this.star(this.app("nameRest").withInterval(decl.sourceInterval(169, 177))).withInterval(decl.sourceInterval(169, 178))).withInterval(decl.sourceInterval(159, 178)), "a name")
	    .define("nameFirst", [], this.alt(this.prim("_").withInterval(decl.sourceInterval(198, 201)), this.app("letter").withInterval(decl.sourceInterval(208, 214))).withInterval(decl.sourceInterval(198, 214)))
	    .define("nameRest", [], this.alt(this.prim("_").withInterval(decl.sourceInterval(233, 236)), this.app("alnum").withInterval(decl.sourceInterval(243, 248))).withInterval(decl.sourceInterval(233, 248)))
	    .build();
	});
	
	},{"..":41}],4:[function(require,module,exports){
	'use strict';
	
	module.exports = {
	  toAST: require('./semantics-toAST').helper,
	  semanticsForToAST: require('./semantics-toAST').semantics
	};
	
	},{"./semantics-toAST":5}],5:[function(require,module,exports){
	'use strict';
	
	// --------------------------------------------------------------------
	// Imports
	// --------------------------------------------------------------------
	
	var pexprs = require('../src/pexprs');
	var MatchResult = require('../src/MatchResult');
	var Grammar = require('../src/Grammar');
	var extend = require('util-extend');
	
	// --------------------------------------------------------------------
	// Operations
	// --------------------------------------------------------------------
	
	var defaultOperation = {
	  _nonterminal: function(children) {
	    var ctorName = this._node.ctorName;
	    var mapping = this.args.mapping;
	
	    // without customization
	    if (!mapping.hasOwnProperty(ctorName)) {
	      // intermediate node
	      if (this._node instanceof pexprs.Alt || this._node instanceof pexprs.Apply) {
	        return children[0].toAST(mapping);
	      }
	
	      // lexical rule
	      if (this.isLexical()) {
	        return this.interval.contents;
	      }
	
	      // singular node (e.g. only surrounded by literals or lookaheads)
	      var realChildren = children.filter(function(child) {
	        return !child.isTerminal();
	      });
	      if (realChildren.length === 1) {
	        return realChildren[0].toAST(mapping);
	      }
	
	      // rest: terms with multiple children
	    }
	
	    // direct forward
	    if (typeof mapping[ctorName] === 'number') {
	      return children[mapping[ctorName]].toAST(mapping);
	    }
	
	    // named/mapped children or unnamed children ('0', '1', '2', ...)
	    var propMap = mapping[ctorName] || children;
	    var node = {
	      type: ctorName
	    };
	    for (var prop in propMap) {
	      var mappedProp = mapping[ctorName] && mapping[ctorName][prop];
	      if (typeof mappedProp === 'number') {
	        // direct forward
	        node[prop] = children[mappedProp].toAST(mapping);
	      } else if ((typeof mappedProp === 'string') || (typeof mappedProp === 'boolean') ||
	          (mappedProp === null)) {
	        // primitive value
	        node[prop] = mappedProp;
	      } else if ((typeof mappedProp === 'object') && (mappedProp instanceof Number)) {
	        // primitive number (must be unboxed)
	        node[prop] = Number(mappedProp);
	      } else if (typeof mappedProp === 'function') {
	        // computed value
	        node[prop] = mappedProp.call(this, children);
	      } else if (mappedProp === undefined) {
	        if (children[prop] && !children[prop].isTerminal()) {
	          node[prop] = children[prop].toAST(mapping);
	        } else {
	          // delete predefined 'type' properties, like 'type', if explicitely removed
	          delete node[prop];
	        }
	      }
	    }
	    return node;
	  },
	
	  _iter: function(children) {
	    if (this._node.isOptional()) {
	      if (this.numChildren === 0) {
	        return null;
	      } else {
	        return children[0].toAST(this.args.mapping);
	      }
	    }
	
	    return children.map(function(child) {
	      return child.toAST(this.args.mapping);
	    }, this);
	  },
	
	  NonemptyListOf: function(first, sep, rest) {
	    return [first.toAST(this.args.mapping)].concat(rest.toAST(this.args.mapping));
	  },
	
	  EmptyListOf: function() {
	    return [];
	  }
	};
	
	// Returns a plain JavaScript object that includes an abstract syntax tree (AST)
	// for the given match result `res` containg a concrete syntax tree (CST) and grammar.
	// The optional `mapping` parameter can be used to customize how the nodes of the CST
	// are mapped to the AST (see /doc/extras.md#toastmatchresult-mapping).
	function toAST(res, mapping) {
	  if (!(res instanceof MatchResult) || res.failed()) {
	    throw new Error('toAST() expects a succesfull MatchResult as first parameter');
	  }
	
	  mapping = extend({}, mapping);
	  var operation = extend({}, defaultOperation);
	  for (var termName in mapping) {
	    if (typeof mapping[termName] === 'function') {
	      operation[termName] = mapping[termName];
	      delete mapping[termName];
	    }
	  }
	  var g = res._cst.grammar;
	  var s = g.semantics().addOperation('toAST(mapping)', operation);
	  return s(res).toAST(mapping);
	}
	
	// Returns a semantics containg the toAST(mapping) operation for the given grammar g.
	function semanticsForToAST(g) {
	  if (!(g instanceof Grammar)) {
	    throw new Error('semanticsToAST() expects a Grammar as parameter');
	  }
	
	  return g.semantics().addOperation('toAST(mapping)', defaultOperation);
	}
	
	module.exports = {
	  helper: toAST,
	  semantics: semanticsForToAST
	};
	
	},{"../src/Grammar":29,"../src/MatchResult":33,"../src/pexprs":59,"util-extend":26}],6:[function(require,module,exports){
	'use strict';
	
	module.exports = require('./is-implemented')() ? Symbol : require('./polyfill');
	
	},{"./is-implemented":7,"./polyfill":22}],7:[function(require,module,exports){
	'use strict';
	
	module.exports = function () {
		var symbol;
		if (typeof Symbol !== 'function') return false;
		symbol = Symbol('test symbol');
		try { String(symbol); } catch (e) { return false; }
		if (typeof Symbol.iterator === 'symbol') return true;
	
		// Return 'true' for polyfills
		if (typeof Symbol.isConcatSpreadable !== 'object') return false;
		if (typeof Symbol.iterator !== 'object') return false;
		if (typeof Symbol.toPrimitive !== 'object') return false;
		if (typeof Symbol.toStringTag !== 'object') return false;
		if (typeof Symbol.unscopables !== 'object') return false;
	
		return true;
	};
	
	},{}],8:[function(require,module,exports){
	'use strict';
	
	module.exports = function (x) {
		return (x && ((typeof x === 'symbol') || (x['@@toStringTag'] === 'Symbol'))) || false;
	};
	
	},{}],9:[function(require,module,exports){
	'use strict';
	
	var assign        = require('es5-ext/object/assign')
	  , normalizeOpts = require('es5-ext/object/normalize-options')
	  , isCallable    = require('es5-ext/object/is-callable')
	  , contains      = require('es5-ext/string/#/contains')
	
	  , d;
	
	d = module.exports = function (dscr, value/*, options*/) {
		var c, e, w, options, desc;
		if ((arguments.length < 2) || (typeof dscr !== 'string')) {
			options = value;
			value = dscr;
			dscr = null;
		} else {
			options = arguments[2];
		}
		if (dscr == null) {
			c = w = true;
			e = false;
		} else {
			c = contains.call(dscr, 'c');
			e = contains.call(dscr, 'e');
			w = contains.call(dscr, 'w');
		}
	
		desc = { value: value, configurable: c, enumerable: e, writable: w };
		return !options ? desc : assign(normalizeOpts(options), desc);
	};
	
	d.gs = function (dscr, get, set/*, options*/) {
		var c, e, options, desc;
		if (typeof dscr !== 'string') {
			options = set;
			set = get;
			get = dscr;
			dscr = null;
		} else {
			options = arguments[3];
		}
		if (get == null) {
			get = undefined;
		} else if (!isCallable(get)) {
			options = get;
			get = set = undefined;
		} else if (set == null) {
			set = undefined;
		} else if (!isCallable(set)) {
			options = set;
			set = undefined;
		}
		if (dscr == null) {
			c = true;
			e = false;
		} else {
			c = contains.call(dscr, 'c');
			e = contains.call(dscr, 'e');
		}
	
		desc = { get: get, set: set, configurable: c, enumerable: e };
		return !options ? desc : assign(normalizeOpts(options), desc);
	};
	
	},{"es5-ext/object/assign":10,"es5-ext/object/is-callable":13,"es5-ext/object/normalize-options":17,"es5-ext/string/#/contains":19}],10:[function(require,module,exports){
	'use strict';
	
	module.exports = require('./is-implemented')()
		? Object.assign
		: require('./shim');
	
	},{"./is-implemented":11,"./shim":12}],11:[function(require,module,exports){
	'use strict';
	
	module.exports = function () {
		var assign = Object.assign, obj;
		if (typeof assign !== 'function') return false;
		obj = { foo: 'raz' };
		assign(obj, { bar: 'dwa' }, { trzy: 'trzy' });
		return (obj.foo + obj.bar + obj.trzy) === 'razdwatrzy';
	};
	
	},{}],12:[function(require,module,exports){
	'use strict';
	
	var keys  = require('../keys')
	  , value = require('../valid-value')
	
	  , max = Math.max;
	
	module.exports = function (dest, src/*, …srcn*/) {
		var error, i, l = max(arguments.length, 2), assign;
		dest = Object(value(dest));
		assign = function (key) {
			try { dest[key] = src[key]; } catch (e) {
				if (!error) error = e;
			}
		};
		for (i = 1; i < l; ++i) {
			src = arguments[i];
			keys(src).forEach(assign);
		}
		if (error !== undefined) throw error;
		return dest;
	};
	
	},{"../keys":14,"../valid-value":18}],13:[function(require,module,exports){
	// Deprecated
	
	'use strict';
	
	module.exports = function (obj) { return typeof obj === 'function'; };
	
	},{}],14:[function(require,module,exports){
	'use strict';
	
	module.exports = require('./is-implemented')()
		? Object.keys
		: require('./shim');
	
	},{"./is-implemented":15,"./shim":16}],15:[function(require,module,exports){
	'use strict';
	
	module.exports = function () {
		try {
			Object.keys('primitive');
			return true;
		} catch (e) { return false; }
	};
	
	},{}],16:[function(require,module,exports){
	'use strict';
	
	var keys = Object.keys;
	
	module.exports = function (object) {
		return keys(object == null ? object : Object(object));
	};
	
	},{}],17:[function(require,module,exports){
	'use strict';
	
	var forEach = Array.prototype.forEach, create = Object.create;
	
	var process = function (src, obj) {
		var key;
		for (key in src) obj[key] = src[key];
	};
	
	module.exports = function (options/*, …options*/) {
		var result = create(null);
		forEach.call(arguments, function (options) {
			if (options == null) return;
			process(Object(options), result);
		});
		return result;
	};
	
	},{}],18:[function(require,module,exports){
	'use strict';
	
	module.exports = function (value) {
		if (value == null) throw new TypeError("Cannot use null or undefined");
		return value;
	};
	
	},{}],19:[function(require,module,exports){
	'use strict';
	
	module.exports = require('./is-implemented')()
		? String.prototype.contains
		: require('./shim');
	
	},{"./is-implemented":20,"./shim":21}],20:[function(require,module,exports){
	'use strict';
	
	var str = 'razdwatrzy';
	
	module.exports = function () {
		if (typeof str.contains !== 'function') return false;
		return ((str.contains('dwa') === true) && (str.contains('foo') === false));
	};
	
	},{}],21:[function(require,module,exports){
	'use strict';
	
	var indexOf = String.prototype.indexOf;
	
	module.exports = function (searchString/*, position*/) {
		return indexOf.call(this, searchString, arguments[1]) > -1;
	};
	
	},{}],22:[function(require,module,exports){
	'use strict';
	
	var d              = require('d')
	  , validateSymbol = require('./validate-symbol')
	
	  , create = Object.create, defineProperties = Object.defineProperties
	  , defineProperty = Object.defineProperty, objPrototype = Object.prototype
	  , Symbol, HiddenSymbol, globalSymbols = create(null);
	
	var generateName = (function () {
		var created = create(null);
		return function (desc) {
			var postfix = 0, name;
			while (created[desc + (postfix || '')]) ++postfix;
			desc += (postfix || '');
			created[desc] = true;
			name = '@@' + desc;
			defineProperty(objPrototype, name, d.gs(null, function (value) {
				defineProperty(this, name, d(value));
			}));
			return name;
		};
	}());
	
	HiddenSymbol = function Symbol(description) {
		if (this instanceof HiddenSymbol) throw new TypeError('TypeError: Symbol is not a constructor');
		return Symbol(description);
	};
	module.exports = Symbol = function Symbol(description) {
		var symbol;
		if (this instanceof Symbol) throw new TypeError('TypeError: Symbol is not a constructor');
		symbol = create(HiddenSymbol.prototype);
		description = (description === undefined ? '' : String(description));
		return defineProperties(symbol, {
			__description__: d('', description),
			__name__: d('', generateName(description))
		});
	};
	defineProperties(Symbol, {
		for: d(function (key) {
			if (globalSymbols[key]) return globalSymbols[key];
			return (globalSymbols[key] = Symbol(String(key)));
		}),
		keyFor: d(function (s) {
			var key;
			validateSymbol(s);
			for (key in globalSymbols) if (globalSymbols[key] === s) return key;
		}),
		hasInstance: d('', Symbol('hasInstance')),
		isConcatSpreadable: d('', Symbol('isConcatSpreadable')),
		iterator: d('', Symbol('iterator')),
		match: d('', Symbol('match')),
		replace: d('', Symbol('replace')),
		search: d('', Symbol('search')),
		species: d('', Symbol('species')),
		split: d('', Symbol('split')),
		toPrimitive: d('', Symbol('toPrimitive')),
		toStringTag: d('', Symbol('toStringTag')),
		unscopables: d('', Symbol('unscopables'))
	});
	defineProperties(HiddenSymbol.prototype, {
		constructor: d(Symbol),
		toString: d('', function () { return this.__name__; })
	});
	
	defineProperties(Symbol.prototype, {
		toString: d(function () { return 'Symbol (' + validateSymbol(this).__description__ + ')'; }),
		valueOf: d(function () { return validateSymbol(this); })
	});
	defineProperty(Symbol.prototype, Symbol.toPrimitive, d('',
		function () { return validateSymbol(this); }));
	defineProperty(Symbol.prototype, Symbol.toStringTag, d('c', 'Symbol'));
	
	defineProperty(HiddenSymbol.prototype, Symbol.toPrimitive,
		d('c', Symbol.prototype[Symbol.toPrimitive]));
	defineProperty(HiddenSymbol.prototype, Symbol.toStringTag,
		d('c', Symbol.prototype[Symbol.toStringTag]));
	
	},{"./validate-symbol":23,"d":9}],23:[function(require,module,exports){
	'use strict';
	
	var isSymbol = require('./is-symbol');
	
	module.exports = function (value) {
		if (!isSymbol(value)) throw new TypeError(value + " is not a symbol");
		return value;
	};
	
	},{"./is-symbol":8}],24:[function(require,module,exports){
	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}
	
	},{}],25:[function(require,module,exports){
	/**
	 * Determine if an object is Buffer
	 *
	 * Author:   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * License:  MIT
	 *
	 * `npm install is-buffer`
	 */
	
	module.exports = function (obj) {
	  return !!(
	    obj != null &&
	    obj.constructor &&
	    typeof obj.constructor.isBuffer === 'function' &&
	    obj.constructor.isBuffer(obj)
	  )
	}
	
	},{}],26:[function(require,module,exports){
	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	module.exports = extend;
	function extend(origin, add) {
	  // Don't do anything if add isn't an object
	  if (!add || typeof add !== 'object') return origin;
	
	  var keys = Object.keys(add);
	  var i = keys.length;
	  while (i--) {
	    origin[keys[i]] = add[keys[i]];
	  }
	  return origin;
	}
	
	},{}],27:[function(require,module,exports){
	'use strict';
	
	// --------------------------------------------------------------------
	// Imports
	// --------------------------------------------------------------------
	
	var GrammarDecl = require('./GrammarDecl');
	var pexprs = require('./pexprs');
	
	// --------------------------------------------------------------------
	// Private stuff
	// --------------------------------------------------------------------
	
	function Builder() {}
	
	Builder.prototype = {
	  newGrammar: function(name) {
	    return new GrammarDecl(name);
	  },
	
	  prim: function(x) {
	    return new pexprs.Prim(x);
	  },
	
	  range: function(from, to) {
	    return new pexprs.Range(from, to);
	  },
	
	  param: function(index) {
	    return new pexprs.Param(index);
	  },
	
	  alt: function(/* term1, term1, ... */) {
	    var terms = [];
	    for (var idx = 0; idx < arguments.length; idx++) {
	      var arg = arguments[idx];
	      if (arg instanceof pexprs.Alt) {
	        terms = terms.concat(arg.terms);
	      } else {
	        terms.push(arg);
	      }
	    }
	    return terms.length === 1 ? terms[0] : new pexprs.Alt(terms);
	  },
	
	  seq: function(/* factor1, factor2, ... */) {
	    var factors = [];
	    for (var idx = 0; idx < arguments.length; idx++) {
	      var arg = arguments[idx];
	      if (arg instanceof pexprs.Seq) {
	        factors = factors.concat(arg.factors);
	      } else {
	        factors.push(arg);
	      }
	    }
	    return factors.length === 1 ? factors[0] : new pexprs.Seq(factors);
	  },
	
	  star: function(expr) {
	    return new pexprs.Star(expr);
	  },
	
	  plus: function(expr) {
	    return new pexprs.Plus(expr);
	  },
	
	  opt: function(expr) {
	    return new pexprs.Opt(expr);
	  },
	
	  not: function(expr) {
	    return new pexprs.Not(expr);
	  },
	
	  la: function(expr) {
	    return new pexprs.Lookahead(expr);
	  },
	
	  lex: function(expr) {
	    return new pexprs.Lex(expr);
	  },
	
	  val: function(expr) {
	    return new pexprs.Value(expr);
	  },
	
	  arr: function(expr) {
	    return new pexprs.Arr(expr);
	  },
	
	  str: function(expr) {
	    return new pexprs.Str(expr);
	  },
	
	  obj: function(properties, isLenient) {
	    return new pexprs.Obj(properties, !!isLenient);
	  },
	
	  app: function(ruleName, optParams) {
	    return new pexprs.Apply(ruleName, optParams);
	  }
	};
	
	// --------------------------------------------------------------------
	// Exports
	// --------------------------------------------------------------------
	
	module.exports = Builder;
	
	},{"./GrammarDecl":30,"./pexprs":59}],28:[function(require,module,exports){
	'use strict';
	
	// --------------------------------------------------------------------
	// Private stuff
	// --------------------------------------------------------------------
	
	/*
	  `Failure`s represent expressions that weren't matched while parsing. They are used to generate
	  error messages automatically. The interface of `Failure`s includes the collowing methods:
	
	  - getText() : String
	  - getType() : String  (one of {"description", "string", "code"})
	  - isDescription() : bool
	  - isStringTerminal() : bool
	  - isCode() : bool
	  - isFluffy() : bool
	  - makeFluffy() : void
	  - subsumes(Failure) : bool
	*/
	
	function isValidType(type) {
	  return type === 'description' || type === 'string' || type === 'code';
	}
	
	function Failure(text, type) {
	  if (!isValidType(type)) {
	    throw new Error('invalid Failure type: ' + type);
	  }
	
	  this.text = text;
	  this.type = type;
	  this.fluffy = false;
	}
	
	Failure.prototype.getText = function() {
	  return this.text;
	};
	
	Failure.prototype.getType = function() {
	  return this.type;
	};
	
	Failure.prototype.isDescription = function() {
	  return this.type === 'description';
	};
	
	Failure.prototype.isStringTerminal = function() {
	  return this.type === 'string';
	};
	
	Failure.prototype.isCode = function() {
	  return this.type === 'code';
	};
	
	Failure.prototype.isFluffy = function() {
	  return this.fluffy;
	};
	
	Failure.prototype.makeFluffy = function() {
	  this.fluffy = true;
	};
	
	Failure.prototype.clearFluffy = function() {
	  this.fluffy = false;
	};
	
	Failure.prototype.subsumes = function(that) {
	  return this.getText() === that.getText() &&
	      this.type === that.type &&
	      (!this.isFluffy() || this.isFluffy() && that.isFluffy());
	};
	
	Failure.prototype.toString = function() {
	  return this.type === 'string' ?
	    JSON.stringify(this.getText()) :
	    this.getText();
	};
	
	Failure.prototype.clone = function() {
	  var failure = new Failure(this.text, this.type);
	  if (this.isFluffy()) {
	    failure.makeFluffy();
	  }
	  return failure;
	};
	
	Failure.prototype.toKey = function() {
	  return this.toString() + '#' + this.type;
	};
	
	// --------------------------------------------------------------------
	// Exports
	// --------------------------------------------------------------------
	
	module.exports = Failure;
	
	},{}],29:[function(require,module,exports){
	'use strict';
	
	// --------------------------------------------------------------------
	// Imports
	// --------------------------------------------------------------------
	
	var MatchResult = require('./MatchResult');
	var Semantics = require('./Semantics');
	var State = require('./State');
	var common = require('./common');
	var errors = require('./errors');
	var pexprs = require('./pexprs');
	
	// --------------------------------------------------------------------
	// Private stuff
	// --------------------------------------------------------------------
	
	function Grammar(
	    name,
	    superGrammar,
	    ruleBodies,
	    ruleFormals,
	    ruleDescriptions,
	    optDefaultStartRule) {
	  this.name = name;
	  this.superGrammar = superGrammar;
	  this.ruleBodies = ruleBodies;
	  this.ruleFormals = ruleFormals;
	  this.ruleDescriptions = ruleDescriptions;
	  if (optDefaultStartRule) {
	    if (!(optDefaultStartRule in ruleBodies)) {
	      throw new Error("Invalid start rule: '" + optDefaultStartRule +
	                      "' is not a rule in grammar '" + name + "'");
	    }
	    this.defaultStartRule = optDefaultStartRule;
	  }
	  this.constructors = this.ctors = this.createConstructors();
	}
	
	Grammar.prototype = {
	  construct: function(ruleName, children) {
	    var body = this.ruleBodies[ruleName];
	    if (!body) {
	      throw errors.undeclaredRule(ruleName, this.name);
	    }
	
	    var ans = this._constructByMatching(ruleName, children);
	    if (!ans) {
	      throw errors.invalidConstructorCall(this, ruleName, children);
	    }
	    return ans;
	  },
	
	  // Try to match `ctorArgs` with the body of the rule given by `ruleName`.
	  // Return the resulting CST node if it succeeds, otherwise return null.
	  _constructByMatching: function(ruleName, ctorArgs) {
	    var state = this._match(ctorArgs, ruleName, {matchNodes: true});
	    if (state.bindings.length === 1) {
	      return state.bindings[0];
	    }
	    return null;
	  },
	
	  createConstructors: function() {
	    var self = this;
	    var constructors = {};
	
	    function makeConstructor(ruleName) {
	      return function(/* val1, val2, ... */) {
	        return self.construct(ruleName, Array.prototype.slice.call(arguments));
	      };
	    }
	
	    for (var ruleName in this.ruleBodies) {
	      // We want *all* properties, not just own properties, because of
	      // supergrammars.
	      constructors[ruleName] = makeConstructor(ruleName);
	    }
	    return constructors;
	  },
	
	  // Return true if the grammar is a built-in grammar, otherwise false.
	  // NOTE: This might give an unexpected result if called before BuiltInRules is defined!
	  isBuiltIn: function() {
	    return this === Grammar.ProtoBuiltInRules || this === Grammar.BuiltInRules;
	  },
	
	  match: function(obj, optStartRule) {
	    var startRule = optStartRule || this.defaultStartRule;
	    if (!startRule) {
	      throw new Error('Missing start rule argument -- the grammar has no default start rule.');
	    }
	    var state = this._match([obj], startRule, {});
	    return MatchResult.newFor(state);
	  },
	
	  _match: function(values, startRule, opts) {
	    if (!(startRule in this.ruleBodies)) {
	      throw errors.undeclaredRule(startRule, this.name);
	    }
	    var expr = new pexprs.Apply(startRule);
	    var state = new State(this, expr.newInputStreamFor(values, this), startRule, opts);
	    state.eval(expr);
	    return state;
	  },
	
	  trace: function(obj, optStartRule) {
	    var startRule = optStartRule || this.defaultStartRule;
	    if (!startRule) {
	      throw new Error('Missing start rule argument -- the grammar has no default start rule.');
	    }
	    var state = this._match([obj], startRule, {trace: true});
	
	    var rootTrace = state.trace[0];
	    rootTrace.state = state;
	    rootTrace.result = MatchResult.newFor(state);
	    return rootTrace;
	  },
	
	  semantics: function() {
	    return Semantics.createSemantics(this);
	  },
	
	  extendSemantics: function(superSemantics) {
	    return Semantics.createSemantics(this, superSemantics._getSemantics());
	  },
	
	  // Check that every key in `actionDict` corresponds to a semantic action, and that it maps to
	  // a function of the correct arity. If not, throw an exception.
	  _checkTopDownActionDict: function(what, name, actionDict) {
	    function isSpecialAction(a) {
	      return a === '_iter' || a === '_terminal' || a === '_nonterminal' || a === '_default';
	    }
	
	    var problems = [];
	    for (var k in actionDict) {
	      var v = actionDict[k];
	      if (!isSpecialAction(k) && !(k in this.ruleBodies)) {
	        problems.push("'" + k + "' is not a valid semantic action for '" + this.name + "'");
	      } else if (typeof v !== 'function') {
	        problems.push(
	            "'" + k + "' must be a function in an action dictionary for '" + this.name + "'");
	      } else {
	        var actual = v.length;
	        var expected = this._topDownActionArity(k);
	        if (actual !== expected) {
	          problems.push(
	              "Semantic action '" + k + "' has the wrong arity: " +
	              'expected ' + expected + ', got ' + actual);
	        }
	      }
	    }
	    if (problems.length > 0) {
	      var prettyProblems = problems.map(function(problem) { return '- ' + problem; });
	      var error = new Error(
	          "Found errors in the action dictionary of the '" + name + "' " + what + ':\n' +
	          prettyProblems.join('\n'));
	      error.problems = problems;
	      throw error;
	    }
	  },
	
	  // Return the expected arity for a semantic action named `actionName`, which
	  // is either a rule name or a special action name like '_nonterminal'.
	  _topDownActionArity: function(actionName) {
	    if (actionName === '_iter' || actionName === '_nonterminal' || actionName === '_default') {
	      return 1;
	    } else if (actionName === '_terminal') {
	      return 0;
	    }
	    return this.ruleBodies[actionName].getArity();
	  },
	
	  _inheritsFrom: function(grammar) {
	    var g = this.superGrammar;
	    while (g) {
	      if (g === grammar) {
	        return true;
	      }
	      g = g.superGrammar;
	    }
	    return false;
	  },
	
	  toRecipe: function(optVarName) {
	    if (this.isBuiltIn()) {
	      throw new Error(
	          'Why would anyone want to generate a recipe for the ' + this.name + ' grammar?!?!');
	    }
	    var sb = new common.StringBuffer();
	    if (optVarName) {
	      sb.append('var ' + optVarName + ' = ');
	    }
	    sb.append('(function() {\n');
	
	    // Include the supergrammar in the recipe if it's not a built-in grammar.
	    var superGrammarDecl = '';
	    if (!this.superGrammar.isBuiltIn()) {
	      sb.append(this.superGrammar.toRecipe('buildSuperGrammar'));
	      superGrammarDecl = '    .withSuperGrammar(buildSuperGrammar.call(this))\n';
	    }
	    sb.append('  var decl = this.newGrammar(' + JSON.stringify(this.name) + ')\n');
	
	    // Include the grammar source if it is available.
	    if (this.definitionInterval) {
	      sb.append('    .withSource(' + JSON.stringify(this.definitionInterval.contents) + ')\n');
	    }
	    sb.append(superGrammarDecl);
	
	    if (this.defaultStartRule) {
	      sb.append('    .withDefaultStartRule("' + this.defaultStartRule + '")\n');
	    }
	    sb.append('  return decl\n');
	
	    var self = this;
	    Object.keys(this.ruleBodies).forEach(function(ruleName) {
	      var body = self.ruleBodies[ruleName];
	      sb.append('    .');
	      if (self.superGrammar.ruleBodies[ruleName]) {
	        sb.append(body instanceof pexprs.Extend ? 'extend' : 'override');
	      } else {
	        sb.append('define');
	      }
	      var formals = self.ruleFormals[ruleName];
	      var formalsString = '[' + formals.map(JSON.stringify).join(', ') + ']';
	      sb.append('(' + JSON.stringify(ruleName) + ', ' + formalsString + ', ');
	      body.outputRecipe(sb, formals, self.definitionInterval);
	
	      if (!self.superGrammar.ruleBodies[ruleName] && self.ruleDescriptions[ruleName]) {
	        sb.append(', ' + JSON.stringify(self.ruleDescriptions[ruleName]));
	      }
	      sb.append(')\n');
	    });
	    sb.append('    .build();\n});\n');
	    return sb.contents();
	  },
	
	  // TODO: Come up with better names for these methods.
	  // TODO: Write the analog of these methods for inherited attributes.
	  toOperationActionDictionaryTemplate: function() {
	    return this._toOperationOrAttributeActionDictionaryTemplate();
	  },
	  toAttributeActionDictionaryTemplate: function() {
	    return this._toOperationOrAttributeActionDictionaryTemplate();
	  },
	
	  _toOperationOrAttributeActionDictionaryTemplate: function() {
	    // TODO: add the super-grammar's templates at the right place, e.g., a case for AddExpr_plus
	    // should appear next to other cases of AddExpr.
	
	    var sb = new common.StringBuffer();
	    sb.append('{');
	
	    var first = true;
	    for (var ruleName in this.ruleBodies) {
	      var body = this.ruleBodies[ruleName];
	      if (first) {
	        first = false;
	      } else {
	        sb.append(',');
	      }
	      sb.append('\n');
	      sb.append('  ');
	      this.addSemanticActionTemplate(ruleName, body, sb);
	    }
	
	    sb.append('\n}');
	    return sb.contents();
	  },
	
	  addSemanticActionTemplate: function(ruleName, body, sb) {
	    sb.append(ruleName);
	    sb.append(': function(');
	    var arity = this._topDownActionArity(ruleName);
	    sb.append(common.repeat('_', arity).join(', '));
	    sb.append(') {\n');
	    sb.append('  }');
	  }
	};
	
	// The following grammar contains a few rules that couldn't be written  in "userland".
	// At the bottom of src/main.js, we create a sub-grammar of this grammar that's called
	// `BuiltInRules`. That grammar contains several convenience rules, e.g., `letter` and
	// `digit`, and is implicitly the super-grammar of any grammar whose super-grammar
	// isn't specified.
	Grammar.ProtoBuiltInRules = new Grammar(
	    'ProtoBuiltInRules',  // name
	    undefined,  // supergrammar
	
	    // rule bodies
	    {
	      any: pexprs.any,
	      end: pexprs.end,
	      lower: new pexprs.UnicodeChar('Ll'),
	
	      // The following rule is invoked implicitly by syntactic rules to skip spaces.
	      spaces: new pexprs.Star(new pexprs.Apply('space')),
	
	      // The `space` rule must be defined here because it's referenced by `spaces`.
	      space: new pexprs.Range('\x00', ' '),
	
	      // The union of Lt (titlecase), Lm (modifier), and Lo (other), i.e. any letter not
	      // in Ll or Lu.
	      unicodeLtmo: new pexprs.UnicodeChar('Ltmo'),
	
	      upper: new pexprs.UnicodeChar('Lu'),
	
	      Boolean: new pexprs.TypeCheck('boolean'),
	      Number: new pexprs.TypeCheck('number'),
	      String: new pexprs.TypeCheck('string')
	    },
	
	    // rule formal arguments
	    {
	      any: [],
	      end: [],
	      spaces: [],
	      space: [],
	      lower: [],
	      unicodeLtmo: [],
	      upper: [],
	      Boolean: [],
	      Number: [],
	      String: []
	    },
	
	    // rule descriptions
	    {
	      any: 'any object',
	      end: 'end of input',
	      space: 'a space',
	      lower: 'a lowercase letter',
	      upper: 'an uppercase letter'
	    }
	);
	
	// --------------------------------------------------------------------
	// Exports
	// --------------------------------------------------------------------
	
	module.exports = Grammar;
	
	},{"./MatchResult":33,"./Semantics":36,"./State":37,"./common":39,"./errors":40,"./pexprs":59}],30:[function(require,module,exports){
	'use strict';
	
	// --------------------------------------------------------------------
	// Imports
	// --------------------------------------------------------------------
	
	var Grammar = require('./Grammar');
	var InputStream = require('./InputStream');
	var common = require('./common');
	var errors = require('./errors');
	var pexprs = require('./pexprs');
	
	// --------------------------------------------------------------------
	// Private Stuff
	// --------------------------------------------------------------------
	
	// Constructors
	
	function GrammarDecl(name) {
	  this.name = name;
	}
	
	// Helpers
	
	GrammarDecl.prototype.sourceInterval = function(startIdx, endIdx) {
	  var inputStream = this.interval.inputStream;
	  return inputStream.interval(startIdx, endIdx);
	};
	
	GrammarDecl.prototype.ensureSuperGrammar = function() {
	  if (!this.superGrammar) {
	    this.withSuperGrammar(
	        // TODO: The conditional expression below is an ugly hack. It's kind of ok because
	        // I doubt anyone will ever try to declare a grammar called `BuiltInRules`. Still,
	        // we should try to find a better way to do this.
	        this.name === 'BuiltInRules' ?
	            Grammar.ProtoBuiltInRules :
	            Grammar.BuiltInRules);
	  }
	  return this.superGrammar;
	};
	
	GrammarDecl.prototype.installOverriddenOrExtendedRule = function(name, formals, body) {
	  var duplicateParameterNames = common.getDuplicates(formals);
	  if (duplicateParameterNames.length > 0) {
	    throw errors.duplicateParameterNames(name, duplicateParameterNames, body);
	  }
	  var expectedFormals = this.ensureSuperGrammar().ruleFormals[name];
	  var expectedNumFormals = expectedFormals ? expectedFormals.length : 0;
	  if (formals.length !== expectedNumFormals) {
	    throw errors.wrongNumberOfParameters(name, expectedNumFormals, formals.length, body);
	  }
	  return this.install(name, formals, body);
	};
	
	GrammarDecl.prototype.install = function(name, formals, body, optDescription) {
	  body = body.introduceParams(formals);
	  this.ruleFormals[name] = formals;
	  if (optDescription) {
	    this.ruleDescriptions[name] = optDescription;
	  }
	  this.ruleBodies[name] = body;
	  return this;
	};
	
	// Stuff that you should only do once
	
	GrammarDecl.prototype.withSuperGrammar = function(superGrammar) {
	  if (this.superGrammar) {
	    throw new Error('the super grammar of a GrammarDecl cannot be set more than once');
	  }
	  this.superGrammar = superGrammar;
	  this.ruleBodies = Object.create(superGrammar.ruleBodies);
	  this.ruleFormals = Object.create(superGrammar.ruleFormals);
	  this.ruleDescriptions = Object.create(superGrammar.ruleDescriptions);
	
	  // Grammars with an explicit supergrammar inherit a default start rule.
	  if (!superGrammar.isBuiltIn()) {
	    this.defaultStartRule = superGrammar.defaultStartRule;
	  }
	  return this;
	};
	
	GrammarDecl.prototype.withDefaultStartRule = function(ruleName) {
	  this.defaultStartRule = ruleName;
	  return this;
	};
	
	GrammarDecl.prototype.withSource = function(source) {
	  this.interval = InputStream.newFor(source).interval(0, source.length);
	  return this;
	};
	
	// Creates a Grammar instance, and if it passes the sanity checks, returns it.
	GrammarDecl.prototype.build = function() {
	  var grammar = new Grammar(
	      this.name,
	      this.ensureSuperGrammar(),
	      this.ruleBodies,
	      this.ruleFormals,
	      this.ruleDescriptions,
	      this.defaultStartRule);
	  // TODO: change the pexpr.prototype.assert... methods to make them add
	  // exceptions to an array that's provided as an arg. Then we'll be able to
	  // show more than one error of the same type at a time.
	  // TODO: include the offending pexpr in the errors, that way we can show
	  // the part of the source that caused it.
	  var grammarErrors = [];
	  var grammarHasInvalidApplications = false;
	  Object.keys(grammar.ruleBodies).forEach(function(ruleName) {
	    var body = grammar.ruleBodies[ruleName];
	    try {
	      body.assertChoicesHaveUniformArity(ruleName);
	    } catch (e) {
	      grammarErrors.push(e);
	    }
	    try {
	      body.assertAllApplicationsAreValid(ruleName, grammar);
	    } catch (e) {
	      grammarErrors.push(e);
	      grammarHasInvalidApplications = true;
	    }
	  });
	  if (!grammarHasInvalidApplications) {
	    // The following check can only be done if the grammar has no invalid applications.
	    Object.keys(grammar.ruleBodies).forEach(function(ruleName) {
	      var body = grammar.ruleBodies[ruleName];
	      try {
	        body.assertIteratedExprsAreNotNullable(grammar, ruleName);
	      } catch (e) {
	        grammarErrors.push(e);
	      }
	      // For now, only check the bodies of unparameterized rules, because the checks can't deal
	      // properly with parameters that don't have a concrete value.
	      // TODO: Fix this.
	      if (grammar.ruleFormals[ruleName].length === 0) {
	        try {
	          body.assertValuesAndStringsAreNotMixed(grammar, ruleName);
	        } catch (e) {
	          grammarErrors.push(e);
	        }
	      }
	    });
	  }
	  if (grammarErrors.length > 0) {
	    errors.throwErrors(grammarErrors);
	  }
	  if (this.interval) {
	    grammar.definitionInterval = this.interval;
	  }
	
	  return grammar;
	};
	
	// Rule declarations
	
	GrammarDecl.prototype.define = function(name, formals, body, optDescr) {
	  this.ensureSuperGrammar();
	  if (this.superGrammar.ruleBodies[name]) {
	    throw errors.duplicateRuleDeclaration(name, this.name, this.superGrammar.name, body);
	  } else if (this.ruleBodies[name]) {
	    throw errors.duplicateRuleDeclaration(name, this.name, this.name, body);
	  }
	  var duplicateParameterNames = common.getDuplicates(formals);
	  if (duplicateParameterNames.length > 0) {
	    throw errors.duplicateParameterNames(name, duplicateParameterNames, body);
	  }
	  return this.install(name, formals, body, optDescr);
	};
	
	GrammarDecl.prototype.override = function(name, formals, body) {
	  var baseRule = this.ensureSuperGrammar().ruleBodies[name];
	  if (!baseRule) {
	    throw errors.cannotOverrideUndeclaredRule(name, this.superGrammar.name, body);
	  }
	  this.installOverriddenOrExtendedRule(name, formals, body);
	  return this;
	};
	
	GrammarDecl.prototype.extend = function(name, formals, fragment) {
	  var baseRule = this.ensureSuperGrammar().ruleBodies[name];
	  if (!baseRule) {
	    throw errors.cannotExtendUndeclaredRule(name, this.superGrammar.name, fragment);
	  }
	  var body = new pexprs.Extend(this.superGrammar, name, fragment);
	  body.interval = fragment.interval;
	  this.installOverriddenOrExtendedRule(name, formals, body);
	  return this;
	};
	
	// --------------------------------------------------------------------
	// Exports
	// --------------------------------------------------------------------
	
	module.exports = GrammarDecl;
	
	},{"./Grammar":29,"./InputStream":31,"./common":39,"./errors":40,"./pexprs":59}],31:[function(require,module,exports){
	'use strict';
	
	// --------------------------------------------------------------------
	// Imports
	// --------------------------------------------------------------------
	
	var inherits = require('inherits');
	
	var common = require('./common');
	var Interval = require('./Interval');
	
	// --------------------------------------------------------------------
	// Private stuff
	// --------------------------------------------------------------------
	
	function InputStream() {
	  throw new Error('InputStream cannot be instantiated -- it\'s abstract');
	}
	
	InputStream.newFor = function(arrOrStr) {
	  return Array.isArray(arrOrStr) ? new ListInputStream(arrOrStr) : new StringInputStream(arrOrStr);
	};
	
	InputStream.prototype = {
	  init: function(source) {
	    this.source = source;
	    this.pos = 0;
	    this.posInfos = [];
	  },
	
	  atEnd: function() {
	    return this.pos === this.source.length;
	  },
	
	  next: function() {
	    if (this.atEnd()) {
	      return common.fail;
	    } else {
	      return this.source[this.pos++];
	    }
	  },
	
	  matchExactly: function(x) {
	    return this.next() === x ? true : common.fail;
	  },
	
	  sourceSlice: function(startIdx, endIdx) {
	    return this.source.slice(startIdx, endIdx);
	  },
	
	  interval: function(startIdx, optEndIdx) {
	    return new Interval(this, startIdx, optEndIdx ? optEndIdx : this.pos);
	  }
	};
	
	function StringInputStream(source) {
	  this.init(source);
	}
	inherits(StringInputStream, InputStream);
	
	StringInputStream.prototype.matchString = function(s) {
	  for (var idx = 0; idx < s.length; idx++) {
	    if (this.matchExactly(s[idx]) === common.fail) {
	      return common.fail;
	    }
	  }
	  return true;
	};
	
	function ListInputStream(source) {
	  this.init(source);
	}
	inherits(ListInputStream, InputStream);
	
	ListInputStream.prototype.matchString = function(s) {
	  return this.matchExactly(s);
	};
	
	// --------------------------------------------------------------------
	// Exports
	// --------------------------------------------------------------------
	
	module.exports = InputStream;
	
	},{"./Interval":32,"./common":39,"inherits":24}],32:[function(require,module,exports){
	'use strict';
	
	// --------------------------------------------------------------------
	// Imports
	// --------------------------------------------------------------------
	
	var assert = require('./common').assert;
	var errors = require('./errors');
	var util = require('./util');
	
	// --------------------------------------------------------------------
	// Private stuff
	// --------------------------------------------------------------------
	
	function Interval(inputStream, startIdx, endIdx) {
	  this.inputStream = inputStream;
	  this.startIdx = startIdx;
	  this.endIdx = endIdx;
	}
	
	Interval.coverage = function(/* interval1, interval2, ... */) {
	  var inputStream = arguments[0].inputStream;
	  var startIdx = arguments[0].startIdx;
	  var endIdx = arguments[0].endIdx;
	  for (var idx = 1; idx < arguments.length; idx++) {
	    var interval = arguments[idx];
	    if (interval.inputStream !== inputStream) {
	      throw errors.intervalSourcesDontMatch();
	    } else {
	      startIdx = Math.min(startIdx, arguments[idx].startIdx);
	      endIdx = Math.max(endIdx, arguments[idx].endIdx);
	    }
	  }
	  return new Interval(inputStream, startIdx, endIdx);
	};
	
	Interval.prototype = {
	  coverageWith: function(/* interval1, interval2, ... */) {
	    var intervals = Array.prototype.slice.call(arguments);
	    intervals.push(this);
	    return Interval.coverage.apply(undefined, intervals);
	  },
	
	  collapsedLeft: function() {
	    return new Interval(this.inputStream, this.startIdx, this.startIdx);
	  },
	
	  collapsedRight: function() {
	    return new Interval(this.inputStream, this.endIdx, this.endIdx);
	  },
	
	  getLineAndColumnMessage: function() {
	    var range = [this.startIdx, this.endIdx];
	    return util.getLineAndColumnMessage(this.inputStream.source, this.startIdx, range);
	  },
	
	  // Returns an array of 0, 1, or 2 intervals that represents the result of the
	  // interval difference operation.
	  minus: function(that) {
	    if (this.inputStream !== that.inputStream) {
	      throw errors.intervalSourcesDontMatch();
	    } else if (this.startIdx === that.startIdx && this.endIdx === that.endIdx) {
	      // `this` and `that` are the same interval!
	      return [
	      ];
	    } else if (this.startIdx < that.startIdx && that.endIdx < this.endIdx) {
	      // `that` splits `this` into two intervals
	      return [
	        new Interval(this.inputStream, this.startIdx, that.startIdx),
	        new Interval(this.inputStream, that.endIdx, this.endIdx)
	      ];
	    } else if (this.startIdx < that.endIdx && that.endIdx < this.endIdx) {
	      // `that` contains a prefix of `this`
	      return [
	        new Interval(this.inputStream, that.endIdx, this.endIdx)
	      ];
	    } else if (this.startIdx < that.startIdx && that.startIdx < this.endIdx) {
	      // `that` contains a suffix of `this`
	      return [
	        new Interval(this.inputStream, this.startIdx, that.startIdx)
	      ];
	    } else {
	      // `that` and `this` do not overlap
	      return [
	        this
	      ];
	    }
	  },
	
	  // Returns a new Interval that has the same extent as this one, but which is relative
	  // to `that`, an Interval that fully covers this one.
	  relativeTo: function(that, newInputStream) {
	    if (this.inputStream !== that.inputStream) {
	      throw errors.intervalSourcesDontMatch();
	    }
	    assert(this.startIdx >= that.startIdx && this.endIdx <= that.endIdx,
	           'other interval does not cover this one');
	    return new Interval(newInputStream,
	                        this.startIdx - that.startIdx,
	                        this.endIdx - that.startIdx);
	  },
	
	  // Returns a new Interval which contains the same contents as this one,
	  // but with whitespace trimmed from both ends. (This only makes sense when
	  // the input stream is a string.)
	  trimmed: function() {
	    var contents = this.contents;
	    var startIdx = this.startIdx + contents.match(/^\s*/)[0].length;
	    var endIdx = this.endIdx - contents.match(/\s*$/)[0].length;
	    return new Interval(this.inputStream, startIdx, endIdx);
	  }
	};
	
	Object.defineProperties(Interval.prototype, {
	  contents: {
	    get: function() {
	      if (this._contents === undefined) {
	        this._contents = this.inputStream.sourceSlice(this.startIdx, this.endIdx);
	      }
	      return this._contents;
	    },
	    enumerable: true
	  }
	});
	
	// --------------------------------------------------------------------
	// Exports
	// --------------------------------------------------------------------
	
	module.exports = Interval;
	
	
	},{"./common":39,"./errors":40,"./util":60}],33:[function(require,module,exports){
	'use strict';
	
	// --------------------------------------------------------------------
	// Imports
	// --------------------------------------------------------------------
	
	var inherits = require('inherits');
	
	var common = require('./common');
	var nodes = require('./nodes');
	var util = require('./util');
	var Interval = require('./Interval');
	
	// --------------------------------------------------------------------
	// Private stuff
	// --------------------------------------------------------------------
	
	// Create a short error message for an error that occurred during matching.
	function getShortMatchErrorMessage(pos, source, detail) {
	  var errorInfo = util.getLineAndColumn(source, pos);
	  return 'Line ' + errorInfo.lineNum + ', col ' + errorInfo.colNum + ': ' + detail;
	}
	
	// ----------------- MatchFailure -----------------
	
	function MatchResult(state) {
	  this.state = state;
	  this._cst = state.bindings[0];
	}
	
	MatchResult.newFor = function(state) {
	  var succeeded = state.bindings.length === 1;
	  return succeeded ? new MatchResult(state) : new MatchFailure(state);
	};
	
	MatchResult.prototype.failed = function() {
	  return false;
	};
	
	MatchResult.prototype.succeeded = function() {
	  return !this.failed();
	};
	
	// Returns a `MatchResult` that can be fed into operations or attributes that care
	// about the whitespace that was implicitly skipped over by syntactic rules. This
	// is useful for doing things with comments, e.g., syntax highlighting.
	MatchResult.prototype.getDiscardedSpaces = function() {
	  if (this.failed()) {
	    return [];
	  }
	
	  var state = this.state;
	  var grammar = state.grammar;
	  var inputStream = state.inputStream;
	
	  var intervals = [new Interval(inputStream, 0, inputStream.source.length)];
	
	  // Subtract the interval of each terminal from the set of intervals above.
	  var s = grammar.semantics().addOperation('subtractTerminals', {
	    _nonterminal: function(children) {
	      children.forEach(function(child) {
	        child.subtractTerminals();
	      });
	    },
	    _terminal: function() {
	      var t = this;
	      intervals = intervals.
	          map(function(interval) { return interval.minus(t.interval); }).
	          reduce(function(xs, ys) { return xs.concat(ys); }, []);
	    }
	  });
	  s(this).subtractTerminals();
	
	  // Now `intervals` holds the intervals of the input stream that were skipped over by syntactic
	  // rules, because they contained spaces.
	
	  // Next, we want to match the contents of each of those intervals with the grammar's `spaces`
	  // rule, to reconstruct the CST nodes that were discarded by syntactic rules. But if we simply
	  // pass each interval's `contents` to the grammar's `match` method, the resulting nodes and
	  // their children will have intervals that are associated with a different input, i.e., a
	  // substring of the original input. The following operation will fix this problem for us.
	  s.addOperation('fixIntervals(idxOffset)', {
	    _default: function(children) {
	      var idxOffset = this.args.idxOffset;
	      this.interval.inputStream = inputStream;
	      this.interval.startIdx += idxOffset;
	      this.interval.endIdx += idxOffset;
	      if (!this.isTerminal()) {
	        children.forEach(function(child) {
	          child.fixIntervals(idxOffset);
	        });
	      }
	    }
	  });
	
	  // Now we're finally ready to reconstruct the discarded CST nodes.
	  var discardedNodes = intervals.map(function(interval) {
	    var r = grammar.match(interval.contents, 'spaces');
	    s(r).fixIntervals(interval.startIdx);
	    return r._cst;
	  });
	
	  // Rather than return a bunch of CST nodes and make the caller of this method loop over them,
	  // we can construct a single CST node that is the parent of all of the discarded nodes. An
	  // `IterationNode` is the obvious choice for this.
	  discardedNodes = new nodes.IterationNode(
	      grammar,
	      discardedNodes,
	      discardedNodes.length === 0 ?
	          new Interval(inputStream, 0, 0) :
	          new Interval(
	              inputStream,
	              discardedNodes[0].interval.startIdx,
	              discardedNodes[discardedNodes.length - 1].interval.endIdx));
	
	  // But remember that a CST node can't be used directly by clients. What we really need to return
	  // from this method is a successful `MatchResult` that can be used with the clients' semantics.
	  // We already have one -- `this` -- but it's got a different CST node inside. So we create a new
	  // object that delegates to `this`, and override its `_cst` property.
	  var r = Object.create(this);
	  r._cst = discardedNodes;
	
	  // We also override its `getDiscardedSpaces` method, in case someone decides to call it.
	  r.getDiscardedSpaces = function() { return r; };
	
	  return r;
	};
	
	// ----------------- MatchFailure -----------------
	
	function MatchFailure(state) {
	  this.state = state;
	  common.defineLazyProperty(this, '_failures', function() {
	    return this.state.getFailures();
	  });
	  common.defineLazyProperty(this, 'message', function() {
	    var source = this.state.inputStream.source;
	    if (typeof source !== 'string') {
	      return 'match failed at position ' + this.getRightmostFailurePosition();
	    }
	
	    var detail = 'Expected ' + this.getExpectedText();
	    return util.getLineAndColumnMessage(source, this.getRightmostFailurePosition()) + detail;
	  });
	  common.defineLazyProperty(this, 'shortMessage', function() {
	    if (typeof this.state.inputStream.source !== 'string') {
	      return 'match failed at position ' + this.getRightmostFailurePosition();
	    }
	    var detail = 'expected ' + this.getExpectedText();
	    return getShortMatchErrorMessage(
	        this.getRightmostFailurePosition(),
	        this.state.inputStream.source,
	        detail);
	  });
	}
	inherits(MatchFailure, MatchResult);
	
	MatchFailure.prototype.toString = function() {
	  return '[MatchFailure at position ' + this.getRightmostFailurePosition() + ']';
	};
	
	MatchFailure.prototype.failed = function() {
	  return true;
	};
	
	MatchFailure.prototype.getRightmostFailurePosition = function() {
	  return this.state.getRightmostFailurePosition();
	};
	
	MatchFailure.prototype.getRightmostFailures = function() {
	  return this._failures;
	};
	
	// Return a string summarizing the expected contents of the input stream when
	// the match failure occurred.
	MatchFailure.prototype.getExpectedText = function() {
	  var sb = new common.StringBuffer();
	  var failures = this.getRightmostFailures();
	
	  // Filter out the fluffy failures to make the default error messages more useful
	  failures = failures.filter(function(failure) {
	    return !failure.isFluffy();
	  });
	
	  for (var idx = 0; idx < failures.length; idx++) {
	    if (idx > 0) {
	      if (idx === failures.length - 1) {
	        sb.append((failures.length > 2 ? ', or ' : ' or '));
	      } else {
	        sb.append(', ');
	      }
	    }
	    sb.append(failures[idx].toString());
	  }
	  return sb.contents();
	};
	
	MatchFailure.prototype.getInterval = function() {
	  var pos = this.state.getRightmostFailurePosition();
	  return new Interval(this.state.inputStream, pos, pos);
	};
	
	// --------------------------------------------------------------------
	// Exports
	// --------------------------------------------------------------------
	
	module.exports = MatchResult;
	
	},{"./Interval":32,"./common":39,"./nodes":42,"./util":60,"inherits":24}],34:[function(require,module,exports){
	'use strict';
	
	// --------------------------------------------------------------------
	// Imports
	// --------------------------------------------------------------------
	
	var extend = require('util-extend');
	
	// --------------------------------------------------------------------
	// Private stuff
	// --------------------------------------------------------------------
	
	function Namespace() {
	}
	Namespace.prototype = Object.create(null);
	
	Namespace.asNamespace = function(objOrNamespace) {
	  if (objOrNamespace instanceof Namespace) {
	    return objOrNamespace;
	  }
	  return Namespace.createNamespace(objOrNamespace);
	};
	
	// Create a new namespace. If `optProps` is specified, all of its properties
	// will be copied to the new namespace.
	Namespace.createNamespace = function(optProps) {
	  return Namespace.extend(Namespace.prototype, optProps);
	};
	
	// Create a new namespace which extends another namespace. If `optProps` is
	// specified, all of its properties will be copied to the new namespace.
	Namespace.extend = function(namespace, optProps) {
	  if (namespace !== Namespace.prototype && !(namespace instanceof Namespace)) {
	    throw new TypeError('not a Namespace object: ' + namespace);
	  }
	  var ns = Object.create(namespace, {
	    constructor: {
	      value: Namespace,
	      enumerable: false,
	      writable: true,
	      configurable: true
	    }
	  });
	  return extend(ns, optProps);
	};
	
	// TODO: Should this be a regular method?
	Namespace.toString = function(ns) {
	  return Object.prototype.toString.call(ns);
	};
	
	// --------------------------------------------------------------------
	// Exports
	// --------------------------------------------------------------------
	
	module.exports = Namespace;
	
	},{"util-extend":26}],35:[function(require,module,exports){
	'use strict';
	
	// --------------------------------------------------------------------
	// Private stuff
	// --------------------------------------------------------------------
	
	function PosInfo(state) {
	  this.state = state;
	  this.applicationMemoKeyStack = [];  // a stack of "memo keys" of the active applications
	  this.memo = {};
	  this.currentLeftRecursion = undefined;
	}
	
	PosInfo.prototype = {
	  isActive: function(application) {
	    return this.applicationMemoKeyStack.indexOf(application.toMemoKey()) >= 0;
	  },
	
	  enter: function(application) {
	    this.state.enter(application);
	    this.applicationMemoKeyStack.push(application.toMemoKey());
	  },
	
	  exit: function() {
	    this.state.exit();
	    this.applicationMemoKeyStack.pop();
	  },
	
	  startLeftRecursion: function(headApplication, memoRec) {
	    memoRec.isLeftRecursion = true;
	    memoRec.headApplication = headApplication;
	    memoRec.nextLeftRecursion = this.currentLeftRecursion;
	    this.currentLeftRecursion = memoRec;
	
	    var applicationMemoKeyStack = this.applicationMemoKeyStack;
	    var indexOfFirstInvolvedRule = applicationMemoKeyStack.indexOf(headApplication.toMemoKey()) + 1;
	    var involvedApplicationMemoKeys = applicationMemoKeyStack.slice(indexOfFirstInvolvedRule);
	
	    memoRec.isInvolved = function(applicationMemoKey) {
	      return involvedApplicationMemoKeys.indexOf(applicationMemoKey) >= 0;
	    };
	
	    memoRec.updateInvolvedApplicationMemoKeys = function() {
	      for (var idx = indexOfFirstInvolvedRule; idx < applicationMemoKeyStack.length; idx++) {
	        var applicationMemoKey = applicationMemoKeyStack[idx];
	        if (!this.isInvolved(applicationMemoKey)) {
	          involvedApplicationMemoKeys.push(applicationMemoKey);
	        }
	      }
	    };
	  },
	
	  endLeftRecursion: function() {
	    this.currentLeftRecursion = this.currentLeftRecursion.nextLeftRecursion;
	  },
	
	  // Note: this method doesn't get called for the "head" of a left recursion -- for LR heads,
	  // the memoized result (which starts out being a failure) is always used.
	  shouldUseMemoizedResult: function(memoRec) {
	    if (!memoRec.isLeftRecursion) {
	      return true;
	    }
	    var applicationMemoKeyStack = this.applicationMemoKeyStack;
	    for (var idx = 0; idx < applicationMemoKeyStack.length; idx++) {
	      var applicationMemoKey = applicationMemoKeyStack[idx];
	      if (memoRec.isInvolved(applicationMemoKey)) {
	        return false;
	      }
	    }
	    return true;
	  }
	};
	
	// --------------------------------------------------------------------
	// Exports
	// --------------------------------------------------------------------
	
	module.exports = PosInfo;
	
	},{}],36:[function(require,module,exports){
	'use strict';
	
	// --------------------------------------------------------------------
	// Imports
	// --------------------------------------------------------------------
	
	var Symbol = require('es6-symbol');  // eslint-disable-line no-undef
	var inherits = require('inherits');
	
	var MatchResult = require('./MatchResult');
	var IterationNode = require('./nodes').IterationNode;
	var common = require('./common');
	
	// --------------------------------------------------------------------
	// Private stuff
	// --------------------------------------------------------------------
	
	// ----------------- Wrappers -----------------
	
	// Wrappers decorate CST nodes with all of the functionality (i.e., operations and attributes)
	// provided by a Semantics (see below). `Wrapper` is the abstract superclass of all wrappers. A
	// `Wrapper` must have `_node` and `_semantics` instance variables, which refer to the CST node and
	// Semantics (resp.) for which it was created, and a `_childWrappers` instance variable which is
	// used to cache the wrapper instances that are created for its child nodes. Setting these instance
	// variables is the responsibility of the constructor of each Semantics-specific subclass of
	// `Wrapper`.
	function Wrapper() {}
	
	Wrapper.prototype.toString = function() {
	  return '[semantics wrapper for ' + this._node.grammar.name + ']';
	};
	
	// Returns the wrapper of the specified child node. Child wrappers are created lazily and cached in
	// the parent wrapper's `_childWrappers` instance variable.
	Wrapper.prototype.child = function(idx) {
	  if (!(0 <= idx && idx < this._node.numChildren())) {
	    // TODO: Consider throwing an exception here.
	    return undefined;
	  }
	  var childWrapper = this._childWrappers[idx];
	  if (!childWrapper) {
	    childWrapper = this._childWrappers[idx] = this._semantics.wrap(this._node.childAt(idx));
	  }
	  return childWrapper;
	};
	
	// Returns an array containing the wrappers of all of the children of the node associated with this
	// wrapper.
	Wrapper.prototype._children = function() {
	  // Force the creation of all child wrappers
	  for (var idx = 0; idx < this._node.numChildren(); idx++) {
	    this.child(idx);
	  }
	  return this._childWrappers;
	};
	
	// Returns `true` if the CST node associated with this wrapper corresponds to an iteration
	// expression, i.e., a Kleene-*, Kleene-+, or an optional. Returns `false` otherwise.
	Wrapper.prototype.isIteration = function() {
	  return this._node.isIteration();
	};
	
	// Returns `true` if the CST node associated with this wrapper is a terminal node, `false`
	// otherwise.
	Wrapper.prototype.isTerminal = function() {
	  return this._node.isTerminal();
	};
	
	// Returns `true` if the CST node associated with this wrapper is a nonterminal node, `false`
	// otherwise.
	Wrapper.prototype.isNonterminal = function() {
	  return this._node.isNonterminal();
	};
	
	// Returns `true` if the CST node associated with this wrapper is a nonterminal node
	// corresponding to a syntactic rule, `false` otherwise.
	Wrapper.prototype.isSyntactic = function() {
	  return this.isNonterminal() && this._node.isSyntactic();
	};
	
	// Returns `true` if the CST node associated with this wrapper is a nonterminal node
	// corresponding to a lexical rule, `false` otherwise.
	Wrapper.prototype.isLexical = function() {
	  return this.isNonterminal() && this._node.isLexical();
	};
	
	// Returns `true` if the CST node associated with this wrapper is an iterator node
	// having either one or no child (? operator), `false` otherwise.
	// Otherwise, throws an exception.
	Wrapper.prototype.isOptional = function() {
	  return this._node.isOptional();
	};
	
	// Create a new IterationNode in the same semantics as this wrapper.
	Wrapper.prototype.iteration = function(optElements) {
	  var iter = new IterationNode(this._node.grammar, optElements || [], this.interval, false);
	  return this._semantics.wrap(iter);
	};
	
	Object.defineProperties(Wrapper.prototype, {
	  // Returns an array containing the children of this CST node.
	  children: {get: function() { return this._children(); }},
	
	  // Returns the name of grammar rule that created this CST node.
	  ctorName: {get: function() { return this._node.ctorName; }},
	
	  // Returns the interval consumed by the CST node associated with this wrapper.
	  interval: {get: function() { return this._node.interval; }},
	
	  // Returns the number of children of this CST node.
	  numChildren: {get: function() { return this._node.numChildren(); }},
	
	  // Returns the primitive value of this CST node, if it's a terminal node. Otherwise,
	  // throws an exception.
	  primitiveValue: {
	    get: function() {
	      if (this.isTerminal()) {
	        return this._node.primitiveValue;
	      }
	      throw new TypeError(
	          "tried to access the 'primitiveValue' attribute of a non-terminal CST node");
	    }
	  }
	});
	
	// ----------------- Semantics -----------------
	
	// A Semantics is a container for a family of Operations and Attributes for a given grammar.
	// Semantics enable modularity (different clients of a grammar can create their set of operations
	// and attributes in isolation) and extensibility even when operations and attributes are mutually-
	// recursive. This constructor should not be called directly except from
	// `Semantics.createSemantics`. The normal ways to create a Semantics, given a grammar 'g', are
	// `g.semantics()` and `g.extendSemantics(parentSemantics)`.
	function Semantics(grammar, superSemantics) {
	  var self = this;
	  this.grammar = grammar;
	  this.checkedActionDicts = false;
	
	  // Constructor for wrapper instances, which are passed as the arguments to the semantic actions
	  // of an operation or attribute. Operations and attributes require double dispatch: the semantic
	  // action is chosen based on both the node's type and the semantics. Wrappers ensure that
	  // the `execute` method is called with the correct (most specific) semantics object as an
	  // argument.
	  this.Wrapper = function(node) {
	    self.checkActionDictsIfHaventAlready();
	    this._semantics = self;
	    this._node = node;
	    this._childWrappers = [];
	  };
	
	  this.super = superSemantics;
	  if (superSemantics) {
	    if (grammar !== this.super.grammar && !grammar._inheritsFrom(this.super.grammar)) {
	      throw new Error(
	          "Cannot extend a semantics for grammar '" + this.super.grammar.name +
	          "' for use with grammar '" + grammar.name + "' (not a sub-grammar)");
	    }
	    inherits(this.Wrapper, this.super.Wrapper);
	    this.operations = Object.create(this.super.operations);
	    this.attributes = Object.create(this.super.attributes);
	    this.attributeKeys = Object.create(null);
	
	    // Assign unique symbols for each of the attributes inherited from the super-semantics so that
	    // they are memoized independently.
	    for (var attributeName in this.attributes) {
	      this.attributeKeys[attributeName] = Symbol();
	    }
	  } else {
	    inherits(this.Wrapper, Wrapper);
	    this.operations = Object.create(null);
	    this.attributes = Object.create(null);
	    this.attributeKeys = Object.create(null);
	  }
	}
	
	Semantics.prototype.toString = function() {
	  return '[semantics for ' + this.grammar.name + ']';
	};
	
	Semantics.prototype.checkActionDictsIfHaventAlready = function() {
	  if (!this.checkedActionDicts) {
	    this.checkActionDicts();
	    this.checkedActionDicts = true;
	  }
	};
	
	// Checks that the action dictionaries for all operations and attributes in this semantics,
	// including the ones that were inherited from the super-semantics, agree with the grammar.
	// Throws an exception if one or more of them doesn't.
	Semantics.prototype.checkActionDicts = function() {
	  for (var name in this.operations) {
	    this.operations[name].checkActionDict(this.grammar);
	  }
	  for (name in this.attributes) {
	    this.attributes[name].checkActionDict(this.grammar);
	  }
	};
	
	var prototypeGrammar;
	var prototypeGrammarSemantics;
	
	// This method is called from main.js once Ohm has loaded.
	Semantics.initPrototypeParser = function(grammar) {
	  prototypeGrammarSemantics = grammar.semantics().addOperation('parse', {
	    NameNoFormals: function(n) {
	      return {
	        name: n.parse(),
	        formals: []
	      };
	    },
	    NameAndFormals: function(n, fs) {
	      return {
	        name: n.parse(),
	        formals: fs.parse()[0] || []
	      };
	    },
	    Formals: function(oparen, fs, cparen) {
	      return fs.asIteration().parse();
	    },
	    name: function(first, rest) {
	      return this.interval.contents;
	    }
	  });
	  prototypeGrammar = grammar;
	};
	
	function parsePrototype(nameAndFormalArgs, allowFormals) {
	  if (!prototypeGrammar) {
	    // The Operations and Attributes grammar won't be available while Ohm is loading,
	    // but we can get away the following simplification b/c none of the operations
	    // that are used while loading take arguments.
	    common.assert(nameAndFormalArgs.indexOf('(') === -1);
	    return {
	      name: nameAndFormalArgs,
	      formals: []
	    };
	  }
	
	  var r = prototypeGrammar.match(
	      nameAndFormalArgs,
	      allowFormals ? 'NameAndFormals' : 'NameNoFormals');
	  if (r.failed()) {
	    throw new Error(r.message);
	  }
	
	  return prototypeGrammarSemantics(r).parse();
	}
	
	Semantics.prototype.addOperationOrAttribute = function(type, nameAndFormalArgs, actionDict) {
	  var typePlural = type + 's';
	
	  var parsedNameAndFormalArgs = parsePrototype(nameAndFormalArgs, type === 'operation');
	  var name = parsedNameAndFormalArgs.name;
	  var formals = parsedNameAndFormalArgs.formals;
	
	  // TODO: check that there are no duplicate formal arguments
	
	  this.assertNewName(name, type);
	
	  // Create the action dictionary for this operation / attribute that contains a `_default` action
	  // which defines the default behavior of iteration, terminal, and non-terminal nodes...
	  var realActionDict = {
	    _default: function(children) {
	      var self = this;
	      var thisThing = this._semantics[typePlural][name];
	      var args = thisThing.formals.map(function(formal) {
	        return self.args[formal];
	      });
	
	      if (this.isIteration()) {
	        // This CST node corresponds to an iteration expression in the grammar (*, +, or ?). The
	        // default behavior is to map this operation or attribute over all of its child nodes.
	        return children.map(function(child) { return doIt.apply(child, args); });
	      }
	
	      if (this.isTerminal()) {
	        // This CST node corresponds to a terminal expression in the grammar (e.g., "+"). The
	        // default behavior is to return that terminal's primitive value.
	        return this.primitiveValue;
	      }
	
	      // This CST node corresponds to a non-terminal in the grammar (e.g., AddExpr). The fact that
	      // we got here means that this action dictionary doesn't have an action for this particular
	      // non-terminal or a generic `_nonterminal` action.
	      if (children.length === 1) {
	        // As a convenience, if this node only has one child, we just return the result of
	        // applying this operation / attribute to the child node.
	        return doIt.apply(children[0], args);
	      } else {
	        // Otherwise, we throw an exception to let the programmer know that we don't know what
	        // to do with this node.
	        throw new Error(
	            'Missing semantic action for ' + this.ctorName + ' in ' + name + ' ' + type);
	      }
	    }
	  };
	  // ... and add in the actions supplied by the programmer, which may override some or all of the
	  // default ones.
	  Object.keys(actionDict).forEach(function(name) {
	    realActionDict[name] = actionDict[name];
	  });
	
	  var entry = type === 'operation' ?
	      new Operation(name, formals, realActionDict) :
	      new Attribute(name, realActionDict);
	
	  // The following check is not strictly necessary (it will happen later anyway) but it's better to
	  // catch errors early.
	  entry.checkActionDict(this.grammar);
	
	  this[typePlural][name] = entry;
	
	  function doIt() {
	    // Dispatch to most specific version of this operation / attribute -- it may have been
	    // overridden by a sub-semantics.
	    var thisThing = this._semantics[typePlural][name];
	
	    // Check that the caller passed the correct number of arguments.
	    if (arguments.length !== thisThing.formals.length) {
	      throw new Error(
	          'Invalid number of arguments passed to ' + name + ' ' + type + ' (expected ' +
	          thisThing.formals.length + ', got ' + arguments.length + ')');
	    }
	
	    // Create an "arguments object" from the arguments that were passed to this
	    // operation / attribute.
	    var args = Object.create(null);
	    for (var idx = 0; idx < arguments.length; idx++) {
	      var formal = thisThing.formals[idx];
	      args[formal] = arguments[idx];
	    }
	
	    var oldArgs = this.args;
	    this.args = args;
	    var ans = thisThing.execute(this._semantics, this);
	    this.args = oldArgs;
	    return ans;
	  }
	
	  if (type === 'operation') {
	    this.Wrapper.prototype[name] = doIt;
	    this.Wrapper.prototype[name].toString = function() {
	      return '[' + name + ' operation]';
	    };
	  } else {
	    Object.defineProperty(this.Wrapper.prototype, name, {get: doIt});
	    this.attributeKeys[name] = Symbol();
	  }
	};
	
	Semantics.prototype.extendOperationOrAttribute = function(type, name, actionDict) {
	  var typePlural = type + 's';
	
	  // Make sure that `name` really is just a name, i.e., that it doesn't also contain formals.
	  parsePrototype(name, false);
	
	  if (!(this.super && name in this.super[typePlural])) {
	    throw new Error('Cannot extend ' + type + " '" + name +
	        "': did not inherit an " + type + ' with that name');
	  }
	  if (Object.prototype.hasOwnProperty.call(this[typePlural], name)) {
	    throw new Error('Cannot extend ' + type + " '" + name + "' again");
	  }
	
	  // Create a new operation / attribute whose actionDict delegates to the super operation /
	  // attribute's actionDict, and which has all the keys from `inheritedActionDict`.
	  var inheritedFormals = this[typePlural][name].formals;
	  var inheritedActionDict = this[typePlural][name].actionDict;
	  var newActionDict = Object.create(inheritedActionDict);
	  Object.keys(actionDict).forEach(function(name) {
	    newActionDict[name] = actionDict[name];
	  });
	
	  this[typePlural][name] = type === 'operation' ?
	      new Operation(name, inheritedFormals, newActionDict) :
	      new Attribute(name, newActionDict);
	
	  // The following check is not strictly necessary (it will happen later anyway) but it's better to
	  // catch errors early.
	  this[typePlural][name].checkActionDict(this.grammar);
	};
	
	Semantics.prototype.assertNewName = function(name, type) {
	  if (Wrapper.prototype.hasOwnProperty(name)) {
	    throw new Error(
	        'Cannot add ' + type + " '" + name + "': that's a reserved name");
	  }
	  if (name in this.operations) {
	    throw new Error(
	        'Cannot add ' + type + " '" + name + "': an operation with that name already exists");
	  }
	  if (name in this.attributes) {
	    throw new Error(
	        'Cannot add ' + type + " '" + name + "': an attribute with that name already exists");
	  }
	};
	
	// Returns a wrapper for the given CST `node` in this semantics.
	// If `node` is already a wrapper, returns `node` itself.  // TODO: why is this needed?
	Semantics.prototype.wrap = function(node) {
	  return node instanceof this.Wrapper ? node : new this.Wrapper(node);
	};
	
	// Creates a new Semantics instance for `grammar`, inheriting operations and attributes from
	// `optSuperSemantics`, if it is specified. Returns a function that acts as a proxy for the new
	// Semantics instance. When that function is invoked with a CST node as an argument, it returns
	// a wrapper for that node which gives access to the operations and attributes provided by this
	// semantics.
	Semantics.createSemantics = function(grammar, optSuperSemantics) {
	  var s = new Semantics(
	      grammar,
	      optSuperSemantics !== undefined ?
	          optSuperSemantics :
	          Semantics.BuiltInSemantics._getSemantics());
	
	  // To enable clients to invoke a semantics like a function, return a function that acts as a proxy
	  // for `s`, which is the real `Semantics` instance.
	  var proxy = function ASemantics(matchResult) {
	    if (!(matchResult instanceof MatchResult)) {
	      throw new TypeError(
	          'Semantics expected a MatchResult, but got ' + common.unexpectedObjToString(matchResult));
	    }
	    if (!matchResult.succeeded()) {
	      throw new TypeError(
	          'cannot apply Semantics to ' + matchResult.toString());
	    }
	
	    var cst = matchResult._cst;
	    if (cst.grammar !== grammar) {
	      throw new Error(
	          "Cannot use a CST node created by grammar '" + cst.grammar.name +
	          "' with a semantics for '" + grammar.name + "'");
	    }
	    return s.wrap(cst);
	  };
	
	  // Forward public methods from the proxy to the semantics instance.
	  proxy.addOperation = function(nameAndFormalArgs, actionDict) {
	    s.addOperationOrAttribute.call(s, 'operation', nameAndFormalArgs, actionDict);
	    return proxy;
	  };
	  proxy.getOperation = function(operationName){
	    return s.operations[operationName];
	  }
	  proxy.extendOperation = function(name, actionDict) {
	    s.extendOperationOrAttribute.call(s, 'operation', name, actionDict);
	    return proxy;
	  };
	  proxy.addAttribute = function(name, actionDict) {
	    s.addOperationOrAttribute.call(s, 'attribute', name, actionDict);
	    return proxy;
	  };
	  proxy.extendAttribute = function(name, actionDict) {
	    s.extendOperationOrAttribute.call(s, 'attribute', name, actionDict);
	    return proxy;
	  };
	
	  // Make the proxy's toString() work.
	  proxy.toString = s.toString.bind(s);
	
	  // Returns the semantics for the proxy.
	  proxy._getSemantics = function() {
	    return s;
	  };
	
	  return proxy;
	};
	
	Semantics.initBuiltInSemantics = function(builtInRules) {
	  var actions = {
	    empty: function() {
	      return this.iteration();
	    },
	    nonEmpty: function(first, _, rest) {
	      return this.iteration([first].concat(rest.children));
	    }
	  };
	
	  Semantics.BuiltInSemantics = Semantics
	      .createSemantics(builtInRules, null)
	      .addOperation('asIteration', {
	        emptyListOf: actions.empty,
	        nonemptyListOf: actions.nonEmpty,
	        EmptyListOf: actions.empty,
	        NonemptyListOf: actions.nonEmpty
	      });
	};
	
	// ----------------- Operation -----------------
	
	// An Operation represents a function to be applied to a concrete syntax tree (CST) -- it's very
	// similar to a Visitor (http://en.wikipedia.org/wiki/Visitor_pattern). An operation is executed by
	// recursively walking the CST, and at each node, invoking the matching semantic action from
	// `actionDict`. See `Operation.prototype.execute` for details of how a CST node's matching semantic
	// action is found.
	function Operation(name, formals, actionDict) {
	  this.name = name;
	  this.formals = formals;
	  this.actionDict = actionDict;
	}
	
	Operation.prototype.typeName = 'operation';
	
	Operation.prototype.checkActionDict = function(grammar) {
	  grammar._checkTopDownActionDict(this.typeName, this.name, this.actionDict);
	};
	
	// Execute this operation on the CST node associated with `nodeWrapper` in the context of the given
	// Semantics instance.
	Operation.prototype.execute = function(semantics, nodeWrapper) {
	  // Look for a semantic action whose name matches the node's constructor name, which is either the
	  // name of a rule in the grammar, or '_terminal' (for a terminal node), or '_iter' (for an
	  // iteration node). In the latter case, the action function receives a single argument, which is
	  // an array containing all of the children of the CST node.
	  var actionFn = this.actionDict[nodeWrapper._node.ctorName];
	  if (actionFn) {
	    return this.doAction(semantics, nodeWrapper, actionFn, nodeWrapper.isIteration());
	  }
	
	  // The action dictionary does not contain a semantic action for this specific type of node.
	  // If this is a nonterminal node and the programmer has provided a `_nonterminal` semantic
	  // action, we invoke it:
	  if (nodeWrapper.isNonterminal()) {
	    actionFn = this.actionDict._nonterminal;
	    if (actionFn) {
	      return this.doAction(semantics, nodeWrapper, actionFn, true);
	    }
	  }
	
	  // Otherwise, we invoke the '_default' semantic action.
	  return this.doAction(semantics, nodeWrapper, this.actionDict._default, true);
	};
	
	// Invoke `actionFn` on the CST node that corresponds to `nodeWrapper`, in the context of
	// `semantics`. If `optPassChildrenAsArray` is truthy, `actionFn` will be called with a single
	// argument, which is an array of wrappers. Otherwise, the number of arguments to `actionFn` will
	// be equal to the number of children in the CST node.
	Operation.prototype.doAction = function(semantics, nodeWrapper, actionFn, optPassChildrenAsArray) {
	  return optPassChildrenAsArray ?
	      actionFn.call(nodeWrapper, nodeWrapper._children()) :
	      actionFn.apply(nodeWrapper, nodeWrapper._children());
	};
	
	// ----------------- Attribute -----------------
	
	// Attributes are Operations whose results are memoized. This means that, for any given semantics,
	// the semantic action for a CST node will be invoked no more than once.
	function Attribute(name, actionDict) {
	  this.name = name;
	  this.formals = [];
	  this.actionDict = actionDict;
	}
	inherits(Attribute, Operation);
	
	Attribute.prototype.typeName = 'attribute';
	
	Attribute.prototype.execute = function(semantics, nodeWrapper) {
	  var node = nodeWrapper._node;
	  var key = semantics.attributeKeys[this.name];
	  if (!node.hasOwnProperty(key)) {
	    // The following is a super-send -- isn't JS beautiful? :/
	    node[key] = Operation.prototype.execute.call(this, semantics, nodeWrapper);
	  }
	  return node[key];
	};
	
	// --------------------------------------------------------------------
	// Exports
	// --------------------------------------------------------------------
	
	module.exports = Semantics;
	
	},{"./MatchResult":33,"./common":39,"./nodes":42,"es6-symbol":6,"inherits":24}],37:[function(require,module,exports){
	'use strict';
	
	// --------------------------------------------------------------------
	// Imports
	// --------------------------------------------------------------------
	
	var PosInfo = require('./PosInfo');
	var Trace = require('./Trace');
	var pexprs = require('./pexprs');
	// --------------------------------------------------------------------
	// Private stuff
	// --------------------------------------------------------------------
	
	var RM_RIGHTMOST_FAILURE_POSITION = 0;
	var RM_RIGHTMOST_FAILURES = 1;
	
	var applySpaces = new pexprs.Apply('spaces');
	
	function State(grammar, inputStream, startRule, opts) {
	  this.grammar = grammar;
	  this.origInputStream = inputStream;
	  this.startRule = startRule;
	  this.tracingEnabled = opts.trace || false;
	  this.matchNodes = opts.matchNodes || false;
	  this.init(RM_RIGHTMOST_FAILURE_POSITION);
	}
	
	State.prototype = {
	  init: function(recordingMode) {
	    this.bindings = [];
	
	    this.inputStreamStack = [];
	    this.posInfosStack = [];
	    this.pushInputStream(this.origInputStream);
	
	    this.applicationStack = [];
	    this.inLexifiedContextStack = [false];
	
	    this.recordingMode = recordingMode;
	    if (recordingMode === RM_RIGHTMOST_FAILURE_POSITION) {
	      this.rightmostFailurePosition = -1;
	    } else if (recordingMode === RM_RIGHTMOST_FAILURES) {
	      // We always run in *rightmost failure position* recording mode before running in
	      // *rightmost failures* recording mode. And since the traces generated by each of
	      // these passes would be identical, there's no need to record it now if we have
	      // already recorded it in the first pass.
	      this.tracingEnabled = false;
	    } else {
	      throw new Error('invalid recording mode: ' + recordingMode);
	    }
	
	    if (this.isTracing()) {
	      this.trace = [];
	    }
	  },
	
	  enter: function(app) {
	    this.applicationStack.push(app);
	    this.inLexifiedContextStack.push(false);
	  },
	
	  exit: function() {
	    this.applicationStack.pop();
	    this.inLexifiedContextStack.pop();
	  },
	
	  enterLexifiedContext: function() {
	    this.inLexifiedContextStack.push(true);
	  },
	
	  exitLexifiedContext: function() {
	    this.inLexifiedContextStack.pop();
	  },
	
	  currentApplication: function() {
	    return this.applicationStack[this.applicationStack.length - 1];
	  },
	
	  inSyntacticRule: function() {
	    if (typeof this.inputStream.source !== 'string') {
	      return false;
	    }
	    var currentApplication = this.currentApplication();
	    return currentApplication && currentApplication.isSyntactic();
	  },
	
	  inSyntacticContext: function() {
	    return this.inSyntacticRule() && !this.inLexifiedContext();
	  },
	
	  inLexifiedContext: function() {
	    return this.inLexifiedContextStack[this.inLexifiedContextStack.length - 1];
	  },
	
	  skipSpaces: function() {
	    var origFailuresInfo = this.getFailuresInfo();
	    this.eval(applySpaces);
	    this.bindings.pop();
	    this.restoreFailuresInfo(origFailuresInfo);
	    return this.inputStream.pos;
	  },
	
	  skipSpacesIfInSyntacticContext: function() {
	    return this.inSyntacticContext() ?
	        this.skipSpaces() :
	        this.inputStream.pos;
	  },
	
	  truncateBindings: function(newLength) {
	    // TODO: is this really faster than setting the `length` property?
	    while (this.bindings.length > newLength) {
	      this.bindings.pop();
	    }
	  },
	
	  pushInputStream: function(inputStream) {
	    this.inputStreamStack.push(this.inputStream);
	    this.posInfosStack.push(this.posInfos);
	    this.inputStream = inputStream;
	    this.posInfos = [];
	  },
	
	  popInputStream: function() {
	    this.inputStream = this.inputStreamStack.pop();
	    this.posInfos = this.posInfosStack.pop();
	  },
	
	  getCurrentPosInfo: function() {
	    return this.getPosInfo(this.inputStream.pos);
	  },
	
	  getPosInfo: function(pos) {
	    var posInfo = this.posInfos[pos];
	    return posInfo || (this.posInfos[pos] = new PosInfo(this));
	  },
	
	  processFailure: function(pos, expr) {
	    if (this.recordingMode === RM_RIGHTMOST_FAILURE_POSITION) {
	      if (pos > this.rightmostFailurePosition) {
	        this.rightmostFailurePosition = pos;
	      }
	    } else /* if (this.recordingMode === RM_RIGHTMOST_FAILURES) */
	        if (pos === this.rightmostFailurePosition) {
	          // We're only interested in failures at the rightmost failure position that haven't
	          // already been recorded.
	
	          this.addRightmostFailure(expr.toFailure(this.grammar), false);
	        }
	  },
	
	  ensureRightmostFailures: function() {
	    if (!this.rightmostFailures) {
	      this.rightmostFailures = Object.create(null);
	    }
	  },
	
	  addRightmostFailure: function(failure, shouldCloneIfNew) {
	    this.ensureRightmostFailures();
	    var key = failure.toKey();
	    if (!this.rightmostFailures[key]) {
	      this.rightmostFailures[key] = shouldCloneIfNew ? failure.clone() : failure;
	    } else if (this.rightmostFailures[key].isFluffy() && !failure.isFluffy()) {
	      this.rightmostFailures[key].clearFluffy();
	    }
	  },
	
	  addRightmostFailures: function(failures, shouldCloneIfNew) {
	    var self = this;
	    Object.keys(failures).forEach(function(key) {
	      self.addRightmostFailure(failures[key], shouldCloneIfNew);
	    });
	  },
	
	  cloneRightmostFailures: function() {
	    if (!this.rightmostFailures) {
	      return undefined;
	    }
	
	    var ans = Object.create(null);
	    var self = this;
	    Object.keys(this.rightmostFailures).forEach(function(key) {
	      ans[key] = self.rightmostFailures[key].clone();
	    });
	    return ans;
	  },
	
	  getRightmostFailurePosition: function() {
	    return this.rightmostFailurePosition;
	  },
	
	  getFailures: function() {
	    if (this.recordingMode === RM_RIGHTMOST_FAILURE_POSITION) {
	      // Rewind, then try to match the input again, recording failures.
	      this.init(RM_RIGHTMOST_FAILURES);
	      this.eval(new pexprs.Apply(this.startRule));
	    }
	
	    this.ensureRightmostFailures();
	    var self = this;
	    return Object.keys(this.rightmostFailures).map(function(key) {
	      return self.rightmostFailures[key];
	    });
	  },
	
	  // Returns the memoized trace entry for `expr` at `pos`, if one exists, `null` otherwise.
	  getMemoizedTraceEntry: function(pos, expr) {
	    var posInfo = this.posInfos[pos];
	    if (posInfo && expr.ruleName) {
	      var memoRec = posInfo.memo[expr.toMemoKey()];
	      if (memoRec) {
	        return memoRec.traceEntry;
	      }
	    }
	    return null;
	  },
	
	  // Returns a new trace entry, with the currently active trace array as its children.
	  getTraceEntry: function(pos, expr, result) {
	    var memoEntry = this.getMemoizedTraceEntry(pos, expr);
	    return memoEntry ? memoEntry.cloneWithExpr(expr)
	                     : new Trace(this.inputStream, pos, expr, result, this.trace);
	  },
	
	  isTracing: function() {
	    return this.tracingEnabled;
	  },
	
	  useMemoizedResult: function(memoRec) {
	    if (this.isTracing()) {
	      this.trace.push(memoRec.traceEntry);
	    }
	
	    if (this.recordingMode === RM_RIGHTMOST_FAILURES && memoRec.failuresAtRightmostPosition) {
	      this.addRightmostFailures(memoRec.failuresAtRightmostPosition, true);
	    }
	
	    if (memoRec.value) {
	      this.inputStream.pos = memoRec.pos;
	      this.bindings.push(memoRec.value);
	      return true;
	    }
	    return false;
	  },
	
	  // Evaluate `expr` and return `true` if it succeeded, `false` otherwise. On success, `bindings`
	  // will have `expr.getArity()` more elements than before, and the input stream's position may
	  // have increased. On failure, `bindings` and position will be unchanged.
	  eval: function(expr) {
	    var inputStream = this.inputStream;
	    var origPos = inputStream.pos;
	    var origNumBindings = this.bindings.length;
	
	    if (this.recordingMode === RM_RIGHTMOST_FAILURES) {
	      var origFailures = this.rightmostFailures;
	      this.rightmostFailures = undefined;
	    }
	
	    if (this.isTracing()) {
	      var origTrace = this.trace;
	      this.trace = [];
	    }
	
	    // Do the actual evaluation.
	    var ans = expr.eval(this);
	
	    if (this.isTracing()) {
	      var traceEntry = this.getTraceEntry(origPos, expr, ans);
	      origTrace.push(traceEntry);
	      this.trace = origTrace;
	    }
	
	    if (ans) {
	      if (this.rightmostFailures &&
	        (inputStream.pos === this.rightmostFailurePosition ||
	         this.skipSpacesIfInSyntacticContext() === this.rightmostFailurePosition)) {
	        var self = this;
	        Object.keys(this.rightmostFailures).forEach(function(key) {
	          self.rightmostFailures[key].makeFluffy();
	        });
	      }
	    } else {
	      // Reset the position and the bindings.
	      inputStream.pos = origPos;
	      this.truncateBindings(origNumBindings);
	    }
	
	    if (this.recordingMode === RM_RIGHTMOST_FAILURES && origFailures) {
	      this.addRightmostFailures(origFailures, false);
	    }
	
	    return ans;
	  },
	
	  getFailuresInfo: function() {
	    if (this.recordingMode === RM_RIGHTMOST_FAILURE_POSITION) {
	      return this.rightmostFailurePosition;
	    } else /* if (this.recordingMode === RM_RIGHTMOST_FAILURES) */ {
	      return this.rightmostFailures;
	    }
	  },
	
	  restoreFailuresInfo: function(failuresInfo) {
	    if (this.recordingMode === RM_RIGHTMOST_FAILURE_POSITION) {
	      this.rightmostFailurePosition = failuresInfo;
	    } else /* if (this.recordingMode === RM_RIGHTMOST_FAILURES) */ {
	      this.rightmostFailures = failuresInfo;
	    }
	  },
	
	  applySpaces: applySpaces
	};
	
	// --------------------------------------------------------------------
	// Exports
	// --------------------------------------------------------------------
	
	module.exports = State;
	
	},{"./PosInfo":35,"./Trace":38,"./pexprs":59}],38:[function(require,module,exports){
	'use strict';
	
	// --------------------------------------------------------------------
	// Imports
	// --------------------------------------------------------------------
	
	var Interval = require('./Interval');
	var common = require('./common');
	
	// --------------------------------------------------------------------
	// Private stuff
	// --------------------------------------------------------------------
	
	// Unicode characters that are used in the `toString` output.
	var BALLOT_X = '\u2717';
	var CHECK_MARK = '\u2713';
	var DOT_OPERATOR = '\u22C5';
	var RIGHTWARDS_DOUBLE_ARROW = '\u21D2';
	var SYMBOL_FOR_HORIZONTAL_TABULATION = '\u2409';
	var SYMBOL_FOR_LINE_FEED = '\u240A';
	var SYMBOL_FOR_CARRIAGE_RETURN = '\u240D';
	
	function linkLeftRecursiveChildren(children) {
	  for (var i = 0; i < children.length; ++i) {
	    var child = children[i];
	    var nextChild = children[i + 1];
	
	    if (nextChild && child.expr === nextChild.expr) {
	      child.replacedBy = nextChild;
	    }
	  }
	}
	
	function spaces(n) {
	  return common.repeat(' ', n).join('');
	}
	
	// Return a string representation of a portion of `inputStream` at offset `pos`.
	// The result will contain exactly `len` characters.
	function getInputExcerpt(inputStream, pos, len) {
	  var excerpt = asEscapedString(inputStream.sourceSlice(pos, pos + len));
	
	  // Pad the output if necessary.
	  if (excerpt.length < len) {
	    return excerpt + common.repeat(' ', len - excerpt.length).join('');
	  }
	  return excerpt;
	}
	
	function asEscapedString(obj) {
	  if (typeof obj === 'string') {
	    // Replace non-printable characters with visible symbols.
	    return obj
	        .replace(/ /g, DOT_OPERATOR)
	        .replace(/\t/g, SYMBOL_FOR_HORIZONTAL_TABULATION)
	        .replace(/\n/g, SYMBOL_FOR_LINE_FEED)
	        .replace(/\r/g, SYMBOL_FOR_CARRIAGE_RETURN);
	  }
	  return String(obj);
	}
	
	// ----------------- Trace -----------------
	
	function Trace(inputStream, pos, expr, ans, optChildren) {
	  this.children = optChildren || [];
	  this.expr = expr;
	  if (ans) {
	    this.interval = new Interval(inputStream, pos, inputStream.pos);
	  }
	  this.isLeftRecursive = false;
	  this.pos = pos;
	  this.inputStream = inputStream;
	  this.succeeded = !!ans;
	}
	
	// A value that can be returned from visitor functions to indicate that a
	// node should not be recursed into.
	Trace.prototype.SKIP = {};
	
	Object.defineProperty(Trace.prototype, 'displayString', {
	  get: function() { return this.expr.toDisplayString(); }
	});
	
	Trace.prototype.cloneWithExpr = function(expr) {
	  var ans = new Trace(this.inputStream, this.pos, expr, this.succeeded, this.children);
	  ans.isLeftRecursive = this.isLeftRecursive;
	  ans.isMemoized = true;
	  return ans;
	};
	
	// Set the value of `isLeftRecursive` for this node.
	// If true, each child of this node represents one iteration of the "growing the seed" loop.
	Trace.prototype.setLeftRecursive = function(leftRecursive) {
	  this.isLeftRecursive = leftRecursive;
	  if (leftRecursive) {
	    linkLeftRecursiveChildren(this.children);
	  }
	};
	
	// Recursively traverse this trace node and all its descendents, calling a visitor function
	// for each node that is visited. If `vistorObjOrFn` is an object, then its 'enter' property
	// is a function to call before visiting the children of a node, and its 'exit' property is
	// a function to call afterwards. If `visitorObjOrFn` is a function, it represents the 'enter'
	// function.
	//
	// The functions are called with three arguments: the Trace node, its parent Trace, and a number
	// representing the depth of the node in the tree. (The root node has depth 0.) `optThisArg`, if
	// specified, is the value to use for `this` when executing the visitor functions.
	Trace.prototype.walk = function(visitorObjOrFn, optThisArg) {
	  var visitor = visitorObjOrFn;
	  if (typeof visitor === 'function') {
	    visitor = {enter: visitor};
	  }
	  return (function _walk(node, parent, depth) {
	    var recurse = true;
	    if (visitor.enter) {
	      if (visitor.enter.call(optThisArg, node, parent, depth) === Trace.prototype.SKIP) {
	        recurse = false;
	      }
	    }
	    if (recurse) {
	      node.children.forEach(function(c) {
	        if (c && ('walk' in c)) {
	          _walk(c, node, depth + 1);
	        }
	      });
	      if (visitor.exit) {
	        visitor.exit.call(optThisArg, node, parent, depth);
	      }
	    }
	  })(this, null, 0);
	};
	
	// Return a string representation of the trace.
	// Sample:
	//     12⋅+⋅2⋅*⋅3 ✓ exp ⇒  "12"
	//     12⋅+⋅2⋅*⋅3   ✓ addExp (LR) ⇒  "12"
	//     12⋅+⋅2⋅*⋅3       ✗ addExp_plus
	Trace.prototype.toString = function() {
	  var sb = new common.StringBuffer();
	  this.walk(function(node, parent, depth) {
	    var ctorName = node.expr.constructor.name;
	    if (ctorName === 'Alt') {
	      return;  // Don't print anything for Alt nodes.
	    }
	    sb.append(getInputExcerpt(node.inputStream, node.pos, 10) + spaces(depth * 2 + 1));
	    sb.append((node.succeeded ? CHECK_MARK : BALLOT_X) + ' ' + node.displayString);
	    if (node.isLeftRecursive) {
	      sb.append(' (LR)');
	    }
	    if (node.succeeded) {
	      var contents = asEscapedString(node.interval.contents);
	      sb.append(' ' + RIGHTWARDS_DOUBLE_ARROW + '  ');
	      sb.append(typeof contents === 'string' ? '"' + contents + '"' : contents);
	    }
	    sb.append('\n');
	  });
	  return sb.contents();
	};
	
	// --------------------------------------------------------------------
	// Exports
	// --------------------------------------------------------------------
	
	module.exports = Trace;
	
	},{"./Interval":32,"./common":39}],39:[function(require,module,exports){
	'use strict';
	
	// --------------------------------------------------------------------
	// Imports
	// --------------------------------------------------------------------
	
	var extend = require('util-extend');
	
	// --------------------------------------------------------------------
	// Private Stuff
	// --------------------------------------------------------------------
	
	// Helpers
	
	var escapeStringFor = {};
	for (var c = 0; c < 128; c++) {
	  escapeStringFor[c] = String.fromCharCode(c);
	}
	escapeStringFor["'".charCodeAt(0)]  = "\\'";
	escapeStringFor['"'.charCodeAt(0)]  = '\\"';
	escapeStringFor['\\'.charCodeAt(0)] = '\\\\';
	escapeStringFor['\b'.charCodeAt(0)] = '\\b';
	escapeStringFor['\f'.charCodeAt(0)] = '\\f';
	escapeStringFor['\n'.charCodeAt(0)] = '\\n';
	escapeStringFor['\r'.charCodeAt(0)] = '\\r';
	escapeStringFor['\t'.charCodeAt(0)] = '\\t';
	escapeStringFor['\u000b'.charCodeAt(0)] = '\\v';
	
	// --------------------------------------------------------------------
	// Exports
	// --------------------------------------------------------------------
	
	exports.abstract = function() {
	  throw new Error(
	      'this method is abstract! ' +
	      '(it has no implementation in class ' + this.constructor.name + ')');
	};
	
	exports.assert = function(cond, message) {
	  if (!cond) {
	    throw new Error(message);
	  }
	};
	
	// Define a lazily-computed, non-enumerable property named `propName`
	// on the object `obj`. `getterFn` will be called to compute the value the
	// first time the property is accessed.
	exports.defineLazyProperty = function(obj, propName, getterFn) {
	  var memo;
	  Object.defineProperty(obj, propName, {
	    get: function() {
	      if (!memo) {
	        memo = getterFn.call(this);
	      }
	      return memo;
	    }
	  });
	};
	
	exports.clone = function(obj) {
	  if (obj) {
	    return extend({}, obj);
	  }
	  return obj;
	};
	
	exports.extend = extend;
	
	exports.repeatFn = function(fn, n) {
	  var arr = [];
	  while (n-- > 0) {
	    arr.push(fn());
	  }
	  return arr;
	};
	
	exports.repeatStr = function(str, n) {
	  return new Array(n + 1).join(str);
	};
	
	exports.repeat = function(x, n) {
	  return exports.repeatFn(function() { return x; }, n);
	};
	
	exports.getDuplicates = function(array) {
	  var duplicates = [];
	  for (var idx = 0; idx < array.length; idx++) {
	    var x = array[idx];
	    if (array.lastIndexOf(x) !== idx && duplicates.indexOf(x) < 0) {
	      duplicates.push(x);
	    }
	  }
	  return duplicates;
	};
	
	exports.fail = {};
	
	exports.isSyntactic = function(ruleName) {
	  var firstChar = ruleName[0];
	  return firstChar === firstChar.toUpperCase();
	};
	
	exports.isLexical = function(ruleName) {
	  return !exports.isSyntactic(ruleName);
	};
	
	exports.padLeft = function(str, len, optChar) {
	  var ch = optChar || ' ';
	  if (str.length < len) {
	    return exports.repeatStr(ch, len - str.length) + str;
	  }
	  return str;
	};
	
	// StringBuffer
	
	exports.StringBuffer = function() {
	  this.strings = [];
	};
	
	exports.StringBuffer.prototype.append = function(str) {
	  this.strings.push(str);
	};
	
	exports.StringBuffer.prototype.contents = function() {
	  return this.strings.join('');
	};
	
	// Character escaping and unescaping
	
	exports.escapeChar = function(c, optDelim) {
	  var charCode = c.charCodeAt(0);
	  if ((c === '"' || c === "'") && optDelim && c !== optDelim) {
	    return c;
	  } else if (charCode < 128) {
	    return escapeStringFor[charCode];
	  } else if (128 <= charCode && charCode < 256) {
	    return '\\x' + exports.padLeft(charCode.toString(16), 2, '0');
	  } else {
	    return '\\u' + exports.padLeft(charCode.toString(16), 4, '0');
	  }
	};
	
	exports.unescapeChar = function(s) {
	  if (s.charAt(0) === '\\') {
	    switch (s.charAt(1)) {
	      case 'b': return '\b';
	      case 'f': return '\f';
	      case 'n': return '\n';
	      case 'r': return '\r';
	      case 't': return '\t';
	      case 'v': return '\v';
	      case 'x': return String.fromCharCode(parseInt(s.substring(2, 4), 16));
	      case 'u': return String.fromCharCode(parseInt(s.substring(2, 6), 16));
	      default:   return s.charAt(1);
	    }
	  } else {
	    return s;
	  }
	};
	
	// Helper for producing a description of an unknown object in a safe way.
	// Especially useful for error messages where an unexpected type of object was encountered.
	exports.unexpectedObjToString = function(obj) {
	  if (obj == null) {
	    return String(obj);
	  }
	  var baseToString = Object.prototype.toString.call(obj);
	  try {
	    var typeName;
	    if (obj.constructor && obj.constructor.name) {
	      typeName = obj.constructor.name;
	    } else if (baseToString.indexOf('[object ') === 0) {
	      typeName = baseToString.slice(8, -1);  // Extract e.g. "Array" from "[object Array]".
	    } else {
	      typeName = typeof obj;
	    }
	    return typeName + ': ' + JSON.stringify(String(obj));
	  } catch (e) {
	    return baseToString;
	  }
	};
	
	},{"util-extend":26}],40:[function(require,module,exports){
	'use strict';
	
	// --------------------------------------------------------------------
	// Imports
	// --------------------------------------------------------------------
	
	var Namespace = require('./Namespace');
	
	// --------------------------------------------------------------------
	// Private stuff
	// --------------------------------------------------------------------
	
	function createError(message, optInterval) {
	  var e;
	  if (optInterval) {
	    e = new Error(optInterval.getLineAndColumnMessage() + message);
	    e.shortMessage = message;
	    e.interval = optInterval;
	  } else {
	    e = new Error(message);
	  }
	  return e;
	}
	
	// ----------------- errors about intervals -----------------
	
	function intervalSourcesDontMatch() {
	  return createError("Interval sources don't match");
	}
	
	// ----------------- errors about grammars -----------------
	
	// Grammar syntax error
	
	function grammarSyntaxError(matchFailure) {
	  var e = new Error();
	  Object.defineProperty(e, 'message', {get: function() { return matchFailure.message; }});
	  Object.defineProperty(e, 'shortMessage', {get: function() {
	    return 'Expected ' + matchFailure.getExpectedText();
	  }});
	  e.interval = matchFailure.getInterval();
	  return e;
	}
	
	// Undeclared grammar
	
	function undeclaredGrammar(grammarName, namespace, interval) {
	  var message = namespace ?
	      'Grammar ' + grammarName + ' is not declared in namespace ' + Namespace.toString(namespace) :
	      'Undeclared grammar ' + grammarName;
	  return createError(message, interval);
	}
	
	// Duplicate grammar declaration
	
	function duplicateGrammarDeclaration(grammar, namespace) {
	  return createError('Grammar ' + grammar.name + ' is already declared in this namespace');
	}
	
	// ----------------- rules -----------------
	
	// Undeclared rule
	
	function undeclaredRule(ruleName, grammarName, optInterval) {
	  return createError(
	      'Rule ' + ruleName + ' is not declared in grammar ' + grammarName,
	      optInterval);
	}
	
	// Cannot override undeclared rule
	
	function cannotOverrideUndeclaredRule(ruleName, grammarName, body) {
	  return createError(
	      'Cannot override rule ' + ruleName + ' because it is not declared in ' + grammarName,
	      body.definitionInterval);
	}
	
	// Cannot extend undeclared rule
	
	function cannotExtendUndeclaredRule(ruleName, grammarName, body) {
	  return createError(
	      'Cannot extend rule ' + ruleName + ' because it is not declared in ' + grammarName,
	      body.definitionInterval);
	}
	
	// Duplicate rule declaration
	
	function duplicateRuleDeclaration(ruleName, offendingGrammarName, declGrammarName, body) {
	  var message = "Duplicate declaration for rule '" + ruleName +
	      "' in grammar '" + offendingGrammarName + "'";
	  if (offendingGrammarName !== declGrammarName) {
	    message += " (originally declared in '" + declGrammarName + "')";
	  }
	  return createError(message, body.definitionInterval);
	}
	
	// Wrong number of parameters
	
	function wrongNumberOfParameters(ruleName, expected, actual, body) {
	  return createError(
	      'Wrong number of parameters for rule ' + ruleName +
	          ' (expected ' + expected + ', got ' + actual + ')',
	      body.definitionInterval);
	}
	
	// Wrong number of arguments
	
	function wrongNumberOfArguments(ruleName, expected, actual, expr) {
	  return createError(
	      'Wrong number of arguments for rule ' + ruleName +
	          ' (expected ' + expected + ', got ' + actual + ')',
	      expr.interval);
	}
	
	// Duplicate parameter names
	
	function duplicateParameterNames(ruleName, duplicates, body) {
	  return createError(
	      'Duplicate parameter names in rule ' + ruleName + ': ' + duplicates.join(','),
	      body.definitionInterval);
	}
	
	// Invalid parameter expression
	
	function invalidParameter(ruleName, expr) {
	  return createError(
	      'Invalid parameter to rule ' + ruleName + ': ' + expr + ' has arity ' + expr.getArity() +
	          ', but parameter expressions ' + 'must have arity 1',
	      expr.interval);
	}
	
	// Application of syntactic rule from lexical rule
	
	function applicationOfSyntacticRuleFromLexicalContext(ruleName, applyExpr) {
	  return createError(
	      'Cannot apply syntactic rule ' + ruleName + ' from here (inside a lexical context)',
	      applyExpr.interval);
	}
	
	function exprMixesValueAndStringExpressions(expr, optRuleName) {
	  // TODO: Improve the reporting here.
	  var desc =
	      (optRuleName ? 'Rule ' + optRuleName : 'Expression') + ' mixes value and string expressions';
	  return createError(desc, expr.interval);
	}
	
	// ----------------- Kleene operators -----------------
	
	function kleeneExprHasNullableOperand(kleeneExpr) {
	  return createError(
	      'Nullable expression ' + kleeneExpr.expr.interval.contents + " is not allowed inside '" +
	          kleeneExpr.operator + "' (possible infinite loop)",
	      kleeneExpr.expr.interval);
	}
	
	// ----------------- arity -----------------
	
	function inconsistentArity(ruleName, expected, actual, expr) {
	  return createError(
	      'Rule ' + ruleName + ' involves an alternation which has inconsistent arity ' +
	          '(expected ' + expected + ', got ' + actual + ')',
	      expr.interval);
	}
	
	// ----------------- properties -----------------
	
	function duplicatePropertyNames(duplicates) {
	  return createError('Object pattern has duplicate property names: ' + duplicates.join(', '));
	}
	
	// ----------------- constructors -----------------
	
	function invalidConstructorCall(grammar, ctorName, children) {
	  return createError(
	      'Attempt to invoke constructor ' + ctorName + ' with invalid or unexpected arguments');
	}
	
	// ----------------- convenience -----------------
	
	function multipleErrors(errors) {
	  var messages = errors.map(function(e) { return e.message; });
	  return createError(
	      ['Errors:'].concat(messages).join('\n- '),
	      errors[0].interval);
	}
	
	// --------------------------------------------------------------------
	// Exports
	// --------------------------------------------------------------------
	
	module.exports = {
	  applicationOfSyntacticRuleFromLexicalContext: applicationOfSyntacticRuleFromLexicalContext,
	  cannotExtendUndeclaredRule: cannotExtendUndeclaredRule,
	  cannotOverrideUndeclaredRule: cannotOverrideUndeclaredRule,
	  duplicateGrammarDeclaration: duplicateGrammarDeclaration,
	  duplicateParameterNames: duplicateParameterNames,
	  duplicatePropertyNames: duplicatePropertyNames,
	  duplicateRuleDeclaration: duplicateRuleDeclaration,
	  exprMixesValueAndStringExpressions: exprMixesValueAndStringExpressions,
	  inconsistentArity: inconsistentArity,
	  intervalSourcesDontMatch: intervalSourcesDontMatch,
	  invalidConstructorCall: invalidConstructorCall,
	  invalidParameter: invalidParameter,
	  grammarSyntaxError: grammarSyntaxError,
	  kleeneExprHasNullableOperand: kleeneExprHasNullableOperand,
	  undeclaredGrammar: undeclaredGrammar,
	  undeclaredRule: undeclaredRule,
	  wrongNumberOfArguments: wrongNumberOfArguments,
	  wrongNumberOfParameters: wrongNumberOfParameters,
	
	  throwErrors: function(errors) {
	    if (errors.length === 1) {
	      throw errors[0];
	    }
	    if (errors.length > 1) {
	      throw multipleErrors(errors);
	    }
	  }
	};
	
	},{"./Namespace":34}],41:[function(require,module,exports){
	/* global document, XMLHttpRequest */
	
	'use strict';
	
	// --------------------------------------------------------------------
	// Imports
	// --------------------------------------------------------------------
	
	var Builder = require('./Builder');
	var Grammar = require('./Grammar');
	var Namespace = require('./Namespace');
	var common = require('./common');
	var errors = require('./errors');
	var pexprs = require('./pexprs');
	var util = require('./util');
	
	var isBuffer = require('is-buffer');
	
	// --------------------------------------------------------------------
	// Private stuff
	// --------------------------------------------------------------------
	
	// The metagrammar, i.e. the grammar for Ohm grammars. Initialized at the
	// bottom of this file because loading the grammar requires Ohm itself.
	var ohmGrammar;
	
	// An object which makes it possible to stub out the document API for testing.
	var documentInterface = {
	  querySelector: function(sel) { return document.querySelector(sel); },
	  querySelectorAll: function(sel) { return document.querySelectorAll(sel); }
	};
	
	// Check if `obj` is a DOM element.
	function isElement(obj) {
	  return !!(obj && obj.nodeType === 1);
	}
	
	function isUndefined(obj) {
	  return obj === void 0;
	}
	
	var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
	
	function isArrayLike(obj) {
	  if (obj == null) {
	    return false;
	  }
	  var length = obj.length;
	  return typeof length === 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
	}
	
	// TODO: just use the jQuery thing
	function load(url) {
	  var req = new XMLHttpRequest();
	  req.open('GET', url, false);
	  try {
	    req.send();
	    if (req.status === 0 || req.status === 200) {
	      return req.responseText;
	    }
	  } catch (e) {}
	  throw new Error('unable to load url ' + url);
	}
	
	// Returns a Grammar instance (i.e., an object with a `match` method) for
	// `tree`, which is the concrete syntax tree of a user-written grammar.
	// The grammar will be assigned into `namespace` under the name of the grammar
	// as specified in the source.
	function buildGrammar(match, namespace, optOhmGrammarForTesting) {
	  var builder;
	  var decl;
	  var currentRuleName;
	  var currentRuleFormals;
	  var overriding = false;
	  var metaGrammar = optOhmGrammarForTesting || ohmGrammar;
	
	  // A visitor that produces a Grammar instance from the CST.
	  var helpers = metaGrammar.semantics().addOperation('visit', {
	    Grammar: function(n, s, open, rs, close) {
	      builder = new Builder();
	      var grammarName = n.visit();
	      decl = builder.newGrammar(grammarName, namespace);
	      s.visit();
	      rs.visit();
	      var g = decl.build();
	      g.definitionInterval = this.interval.trimmed();
	      if (grammarName in namespace) {
	        throw errors.duplicateGrammarDeclaration(g, namespace);
	      }
	      namespace[grammarName] = g;
	      return g;
	    },
	
	    SuperGrammar: function(_, n) {
	      var superGrammarName = n.visit();
	      if (superGrammarName === 'null') {
	        decl.withSuperGrammar(null);
	      } else {
	        if (!namespace || !(superGrammarName in namespace)) {
	          throw errors.undeclaredGrammar(superGrammarName, namespace, n.interval);
	        }
	        decl.withSuperGrammar(namespace[superGrammarName]);
	      }
	    },
	
	    Rule_define: function(n, fs, d, _equals, _optBar, b) {
	      currentRuleName = n.visit();
	      currentRuleFormals = fs.visit()[0] || [];
	      // If there is no default start rule yet, set it now. This must be done before visiting
	      // the body, because it might contain an inline rule definition.
	      if (!decl.defaultStartRule && decl.ensureSuperGrammar() !== Grammar.ProtoBuiltInRules) {
	        decl.withDefaultStartRule(currentRuleName);
	      }
	      var body = b.visit();
	      body.definitionInterval = this.interval.trimmed();
	      var description = d.visit()[0];
	      return decl.define(currentRuleName, currentRuleFormals, body, description);
	    },
	    Rule_override: function(n, fs, _colonEquals, _optBar, b) {
	      currentRuleName = n.visit();
	      currentRuleFormals = fs.visit()[0] || [];
	      overriding = true;
	      var body = b.visit();
	      body.definitionInterval = this.interval.trimmed();
	      var ans = decl.override(currentRuleName, currentRuleFormals, body);
	      overriding = false;
	      return ans;
	    },
	    Rule_extend: function(n, fs, _plusEquals, _optBar, b) {
	      currentRuleName = n.visit();
	      currentRuleFormals = fs.visit()[0] || [];
	      var body = b.visit();
	      var ans = decl.extend(currentRuleName, currentRuleFormals, body);
	      decl.ruleBodies[currentRuleName].definitionInterval = this.interval.trimmed();
	      return ans;
	    },
	
	    Formals: function(opointy, fs, cpointy) {
	      return fs.visit();
	    },
	
	    Params: function(opointy, ps, cpointy) {
	      return ps.visit();
	    },
	
	    Alt: function(term, _, terms) {
	      var args = [term.visit()].concat(terms.visit());
	      return builder.alt.apply(builder, args).withInterval(this.interval);
	    },
	
	    Term_inline: function(b, n) {
	      var inlineRuleName = currentRuleName + '_' + n.visit();
	      var body = b.visit();
	      body.definitionInterval = this.interval.trimmed();
	      var isNewRuleDeclaration =
	          !(decl.superGrammar && decl.superGrammar.ruleBodies[inlineRuleName]);
	      if (overriding && !isNewRuleDeclaration) {
	        decl.override(inlineRuleName, currentRuleFormals, body);
	      } else {
	        decl.define(inlineRuleName, currentRuleFormals, body);
	      }
	      var params = currentRuleFormals.map(function(formal) { return builder.app(formal); });
	      return builder.app(inlineRuleName, params).withInterval(body.interval);
	    },
	
	    Seq: function(expr) {
	      return builder.seq.apply(builder, expr.visit()).withInterval(this.interval);
	    },
	
	    Iter_star: function(x, _) {
	      return builder.star(x.visit()).withInterval(this.interval);
	    },
	    Iter_plus: function(x, _) {
	      return builder.plus(x.visit()).withInterval(this.interval);
	    },
	    Iter_opt: function(x, _) {
	      return builder.opt(x.visit()).withInterval(this.interval);
	    },
	
	    Pred_not: function(_, x) {
	      return builder.not(x.visit()).withInterval(this.interval);
	    },
	    Pred_lookahead: function(_, x) {
	      return builder.la(x.visit()).withInterval(this.interval);
	    },
	
	    Modifier_lex: function(_, x) {
	      return builder.lex(x.visit()).withInterval(this.interval);
	    },
	    Modifier_val: function(_, x) {
	      return builder.val(x.visit()).withInterval(this.interval);
	    },
	
	    Base_application: function(rule, ps) {
	      return builder.app(rule.visit(), ps.visit()[0] || []).withInterval(this.interval);
	    },
	    Base_range: function(from, _, to) {
	      return builder.range(from.visit(), to.visit()).withInterval(this.interval);
	    },
	    Base_prim: function(expr) {
	      return builder.prim(expr.visit()).withInterval(this.interval);
	    },
	    Base_paren: function(open, x, close) {
	      return x.visit();
	    },
	    Base_arr: function(open, x, close) {
	      return builder.arr(x.visit()).withInterval(this.interval);
	    },
	    Base_obj: function(open, lenient, close) {
	      return builder.obj([], lenient.visit()[0]);
	    },
	
	    Base_objWithProps: function(open, ps, _, lenient, close) {
	      return builder.obj(ps.visit(), lenient.visit()[0]).withInterval(this.interval);
	    },
	
	    Props: function(p, _, ps) {
	      return [p.visit()].concat(ps.visit());
	    },
	    Prop: function(n, _, p) {
	      return {name: n.visit(), pattern: p.visit()};
	    },
	
	    ruleDescr: function(open, t, close) {
	      return t.visit();
	    },
	    ruleDescrText: function(_) {
	      return this.interval.contents.trim();
	    },
	
	    caseName: function(_, space1, n, space2, end) {
	      return n.visit();
	    },
	
	    name: function(first, rest) {
	      return this.interval.contents;
	    },
	    nameFirst: function(expr) {},
	    nameRest: function(expr) {},
	
	    keyword_null: function(_) {
	      return null;
	    },
	    keyword_true: function(_) {
	      return true;
	    },
	    keyword_false: function(_) {
	      return false;
	    },
	
	    string: function(open, cs, close) {
	      return cs.visit().map(function(c) { return common.unescapeChar(c); }).join('');
	    },
	
	    strChar: function(_) {
	      return this.interval.contents;
	    },
	
	    escapeChar: function(_) {
	      return this.interval.contents;
	    },
	
	    number: function(_, digits) {
	      return parseInt(this.interval.contents);
	    },
	
	    NonemptyListOf: function(x, _, xs) {
	      return [x.visit()].concat(xs.visit());
	    },
	    EmptyListOf: function() {
	      return [];
	    }
	  });
	  return helpers(match).visit();
	}
	
	function compileAndLoad(source, namespace) {
	  var m = ohmGrammar.match(source, 'Grammars');
	  if (m.failed()) {
	    throw errors.grammarSyntaxError(m);
	  }
	  return buildGrammar(m, namespace);
	}
	
	// Return the contents of a script element, fetching it via XHR if necessary.
	function getScriptElementContents(el) {
	  if (!isElement(el)) {
	    throw new TypeError('Expected a DOM Node, got ' + common.unexpectedObjToString(el));
	  }
	  if (el.type !== 'text/ohm-js') {
	    throw new Error('Expected a script tag with type="text/ohm-js", got ' + el);
	  }
	  return el.getAttribute('src') ? load(el.getAttribute('src')) : el.innerHTML;
	}
	
	function grammar(source, optNamespace) {
	  var ns = grammars(source, optNamespace);
	
	  // Ensure that the source contained no more than one grammar definition.
	  var grammarNames = Object.keys(ns);
	  if (grammarNames.length === 0) {
	    throw new Error('Missing grammar definition');
	  } else if (grammarNames.length > 1) {
	    var secondGrammar = ns[grammarNames[1]];
	    var interval = secondGrammar.definitionInterval;
	    throw new Error(
	        util.getLineAndColumnMessage(interval.inputStream.source, interval.startIdx) +
	        'Found more than one grammar definition -- use ohm.grammars() instead.');
	  }
	  return ns[grammarNames[0]];  // Return the one and only grammar.
	}
	
	function grammars(source, optNamespace) {
	  var ns = Namespace.extend(Namespace.asNamespace(optNamespace));
	  if (typeof source !== 'string') {
	    // For convenience, detect Node.js Buffer objects and automatically call toString().
	    if (isBuffer(source)) {
	      source = source.toString();
	    } else {
	      throw new TypeError(
	          'Expected string as first argument, got ' + common.unexpectedObjToString(source));
	    }
	  }
	  compileAndLoad(source, ns);
	  return ns;
	}
	
	function grammarFromScriptElement(optNode) {
	  var node = optNode;
	  if (isUndefined(node)) {
	    var nodeList = documentInterface.querySelectorAll('script[type="text/ohm-js"]');
	    if (nodeList.length !== 1) {
	      throw new Error(
	          'Expected exactly one script tag with type="text/ohm-js", found ' + nodeList.length);
	    }
	    node = nodeList[0];
	  }
	  return grammar(getScriptElementContents(node));
	}
	
	function grammarsFromScriptElements(optNodeOrNodeList) {
	  // Simple case: the argument is a DOM node.
	  if (isElement(optNodeOrNodeList)) {
	    return grammars(optNodeOrNodeList);
	  }
	  // Otherwise, it must be either undefined or a NodeList.
	  var nodeList = optNodeOrNodeList;
	  if (isUndefined(nodeList)) {
	    // Find all script elements with type="text/ohm-js".
	    nodeList = documentInterface.querySelectorAll('script[type="text/ohm-js"]');
	  } else if (typeof nodeList === 'string' || (!isElement(nodeList) && !isArrayLike(nodeList))) {
	    throw new TypeError('Expected a Node, NodeList, or Array, but got ' + nodeList);
	  }
	  var ns = Namespace.createNamespace();
	  for (var i = 0; i < nodeList.length; ++i) {
	    // Copy the new grammars into `ns` to keep the namespace flat.
	    common.extend(ns, grammars(getScriptElementContents(nodeList[i]), ns));
	  }
	  return ns;
	}
	
	function makeRecipe(recipeFn) {
	  return recipeFn.call(new Builder());
	}
	
	// --------------------------------------------------------------------
	// Exports
	// --------------------------------------------------------------------
	
	// Stuff that users should know about
	module.exports = {
	  createNamespace: Namespace.createNamespace,
	  grammar: grammar,
	  grammars: grammars,
	  grammarFromScriptElement: grammarFromScriptElement,
	  grammarsFromScriptElements: grammarsFromScriptElements,
	  makeRecipe: makeRecipe,
	  ohmGrammar: null,  // Initialized below, after Grammar.BuiltInRules.
	  pexprs: pexprs,
	  util: util
	};
	
	// Stuff for testing, etc.
	module.exports._buildGrammar = buildGrammar;
	module.exports._setDocumentInterfaceForTesting = function(doc) { documentInterface = doc; };
	
	// Late initialization for stuff that is bootstrapped.
	
	Grammar.BuiltInRules = require('../dist/built-in-rules');
	
	var Semantics = require('./Semantics');
	var operationsAndAttributesGrammar = require('../dist/operations-and-attributes');
	Semantics.initBuiltInSemantics(Grammar.BuiltInRules);
	Semantics.initPrototypeParser(operationsAndAttributesGrammar);  // requires BuiltInSemantics
	
	module.exports.ohmGrammar = ohmGrammar = require('../dist/ohm-grammar');
	
	},{"../dist/built-in-rules":1,"../dist/ohm-grammar":2,"../dist/operations-and-attributes":3,"./Builder":27,"./Grammar":29,"./Namespace":34,"./Semantics":36,"./common":39,"./errors":40,"./pexprs":59,"./util":60,"is-buffer":25}],42:[function(require,module,exports){
	'use strict';
	
	var inherits = require('inherits');
	
	var common = require('./common');
	
	// --------------------------------------------------------------------
	// Private stuff
	// --------------------------------------------------------------------
	
	function Node(grammar, ctorName, children, interval) {
	  this.grammar = grammar;
	  this.ctorName = ctorName;
	  this.children = children;
	  this.interval = interval;
	}
	
	Node.prototype.numChildren = function() {
	  return this.children.length;
	};
	
	Node.prototype.childAt = function(idx) {
	  return this.children[idx];
	};
	
	Node.prototype.indexOfChild = function(arg) {
	  return this.children.indexOf(arg);
	};
	
	Node.prototype.hasChildren = function() {
	  return this.children.length > 0;
	};
	
	Node.prototype.hasNoChildren = function() {
	  return !this.hasChildren();
	};
	
	Node.prototype.onlyChild = function() {
	  if (this.children.length !== 1) {
	    throw new Error(
	        'cannot get only child of a node of type ' + this.ctorName +
	        ' (it has ' + this.numChildren() + ' children)');
	  } else {
	    return this.firstChild();
	  }
	};
	
	Node.prototype.firstChild = function() {
	  if (this.hasNoChildren()) {
	    throw new Error(
	        'cannot get first child of a ' + this.ctorName + ' node, which has no children');
	  } else {
	    return this.childAt(0);
	  }
	};
	
	Node.prototype.lastChild = function() {
	  if (this.hasNoChildren()) {
	    throw new Error(
	        'cannot get last child of a ' + this.ctorName + ' node, which has no children');
	  } else {
	    return this.childAt(this.numChildren() - 1);
	  }
	};
	
	Node.prototype.childBefore = function(child) {
	  var childIdx = this.indexOfChild(child);
	  if (childIdx < 0) {
	    throw new Error('Node.childBefore() called w/ an argument that is not a child');
	  } else if (childIdx === 0) {
	    throw new Error('cannot get child before first child');
	  } else {
	    return this.childAt(childIdx - 1);
	  }
	};
	
	Node.prototype.childAfter = function(child) {
	  var childIdx = this.indexOfChild(child);
	  if (childIdx < 0) {
	    throw new Error('Node.childAfter() called w/ an argument that is not a child');
	  } else if (childIdx === this.numChildren() - 1) {
	    throw new Error('cannot get child after last child');
	  } else {
	    return this.childAt(childIdx + 1);
	  }
	};
	
	Node.prototype.isTerminal = function() {
	  return false;
	};
	
	Node.prototype.isNonterminal = function() {
	  return false;
	};
	
	Node.prototype.isIteration = function() {
	  return false;
	};
	
	Node.prototype.isOptional = function() {
	  return false;
	};
	
	Node.prototype.toJSON = function() {
	  var r = {};
	  r[this.ctorName] = this.children;
	  return r;
	};
	
	// Terminals
	
	function TerminalNode(grammar, value, interval) {
	  Node.call(this, grammar, '_terminal', [], interval);
	  this.primitiveValue = value;
	}
	inherits(TerminalNode, Node);
	
	TerminalNode.prototype.isTerminal = function() {
	  return true;
	};
	
	// Nonterminals
	
	function NonterminalNode(grammar, ruleName, children, interval) {
	  Node.call(this, grammar, ruleName, children, interval);
	}
	inherits(NonterminalNode, Node);
	
	NonterminalNode.prototype.isNonterminal = function() {
	  return true;
	};
	
	NonterminalNode.prototype.isLexical = function() {
	  return common.isLexical(this.ctorName);
	};
	
	NonterminalNode.prototype.isSyntactic = function() {
	  return common.isSyntactic(this.ctorName);
	};
	
	// Iterations
	
	function IterationNode(grammar, children, interval, optional) {
	  Node.call(this, grammar, '_iter', children, interval);
	  this.optional = optional;
	}
	inherits(IterationNode, Node);
	
	IterationNode.prototype.isIteration = function() {
	  return true;
	};
	
	IterationNode.prototype.isOptional = function() {
	  return this.optional;
	};
	
	// --------------------------------------------------------------------
	// Exports
	// --------------------------------------------------------------------
	
	module.exports = {
	  Node: Node,
	  TerminalNode: TerminalNode,
	  NonterminalNode: NonterminalNode,
	  IterationNode: IterationNode
	};
	
	},{"./common":39,"inherits":24}],43:[function(require,module,exports){
	'use strict';
	
	// --------------------------------------------------------------------
	// Imports
	// --------------------------------------------------------------------
	
	var common = require('./common');
	var errors = require('./errors');
	var pexprs = require('./pexprs');
	
	// --------------------------------------------------------------------
	// Operations
	// --------------------------------------------------------------------
	
	var lexifyCount;
	
	pexprs.PExpr.prototype.assertAllApplicationsAreValid = function(ruleName, grammar) {
	  lexifyCount = 0;
	  this._assertAllApplicationsAreValid(ruleName, grammar);
	};
	
	pexprs.PExpr.prototype._assertAllApplicationsAreValid = common.abstract;
	
	pexprs.any._assertAllApplicationsAreValid =
	pexprs.end._assertAllApplicationsAreValid =
	pexprs.Prim.prototype._assertAllApplicationsAreValid =
	pexprs.Range.prototype._assertAllApplicationsAreValid =
	pexprs.Param.prototype._assertAllApplicationsAreValid =
	pexprs.TypeCheck.prototype._assertAllApplicationsAreValid =
	pexprs.UnicodeChar.prototype._assertAllApplicationsAreValid = function(ruleName, grammar) {
	  // no-op
	};
	
	pexprs.Lex.prototype._assertAllApplicationsAreValid = function(ruleName, grammar) {
	  lexifyCount++;
	  this.expr._assertAllApplicationsAreValid(ruleName, grammar);
	  lexifyCount--;
	};
	
	pexprs.Alt.prototype._assertAllApplicationsAreValid = function(ruleName, grammar) {
	  for (var idx = 0; idx < this.terms.length; idx++) {
	    this.terms[idx]._assertAllApplicationsAreValid(ruleName, grammar);
	  }
	};
	
	pexprs.Seq.prototype._assertAllApplicationsAreValid = function(ruleName, grammar) {
	  for (var idx = 0; idx < this.factors.length; idx++) {
	    this.factors[idx]._assertAllApplicationsAreValid(ruleName, grammar);
	  }
	};
	
	pexprs.Iter.prototype._assertAllApplicationsAreValid =
	pexprs.Not.prototype._assertAllApplicationsAreValid =
	pexprs.Lookahead.prototype._assertAllApplicationsAreValid =
	pexprs.Value.prototype._assertAllApplicationsAreValid =
	pexprs.Arr.prototype._assertAllApplicationsAreValid = function(ruleName, grammar) {
	  this.expr._assertAllApplicationsAreValid(ruleName, grammar);
	};
	
	pexprs.Obj.prototype._assertAllApplicationsAreValid = function(ruleName, grammar) {
	  for (var idx = 0; idx < this.properties.length; idx++) {
	    this.properties[idx].pattern._assertAllApplicationsAreValid(ruleName, grammar);
	  }
	};
	
	pexprs.Apply.prototype._assertAllApplicationsAreValid = function(ruleName, grammar) {
	  var body = grammar.ruleBodies[this.ruleName];
	
	  // Make sure that the rule exists...
	  if (!body) {
	    throw errors.undeclaredRule(this.ruleName, grammar.name, this.interval);
	  }
	
	  // ...and that this application is allowed
	  if (common.isSyntactic(this.ruleName) && (!common.isSyntactic(ruleName) || lexifyCount > 0)) {
	    throw errors.applicationOfSyntacticRuleFromLexicalContext(this.ruleName, this);
	  }
	
	  // ...and that this application has the correct number of arguments
	  var actual = this.args.length;
	  var expected = grammar.ruleFormals[this.ruleName].length;
	  if (actual !== expected) {
	    throw errors.wrongNumberOfArguments(this.ruleName, expected, actual, this);
	  }
	
	  // ...and that all of the argument expressions only have valid applications and have arity 1.
	  var self = this;
	  this.args.forEach(function(arg) {
	    arg._assertAllApplicationsAreValid(ruleName, grammar);
	    if (arg.getArity() !== 1) {
	      throw errors.invalidParameter(self.ruleName, arg);
	    }
	  });
	};
	
	},{"./common":39,"./errors":40,"./pexprs":59}],44:[function(require,module,exports){
	'use strict';
	
	// --------------------------------------------------------------------
	// Imports
	// --------------------------------------------------------------------
	
	var common = require('./common');
	var errors = require('./errors');
	var pexprs = require('./pexprs');
	
	// --------------------------------------------------------------------
	// Operations
	// --------------------------------------------------------------------
	
	pexprs.PExpr.prototype.assertChoicesHaveUniformArity = common.abstract;
	
	pexprs.any.assertChoicesHaveUniformArity =
	pexprs.end.assertChoicesHaveUniformArity =
	pexprs.Prim.prototype.assertChoicesHaveUniformArity =
	pexprs.Range.prototype.assertChoicesHaveUniformArity =
	pexprs.Param.prototype.assertChoicesHaveUniformArity =
	pexprs.Lex.prototype.assertChoicesHaveUniformArity =
	pexprs.TypeCheck.prototype.assertChoicesHaveUniformArity =
	pexprs.UnicodeChar.prototype.assertChoicesHaveUniformArity = function(ruleName) {
	  // no-op
	};
	
	pexprs.Alt.prototype.assertChoicesHaveUniformArity = function(ruleName) {
	  if (this.terms.length === 0) {
	    return;
	  }
	  var arity = this.terms[0].getArity();
	  for (var idx = 0; idx < this.terms.length; idx++) {
	    var term = this.terms[idx];
	    term.assertChoicesHaveUniformArity();
	    var otherArity = term.getArity();
	    if (arity !== otherArity) {
	      throw errors.inconsistentArity(ruleName, arity, otherArity, term);
	    }
	  }
	};
	
	pexprs.Extend.prototype.assertChoicesHaveUniformArity = function(ruleName) {
	  // Extend is a special case of Alt that's guaranteed to have exactly two
	  // cases: [extensions, origBody].
	  var actualArity = this.terms[0].getArity();
	  var expectedArity = this.terms[1].getArity();
	  if (actualArity !== expectedArity) {
	    throw errors.inconsistentArity(ruleName, expectedArity, actualArity, this.terms[0]);
	  }
	};
	
	pexprs.Seq.prototype.assertChoicesHaveUniformArity = function(ruleName) {
	  for (var idx = 0; idx < this.factors.length; idx++) {
	    this.factors[idx].assertChoicesHaveUniformArity(ruleName);
	  }
	};
	
	pexprs.Iter.prototype.assertChoicesHaveUniformArity = function(ruleName) {
	  this.expr.assertChoicesHaveUniformArity(ruleName);
	};
	
	pexprs.Not.prototype.assertChoicesHaveUniformArity = function(ruleName) {
	  // no-op (not required b/c the nested expr doesn't show up in the CST)
	};
	
	pexprs.Lookahead.prototype.assertChoicesHaveUniformArity =
	pexprs.Arr.prototype.assertChoicesHaveUniformArity =
	pexprs.Value.prototype.assertChoicesHaveUniformArity = function(ruleName) {
	  this.expr.assertChoicesHaveUniformArity(ruleName);
	};
	
	pexprs.Obj.prototype.assertChoicesHaveUniformArity = function(ruleName) {
	  for (var idx = 0; idx < this.properties.length; idx++) {
	    this.properties[idx].pattern.assertChoicesHaveUniformArity(ruleName);
	  }
	};
	
	pexprs.Apply.prototype.assertChoicesHaveUniformArity = function(ruleName) {
	  // The arities of the parameter expressions is required to be 1 by
	  // `assertAllApplicationsAreValid()`.
	};
	
	},{"./common":39,"./errors":40,"./pexprs":59}],45:[function(require,module,exports){
	'use strict';
	
	// --------------------------------------------------------------------
	// Imports
	// --------------------------------------------------------------------
	
	var common = require('./common');
	var errors = require('./errors');
	var pexprs = require('./pexprs');
	
	// --------------------------------------------------------------------
	// Operations
	// --------------------------------------------------------------------
	
	pexprs.PExpr.prototype.assertIteratedExprsAreNotNullable = common.abstract;
	
	pexprs.any.assertIteratedExprsAreNotNullable =
	pexprs.end.assertIteratedExprsAreNotNullable =
	pexprs.Prim.prototype.assertIteratedExprsAreNotNullable =
	pexprs.Range.prototype.assertIteratedExprsAreNotNullable =
	pexprs.Param.prototype.assertIteratedExprsAreNotNullable =
	pexprs.TypeCheck.prototype.assertIteratedExprsAreNotNullable =
	pexprs.UnicodeChar.prototype.assertIteratedExprsAreNotNullable = function(grammar, ruleName) {
	  // no-op
	};
	
	pexprs.Alt.prototype.assertIteratedExprsAreNotNullable = function(grammar, ruleName) {
	  for (var idx = 0; idx < this.terms.length; idx++) {
	    this.terms[idx].assertIteratedExprsAreNotNullable(grammar, ruleName);
	  }
	};
	
	pexprs.Seq.prototype.assertIteratedExprsAreNotNullable = function(grammar, ruleName) {
	  for (var idx = 0; idx < this.factors.length; idx++) {
	    this.factors[idx].assertIteratedExprsAreNotNullable(grammar, ruleName);
	  }
	};
	
	pexprs.Iter.prototype.assertIteratedExprsAreNotNullable = function(grammar, ruleName) {
	  // Note: this is the implementation of this method for `Star` and `Plus` expressions.
	  // It is overridden for `Opt` below.
	  this.expr.assertIteratedExprsAreNotNullable(grammar, ruleName);
	  if (this.expr.isNullable(grammar)) {
	    throw errors.kleeneExprHasNullableOperand(this, ruleName);
	  }
	};
	
	pexprs.Opt.prototype.assertIteratedExprsAreNotNullable =
	pexprs.Not.prototype.assertIteratedExprsAreNotNullable =
	pexprs.Lookahead.prototype.assertIteratedExprsAreNotNullable =
	pexprs.Lex.prototype.assertIteratedExprsAreNotNullable =
	pexprs.Value.prototype.assertIteratedExprsAreNotNullable =
	pexprs.Arr.prototype.assertIteratedExprsAreNotNullable = function(grammar, ruleName) {
	  this.expr.assertIteratedExprsAreNotNullable(grammar, ruleName);
	};
	
	pexprs.Obj.prototype.assertIteratedExprsAreNotNullable = function(grammar, ruleName) {
	  for (var idx = 0; idx < this.properties.length; idx++) {
	    this.properties[idx].pattern.assertIteratedExprsAreNotNullable(grammar, ruleName);
	  }
	};
	
	pexprs.Apply.prototype.assertIteratedExprsAreNotNullable = function(grammar, ruleName) {
	  this.args.forEach(function(arg) {
	    arg.assertIteratedExprsAreNotNullable(grammar, ruleName);
	  });
	};
	
	},{"./common":39,"./errors":40,"./pexprs":59}],46:[function(require,module,exports){
	'use strict';
	
	// --------------------------------------------------------------------
	// Imports
	// --------------------------------------------------------------------
	
	var pexprs = require('./pexprs');
	
	// --------------------------------------------------------------------
	// Operations
	// --------------------------------------------------------------------
	
	// Checks that no PExpr combines a value expression (e.g., `null`, `3`) with a string fragment
	// expression (e.g., `"blah"`).
	pexprs.PExpr.prototype.assertValuesAndStringsAreNotMixed = function(grammar, ruleName) {
	  var memo = Object.create(null);
	  memo[ruleName] = pexprs.TYPE_ANY;  // Initialize memo table for the rule we are checking.
	  this.getExprType(grammar, memo);
	};
	
	},{"./pexprs":59}],47:[function(require,module,exports){
	'use strict';
	
	// --------------------------------------------------------------------
	// Imports
	// --------------------------------------------------------------------
	
	var common = require('./common');
	var nodes = require('./nodes');
	var pexprs = require('./pexprs');
	
	// --------------------------------------------------------------------
	// Operations
	// --------------------------------------------------------------------
	
	pexprs.PExpr.prototype.check = common.abstract;
	
	pexprs.any.check = function(grammar, vals) {
	  return vals.length >= 1;
	};
	
	pexprs.end.check = function(grammar, vals) {
	  return vals[0] instanceof nodes.Node &&
	         vals[0].isTerminal() &&
	         vals[0].primitiveValue === undefined;
	};
	
	pexprs.Prim.prototype.check = function(grammar, vals) {
	  return vals[0] instanceof nodes.Node &&
	         vals[0].isTerminal() &&
	         vals[0].primitiveValue === this.obj;
	};
	
	pexprs.Range.prototype.check = function(grammar, vals) {
	  return vals[0] instanceof nodes.Node &&
	         vals[0].isTerminal() &&
	         typeof vals[0].primitiveValue === typeof this.from;
	};
	
	pexprs.Param.prototype.check = function(grammar, vals) {
	  return vals.length >= 1;
	};
	
	pexprs.Alt.prototype.check = function(grammar, vals) {
	  for (var i = 0; i < this.terms.length; i++) {
	    var term = this.terms[i];
	    if (term.check(grammar, vals)) {
	      return true;
	    }
	  }
	  return false;
	};
	
	pexprs.Seq.prototype.check = function(grammar, vals) {
	  var pos = 0;
	  for (var i = 0; i < this.factors.length; i++) {
	    var factor = this.factors[i];
	    if (factor.check(grammar, vals.slice(pos))) {
	      pos += factor.getArity();
	    } else {
	      return false;
	    }
	  }
	  return true;
	};
	
	pexprs.Iter.prototype.check = function(grammar, vals) {
	  var arity = this.getArity();
	  var columns = vals.slice(0, arity);
	  if (columns.length !== arity) {
	    return false;
	  }
	  var rowCount = columns[0].length;
	  var i;
	  for (i = 1; i < arity; i++) {
	    if (columns[i].length !== rowCount) {
	      return false;
	    }
	  }
	
	  for (i = 0; i < rowCount; i++) {
	    var row = [];
	    for (var j = 0; j < arity; j++) {
	      row.push(columns[j][i]);
	    }
	    if (!this.expr.check(grammar, row)) {
	      return false;
	    }
	  }
	
	  return true;
	};
	
	pexprs.Not.prototype.check = function(grammar, vals) {
	  return true;
	};
	
	pexprs.Lookahead.prototype.check =
	pexprs.Lex.prototype.check =
	pexprs.Value.prototype.check =
	pexprs.Arr.prototype.check = function(grammar, vals) {
	  return this.expr.check(grammar, vals);
	};
	
	pexprs.Obj.prototype.check = function(grammar, vals) {
	  var fixedArity = this.getArity();
	  if (this.isLenient) {
	    fixedArity--;
	  }
	
	  var pos = 0;
	  for (var i = 0; i < fixedArity; i++) {
	    var pattern = this.properties[i].pattern;
	    if (pattern.check(grammar, vals.slice(pos))) {
	      pos += pattern.getArity();
	    } else {
	      return false;
	    }
	  }
	
	  return this.isLenient ? typeof vals[pos] === 'object' && vals[pos] : true;
	};
	
	pexprs.Apply.prototype.check = function(grammar, vals) {
	  if (!(vals[0] instanceof nodes.Node &&
	        vals[0].grammar === grammar &&
	        vals[0].ctorName === this.ruleName)) {
	    return false;
	  }
	
	  // TODO: think about *not* doing the following checks, i.e., trusting that the rule
	  // was correctly constructed.
	  var ruleNode = vals[0];
	  var body = grammar.ruleBodies[this.ruleName];
	  return body.check(grammar, ruleNode.children) && ruleNode.numChildren() === body.getArity();
	};
	
	pexprs.UnicodeChar.prototype.check = function(grammar, vals) {
	  return vals[0] instanceof nodes.Node &&
	         vals[0].isTerminal() &&
	         typeof vals[0].primitiveValue === 'string';
	};
	
	pexprs.TypeCheck.prototype.check = function(grammar, vals) {
	  return vals[0] instanceof nodes.Node &&
	         typeof vals[0].primitiveValue === this.type;
	};
	
	},{"./common":39,"./nodes":42,"./pexprs":59}],48:[function(require,module,exports){
	'use strict';
	
	// --------------------------------------------------------------------
	// Imports
	// --------------------------------------------------------------------
	
	var InputStream = require('./InputStream');
	var Trace = require('./Trace');
	var common = require('./common');
	var nodes = require('./nodes');
	var pexprs = require('./pexprs');
	
	var TerminalNode = nodes.TerminalNode;
	var NonterminalNode = nodes.NonterminalNode;
	var IterationNode = nodes.IterationNode;
	
	// --------------------------------------------------------------------
	// Operations
	// --------------------------------------------------------------------
	
	// A safer version of hasOwnProperty.
	var hasOwnProp = Object.prototype.hasOwnProperty;
	
	/*
	  Evaluate the expression and return `true` if it succeeds, `false` otherwise. This method should
	  only be called directly by `State.prototype.eval(expr)`, which also updates the data structures
	  that are used for tracing. (Making those updates in a method of `State` enables the trace-specific
	  data structures to be "secrets" of that class, which is good for modularity.)
	
	  The contract of this method is as follows:
	  * When the return value is `true`,
	    - the state object will have `expr.getArity()` more bindings than it did before the call.
	  * When the return value is `false`,
	    - the state object may have more bindings than it did before the call, and
	    - its input stream's position may be anywhere.
	
	  Note that `State.prototype.eval(expr)`, unlike this method, guarantees that neither the state
	  object's bindings nor its input stream's position will change if the expression fails to match.
	*/
	pexprs.PExpr.prototype.eval = common.abstract;  // function(state) { ... }
	
	pexprs.any.eval = function(state) {
	  var origPos = state.skipSpacesIfInSyntacticContext();
	  var inputStream = state.inputStream;
	  var value = inputStream.next();
	  if (value === common.fail) {
	    state.processFailure(origPos, this);
	    return false;
	  } else {
	    var interval = inputStream.interval(origPos);
	    state.bindings.push(new TerminalNode(state.grammar, value, interval));
	    return true;
	  }
	};
	
	pexprs.end.eval = function(state) {
	  var origPos = state.skipSpacesIfInSyntacticContext();
	  var inputStream = state.inputStream;
	  if (inputStream.atEnd()) {
	    var interval = inputStream.interval(inputStream.pos);
	    state.bindings.push(new TerminalNode(state.grammar, undefined, interval));
	    return true;
	  } else {
	    state.processFailure(origPos, this);
	    return false;
	  }
	};
	
	pexprs.Prim.prototype.eval = function(state) {
	  var origPos = state.skipSpacesIfInSyntacticContext();
	  var inputStream = state.inputStream;
	  if (this.match(inputStream) === common.fail) {
	    state.processFailure(origPos, this);
	    return false;
	  } else {
	    var interval = inputStream.interval(origPos);
	    var primitiveValue = this.obj;
	    state.bindings.push(new TerminalNode(state.grammar, primitiveValue, interval));
	    return true;
	  }
	};
	
	pexprs.Prim.prototype.match = function(inputStream) {
	  return typeof this.obj === 'string' ?
	      inputStream.matchString(this.obj) :
	      inputStream.matchExactly(this.obj);
	};
	
	pexprs.Range.prototype.eval = function(state) {
	  var origPos = state.skipSpacesIfInSyntacticContext();
	  var inputStream = state.inputStream;
	  var obj = inputStream.next();
	  if (typeof obj === typeof this.from && this.from <= obj && obj <= this.to) {
	    var interval = inputStream.interval(origPos);
	    state.bindings.push(new TerminalNode(state.grammar, obj, interval));
	    return true;
	  } else {
	    state.processFailure(origPos, this);
	    return false;
	  }
	};
	
	pexprs.Param.prototype.eval = function(state) {
	  return state.eval(state.currentApplication().args[this.index]);
	};
	
	pexprs.Lex.prototype.eval = function(state) {
	  state.enterLexifiedContext();
	  var ans = state.eval(this.expr);
	  state.exitLexifiedContext();
	  return ans;
	};
	
	pexprs.Alt.prototype.eval = function(state) {
	  for (var idx = 0; idx < this.terms.length; idx++) {
	    if (state.eval(this.terms[idx])) {
	      return true;
	    }
	  }
	  return false;
	};
	
	pexprs.Seq.prototype.eval = function(state) {
	  for (var idx = 0; idx < this.factors.length; idx++) {
	    var factor = this.factors[idx];
	    if (!state.eval(factor)) {
	      return false;
	    }
	  }
	  return true;
	};
	
	pexprs.Iter.prototype.eval = function(state) {
	  var inputStream = state.inputStream;
	  var origPos = inputStream.pos;
	  var arity = this.getArity();
	  var cols = [];
	  while (cols.length < arity) {
	    cols.push([]);
	  }
	  var numMatches = 0;
	  var idx;
	  while (numMatches < this.maxNumMatches && state.eval(this.expr)) {
	    numMatches++;
	    var row = state.bindings.splice(state.bindings.length - arity, arity);
	    for (idx = 0; idx < row.length; idx++) {
	      cols[idx].push(row[idx]);
	    }
	  }
	  if (numMatches < this.minNumMatches) {
	    return false;
	  }
	  var interval;
	  if (numMatches === 0) {
	    interval = inputStream.interval(origPos, origPos);
	  } else {
	    var firstCol = cols[0];
	    var lastCol = cols[cols.length - 1];
	    interval = inputStream.interval(
	        firstCol[0].interval.startIdx,
	        lastCol[lastCol.length - 1].interval.endIdx);
	  }
	  for (idx = 0; idx < cols.length; idx++) {
	    state.bindings.push(new IterationNode(state.grammar, cols[idx], interval,
	      this instanceof pexprs.Opt));
	  }
	  return true;
	};
	
	pexprs.Not.prototype.eval = function(state) {
	  /*
	    TODO:
	    - Right now we're just throwing away all of the failures that happen inside a `not`, and
	      recording `this` as a failed expression.
	    - Double negation should be equivalent to lookahead, but that's not the case right now wrt
	      failures. E.g., ~~'foo' produces a failure for ~~'foo', but maybe it should produce
	      a failure for 'foo' instead.
	  */
	
	  var inputStream = state.inputStream;
	  var origPos = inputStream.pos;
	  var failuresInfo = state.getFailuresInfo();
	
	  var ans = state.eval(this.expr);
	
	  state.restoreFailuresInfo(failuresInfo);
	  if (ans) {
	    state.processFailure(origPos, this);
	    return false;
	  }
	
	  inputStream.pos = origPos;
	  return true;
	};
	
	pexprs.Lookahead.prototype.eval = function(state) {
	  var inputStream = state.inputStream;
	  var origPos = inputStream.pos;
	  if (state.eval(this.expr)) {
	    inputStream.pos = origPos;
	    return true;
	  } else {
	    return false;
	  }
	};
	
	pexprs.Arr.prototype.eval = function(state) {
	  var obj = state.inputStream.next();
	  if (Array.isArray(obj)) {
	    state.pushInputStream(InputStream.newFor(obj));
	    var ans = state.eval(this.expr) && state.inputStream.atEnd();
	    state.popInputStream();
	    return ans;
	  } else {
	    return false;
	  }
	};
	
	pexprs.Value.prototype.eval = function(state) {
	  var obj = state.inputStream.next();
	  if (typeof obj === 'string') {
	    state.pushInputStream(InputStream.newFor(obj));
	    var ans = state.eval(this.expr) && state.inputStream.atEnd();
	    state.popInputStream();
	    return ans;
	  } else {
	    return false;
	  }
	};
	
	pexprs.Obj.prototype.eval = function(state) {
	  var inputStream = state.inputStream;
	  var origPos = inputStream.pos;
	  var obj = inputStream.next();
	  if (obj !== common.fail && obj && (typeof obj === 'object' || typeof obj === 'function')) {
	    var numOwnPropertiesMatched = 0;
	    for (var idx = 0; idx < this.properties.length; idx++) {
	      var property = this.properties[idx];
	      if (!hasOwnProp.call(obj, property.name)) {
	        return false;
	      }
	      var value = obj[property.name];
	      var expr = property.pattern;
	      state.pushInputStream(expr.newInputStreamFor([value], state.grammar));
	      var matched = state.eval(expr) && state.inputStream.atEnd();
	      state.popInputStream();
	      if (!matched) {
	        return false;
	      }
	      numOwnPropertiesMatched++;
	    }
	    if (this.isLenient) {
	      var remainder = {};
	      for (var p in obj) {
	        if (hasOwnProp.call(obj, p) && this.properties.indexOf(p) < 0) {
	          remainder[p] = obj[p];
	        }
	      }
	      var interval = inputStream.interval(origPos);
	      state.bindings.push(new TerminalNode(state.grammar, remainder, interval));
	      return true;
	    } else {
	      return numOwnPropertiesMatched === Object.keys(obj).length;
	    }
	  } else {
	    return false;
	  }
	};
	
	pexprs.Apply.prototype.eval = function(state) {
	  var caller = state.currentApplication();
	  var actuals = caller ? caller.args : [];
	  var app = this.substituteParams(actuals);
	
	  // Skip whitespace at the application site, if the rule that's being applied is syntactic
	  if (app !== state.applySpaces && (app.isSyntactic() || state.inSyntacticContext())) {
	    state.skipSpaces();
	  }
	
	  var posInfo = state.getCurrentPosInfo();
	  if (posInfo.isActive(app)) {
	    // This rule is already active at this position, i.e., it is left-recursive.
	    return app.handleCycle(state);
	  }
	
	  var memoKey = app.toMemoKey();
	  var memoRec = posInfo.memo[memoKey];
	  return memoRec && posInfo.shouldUseMemoizedResult(memoRec) ?
	      state.useMemoizedResult(memoRec) :
	      app.reallyEval(state, !caller);
	};
	
	pexprs.Apply.prototype.handleCycle = function(state) {
	  var posInfo = state.getCurrentPosInfo();
	  var currentLeftRecursion = posInfo.currentLeftRecursion;
	  var memoKey = this.toMemoKey();
	  var memoRec = posInfo.memo[memoKey];
	
	  if (currentLeftRecursion && currentLeftRecursion.headApplication.toMemoKey() === memoKey) {
	    // We already know about this left recursion, but it's possible there are "involved
	    // applications" that we don't already know about, so...
	    memoRec.updateInvolvedApplicationMemoKeys();
	  } else if (!memoRec) {
	    // New left recursion detected! Memoize a failure to try to get a seed parse.
	    memoRec = posInfo.memo[memoKey] =
	        {pos: -1, value: false};
	    posInfo.startLeftRecursion(this, memoRec);
	  }
	  return state.useMemoizedResult(memoRec);
	};
	
	pexprs.Apply.prototype.reallyEval = function(state, isTopLevelApplication) {
	  var inputStream = state.inputStream;
	  var origPos = inputStream.pos;
	  var origPosInfo = state.getCurrentPosInfo();
	  var body = state.grammar.ruleBodies[this.ruleName];
	  var description = state.grammar.ruleDescriptions[this.ruleName];
	
	  origPosInfo.enter(this);
	
	  if (description) {
	    var origFailuresInfo = state.getFailuresInfo();
	  }
	
	  var value = this.evalOnce(body, state);
	  var currentLR = origPosInfo.currentLeftRecursion;
	  var memoKey = this.toMemoKey();
	  var isHeadOfLeftRecursion = currentLR && currentLR.headApplication.toMemoKey() === memoKey;
	  var memoized = true;
	
	  if (isHeadOfLeftRecursion) {
	    value = this.growSeedResult(body, state, origPos, currentLR, value);
	    origPosInfo.endLeftRecursion();
	  } else if (currentLR && currentLR.isInvolved(memoKey)) {
	    // Don't memoize the result
	    memoized = false;
	  } else {
	    origPosInfo.memo[memoKey] = {
	      pos: inputStream.pos,
	      value: value,
	      failuresAtRightmostPosition: state.cloneRightmostFailures()
	    };
	  }
	
	  if (description) {
	    state.restoreFailuresInfo(origFailuresInfo);
	    if (!value) {
	      state.processFailure(origPos, this);
	    }
	
	    if (memoized) {
	      origPosInfo.memo[memoKey].failuresAtRightmostPosition = state.cloneRightmostFailures();
	    }
	  }
	
	  // Record trace information in the memo table, so that it is available if the memoized result
	  // is used later.
	  if (state.isTracing() && origPosInfo.memo[memoKey]) {
	    var entry = state.getTraceEntry(origPos, this, value);
	    entry.setLeftRecursive(isHeadOfLeftRecursion);
	    origPosInfo.memo[memoKey].traceEntry = entry;
	  }
	
	  origPosInfo.exit();
	
	  if (value) {
	    state.bindings.push(value);
	    return !isTopLevelApplication || this.entireInputWasConsumed(state);
	  } else {
	    return false;
	  }
	};
	
	pexprs.Apply.prototype.evalOnce = function(expr, state) {
	  var inputStream = state.inputStream;
	  var origPos = inputStream.pos;
	
	  // If `matchNodes` is true and the next thing in the input stream is a Node whose type matches
	  // this rule, then accept that as a valid match -- but not for the top-level application.
	  if (state.matchNodes && state.applicationStack.length > 1) {
	    var node = inputStream.next();
	    if (node instanceof nodes.Node &&
	        node.grammar === state.grammar &&
	        node.ctorName === this.ruleName) {
	      return node;
	    } else {
	      inputStream.pos = origPos;
	    }
	  }
	
	  if (state.eval(expr)) {
	    var arity = expr.getArity();
	    var bindings = state.bindings.splice(state.bindings.length - arity, arity);
	    var ans =
	        new NonterminalNode(state.grammar, this.ruleName, bindings, inputStream.interval(origPos));
	    return ans;
	  } else {
	    return false;
	  }
	};
	
	pexprs.Apply.prototype.growSeedResult = function(body, state, origPos, lrMemoRec, newValue) {
	  if (!newValue) {
	    return false;
	  }
	
	  var inputStream = state.inputStream;
	
	  while (true) {
	    lrMemoRec.pos = inputStream.pos;
	    lrMemoRec.value = newValue;
	    lrMemoRec.failuresAtRightmostPosition = state.cloneRightmostFailures();
	
	    if (state.isTracing()) {
	      var children = state.trace[state.trace.length - 1].children.slice();
	      lrMemoRec.traceEntry = new Trace(state.inputStream, origPos, this, newValue, children);
	    }
	    inputStream.pos = origPos;
	    newValue = this.evalOnce(body, state);
	    if (inputStream.pos <= lrMemoRec.pos) {
	      break;
	    }
	  }
	  if (state.isTracing()) {
	    state.trace.pop();  // Drop last trace entry since `value` was unused.
	    lrMemoRec.traceEntry = null;
	  }
	  inputStream.pos = lrMemoRec.pos;
	  return lrMemoRec.value;
	};
	
	pexprs.Apply.prototype.entireInputWasConsumed = function(state) {
	  if (this.isSyntactic()) {
	    state.skipSpaces();
	  }
	  if (!state.eval(pexprs.end)) {
	    return false;
	  }
	  state.bindings.pop();  // discard the binding that was added by `end` in the check above
	  return true;
	};
	
	pexprs.UnicodeChar.prototype.eval = function(state) {
	  var origPos = state.skipSpacesIfInSyntacticContext();
	  var inputStream = state.inputStream;
	  var value = inputStream.next();
	  if (value === common.fail || !this.pattern.test(value)) {
	    state.processFailure(origPos, this);
	    return false;
	  } else {
	    var interval = inputStream.interval(origPos);
	    state.bindings.push(new TerminalNode(state.grammar, value, interval));
	    return true;
	  }
	};
	
	pexprs.TypeCheck.prototype.eval = function(state) {
	  var inputStream = state.inputStream;
	  var origPos = inputStream.pos;
	  var value = inputStream.next();
	  if (typeof value === this.type) {
	    var interval = inputStream.interval(origPos);
	    state.bindings.push(new TerminalNode(state.grammar, value, interval));
	    return true;
	  } else {
	    state.processFailure(origPos, this);
	    return false;
	  }
	};
	
	},{"./InputStream":31,"./Trace":38,"./common":39,"./nodes":42,"./pexprs":59}],49:[function(require,module,exports){
	'use strict';
	
	// --------------------------------------------------------------------
	// Imports
	// --------------------------------------------------------------------
	
	var common = require('./common');
	var pexprs = require('./pexprs');
	
	// --------------------------------------------------------------------
	// Operations
	// --------------------------------------------------------------------
	
	pexprs.PExpr.prototype.getArity = common.abstract;
	
	pexprs.any.getArity =
	pexprs.end.getArity =
	pexprs.Prim.prototype.getArity =
	pexprs.Range.prototype.getArity =
	pexprs.Param.prototype.getArity =
	pexprs.Apply.prototype.getArity =
	pexprs.TypeCheck.prototype.getArity =
	pexprs.UnicodeChar.prototype.getArity = function() {
	  return 1;
	};
	
	pexprs.Alt.prototype.getArity = function() {
	  // This is ok b/c all terms must have the same arity -- this property is
	  // checked by the Grammar constructor.
	  return this.terms.length === 0 ? 0 : this.terms[0].getArity();
	};
	
	pexprs.Seq.prototype.getArity = function() {
	  var arity = 0;
	  for (var idx = 0; idx < this.factors.length; idx++) {
	    arity += this.factors[idx].getArity();
	  }
	  return arity;
	};
	
	pexprs.Iter.prototype.getArity = function() {
	  return this.expr.getArity();
	};
	
	pexprs.Not.prototype.getArity = function() {
	  return 0;
	};
	
	pexprs.Lookahead.prototype.getArity =
	pexprs.Lex.prototype.getArity =
	pexprs.Value.prototype.getArity =
	pexprs.Arr.prototype.getArity = function() {
	  return this.expr.getArity();
	};
	
	pexprs.Obj.prototype.getArity = function() {
	  var arity = this.isLenient ? 1 : 0;
	  for (var idx = 0; idx < this.properties.length; idx++) {
	    arity += this.properties[idx].pattern.getArity();
	  }
	  return arity;
	};
	
	},{"./common":39,"./pexprs":59}],50:[function(require,module,exports){
	'use strict';
	
	// --------------------------------------------------------------------
	// Imports
	// --------------------------------------------------------------------
	
	var common = require('./common');
	var errors = require('./errors');
	var pexprs = require('./pexprs');
	
	// --------------------------------------------------------------------
	// Operations
	// --------------------------------------------------------------------
	
	function typeFromPrimitive(prim) {
	  return typeof prim === 'string' ? pexprs.TYPE_STRING : pexprs.TYPE_VALUE;
	}
	
	/*
	  Returns the type of this PExpr -- one of `TYPE_STRING`, `TYPE_VALUE`, or `TYPE_ANY`.
	  String expressions (e.g. `"foo"`) and value expressions (e.g., `null`, `3`) cannot be combined
	  with each other, but they may be combined with TYPE_ANY expressions. An exception is thrown if
	  an expression with inconsistent types is encountered.
	
	  The result of this method is cached as a property on the node. For rule applications, the
	  result is cached in a separate memo table, so that the result can be shared for all `Apply`
	  nodes having the same parameters.
	*/
	pexprs.PExpr.prototype.getExprType = function(grammar, optMemo) {
	  if (!this.hasOwnProperty('_exprType')) {
	    var memo = optMemo || Object.create(null);
	    Object.defineProperty(this, '_exprType', {
	      value: this._calculateExprType(grammar, memo)
	    });
	  }
	  return this._exprType;
	};
	
	/*
	  The actual implementation of getExprType, with no caching logic. These implementations
	  should only be invoked directly by the implementation of getExprType above.
	*/
	pexprs.PExpr.prototype._calculateExprType = common.abstract;
	
	pexprs.any._calculateExprType =
	pexprs.UnicodeChar.prototype._calculateExprType = function(grammar, memo) {
	  return pexprs.TYPE_STRING;
	};
	
	pexprs.end._calculateExprType = function(grammar, memo) {
	  return pexprs.TYPE_ANY;
	};
	
	pexprs.Range.prototype._calculateExprType = function(grammar, memo) {
	  return typeFromPrimitive(this.from) | typeFromPrimitive(this.to);
	};
	
	pexprs.Arr.prototype._calculateExprType =
	pexprs.Obj.prototype._calculateExprType =
	pexprs.TypeCheck.prototype._calculateExprType =
	pexprs.Value.prototype._calculateExprType = function(grammar, memo) {
	  return pexprs.TYPE_VALUE;
	};
	
	pexprs.Prim.prototype._calculateExprType = function(grammar, memo) {
	  return typeFromPrimitive(this.obj);
	};
	
	pexprs.Alt.prototype._calculateExprType = function(grammar, memo) {
	  var ans = this.terms.reduce(function(acc, t) {
	    return acc | t.getExprType(grammar, memo);
	  }, 0);
	  if (ans === pexprs.TYPE_INCONSISTENT) {
	    throw errors.exprMixesValueAndStringExpressions(this);
	  }
	  return ans;
	};
	
	pexprs.Seq.prototype._calculateExprType = function(grammar, memo) {
	  var ans = this.factors.reduce(function(acc, f) {
	    return acc | f.getExprType(grammar, memo);
	  }, 0);
	  if (ans === pexprs.TYPE_INCONSISTENT) {
	    throw errors.exprMixesValueAndStringExpressions(this);
	  }
	  return ans;
	};
	
	pexprs.Iter.prototype._calculateExprType =
	pexprs.Not.prototype._calculateExprType =
	pexprs.Lookahead.prototype._calculateExprType =
	pexprs.Lex.prototype._calculateExprType = function(grammar, memo) {
	  return this.expr.getExprType(grammar, memo);
	};
	
	pexprs.Param.prototype._calculateExprType = function(grammar, memo) {
	  // Throwing an error here ensures that we never calculate and cache the result of an
	  // expression containing unbound parameters, because it could be incorrect.
	  throw new Error('Cannot calculate _calculateExprType for unbound parameter');
	};
	
	pexprs.Apply.prototype._calculateExprType = function(grammar, memo) {
	  var key = this.toMemoKey();
	  if (!Object.prototype.hasOwnProperty.call(memo, key)) {
	    var inlinedBody = grammar.ruleBodies[this.ruleName].substituteParams(this.args);
	
	    // Initialize a memo value to prevent infinite recursion for recursive rules.
	    // Use TYPE_ANY because it is the identity of the bitwise 'or' operator, ensuring that a rule
	    // like 'x = x | String' will return `TYPE_STRING`.
	    memo[key] = pexprs.TYPE_ANY;
	
	    memo[key] = inlinedBody.getExprType(grammar, memo);
	  }
	  return memo[key];
	};
	
	},{"./common":39,"./errors":40,"./pexprs":59}],51:[function(require,module,exports){
	'use strict';
	
	// --------------------------------------------------------------------
	// Imports
	// --------------------------------------------------------------------
	
	var common = require('./common');
	var pexprs = require('./pexprs');
	
	// --------------------------------------------------------------------
	// Operations
	// --------------------------------------------------------------------
	
	/*
	  Called at grammar creation time to rewrite a rule body, replacing each reference to a formal
	  parameter with a `Param` node. Returns a PExpr -- either a new one, or the original one if
	  it was modified in place.
	*/
	pexprs.PExpr.prototype.introduceParams = common.abstract;
	
	pexprs.any.introduceParams =
	pexprs.end.introduceParams =
	pexprs.Prim.prototype.introduceParams =
	pexprs.Range.prototype.introduceParams =
	pexprs.Param.prototype.introduceParams =
	pexprs.TypeCheck.prototype.introduceParams =
	pexprs.UnicodeChar.prototype.introduceParams = function(formals) {
	  return this;
	};
	
	pexprs.Alt.prototype.introduceParams = function(formals) {
	  this.terms.forEach(function(term, idx, terms) {
	    terms[idx] = term.introduceParams(formals);
	  });
	  return this;
	};
	
	pexprs.Seq.prototype.introduceParams = function(formals) {
	  this.factors.forEach(function(factor, idx, factors) {
	    factors[idx] = factor.introduceParams(formals);
	  });
	  return this;
	};
	
	pexprs.Iter.prototype.introduceParams =
	pexprs.Not.prototype.introduceParams =
	pexprs.Lookahead.prototype.introduceParams =
	pexprs.Lex.prototype.introduceParams =
	pexprs.Value.prototype.introduceParams =
	pexprs.Arr.prototype.introduceParams = function(formals) {
	  this.expr = this.expr.introduceParams(formals);
	  return this;
	};
	
	pexprs.Obj.prototype.introduceParams = function(formals) {
	  this.properties.forEach(function(property, idx) {
	    property.pattern = property.pattern.introduceParams(formals);
	  });
	  return this;
	};
	
	pexprs.Apply.prototype.introduceParams = function(formals) {
	  var index = formals.indexOf(this.ruleName);
	  if (index >= 0) {
	    if (this.args.length > 0) {
	      // TODO: Should this be supported? See issue #64.
	      throw new Error('Parameterized rules cannot be passed as arguments to another rule.');
	    }
	    return new pexprs.Param(index);
	  } else {
	    this.args.forEach(function(arg, idx, args) {
	      args[idx] = arg.introduceParams(formals);
	    });
	    return this;
	  }
	};
	
	},{"./common":39,"./pexprs":59}],52:[function(require,module,exports){
	'use strict';
	
	// --------------------------------------------------------------------
	// Imports
	// --------------------------------------------------------------------
	
	var common = require('./common');
	var pexprs = require('./pexprs');
	
	// --------------------------------------------------------------------
	// Operations
	// --------------------------------------------------------------------
	
	// Returns `true` if this parsing expression may accept without consuming any input.
	pexprs.PExpr.prototype.isNullable = function(grammar) {
	  return this._isNullable(grammar, Object.create(null));
	};
	
	pexprs.PExpr.prototype._isNullable = common.abstract;
	
	pexprs.any._isNullable =
	pexprs.Range.prototype._isNullable =
	pexprs.Param.prototype._isNullable =
	pexprs.Plus.prototype._isNullable =
	pexprs.Value.prototype._isNullable =
	pexprs.Arr.prototype._isNullable =
	pexprs.Obj.prototype._isNullable =
	pexprs.TypeCheck.prototype._isNullable =
	pexprs.UnicodeChar.prototype._isNullable = function(grammar, memo) {
	  return false;
	};
	
	pexprs.end._isNullable = function(grammar, memo) {
	  return true;
	};
	
	pexprs.Prim.prototype._isNullable = function(grammar, memo) {
	  if (typeof this.obj === 'string') {
	    // This is an over-simplification: it's only correct if the input is a string. If it's an array
	    // or an object, then the empty string parsing expression is not nullable.
	    return this.obj === '';
	  } else {
	    return false;
	  }
	};
	
	pexprs.Alt.prototype._isNullable = function(grammar, memo) {
	  return this.terms.length === 0 ||
	      this.terms.some(function(term) { return term._isNullable(grammar, memo); });
	};
	
	pexprs.Seq.prototype._isNullable = function(grammar, memo) {
	  return this.factors.every(function(factor) { return factor._isNullable(grammar, memo); });
	};
	
	pexprs.Star.prototype._isNullable =
	pexprs.Opt.prototype._isNullable =
	pexprs.Not.prototype._isNullable =
	pexprs.Lookahead.prototype._isNullable = function(grammar, memo) {
	  return true;
	};
	
	pexprs.Lex.prototype._isNullable = function(grammar, memo) {
	  return this.expr._isNullable(grammar, memo);
	};
	
	pexprs.Apply.prototype._isNullable = function(grammar, memo) {
	  var key = this.toMemoKey();
	  if (!Object.prototype.hasOwnProperty.call(memo, key)) {
	    var body = grammar.ruleBodies[this.ruleName];
	    var inlined = body.substituteParams(this.args);
	    memo[key] = false;  // Prevent infinite recursion for recursive rules.
	    memo[key] = inlined._isNullable(grammar, memo);
	  }
	  return memo[key];
	};
	
	},{"./common":39,"./pexprs":59}],53:[function(require,module,exports){
	'use strict';
	
	// --------------------------------------------------------------------
	// Imports
	// --------------------------------------------------------------------
	
	var common = require('./common');
	var pexprs = require('./pexprs');
	
	// --------------------------------------------------------------------
	// Private stuff
	// --------------------------------------------------------------------
	
	function escapeString(str) {
	  var output = JSON.stringify(str);
	  output = output.replace(/[\u2028\u2029]/g, function(char, pos, str) {
	    var hex = char.codePointAt(0).toString(16);
	    return '\\u' + '0000'.slice(hex.length) + hex;
	  });
	  return output;
	}
	
	function getIntervalInfo(expr, grammarInterval) {
	  if (expr.interval && grammarInterval) {
	    var adjusted = expr.interval.relativeTo(grammarInterval);
	    var start = adjusted.startIdx;
	    var end = adjusted.endIdx;
	    return '.withInterval(decl.sourceInterval(' + start + ', ' + end + '))';
	  }
	  return '';
	}
	
	// --------------------------------------------------------------------
	// Operations
	// --------------------------------------------------------------------
	
	pexprs.PExpr.prototype.outputRecipe = common.abstract;
	
	pexprs.any.outputRecipe = function(sb, formals, grammarInterval) {
	  throw new Error('should never output a recipe for `any` expression');
	};
	
	pexprs.end.outputRecipe = function(sb, formals, grammarInterval) {
	  throw new Error('should never output a recipe for `end` expression');
	};
	
	pexprs.Prim.prototype.outputRecipe = function(sb, formals, grammarInterval) {
	  sb.append('this.prim(');
	  sb.append(typeof this.obj === 'string' ? escapeString(this.obj) : '' + this.obj);
	  sb.append(')' + getIntervalInfo(this, grammarInterval));
	};
	
	pexprs.Range.prototype.outputRecipe = function(sb, formals, grammarInterval) {
	  sb.append('this.range(');
	  sb.append(JSON.stringify(this.from));
	  sb.append(', ');
	  sb.append(JSON.stringify(this.to));
	  sb.append(')' + getIntervalInfo(this, grammarInterval));
	};
	
	pexprs.Param.prototype.outputRecipe = function(sb, formals, grammarInterval) {
	  sb.append('this.param(' + this.index + ')' + getIntervalInfo(this, grammarInterval));
	};
	
	pexprs.Alt.prototype.outputRecipe = function(sb, formals, grammarInterval) {
	  sb.append('this.alt(');
	  for (var idx = 0; idx < this.terms.length; idx++) {
	    if (idx > 0) {
	      sb.append(', ');
	    }
	    this.terms[idx].outputRecipe(sb, formals, grammarInterval);
	  }
	  sb.append(')' + getIntervalInfo(this, grammarInterval));
	};
	
	pexprs.Extend.prototype.outputRecipe = function(sb, formals, grammarInterval) {
	  var extension = this.terms[0]; // [extension, orginal]
	  extension.outputRecipe(sb, formals, grammarInterval);
	};
	
	pexprs.Seq.prototype.outputRecipe = function(sb, formals, grammarInterval) {
	  sb.append('this.seq(');
	  for (var idx = 0; idx < this.factors.length; idx++) {
	    if (idx > 0) {
	      sb.append(', ');
	    }
	    this.factors[idx].outputRecipe(sb, formals, grammarInterval);
	  }
	  sb.append(')' + getIntervalInfo(this, grammarInterval));
	};
	
	pexprs.Star.prototype.outputRecipe =
	pexprs.Plus.prototype.outputRecipe =
	pexprs.Opt.prototype.outputRecipe =
	pexprs.Not.prototype.outputRecipe =
	pexprs.Lex.prototype.outputRecipe =
	pexprs.Arr.prototype.outputRecipe = function(sb, formals, grammarInterval) {
	  sb.append('this.' + this.constructor.name.toLowerCase() + '(');
	  this.expr.outputRecipe(sb, formals, grammarInterval);
	  sb.append(')' + getIntervalInfo(this, grammarInterval));
	};
	
	pexprs.Lookahead.prototype.outputRecipe = function(sb, formals, grammarInterval) {
	  sb.append('this.la(');
	  this.expr.outputRecipe(sb, formals, grammarInterval);
	  sb.append(')' + getIntervalInfo(this, grammarInterval));
	};
	
	pexprs.Value.prototype.outputRecipe = function(sb, formals, grammarInterval) {
	  sb.append('this.val(');
	  this.expr.outputRecipe(sb, formals, grammarInterval);
	  sb.append(')' + getIntervalInfo(this, grammarInterval));
	};
	
	pexprs.Obj.prototype.outputRecipe = function(sb, formals, grammarInterval) {
	  function outputPropertyRecipe(prop) {
	    sb.append('{name: ');
	    sb.append(JSON.stringify(prop.name));
	    sb.append(', pattern: ');
	    prop.pattern.outputRecipe(sb, formals, grammarInterval);
	    sb.append('}');
	  }
	
	  sb.append('this.obj([');
	  for (var idx = 0; idx < this.properties.length; idx++) {
	    if (idx > 0) {
	      sb.append(', ');
	    }
	    outputPropertyRecipe(this.properties[idx]);
	  }
	  sb.append('], ');
	  sb.append(!!this.isLenient);
	  sb.append(')' + getIntervalInfo(this, grammarInterval));
	};
	
	pexprs.Apply.prototype.outputRecipe = function(sb, formals, grammarInterval) {
	  sb.append('this.app(');
	  sb.append(JSON.stringify(this.ruleName));
	  if (this.ruleName.indexOf('_') >= 0 && formals.length > 0) {
	    var apps = formals.
	        map(function(_, idx) { return 'this.param(' + idx + ')'; });
	    sb.append(', [' + apps.join(', ') + ']');
	  } else if (this.args.length > 0) {
	    sb.append(', [');
	    this.args.forEach(function(arg, idx) {
	      if (idx > 0) {
	        sb.append(', ');
	      }
	      arg.outputRecipe(sb, formals, grammarInterval);
	    });
	    sb.append(']');
	  }
	  sb.append(')' + getIntervalInfo(this, grammarInterval));
	};
	
	},{"./common":39,"./pexprs":59}],54:[function(require,module,exports){
	'use strict';
	
	// --------------------------------------------------------------------
	// Imports
	// --------------------------------------------------------------------
	
	var common = require('./common');
	var pexprs = require('./pexprs');
	
	// --------------------------------------------------------------------
	// Operations
	// --------------------------------------------------------------------
	
	/*
	  Returns a PExpr that results from recursively replacing every formal parameter (i.e., instance
	  of `Param`) inside this PExpr with its actual value from `actuals` (an Array).
	
	  The receiver must not be modified; a new PExpr must be returned if any replacement is necessary.
	*/
	pexprs.PExpr.prototype.substituteParams = common.abstract;  // function (actuals) { ... }
	
	pexprs.any.substituteParams =
	pexprs.end.substituteParams =
	pexprs.Prim.prototype.substituteParams =
	pexprs.Range.prototype.substituteParams =
	pexprs.Prim.prototype.substituteParams =
	pexprs.TypeCheck.prototype.substituteParams =
	pexprs.UnicodeChar.prototype.substituteParams = function(actuals) {
	  return this;
	};
	
	pexprs.Param.prototype.substituteParams = function(actuals) {
	  return actuals[this.index];
	};
	
	pexprs.Alt.prototype.substituteParams = function(actuals) {
	  return new pexprs.Alt(
	      this.terms.map(function(term) { return term.substituteParams(actuals); }));
	};
	
	pexprs.Seq.prototype.substituteParams = function(actuals) {
	  return new pexprs.Seq(
	      this.factors.map(function(factor) { return factor.substituteParams(actuals); }));
	};
	
	pexprs.Iter.prototype.substituteParams =
	pexprs.Not.prototype.substituteParams =
	pexprs.Lookahead.prototype.substituteParams =
	pexprs.Lex.prototype.substituteParams =
	pexprs.Value.prototype.substituteParams =
	pexprs.Arr.prototype.substituteParams = function(actuals) {
	  return new this.constructor(this.expr.substituteParams(actuals));
	};
	
	pexprs.Obj.prototype.substituteParams = function(actuals) {
	  var properties = this.properties.map(function(property) {
	    return {
	      name: property.name,
	      pattern: property.pattern.substituteParams(actuals)
	    };
	  });
	  return new pexprs.Obj(properties, this.isLenient);
	};
	
	pexprs.Apply.prototype.substituteParams = function(actuals) {
	  if (this.args.length === 0) {
	    // Avoid making a copy of this application, as an optimization
	    return this;
	  } else {
	    var args = this.args.map(function(arg) { return arg.substituteParams(actuals); });
	    return new pexprs.Apply(this.ruleName, args);
	  }
	};
	
	},{"./common":39,"./pexprs":59}],55:[function(require,module,exports){
	'use strict';
	
	// --------------------------------------------------------------------
	// Imports
	// --------------------------------------------------------------------
	
	var common = require('./common');
	var pexprs = require('./pexprs');
	
	// --------------------------------------------------------------------
	// Operations
	// --------------------------------------------------------------------
	
	/* Trying to convert pexpr to string that could be used as argument of function. */
	/* Rulename could be used directly, and for those we don't have a better way to */
	/* represent, use '$'+index (index in the arguement list) */
	
	pexprs.PExpr.prototype.toArgString = common.abstract;
	
	pexprs.any.toArgString = function() {
	  return 'any';
	};
	
	pexprs.end.toArgString = function() {
	  return 'end';
	};
	
	pexprs.Prim.prototype.toArgString =
	pexprs.Range.prototype.toArgString =
	pexprs.Lex.prototype.toArgString =
	pexprs.Value.prototype.toArgString =
	pexprs.Obj.prototype.toArgString =
	pexprs.UnicodeChar.prototype.toArgString = function() {
	  return '';
	};
	
	pexprs.Alt.prototype.toArgString = function() {
	  return 'alt_option';
	};
	
	pexprs.Param.prototype.toArgString = function() {
	  return '$param' + this.index;
	};
	
	pexprs.Seq.prototype.toArgString = function() {
	  if (this.factors.length === 1) {
	    return this.factors[0].toArgString().length === 0 ?
	      '$0' :
	      this.factors[0].toArgString();
	  }
	
	  var ans = [];
	  var count = {};
	  this.factors.forEach(function(factor, idx) {
	      var arg = factor.toArgString().length > 0 ?
	        factor.toArgString() :
	        '$' + (idx + 1);
	
	      // Check if argument name duplicated
	      if (!count[arg]) {
	        count[arg] = 1;
	      } else {
	        if (count[arg] === 1) {
	          ans[ans.indexOf(arg)] = arg + '_1';
	        }
	        arg = arg + '_' + (++count[arg]);
	      }
	
	      ans.push(arg);
	    });
	
	  return ans.join(',');
	};
	
	pexprs.Iter.prototype.toArgString = function() {
	  var str = this.expr.toArgString();
	  str = str.length === 0 ? 'Iter' : str.split(',').join('_');
	  switch (this.operator) {
	    case '*':
	    case '+':
	      return str + 's'; // return `argument`s
	    case '?': return 'opt' + str; // return opt`argument`
	  }
	};
	
	pexprs.Not.prototype.toArgString = function() {
	  return 'not_' + this.expr.toArgString().split(',').join('_');
	};
	
	pexprs.Lookahead.prototype.toArgString = function() {
	  return 'has' + this.expr.toArgString().split(',').join('_');
	};
	
	pexprs.Arr.prototype.toArgString = function() {
	  return '_' + this.expr.toString().split(',').join('_');
	};
	
	pexprs.Apply.prototype.toArgString = function() {
	  return this.ruleName;
	};
	
	pexprs.TypeCheck.prototype.toArgString = function() {
	  return this.type;
	};
	
	},{"./common":39,"./pexprs":59}],56:[function(require,module,exports){
	'use strict';
	
	// --------------------------------------------------------------------
	// Imports
	// --------------------------------------------------------------------
	
	var common = require('./common');
	var pexprs = require('./pexprs');
	
	// --------------------------------------------------------------------
	// Operations
	// --------------------------------------------------------------------
	
	// Returns a string representing the PExpr, for use as a UI label, etc.
	pexprs.PExpr.prototype.toDisplayString = common.abstract;
	
	pexprs.Alt.prototype.toDisplayString =
	pexprs.Seq.prototype.toDisplayString =
	pexprs.Iter.prototype.toDisplayString =
	pexprs.Not.prototype.toDisplayString =
	pexprs.Lookahead.prototype.toDisplayString =
	pexprs.Lex.prototype.toDisplayString =
	pexprs.Value.prototype.toDisplayString =
	pexprs.Arr.prototype.toDisplayString =
	pexprs.Obj.prototype.toDisplayString = function() {
	  if (this.interval) {
	    return this.interval.trimmed().contents;
	  }
	  return '[' + this.constructor.name + ']';
	};
	
	pexprs.any.toDisplayString = function() {
	  return 'any';
	};
	
	pexprs.end.toDisplayString = function() {
	  return 'end';
	};
	
	pexprs.Prim.prototype.toDisplayString = function() {
	  return JSON.stringify(this.obj);
	};
	
	pexprs.Range.prototype.toDisplayString = function() {
	  return JSON.stringify(this.from) + '..' + JSON.stringify(this.to);
	};
	
	pexprs.Param.prototype.toDisplayString = function() {
	  return '#' + this.index;
	};
	
	pexprs.Apply.prototype.toDisplayString = function() {
	  return this.toString();
	};
	
	pexprs.UnicodeChar.prototype.toDisplayString = function() {
	  return 'Unicode {' + this.category + '} character';
	};
	
	pexprs.TypeCheck.prototype.toDisplayString = function() {
	  return 'TypeCheck(' + JSON.stringify(this.type) + ')';
	};
	
	},{"./common":39,"./pexprs":59}],57:[function(require,module,exports){
	'use strict';
	
	// --------------------------------------------------------------------
	// Imports
	// --------------------------------------------------------------------
	
	var Failure = require('./Failure');
	var common = require('./common');
	var pexprs = require('./pexprs');
	
	// --------------------------------------------------------------------
	// Operations
	// --------------------------------------------------------------------
	
	pexprs.PExpr.prototype.toFailure = common.abstract;
	
	pexprs.any.toFailure = function(grammar) {
	  return new Failure('any object', 'description');
	};
	
	pexprs.end.toFailure = function(grammar) {
	  return new Failure('end of input', 'description');
	};
	
	pexprs.Prim.prototype.toFailure = function(grammar) {
	  return typeof this.obj === 'string' ?
	    new Failure(this.obj, 'string') :
	    new Failure(JSON.stringify(this.obj), 'code');
	};
	
	pexprs.Range.prototype.toFailure = function(grammar) {
	  // TODO: come up with something better
	  return new Failure(JSON.stringify(this.from) + '..' + JSON.stringify(this.to), 'code');
	};
	
	pexprs.Not.prototype.toFailure = function(grammar) {
	  var description = this.expr === pexprs.any ?
	      'nothing' :
	      'not ' + this.expr.toFailure(grammar);
	  return new Failure(description, 'description');
	};
	
	// TODO: think about Arr, Str, and Obj
	
	pexprs.Apply.prototype.toFailure = function(grammar) {
	  var description = grammar.ruleDescriptions[this.ruleName];
	  if (!description) {
	    var article = (/^[aeiouAEIOU]/.test(this.ruleName) ? 'an' : 'a');
	    description = article + ' ' + this.ruleName;
	  }
	  return new Failure(description, 'description');
	};
	
	pexprs.UnicodeChar.prototype.toFailure = function(grammar) {
	  return new Failure(this.toDisplayString(), 'description');
	};
	
	pexprs.TypeCheck.prototype.toFailure = function(grammar) {
	  return new Failure('a value of type ' + JSON.stringify(this.type), 'description');
	};
	
	},{"./Failure":28,"./common":39,"./pexprs":59}],58:[function(require,module,exports){
	'use strict';
	
	// --------------------------------------------------------------------
	// Imports
	// --------------------------------------------------------------------
	
	var common = require('./common');
	var pexprs = require('./pexprs');
	
	// --------------------------------------------------------------------
	// Operations
	// --------------------------------------------------------------------
	
	/*
	  e1.toString() === e2.toString() ==> e1 and e2 are semantically equivalent.
	  Note that this is not an iff (<==>): e.g.,
	  (~"b" "a").toString() !== ("a").toString(), even though
	  ~"b" "a" and "a" are interchangeable in any grammar,
	  both in terms of the languages they accept and their arities.
	*/
	pexprs.PExpr.prototype.toString = common.abstract;
	
	pexprs.any.toString = function() {
	  return 'any';
	};
	
	pexprs.end.toString = function() {
	  return 'end';
	};
	
	pexprs.Prim.prototype.toString = function() {
	  return JSON.stringify(this.obj);
	};
	
	pexprs.Range.prototype.toString = function() {
	  return JSON.stringify(this.from) + '..' + JSON.stringify(this.to);
	};
	
	pexprs.Param.prototype.toString = function() {
	  return '$' + this.index;
	};
	
	pexprs.Lex.prototype.toString = function() {
	  return '#(' + this.expr.toString() + ')';
	};
	
	pexprs.Value.prototype.toString = function() {
	  return '$(' + this.expr.toString() + ')';
	};
	
	pexprs.Alt.prototype.toString = function() {
	  return this.terms.length === 1 ?
	    this.terms[0].toString() :
	    '(' + this.terms.map(function(term) { return term.toString(); }).join(' | ') + ')';
	};
	
	pexprs.Seq.prototype.toString = function() {
	  return this.factors.length === 1 ?
	    this.factors[0].toString() :
	    '(' + this.factors.map(function(factor) { return factor.toString(); }).join(' ') + ')';
	};
	
	pexprs.Iter.prototype.toString = function() {
	  return this.expr + this.operator;
	};
	
	pexprs.Not.prototype.toString = function() {
	  return '~' + this.expr;
	};
	
	pexprs.Lookahead.prototype.toString = function() {
	  return '&' + this.expr;
	};
	
	pexprs.Arr.prototype.toString = function() {
	  return '[' + this.expr.toString() + ']';
	};
	
	pexprs.Obj.prototype.toString = function() {
	  var parts = ['{'];
	
	  var first = true;
	  function emit(part) {
	    if (first) {
	      first = false;
	    } else {
	      parts.push(', ');
	    }
	    parts.push(part);
	  }
	
	  this.properties.forEach(function(property) {
	    emit(JSON.stringify(property.name) + ': ' + property.pattern.toString());
	  });
	  if (this.isLenient) {
	    emit('...');
	  }
	
	  parts.push('}');
	  return parts.join('');
	};
	
	pexprs.Apply.prototype.toString = function() {
	  if (this.args.length > 0) {
	    var ps = this.args.map(function(arg) { return arg.toString(); });
	    return this.ruleName + '<' + ps.join(',') + '>';
	  } else {
	    return this.ruleName;
	  }
	};
	
	pexprs.UnicodeChar.prototype.toString = function() {
	  return '\\p{' + this.category + '}';
	};
	
	pexprs.TypeCheck.prototype.toString = function() {
	  return 'TypeCheck(' + JSON.stringify(this.type) + ')';
	};
	
	},{"./common":39,"./pexprs":59}],59:[function(require,module,exports){
	'use strict';
	
	// --------------------------------------------------------------------
	// Imports
	// --------------------------------------------------------------------
	
	var InputStream = require('./InputStream');
	var UnicodeCategories = require('../third_party/UnicodeCategories');
	var common = require('./common');
	var errors = require('./errors');
	var inherits = require('inherits');
	
	// --------------------------------------------------------------------
	// Private stuff
	// --------------------------------------------------------------------
	
	// General stuff
	
	// Constants representing the type of a PExpr. See pexprs-getExprType.js for
	// more information.
	var TYPE_ANY = 0;
	var TYPE_STRING = 1;
	var TYPE_VALUE = 2;
	
	function PExpr() {
	  throw new Error("PExpr cannot be instantiated -- it's abstract");
	}
	
	// Set the `interval` property to the interval containing the source for this expression.
	PExpr.prototype.withInterval = function(interval) {
	  if (interval) {
	    this.interval = interval.trimmed();
	  }
	  return this;
	};
	
	// Allocate the appropriate input stream for this expression and the given values.
	PExpr.prototype.newInputStreamFor = function(values, grammar) {
	  var exprType = this.getExprType(grammar);
	  if (values.length === 1 && typeof values[0] === 'string' && exprType !== TYPE_VALUE) {
	    return InputStream.newFor(values[0]);
	  } else {
	    return InputStream.newFor(values);
	  }
	};
	
	// Any
	
	var any = Object.create(PExpr.prototype);
	
	// End
	
	var end = Object.create(PExpr.prototype);
	
	// Primitives
	
	function Prim(obj) {
	  this.obj = obj;
	}
	inherits(Prim, PExpr);
	
	// Ranges
	
	function Range(from, to) {
	  this.from = from;
	  this.to = to;
	}
	inherits(Range, PExpr);
	
	// Parameters
	
	function Param(index) {
	  this.index = index;
	}
	inherits(Param, PExpr);
	
	// Alternation
	
	function Alt(terms) {
	  this.terms = terms;
	}
	inherits(Alt, PExpr);
	
	// Extend is an implementation detail of rule extension
	
	function Extend(superGrammar, name, body) {
	  this.superGrammar = superGrammar;
	  this.name = name;
	  this.body = body;
	  var origBody = superGrammar.ruleBodies[name];
	  this.terms = [body, origBody];
	}
	inherits(Extend, Alt);
	
	// Sequences
	
	function Seq(factors) {
	  this.factors = factors;
	}
	inherits(Seq, PExpr);
	
	// Iterators and optionals
	
	function Iter(expr) {
	  this.expr = expr;
	}
	inherits(Iter, PExpr);
	
	function Star(expr) {
	  this.expr = expr;
	}
	inherits(Star, Iter);
	
	function Plus(expr) {
	  this.expr = expr;
	}
	inherits(Plus, Iter);
	
	function Opt(expr) {
	  this.expr = expr;
	}
	inherits(Opt, Iter);
	
	Star.prototype.operator = '*';
	Plus.prototype.operator = '+';
	Opt.prototype.operator = '?';
	
	Star.prototype.minNumMatches = 0;
	Plus.prototype.minNumMatches = 1;
	Opt.prototype.minNumMatches = 0;
	
	Star.prototype.maxNumMatches = Number.POSITIVE_INFINITY;
	Plus.prototype.maxNumMatches = Number.POSITIVE_INFINITY;
	Opt.prototype.maxNumMatches = 1;
	
	// Predicates
	
	function Not(expr) {
	  this.expr = expr;
	}
	inherits(Not, PExpr);
	
	function Lookahead(expr) {
	  this.expr = expr;
	}
	inherits(Lookahead, PExpr);
	
	// "Lexification"
	
	function Lex(expr) {
	  this.expr = expr;
	}
	inherits(Lex, PExpr);
	
	// "Value-ification"
	
	function Value(expr) {
	  this.expr = expr;
	}
	inherits(Value, PExpr);
	
	// Array decomposition
	
	function Arr(expr) {
	  this.expr = expr;
	}
	inherits(Arr, PExpr);
	
	// String decomposition
	
	function Str(expr) {
	  this.expr = expr;
	}
	inherits(Str, PExpr);
	
	// Object decomposition
	
	function Obj(properties, isLenient) {
	  var names = properties.map(function(property) { return property.name; });
	  var duplicates = common.getDuplicates(names);
	  if (duplicates.length > 0) {
	    throw errors.duplicatePropertyNames(duplicates);
	  } else {
	    this.properties = properties;
	    this.isLenient = isLenient;
	  }
	}
	inherits(Obj, PExpr);
	
	// Rule application
	
	function Apply(ruleName, optArgs) {
	  this.ruleName = ruleName;
	  this.args = optArgs || [];
	}
	inherits(Apply, PExpr);
	
	Apply.prototype.isSyntactic = function() {
	  return common.isSyntactic(this.ruleName);
	};
	
	// This method just caches the result of `this.toString()` in a non-enumerable property.
	Apply.prototype.toMemoKey = function() {
	  if (!this._memoKey) {
	    Object.defineProperty(this, '_memoKey', {value: this.toString()});
	  }
	  return this._memoKey;
	};
	
	// Unicode character
	function UnicodeChar(category) {
	  this.category = category;
	  this.pattern = UnicodeCategories[category];
	}
	inherits(UnicodeChar, PExpr);
	
	// Matches a value of a particular type (using `typeof`).
	function TypeCheck(t) {
	  this.type = t;
	}
	inherits(TypeCheck, PExpr);
	
	// --------------------------------------------------------------------
	// Exports
	// --------------------------------------------------------------------
	
	exports.TYPE_ANY = TYPE_ANY;
	exports.TYPE_STRING = TYPE_STRING;
	exports.TYPE_VALUE = TYPE_VALUE;
	exports.TYPE_INCONSISTENT = TYPE_STRING | TYPE_VALUE;
	
	exports.PExpr = PExpr;
	exports.any = any;
	exports.end = end;
	exports.Prim = Prim;
	exports.Range = Range;
	exports.Param = Param;
	exports.Alt = Alt;
	exports.Extend = Extend;
	exports.Seq = Seq;
	exports.Iter = Iter;
	exports.Star = Star;
	exports.Plus = Plus;
	exports.Opt = Opt;
	exports.Not = Not;
	exports.Lookahead = Lookahead;
	exports.Lex = Lex;
	exports.Value = Value;
	exports.Arr = Arr;
	exports.Str = Str;
	exports.Obj = Obj;
	exports.Apply = Apply;
	exports.UnicodeChar = UnicodeChar;
	exports.TypeCheck = TypeCheck;
	
	// --------------------------------------------------------------------
	// Extensions
	// --------------------------------------------------------------------
	
	require('./pexprs-assertAllApplicationsAreValid');
	require('./pexprs-assertChoicesHaveUniformArity');
	require('./pexprs-assertIteratedExprsAreNotNullable');
	require('./pexprs-assertValuesAndStringsAreNotMixed');
	require('./pexprs-check');
	require('./pexprs-eval');
	require('./pexprs-getArity');
	require('./pexprs-getExprType');
	require('./pexprs-outputRecipe');
	require('./pexprs-introduceParams');
	require('./pexprs-toArgString');
	require('./pexprs-isNullable');
	require('./pexprs-substituteParams');
	require('./pexprs-toDisplayString');
	require('./pexprs-toFailure');
	require('./pexprs-toString');
	
	},{"../third_party/UnicodeCategories":61,"./InputStream":31,"./common":39,"./errors":40,"./pexprs-assertAllApplicationsAreValid":43,"./pexprs-assertChoicesHaveUniformArity":44,"./pexprs-assertIteratedExprsAreNotNullable":45,"./pexprs-assertValuesAndStringsAreNotMixed":46,"./pexprs-check":47,"./pexprs-eval":48,"./pexprs-getArity":49,"./pexprs-getExprType":50,"./pexprs-introduceParams":51,"./pexprs-isNullable":52,"./pexprs-outputRecipe":53,"./pexprs-substituteParams":54,"./pexprs-toArgString":55,"./pexprs-toDisplayString":56,"./pexprs-toFailure":57,"./pexprs-toString":58,"inherits":24}],60:[function(require,module,exports){
	'use strict';
	
	// --------------------------------------------------------------------
	// Imports
	// --------------------------------------------------------------------
	
	var common = require('./common');
	
	// --------------------------------------------------------------------
	// Private stuff
	// --------------------------------------------------------------------
	
	// Given an array of numbers `arr`, return an array of the numbers as strings,
	// right-justified and padded to the same length.
	function padNumbersToEqualLength(arr) {
	  var maxLen = 0;
	  var strings = arr.map(function(n) {
	    var str = n.toString();
	    maxLen = Math.max(maxLen, str.length);
	    return str;
	  });
	  return strings.map(function(s) { return common.padLeft(s, maxLen); });
	}
	
	// Produce a new string that would be the result of copying the contents
	// of the string `src` onto `dest` at offset `offest`.
	function strcpy(dest, src, offset) {
	  var origDestLen = dest.length;
	  var start = dest.slice(0, offset);
	  var end = dest.slice(offset + src.length);
	  return (start + src + end).substr(0, origDestLen);
	}
	
	// --------------------------------------------------------------------
	// Exports
	// --------------------------------------------------------------------
	
	// Return an object with the line and column information for the given
	// offset in `str`.
	exports.getLineAndColumn = function(str, offset) {
	  var lineNum = 1;
	  var colNum = 1;
	
	  var currOffset = 0;
	  var lineStartOffset = 0;
	
	  var nextLine = null;
	  var prevLine = null;
	  var prevLineStartOffset = -1;
	
	  while (currOffset < offset) {
	    var c = str.charAt(currOffset++);
	    if (c === '\n') {
	      lineNum++;
	      colNum = 1;
	      prevLineStartOffset = lineStartOffset;
	      lineStartOffset = currOffset;
	    } else if (c !== '\r') {
	      colNum++;
	    }
	  }
	
	  // Find the end of the target line.
	  var lineEndOffset = str.indexOf('\n', lineStartOffset);
	  if (lineEndOffset === -1) {
	    lineEndOffset = str.length;
	  } else {
	    // Get the next line.
	    var nextLineEndOffset = str.indexOf('\n', lineEndOffset + 1);
	    nextLine = nextLineEndOffset === -1 ? str.slice(lineEndOffset)
	                                        : str.slice(lineEndOffset, nextLineEndOffset);
	    // Strip leading and trailing EOL char(s).
	    nextLine = nextLine.replace(/^\r?\n/, '').replace(/\r$/, '');
	  }
	
	  // Get the previous line.
	  if (prevLineStartOffset >= 0) {
	    prevLine = str.slice(prevLineStartOffset, lineStartOffset)
	                  .replace(/\r?\n$/, '');  // Strip trailing EOL char(s).
	  }
	
	  // Get the target line, stripping a trailing carriage return if necessary.
	  var line = str.slice(lineStartOffset, lineEndOffset).replace(/\r$/, '');
	
	  return {
	    lineNum: lineNum,
	    colNum: colNum,
	    line: line,
	    prevLine: prevLine,
	    nextLine: nextLine
	  };
	};
	
	// Return a nicely-formatted string describing the line and column for the
	// given offset in `str`.
	exports.getLineAndColumnMessage = function(str, offset /* ...ranges */) {
	  var repeatStr = common.repeatStr;
	
	  var lineAndCol = exports.getLineAndColumn(str, offset);
	  var sb = new common.StringBuffer();
	  sb.append('Line ' + lineAndCol.lineNum + ', col ' + lineAndCol.colNum + ':\n');
	
	  // An array of the previous, current, and next line numbers as strings of equal length.
	  var lineNumbers = padNumbersToEqualLength([
	      lineAndCol.prevLine == null ? 0 : lineAndCol.lineNum - 1,
	      lineAndCol.lineNum,
	      lineAndCol.nextLine == null ? 0 : lineAndCol.lineNum + 1
	  ]);
	
	  // Helper for appending formatting input lines to the buffer.
	  function appendLine(num, content, prefix) {
	    sb.append(prefix + lineNumbers[num] + ' | ' + content + '\n');
	  }
	
	  // Include the previous line for context if possible.
	  if (lineAndCol.prevLine != null) {
	    appendLine(0, lineAndCol.prevLine, '  ');
	  }
	  // Line that the error occurred on.
	  appendLine(1, lineAndCol.line, '> ');
	
	  // Build up the line that points to the offset and possible indicates one or more ranges.
	  // Start with a blank line, and indicate each range by overlaying a string of `~` chars.
	  var lineLen = lineAndCol.line.length;
	  var indicationLine = repeatStr(' ', lineLen + 1);
	  var ranges = Array.prototype.slice.call(arguments, 2);
	  for (var i = 0; i < ranges.length; ++i) {
	    var startIdx = ranges[i][0];
	    var endIdx = ranges[i][1];
	    common.assert(startIdx >= 0 && startIdx <= endIdx, 'range start must be >= 0 and <= end');
	
	    var lineStartOffset = offset - lineAndCol.colNum + 1;
	    startIdx = Math.max(0, startIdx - lineStartOffset);
	    endIdx = Math.min(endIdx - lineStartOffset, lineLen);
	
	    indicationLine = strcpy(indicationLine, repeatStr('~', endIdx - startIdx), startIdx);
	  }
	  var gutterWidth = 2 + lineNumbers[1].length + 3;
	  sb.append(repeatStr(' ', gutterWidth));
	  indicationLine = strcpy(indicationLine, '^', lineAndCol.colNum - 1);
	  sb.append(indicationLine.replace(/ +$/, '') + '\n');
	
	  // Include the next line for context if possible.
	  if (lineAndCol.nextLine != null) {
	    appendLine(2, lineAndCol.nextLine, '  ');
	  }
	  return sb.contents();
	};
	
	},{"./common":39}],61:[function(require,module,exports){
	// Based on https://github.com/tvcutsem/es-lab/blob/master/src/parser/unicode.js.
	// These are just categories that are used in ES5.
	// The full list of Unicode categories is here: http://www.fileformat.info/info/unicode/category/index.htm.
	module.exports = {
	  // Letters
	  Lu: /[\u0041-\u005A]|[\u00C0-\u00D6]|[\u00D8-\u00DE]|[\u0100-\u0100]|[\u0102-\u0102]|[\u0104-\u0104]|[\u0106-\u0106]|[\u0108-\u0108]|[\u010A-\u010A]|[\u010C-\u010C]|[\u010E-\u010E]|[\u0110-\u0110]|[\u0112-\u0112]|[\u0114-\u0114]|[\u0116-\u0116]|[\u0118-\u0118]|[\u011A-\u011A]|[\u011C-\u011C]|[\u011E-\u011E]|[\u0120-\u0120]|[\u0122-\u0122]|[\u0124-\u0124]|[\u0126-\u0126]|[\u0128-\u0128]|[\u012A-\u012A]|[\u012C-\u012C]|[\u012E-\u012E]|[\u0130-\u0130]|[\u0132-\u0132]|[\u0134-\u0134]|[\u0136-\u0136]|[\u0139-\u0139]|[\u013B-\u013B]|[\u013D-\u013D]|[\u013F-\u013F]|[\u0141-\u0141]|[\u0143-\u0143]|[\u0145-\u0145]|[\u0147-\u0147]|[\u014A-\u014A]|[\u014C-\u014C]|[\u014E-\u014E]|[\u0150-\u0150]|[\u0152-\u0152]|[\u0154-\u0154]|[\u0156-\u0156]|[\u0158-\u0158]|[\u015A-\u015A]|[\u015C-\u015C]|[\u015E-\u015E]|[\u0160-\u0160]|[\u0162-\u0162]|[\u0164-\u0164]|[\u0166-\u0166]|[\u0168-\u0168]|[\u016A-\u016A]|[\u016C-\u016C]|[\u016E-\u016E]|[\u0170-\u0170]|[\u0172-\u0172]|[\u0174-\u0174]|[\u0176-\u0176]|[\u0178-\u0179]|[\u017B-\u017B]|[\u017D-\u017D]|[\u0181-\u0182]|[\u0184-\u0184]|[\u0186-\u0187]|[\u0189-\u018B]|[\u018E-\u0191]|[\u0193-\u0194]|[\u0196-\u0198]|[\u019C-\u019D]|[\u019F-\u01A0]|[\u01A2-\u01A2]|[\u01A4-\u01A4]|[\u01A6-\u01A7]|[\u01A9-\u01A9]|[\u01AC-\u01AC]|[\u01AE-\u01AF]|[\u01B1-\u01B3]|[\u01B5-\u01B5]|[\u01B7-\u01B8]|[\u01BC-\u01BC]|[\u01C4-\u01C4]|[\u01C7-\u01C7]|[\u01CA-\u01CA]|[\u01CD-\u01CD]|[\u01CF-\u01CF]|[\u01D1-\u01D1]|[\u01D3-\u01D3]|[\u01D5-\u01D5]|[\u01D7-\u01D7]|[\u01D9-\u01D9]|[\u01DB-\u01DB]|[\u01DE-\u01DE]|[\u01E0-\u01E0]|[\u01E2-\u01E2]|[\u01E4-\u01E4]|[\u01E6-\u01E6]|[\u01E8-\u01E8]|[\u01EA-\u01EA]|[\u01EC-\u01EC]|[\u01EE-\u01EE]|[\u01F1-\u01F1]|[\u01F4-\u01F4]|[\u01FA-\u01FA]|[\u01FC-\u01FC]|[\u01FE-\u01FE]|[\u0200-\u0200]|[\u0202-\u0202]|[\u0204-\u0204]|[\u0206-\u0206]|[\u0208-\u0208]|[\u020A-\u020A]|[\u020C-\u020C]|[\u020E-\u020E]|[\u0210-\u0210]|[\u0212-\u0212]|[\u0214-\u0214]|[\u0216-\u0216]|[\u0386-\u0386]|[\u0388-\u038A]|[\u038C-\u038C]|[\u038E-\u038F]|[\u0391-\u03A1]|[\u03A3-\u03AB]|[\u03D2-\u03D4]|[\u03DA-\u03DA]|[\u03DC-\u03DC]|[\u03DE-\u03DE]|[\u03E0-\u03E0]|[\u03E2-\u03E2]|[\u03E4-\u03E4]|[\u03E6-\u03E6]|[\u03E8-\u03E8]|[\u03EA-\u03EA]|[\u03EC-\u03EC]|[\u03EE-\u03EE]|[\u0401-\u040C]|[\u040E-\u042F]|[\u0460-\u0460]|[\u0462-\u0462]|[\u0464-\u0464]|[\u0466-\u0466]|[\u0468-\u0468]|[\u046A-\u046A]|[\u046C-\u046C]|[\u046E-\u046E]|[\u0470-\u0470]|[\u0472-\u0472]|[\u0474-\u0474]|[\u0476-\u0476]|[\u0478-\u0478]|[\u047A-\u047A]|[\u047C-\u047C]|[\u047E-\u047E]|[\u0480-\u0480]|[\u0490-\u0490]|[\u0492-\u0492]|[\u0494-\u0494]|[\u0496-\u0496]|[\u0498-\u0498]|[\u049A-\u049A]|[\u049C-\u049C]|[\u049E-\u049E]|[\u04A0-\u04A0]|[\u04A2-\u04A2]|[\u04A4-\u04A4]|[\u04A6-\u04A6]|[\u04A8-\u04A8]|[\u04AA-\u04AA]|[\u04AC-\u04AC]|[\u04AE-\u04AE]|[\u04B0-\u04B0]|[\u04B2-\u04B2]|[\u04B4-\u04B4]|[\u04B6-\u04B6]|[\u04B8-\u04B8]|[\u04BA-\u04BA]|[\u04BC-\u04BC]|[\u04BE-\u04BE]|[\u04C1-\u04C1]|[\u04C3-\u04C3]|[\u04C7-\u04C7]|[\u04CB-\u04CB]|[\u04D0-\u04D0]|[\u04D2-\u04D2]|[\u04D4-\u04D4]|[\u04D6-\u04D6]|[\u04D8-\u04D8]|[\u04DA-\u04DA]|[\u04DC-\u04DC]|[\u04DE-\u04DE]|[\u04E0-\u04E0]|[\u04E2-\u04E2]|[\u04E4-\u04E4]|[\u04E6-\u04E6]|[\u04E8-\u04E8]|[\u04EA-\u04EA]|[\u04EE-\u04EE]|[\u04F0-\u04F0]|[\u04F2-\u04F2]|[\u04F4-\u04F4]|[\u04F8-\u04F8]|[\u0531-\u0556]|[\u10A0-\u10C5]|[\u1E00-\u1E00]|[\u1E02-\u1E02]|[\u1E04-\u1E04]|[\u1E06-\u1E06]|[\u1E08-\u1E08]|[\u1E0A-\u1E0A]|[\u1E0C-\u1E0C]|[\u1E0E-\u1E0E]|[\u1E10-\u1E10]|[\u1E12-\u1E12]|[\u1E14-\u1E14]|[\u1E16-\u1E16]|[\u1E18-\u1E18]|[\u1E1A-\u1E1A]|[\u1E1C-\u1E1C]|[\u1E1E-\u1E1E]|[\u1E20-\u1E20]|[\u1E22-\u1E22]|[\u1E24-\u1E24]|[\u1E26-\u1E26]|[\u1E28-\u1E28]|[\u1E2A-\u1E2A]|[\u1E2C-\u1E2C]|[\u1E2E-\u1E2E]|[\u1E30-\u1E30]|[\u1E32-\u1E32]|[\u1E34-\u1E34]|[\u1E36-\u1E36]|[\u1E38-\u1E38]|[\u1E3A-\u1E3A]|[\u1E3C-\u1E3C]|[\u1E3E-\u1E3E]|[\u1E40-\u1E40]|[\u1E42-\u1E42]|[\u1E44-\u1E44]|[\u1E46-\u1E46]|[\u1E48-\u1E48]|[\u1E4A-\u1E4A]|[\u1E4C-\u1E4C]|[\u1E4E-\u1E4E]|[\u1E50-\u1E50]|[\u1E52-\u1E52]|[\u1E54-\u1E54]|[\u1E56-\u1E56]|[\u1E58-\u1E58]|[\u1E5A-\u1E5A]|[\u1E5C-\u1E5C]|[\u1E5E-\u1E5E]|[\u1E60-\u1E60]|[\u1E62-\u1E62]|[\u1E64-\u1E64]|[\u1E66-\u1E66]|[\u1E68-\u1E68]|[\u1E6A-\u1E6A]|[\u1E6C-\u1E6C]|[\u1E6E-\u1E6E]|[\u1E70-\u1E70]|[\u1E72-\u1E72]|[\u1E74-\u1E74]|[\u1E76-\u1E76]|[\u1E78-\u1E78]|[\u1E7A-\u1E7A]|[\u1E7C-\u1E7C]|[\u1E7E-\u1E7E]|[\u1E80-\u1E80]|[\u1E82-\u1E82]|[\u1E84-\u1E84]|[\u1E86-\u1E86]|[\u1E88-\u1E88]|[\u1E8A-\u1E8A]|[\u1E8C-\u1E8C]|[\u1E8E-\u1E8E]|[\u1E90-\u1E90]|[\u1E92-\u1E92]|[\u1E94-\u1E94]|[\u1EA0-\u1EA0]|[\u1EA2-\u1EA2]|[\u1EA4-\u1EA4]|[\u1EA6-\u1EA6]|[\u1EA8-\u1EA8]|[\u1EAA-\u1EAA]|[\u1EAC-\u1EAC]|[\u1EAE-\u1EAE]|[\u1EB0-\u1EB0]|[\u1EB2-\u1EB2]|[\u1EB4-\u1EB4]|[\u1EB6-\u1EB6]|[\u1EB8-\u1EB8]|[\u1EBA-\u1EBA]|[\u1EBC-\u1EBC]|[\u1EBE-\u1EBE]|[\u1EC0-\u1EC0]|[\u1EC2-\u1EC2]|[\u1EC4-\u1EC4]|[\u1EC6-\u1EC6]|[\u1EC8-\u1EC8]|[\u1ECA-\u1ECA]|[\u1ECC-\u1ECC]|[\u1ECE-\u1ECE]|[\u1ED0-\u1ED0]|[\u1ED2-\u1ED2]|[\u1ED4-\u1ED4]|[\u1ED6-\u1ED6]|[\u1ED8-\u1ED8]|[\u1EDA-\u1EDA]|[\u1EDC-\u1EDC]|[\u1EDE-\u1EDE]|[\u1EE0-\u1EE0]|[\u1EE2-\u1EE2]|[\u1EE4-\u1EE4]|[\u1EE6-\u1EE6]|[\u1EE8-\u1EE8]|[\u1EEA-\u1EEA]|[\u1EEC-\u1EEC]|[\u1EEE-\u1EEE]|[\u1EF0-\u1EF0]|[\u1EF2-\u1EF2]|[\u1EF4-\u1EF4]|[\u1EF6-\u1EF6]|[\u1EF8-\u1EF8]|[\u1F08-\u1F0F]|[\u1F18-\u1F1D]|[\u1F28-\u1F2F]|[\u1F38-\u1F3F]|[\u1F48-\u1F4D]|[\u1F59-\u1F59]|[\u1F5B-\u1F5B]|[\u1F5D-\u1F5D]|[\u1F5F-\u1F5F]|[\u1F68-\u1F6F]|[\u1F88-\u1F8F]|[\u1F98-\u1F9F]|[\u1FA8-\u1FAF]|[\u1FB8-\u1FBC]|[\u1FC8-\u1FCC]|[\u1FD8-\u1FDB]|[\u1FE8-\u1FEC]|[\u1FF8-\u1FFC]|[\u2102-\u2102]|[\u2107-\u2107]|[\u210B-\u210D]|[\u2110-\u2112]|[\u2115-\u2115]|[\u2119-\u211D]|[\u2124-\u2124]|[\u2126-\u2126]|[\u2128-\u2128]|[\u212A-\u212D]|[\u2130-\u2131]|[\u2133-\u2133]|[\uFF21-\uFF3A]/,
	  Ll: /[\u0061-\u007A]|[\u00AA-\u00AA]|[\u00B5-\u00B5]|[\u00BA-\u00BA]|[\u00DF-\u00F6]|[\u00F8-\u00FF]|[\u0101-\u0101]|[\u0103-\u0103]|[\u0105-\u0105]|[\u0107-\u0107]|[\u0109-\u0109]|[\u010B-\u010B]|[\u010D-\u010D]|[\u010F-\u010F]|[\u0111-\u0111]|[\u0113-\u0113]|[\u0115-\u0115]|[\u0117-\u0117]|[\u0119-\u0119]|[\u011B-\u011B]|[\u011D-\u011D]|[\u011F-\u011F]|[\u0121-\u0121]|[\u0123-\u0123]|[\u0125-\u0125]|[\u0127-\u0127]|[\u0129-\u0129]|[\u012B-\u012B]|[\u012D-\u012D]|[\u012F-\u012F]|[\u0131-\u0131]|[\u0133-\u0133]|[\u0135-\u0135]|[\u0137-\u0138]|[\u013A-\u013A]|[\u013C-\u013C]|[\u013E-\u013E]|[\u0140-\u0140]|[\u0142-\u0142]|[\u0144-\u0144]|[\u0146-\u0146]|[\u0148-\u0149]|[\u014B-\u014B]|[\u014D-\u014D]|[\u014F-\u014F]|[\u0151-\u0151]|[\u0153-\u0153]|[\u0155-\u0155]|[\u0157-\u0157]|[\u0159-\u0159]|[\u015B-\u015B]|[\u015D-\u015D]|[\u015F-\u015F]|[\u0161-\u0161]|[\u0163-\u0163]|[\u0165-\u0165]|[\u0167-\u0167]|[\u0169-\u0169]|[\u016B-\u016B]|[\u016D-\u016D]|[\u016F-\u016F]|[\u0171-\u0171]|[\u0173-\u0173]|[\u0175-\u0175]|[\u0177-\u0177]|[\u017A-\u017A]|[\u017C-\u017C]|[\u017E-\u0180]|[\u0183-\u0183]|[\u0185-\u0185]|[\u0188-\u0188]|[\u018C-\u018D]|[\u0192-\u0192]|[\u0195-\u0195]|[\u0199-\u019B]|[\u019E-\u019E]|[\u01A1-\u01A1]|[\u01A3-\u01A3]|[\u01A5-\u01A5]|[\u01A8-\u01A8]|[\u01AB-\u01AB]|[\u01AD-\u01AD]|[\u01B0-\u01B0]|[\u01B4-\u01B4]|[\u01B6-\u01B6]|[\u01B9-\u01BA]|[\u01BD-\u01BD]|[\u01C6-\u01C6]|[\u01C9-\u01C9]|[\u01CC-\u01CC]|[\u01CE-\u01CE]|[\u01D0-\u01D0]|[\u01D2-\u01D2]|[\u01D4-\u01D4]|[\u01D6-\u01D6]|[\u01D8-\u01D8]|[\u01DA-\u01DA]|[\u01DC-\u01DD]|[\u01DF-\u01DF]|[\u01E1-\u01E1]|[\u01E3-\u01E3]|[\u01E5-\u01E5]|[\u01E7-\u01E7]|[\u01E9-\u01E9]|[\u01EB-\u01EB]|[\u01ED-\u01ED]|[\u01EF-\u01F0]|[\u01F3-\u01F3]|[\u01F5-\u01F5]|[\u01FB-\u01FB]|[\u01FD-\u01FD]|[\u01FF-\u01FF]|[\u0201-\u0201]|[\u0203-\u0203]|[\u0205-\u0205]|[\u0207-\u0207]|[\u0209-\u0209]|[\u020B-\u020B]|[\u020D-\u020D]|[\u020F-\u020F]|[\u0211-\u0211]|[\u0213-\u0213]|[\u0215-\u0215]|[\u0217-\u0217]|[\u0250-\u02A8]|[\u0390-\u0390]|[\u03AC-\u03CE]|[\u03D0-\u03D1]|[\u03D5-\u03D6]|[\u03E3-\u03E3]|[\u03E5-\u03E5]|[\u03E7-\u03E7]|[\u03E9-\u03E9]|[\u03EB-\u03EB]|[\u03ED-\u03ED]|[\u03EF-\u03F2]|[\u0430-\u044F]|[\u0451-\u045C]|[\u045E-\u045F]|[\u0461-\u0461]|[\u0463-\u0463]|[\u0465-\u0465]|[\u0467-\u0467]|[\u0469-\u0469]|[\u046B-\u046B]|[\u046D-\u046D]|[\u046F-\u046F]|[\u0471-\u0471]|[\u0473-\u0473]|[\u0475-\u0475]|[\u0477-\u0477]|[\u0479-\u0479]|[\u047B-\u047B]|[\u047D-\u047D]|[\u047F-\u047F]|[\u0481-\u0481]|[\u0491-\u0491]|[\u0493-\u0493]|[\u0495-\u0495]|[\u0497-\u0497]|[\u0499-\u0499]|[\u049B-\u049B]|[\u049D-\u049D]|[\u049F-\u049F]|[\u04A1-\u04A1]|[\u04A3-\u04A3]|[\u04A5-\u04A5]|[\u04A7-\u04A7]|[\u04A9-\u04A9]|[\u04AB-\u04AB]|[\u04AD-\u04AD]|[\u04AF-\u04AF]|[\u04B1-\u04B1]|[\u04B3-\u04B3]|[\u04B5-\u04B5]|[\u04B7-\u04B7]|[\u04B9-\u04B9]|[\u04BB-\u04BB]|[\u04BD-\u04BD]|[\u04BF-\u04BF]|[\u04C2-\u04C2]|[\u04C4-\u04C4]|[\u04C8-\u04C8]|[\u04CC-\u04CC]|[\u04D1-\u04D1]|[\u04D3-\u04D3]|[\u04D5-\u04D5]|[\u04D7-\u04D7]|[\u04D9-\u04D9]|[\u04DB-\u04DB]|[\u04DD-\u04DD]|[\u04DF-\u04DF]|[\u04E1-\u04E1]|[\u04E3-\u04E3]|[\u04E5-\u04E5]|[\u04E7-\u04E7]|[\u04E9-\u04E9]|[\u04EB-\u04EB]|[\u04EF-\u04EF]|[\u04F1-\u04F1]|[\u04F3-\u04F3]|[\u04F5-\u04F5]|[\u04F9-\u04F9]|[\u0561-\u0587]|[\u10D0-\u10F6]|[\u1E01-\u1E01]|[\u1E03-\u1E03]|[\u1E05-\u1E05]|[\u1E07-\u1E07]|[\u1E09-\u1E09]|[\u1E0B-\u1E0B]|[\u1E0D-\u1E0D]|[\u1E0F-\u1E0F]|[\u1E11-\u1E11]|[\u1E13-\u1E13]|[\u1E15-\u1E15]|[\u1E17-\u1E17]|[\u1E19-\u1E19]|[\u1E1B-\u1E1B]|[\u1E1D-\u1E1D]|[\u1E1F-\u1E1F]|[\u1E21-\u1E21]|[\u1E23-\u1E23]|[\u1E25-\u1E25]|[\u1E27-\u1E27]|[\u1E29-\u1E29]|[\u1E2B-\u1E2B]|[\u1E2D-\u1E2D]|[\u1E2F-\u1E2F]|[\u1E31-\u1E31]|[\u1E33-\u1E33]|[\u1E35-\u1E35]|[\u1E37-\u1E37]|[\u1E39-\u1E39]|[\u1E3B-\u1E3B]|[\u1E3D-\u1E3D]|[\u1E3F-\u1E3F]|[\u1E41-\u1E41]|[\u1E43-\u1E43]|[\u1E45-\u1E45]|[\u1E47-\u1E47]|[\u1E49-\u1E49]|[\u1E4B-\u1E4B]|[\u1E4D-\u1E4D]|[\u1E4F-\u1E4F]|[\u1E51-\u1E51]|[\u1E53-\u1E53]|[\u1E55-\u1E55]|[\u1E57-\u1E57]|[\u1E59-\u1E59]|[\u1E5B-\u1E5B]|[\u1E5D-\u1E5D]|[\u1E5F-\u1E5F]|[\u1E61-\u1E61]|[\u1E63-\u1E63]|[\u1E65-\u1E65]|[\u1E67-\u1E67]|[\u1E69-\u1E69]|[\u1E6B-\u1E6B]|[\u1E6D-\u1E6D]|[\u1E6F-\u1E6F]|[\u1E71-\u1E71]|[\u1E73-\u1E73]|[\u1E75-\u1E75]|[\u1E77-\u1E77]|[\u1E79-\u1E79]|[\u1E7B-\u1E7B]|[\u1E7D-\u1E7D]|[\u1E7F-\u1E7F]|[\u1E81-\u1E81]|[\u1E83-\u1E83]|[\u1E85-\u1E85]|[\u1E87-\u1E87]|[\u1E89-\u1E89]|[\u1E8B-\u1E8B]|[\u1E8D-\u1E8D]|[\u1E8F-\u1E8F]|[\u1E91-\u1E91]|[\u1E93-\u1E93]|[\u1E95-\u1E9B]|[\u1EA1-\u1EA1]|[\u1EA3-\u1EA3]|[\u1EA5-\u1EA5]|[\u1EA7-\u1EA7]|[\u1EA9-\u1EA9]|[\u1EAB-\u1EAB]|[\u1EAD-\u1EAD]|[\u1EAF-\u1EAF]|[\u1EB1-\u1EB1]|[\u1EB3-\u1EB3]|[\u1EB5-\u1EB5]|[\u1EB7-\u1EB7]|[\u1EB9-\u1EB9]|[\u1EBB-\u1EBB]|[\u1EBD-\u1EBD]|[\u1EBF-\u1EBF]|[\u1EC1-\u1EC1]|[\u1EC3-\u1EC3]|[\u1EC5-\u1EC5]|[\u1EC7-\u1EC7]|[\u1EC9-\u1EC9]|[\u1ECB-\u1ECB]|[\u1ECD-\u1ECD]|[\u1ECF-\u1ECF]|[\u1ED1-\u1ED1]|[\u1ED3-\u1ED3]|[\u1ED5-\u1ED5]|[\u1ED7-\u1ED7]|[\u1ED9-\u1ED9]|[\u1EDB-\u1EDB]|[\u1EDD-\u1EDD]|[\u1EDF-\u1EDF]|[\u1EE1-\u1EE1]|[\u1EE3-\u1EE3]|[\u1EE5-\u1EE5]|[\u1EE7-\u1EE7]|[\u1EE9-\u1EE9]|[\u1EEB-\u1EEB]|[\u1EED-\u1EED]|[\u1EEF-\u1EEF]|[\u1EF1-\u1EF1]|[\u1EF3-\u1EF3]|[\u1EF5-\u1EF5]|[\u1EF7-\u1EF7]|[\u1EF9-\u1EF9]|[\u1F00-\u1F07]|[\u1F10-\u1F15]|[\u1F20-\u1F27]|[\u1F30-\u1F37]|[\u1F40-\u1F45]|[\u1F50-\u1F57]|[\u1F60-\u1F67]|[\u1F70-\u1F7D]|[\u1F80-\u1F87]|[\u1F90-\u1F97]|[\u1FA0-\u1FA7]|[\u1FB0-\u1FB4]|[\u1FB6-\u1FB7]|[\u1FBE-\u1FBE]|[\u1FC2-\u1FC4]|[\u1FC6-\u1FC7]|[\u1FD0-\u1FD3]|[\u1FD6-\u1FD7]|[\u1FE0-\u1FE7]|[\u1FF2-\u1FF4]|[\u1FF6-\u1FF7]|[\u207F-\u207F]|[\u210A-\u210A]|[\u210E-\u210F]|[\u2113-\u2113]|[\u2118-\u2118]|[\u212E-\u212F]|[\u2134-\u2134]|[\uFB00-\uFB06]|[\uFB13-\uFB17]|[\uFF41-\uFF5A]/,
	  Lt: /[\u01C5-\u01C5]|[\u01C8-\u01C8]|[\u01CB-\u01CB]|[\u01F2-\u01F2]/,
	  Lm: /[\u02B0-\u02B8]|[\u02BB-\u02C1]|[\u02D0-\u02D1]|[\u02E0-\u02E4]|[\u037A-\u037A]|[\u0559-\u0559]|[\u0640-\u0640]|[\u06E5-\u06E6]|[\u0E46-\u0E46]|[\u0EC6-\u0EC6]|[\u3005-\u3005]|[\u3031-\u3035]|[\u309D-\u309E]|[\u30FC-\u30FE]|[\uFF70-\uFF70]|[\uFF9E-\uFF9F]/,
	  Lo: /[\u01AA-\u01AA]|[\u01BB-\u01BB]|[\u01BE-\u01C3]|[\u03F3-\u03F3]|[\u04C0-\u04C0]|[\u05D0-\u05EA]|[\u05F0-\u05F2]|[\u0621-\u063A]|[\u0641-\u064A]|[\u0671-\u06B7]|[\u06BA-\u06BE]|[\u06C0-\u06CE]|[\u06D0-\u06D3]|[\u06D5-\u06D5]|[\u0905-\u0939]|[\u093D-\u093D]|[\u0950-\u0950]|[\u0958-\u0961]|[\u0985-\u098C]|[\u098F-\u0990]|[\u0993-\u09A8]|[\u09AA-\u09B0]|[\u09B2-\u09B2]|[\u09B6-\u09B9]|[\u09DC-\u09DD]|[\u09DF-\u09E1]|[\u09F0-\u09F1]|[\u0A05-\u0A0A]|[\u0A0F-\u0A10]|[\u0A13-\u0A28]|[\u0A2A-\u0A30]|[\u0A32-\u0A33]|[\u0A35-\u0A36]|[\u0A38-\u0A39]|[\u0A59-\u0A5C]|[\u0A5E-\u0A5E]|[\u0A72-\u0A74]|[\u0A85-\u0A8B]|[\u0A8D-\u0A8D]|[\u0A8F-\u0A91]|[\u0A93-\u0AA8]|[\u0AAA-\u0AB0]|[\u0AB2-\u0AB3]|[\u0AB5-\u0AB9]|[\u0ABD-\u0ABD]|[\u0AD0-\u0AD0]|[\u0AE0-\u0AE0]|[\u0B05-\u0B0C]|[\u0B0F-\u0B10]|[\u0B13-\u0B28]|[\u0B2A-\u0B30]|[\u0B32-\u0B33]|[\u0B36-\u0B39]|[\u0B3D-\u0B3D]|[\u0B5C-\u0B5D]|[\u0B5F-\u0B61]|[\u0B85-\u0B8A]|[\u0B8E-\u0B90]|[\u0B92-\u0B95]|[\u0B99-\u0B9A]|[\u0B9C-\u0B9C]|[\u0B9E-\u0B9F]|[\u0BA3-\u0BA4]|[\u0BA8-\u0BAA]|[\u0BAE-\u0BB5]|[\u0BB7-\u0BB9]|[\u0C05-\u0C0C]|[\u0C0E-\u0C10]|[\u0C12-\u0C28]|[\u0C2A-\u0C33]|[\u0C35-\u0C39]|[\u0C60-\u0C61]|[\u0C85-\u0C8C]|[\u0C8E-\u0C90]|[\u0C92-\u0CA8]|[\u0CAA-\u0CB3]|[\u0CB5-\u0CB9]|[\u0CDE-\u0CDE]|[\u0CE0-\u0CE1]|[\u0D05-\u0D0C]|[\u0D0E-\u0D10]|[\u0D12-\u0D28]|[\u0D2A-\u0D39]|[\u0D60-\u0D61]|[\u0E01-\u0E30]|[\u0E32-\u0E33]|[\u0E40-\u0E45]|[\u0E81-\u0E82]|[\u0E84-\u0E84]|[\u0E87-\u0E88]|[\u0E8A-\u0E8A]|[\u0E8D-\u0E8D]|[\u0E94-\u0E97]|[\u0E99-\u0E9F]|[\u0EA1-\u0EA3]|[\u0EA5-\u0EA5]|[\u0EA7-\u0EA7]|[\u0EAA-\u0EAB]|[\u0EAD-\u0EB0]|[\u0EB2-\u0EB3]|[\u0EBD-\u0EBD]|[\u0EC0-\u0EC4]|[\u0EDC-\u0EDD]|[\u0F00-\u0F00]|[\u0F40-\u0F47]|[\u0F49-\u0F69]|[\u0F88-\u0F8B]|[\u1100-\u1159]|[\u115F-\u11A2]|[\u11A8-\u11F9]|[\u2135-\u2138]|[\u3006-\u3006]|[\u3041-\u3094]|[\u30A1-\u30FA]|[\u3105-\u312C]|[\u3131-\u318E]|[\u4E00-\u9FA5]|[\uAC00-\uD7A3]|[\uF900-\uFA2D]|[\uFB1F-\uFB28]|[\uFB2A-\uFB36]|[\uFB38-\uFB3C]|[\uFB3E-\uFB3E]|[\uFB40-\uFB41]|[\uFB43-\uFB44]|[\uFB46-\uFBB1]|[\uFBD3-\uFD3D]|[\uFD50-\uFD8F]|[\uFD92-\uFDC7]|[\uFDF0-\uFDFB]|[\uFE70-\uFE72]|[\uFE74-\uFE74]|[\uFE76-\uFEFC]|[\uFF66-\uFF6F]|[\uFF71-\uFF9D]|[\uFFA0-\uFFBE]|[\uFFC2-\uFFC7]|[\uFFCA-\uFFCF]|[\uFFD2-\uFFD7]|[\uFFDA-\uFFDC]/,
	
	  // Numbers
	  Nl: /[\u2160-\u2182]|[\u3007-\u3007]|[\u3021-\u3029]/,
	  Nd: /[\u0030-\u0039]|[\u0660-\u0669]|[\u06F0-\u06F9]|[\u0966-\u096F]|[\u09E6-\u09EF]|[\u0A66-\u0A6F]|[\u0AE6-\u0AEF]|[\u0B66-\u0B6F]|[\u0BE7-\u0BEF]|[\u0C66-\u0C6F]|[\u0CE6-\u0CEF]|[\u0D66-\u0D6F]|[\u0E50-\u0E59]|[\u0ED0-\u0ED9]|[\u0F20-\u0F29]|[\uFF10-\uFF19]/,
	
	  // Marks
	  Mn: /[\u0300-\u0345]|[\u0360-\u0361]|[\u0483-\u0486]|[\u0591-\u05A1]|[\u05A3-\u05B9]|[\u05BB-\u05BD]|[\u05BF-\u05BF]|[\u05C1-\u05C2]|[\u05C4-\u05C4]|[\u064B-\u0652]|[\u0670-\u0670]|[\u06D6-\u06DC]|[\u06DF-\u06E4]|[\u06E7-\u06E8]|[\u06EA-\u06ED]|[\u0901-\u0902]|[\u093C-\u093C]|[\u0941-\u0948]|[\u094D-\u094D]|[\u0951-\u0954]|[\u0962-\u0963]|[\u0981-\u0981]|[\u09BC-\u09BC]|[\u09C1-\u09C4]|[\u09CD-\u09CD]|[\u09E2-\u09E3]|[\u0A02-\u0A02]|[\u0A3C-\u0A3C]|[\u0A41-\u0A42]|[\u0A47-\u0A48]|[\u0A4B-\u0A4D]|[\u0A70-\u0A71]|[\u0A81-\u0A82]|[\u0ABC-\u0ABC]|[\u0AC1-\u0AC5]|[\u0AC7-\u0AC8]|[\u0ACD-\u0ACD]|[\u0B01-\u0B01]|[\u0B3C-\u0B3C]|[\u0B3F-\u0B3F]|[\u0B41-\u0B43]|[\u0B4D-\u0B4D]|[\u0B56-\u0B56]|[\u0B82-\u0B82]|[\u0BC0-\u0BC0]|[\u0BCD-\u0BCD]|[\u0C3E-\u0C40]|[\u0C46-\u0C48]|[\u0C4A-\u0C4D]|[\u0C55-\u0C56]|[\u0CBF-\u0CBF]|[\u0CC6-\u0CC6]|[\u0CCC-\u0CCD]|[\u0D41-\u0D43]|[\u0D4D-\u0D4D]|[\u0E31-\u0E31]|[\u0E34-\u0E3A]|[\u0E47-\u0E4E]|[\u0EB1-\u0EB1]|[\u0EB4-\u0EB9]|[\u0EBB-\u0EBC]|[\u0EC8-\u0ECD]|[\u0F18-\u0F19]|[\u0F35-\u0F35]|[\u0F37-\u0F37]|[\u0F39-\u0F39]|[\u0F71-\u0F7E]|[\u0F80-\u0F84]|[\u0F86-\u0F87]|[\u0F90-\u0F95]|[\u0F97-\u0F97]|[\u0F99-\u0FAD]|[\u0FB1-\u0FB7]|[\u0FB9-\u0FB9]|[\u20D0-\u20DC]|[\u20E1-\u20E1]|[\u302A-\u302F]|[\u3099-\u309A]|[\uFB1E-\uFB1E]|[\uFE20-\uFE23]/,
	  Mc: /[\u0903-\u0903]|[\u093E-\u0940]|[\u0949-\u094C]|[\u0982-\u0983]|[\u09BE-\u09C0]|[\u09C7-\u09C8]|[\u09CB-\u09CC]|[\u09D7-\u09D7]|[\u0A3E-\u0A40]|[\u0A83-\u0A83]|[\u0ABE-\u0AC0]|[\u0AC9-\u0AC9]|[\u0ACB-\u0ACC]|[\u0B02-\u0B03]|[\u0B3E-\u0B3E]|[\u0B40-\u0B40]|[\u0B47-\u0B48]|[\u0B4B-\u0B4C]|[\u0B57-\u0B57]|[\u0B83-\u0B83]|[\u0BBE-\u0BBF]|[\u0BC1-\u0BC2]|[\u0BC6-\u0BC8]|[\u0BCA-\u0BCC]|[\u0BD7-\u0BD7]|[\u0C01-\u0C03]|[\u0C41-\u0C44]|[\u0C82-\u0C83]|[\u0CBE-\u0CBE]|[\u0CC0-\u0CC4]|[\u0CC7-\u0CC8]|[\u0CCA-\u0CCB]|[\u0CD5-\u0CD6]|[\u0D02-\u0D03]|[\u0D3E-\u0D40]|[\u0D46-\u0D48]|[\u0D4A-\u0D4C]|[\u0D57-\u0D57]|[\u0F3E-\u0F3F]|[\u0F7F-\u0F7F]/,
	
	  // Punctuation, Connector
	  Pc: /[\u005F-\u005F]|[\u203F-\u2040]|[\u30FB-\u30FB]|[\uFE33-\uFE34]|[\uFE4D-\uFE4F]|[\uFF3F-\uFF3F]|[\uFF65-\uFF65]/,
	
	  // Separator, Space
	  Zs: /[\u2000-\u200B]|[\u3000-\u3000]/,
	
	  // These two are not real Unicode categories, but our useful for Ohm.
	  // L is a combination of all the letter categories.
	  // Ltmo is a combination of Lt, Lm, and Lo.
	  L: /[\u0041-\u005A]|[\u00C0-\u00D6]|[\u00D8-\u00DE]|[\u0100-\u0100]|[\u0102-\u0102]|[\u0104-\u0104]|[\u0106-\u0106]|[\u0108-\u0108]|[\u010A-\u010A]|[\u010C-\u010C]|[\u010E-\u010E]|[\u0110-\u0110]|[\u0112-\u0112]|[\u0114-\u0114]|[\u0116-\u0116]|[\u0118-\u0118]|[\u011A-\u011A]|[\u011C-\u011C]|[\u011E-\u011E]|[\u0120-\u0120]|[\u0122-\u0122]|[\u0124-\u0124]|[\u0126-\u0126]|[\u0128-\u0128]|[\u012A-\u012A]|[\u012C-\u012C]|[\u012E-\u012E]|[\u0130-\u0130]|[\u0132-\u0132]|[\u0134-\u0134]|[\u0136-\u0136]|[\u0139-\u0139]|[\u013B-\u013B]|[\u013D-\u013D]|[\u013F-\u013F]|[\u0141-\u0141]|[\u0143-\u0143]|[\u0145-\u0145]|[\u0147-\u0147]|[\u014A-\u014A]|[\u014C-\u014C]|[\u014E-\u014E]|[\u0150-\u0150]|[\u0152-\u0152]|[\u0154-\u0154]|[\u0156-\u0156]|[\u0158-\u0158]|[\u015A-\u015A]|[\u015C-\u015C]|[\u015E-\u015E]|[\u0160-\u0160]|[\u0162-\u0162]|[\u0164-\u0164]|[\u0166-\u0166]|[\u0168-\u0168]|[\u016A-\u016A]|[\u016C-\u016C]|[\u016E-\u016E]|[\u0170-\u0170]|[\u0172-\u0172]|[\u0174-\u0174]|[\u0176-\u0176]|[\u0178-\u0179]|[\u017B-\u017B]|[\u017D-\u017D]|[\u0181-\u0182]|[\u0184-\u0184]|[\u0186-\u0187]|[\u0189-\u018B]|[\u018E-\u0191]|[\u0193-\u0194]|[\u0196-\u0198]|[\u019C-\u019D]|[\u019F-\u01A0]|[\u01A2-\u01A2]|[\u01A4-\u01A4]|[\u01A6-\u01A7]|[\u01A9-\u01A9]|[\u01AC-\u01AC]|[\u01AE-\u01AF]|[\u01B1-\u01B3]|[\u01B5-\u01B5]|[\u01B7-\u01B8]|[\u01BC-\u01BC]|[\u01C4-\u01C4]|[\u01C7-\u01C7]|[\u01CA-\u01CA]|[\u01CD-\u01CD]|[\u01CF-\u01CF]|[\u01D1-\u01D1]|[\u01D3-\u01D3]|[\u01D5-\u01D5]|[\u01D7-\u01D7]|[\u01D9-\u01D9]|[\u01DB-\u01DB]|[\u01DE-\u01DE]|[\u01E0-\u01E0]|[\u01E2-\u01E2]|[\u01E4-\u01E4]|[\u01E6-\u01E6]|[\u01E8-\u01E8]|[\u01EA-\u01EA]|[\u01EC-\u01EC]|[\u01EE-\u01EE]|[\u01F1-\u01F1]|[\u01F4-\u01F4]|[\u01FA-\u01FA]|[\u01FC-\u01FC]|[\u01FE-\u01FE]|[\u0200-\u0200]|[\u0202-\u0202]|[\u0204-\u0204]|[\u0206-\u0206]|[\u0208-\u0208]|[\u020A-\u020A]|[\u020C-\u020C]|[\u020E-\u020E]|[\u0210-\u0210]|[\u0212-\u0212]|[\u0214-\u0214]|[\u0216-\u0216]|[\u0386-\u0386]|[\u0388-\u038A]|[\u038C-\u038C]|[\u038E-\u038F]|[\u0391-\u03A1]|[\u03A3-\u03AB]|[\u03D2-\u03D4]|[\u03DA-\u03DA]|[\u03DC-\u03DC]|[\u03DE-\u03DE]|[\u03E0-\u03E0]|[\u03E2-\u03E2]|[\u03E4-\u03E4]|[\u03E6-\u03E6]|[\u03E8-\u03E8]|[\u03EA-\u03EA]|[\u03EC-\u03EC]|[\u03EE-\u03EE]|[\u0401-\u040C]|[\u040E-\u042F]|[\u0460-\u0460]|[\u0462-\u0462]|[\u0464-\u0464]|[\u0466-\u0466]|[\u0468-\u0468]|[\u046A-\u046A]|[\u046C-\u046C]|[\u046E-\u046E]|[\u0470-\u0470]|[\u0472-\u0472]|[\u0474-\u0474]|[\u0476-\u0476]|[\u0478-\u0478]|[\u047A-\u047A]|[\u047C-\u047C]|[\u047E-\u047E]|[\u0480-\u0480]|[\u0490-\u0490]|[\u0492-\u0492]|[\u0494-\u0494]|[\u0496-\u0496]|[\u0498-\u0498]|[\u049A-\u049A]|[\u049C-\u049C]|[\u049E-\u049E]|[\u04A0-\u04A0]|[\u04A2-\u04A2]|[\u04A4-\u04A4]|[\u04A6-\u04A6]|[\u04A8-\u04A8]|[\u04AA-\u04AA]|[\u04AC-\u04AC]|[\u04AE-\u04AE]|[\u04B0-\u04B0]|[\u04B2-\u04B2]|[\u04B4-\u04B4]|[\u04B6-\u04B6]|[\u04B8-\u04B8]|[\u04BA-\u04BA]|[\u04BC-\u04BC]|[\u04BE-\u04BE]|[\u04C1-\u04C1]|[\u04C3-\u04C3]|[\u04C7-\u04C7]|[\u04CB-\u04CB]|[\u04D0-\u04D0]|[\u04D2-\u04D2]|[\u04D4-\u04D4]|[\u04D6-\u04D6]|[\u04D8-\u04D8]|[\u04DA-\u04DA]|[\u04DC-\u04DC]|[\u04DE-\u04DE]|[\u04E0-\u04E0]|[\u04E2-\u04E2]|[\u04E4-\u04E4]|[\u04E6-\u04E6]|[\u04E8-\u04E8]|[\u04EA-\u04EA]|[\u04EE-\u04EE]|[\u04F0-\u04F0]|[\u04F2-\u04F2]|[\u04F4-\u04F4]|[\u04F8-\u04F8]|[\u0531-\u0556]|[\u10A0-\u10C5]|[\u1E00-\u1E00]|[\u1E02-\u1E02]|[\u1E04-\u1E04]|[\u1E06-\u1E06]|[\u1E08-\u1E08]|[\u1E0A-\u1E0A]|[\u1E0C-\u1E0C]|[\u1E0E-\u1E0E]|[\u1E10-\u1E10]|[\u1E12-\u1E12]|[\u1E14-\u1E14]|[\u1E16-\u1E16]|[\u1E18-\u1E18]|[\u1E1A-\u1E1A]|[\u1E1C-\u1E1C]|[\u1E1E-\u1E1E]|[\u1E20-\u1E20]|[\u1E22-\u1E22]|[\u1E24-\u1E24]|[\u1E26-\u1E26]|[\u1E28-\u1E28]|[\u1E2A-\u1E2A]|[\u1E2C-\u1E2C]|[\u1E2E-\u1E2E]|[\u1E30-\u1E30]|[\u1E32-\u1E32]|[\u1E34-\u1E34]|[\u1E36-\u1E36]|[\u1E38-\u1E38]|[\u1E3A-\u1E3A]|[\u1E3C-\u1E3C]|[\u1E3E-\u1E3E]|[\u1E40-\u1E40]|[\u1E42-\u1E42]|[\u1E44-\u1E44]|[\u1E46-\u1E46]|[\u1E48-\u1E48]|[\u1E4A-\u1E4A]|[\u1E4C-\u1E4C]|[\u1E4E-\u1E4E]|[\u1E50-\u1E50]|[\u1E52-\u1E52]|[\u1E54-\u1E54]|[\u1E56-\u1E56]|[\u1E58-\u1E58]|[\u1E5A-\u1E5A]|[\u1E5C-\u1E5C]|[\u1E5E-\u1E5E]|[\u1E60-\u1E60]|[\u1E62-\u1E62]|[\u1E64-\u1E64]|[\u1E66-\u1E66]|[\u1E68-\u1E68]|[\u1E6A-\u1E6A]|[\u1E6C-\u1E6C]|[\u1E6E-\u1E6E]|[\u1E70-\u1E70]|[\u1E72-\u1E72]|[\u1E74-\u1E74]|[\u1E76-\u1E76]|[\u1E78-\u1E78]|[\u1E7A-\u1E7A]|[\u1E7C-\u1E7C]|[\u1E7E-\u1E7E]|[\u1E80-\u1E80]|[\u1E82-\u1E82]|[\u1E84-\u1E84]|[\u1E86-\u1E86]|[\u1E88-\u1E88]|[\u1E8A-\u1E8A]|[\u1E8C-\u1E8C]|[\u1E8E-\u1E8E]|[\u1E90-\u1E90]|[\u1E92-\u1E92]|[\u1E94-\u1E94]|[\u1EA0-\u1EA0]|[\u1EA2-\u1EA2]|[\u1EA4-\u1EA4]|[\u1EA6-\u1EA6]|[\u1EA8-\u1EA8]|[\u1EAA-\u1EAA]|[\u1EAC-\u1EAC]|[\u1EAE-\u1EAE]|[\u1EB0-\u1EB0]|[\u1EB2-\u1EB2]|[\u1EB4-\u1EB4]|[\u1EB6-\u1EB6]|[\u1EB8-\u1EB8]|[\u1EBA-\u1EBA]|[\u1EBC-\u1EBC]|[\u1EBE-\u1EBE]|[\u1EC0-\u1EC0]|[\u1EC2-\u1EC2]|[\u1EC4-\u1EC4]|[\u1EC6-\u1EC6]|[\u1EC8-\u1EC8]|[\u1ECA-\u1ECA]|[\u1ECC-\u1ECC]|[\u1ECE-\u1ECE]|[\u1ED0-\u1ED0]|[\u1ED2-\u1ED2]|[\u1ED4-\u1ED4]|[\u1ED6-\u1ED6]|[\u1ED8-\u1ED8]|[\u1EDA-\u1EDA]|[\u1EDC-\u1EDC]|[\u1EDE-\u1EDE]|[\u1EE0-\u1EE0]|[\u1EE2-\u1EE2]|[\u1EE4-\u1EE4]|[\u1EE6-\u1EE6]|[\u1EE8-\u1EE8]|[\u1EEA-\u1EEA]|[\u1EEC-\u1EEC]|[\u1EEE-\u1EEE]|[\u1EF0-\u1EF0]|[\u1EF2-\u1EF2]|[\u1EF4-\u1EF4]|[\u1EF6-\u1EF6]|[\u1EF8-\u1EF8]|[\u1F08-\u1F0F]|[\u1F18-\u1F1D]|[\u1F28-\u1F2F]|[\u1F38-\u1F3F]|[\u1F48-\u1F4D]|[\u1F59-\u1F59]|[\u1F5B-\u1F5B]|[\u1F5D-\u1F5D]|[\u1F5F-\u1F5F]|[\u1F68-\u1F6F]|[\u1F88-\u1F8F]|[\u1F98-\u1F9F]|[\u1FA8-\u1FAF]|[\u1FB8-\u1FBC]|[\u1FC8-\u1FCC]|[\u1FD8-\u1FDB]|[\u1FE8-\u1FEC]|[\u1FF8-\u1FFC]|[\u2102-\u2102]|[\u2107-\u2107]|[\u210B-\u210D]|[\u2110-\u2112]|[\u2115-\u2115]|[\u2119-\u211D]|[\u2124-\u2124]|[\u2126-\u2126]|[\u2128-\u2128]|[\u212A-\u212D]|[\u2130-\u2131]|[\u2133-\u2133]|[\uFF21-\uFF3A]|[\u0061-\u007A]|[\u00AA-\u00AA]|[\u00B5-\u00B5]|[\u00BA-\u00BA]|[\u00DF-\u00F6]|[\u00F8-\u00FF]|[\u0101-\u0101]|[\u0103-\u0103]|[\u0105-\u0105]|[\u0107-\u0107]|[\u0109-\u0109]|[\u010B-\u010B]|[\u010D-\u010D]|[\u010F-\u010F]|[\u0111-\u0111]|[\u0113-\u0113]|[\u0115-\u0115]|[\u0117-\u0117]|[\u0119-\u0119]|[\u011B-\u011B]|[\u011D-\u011D]|[\u011F-\u011F]|[\u0121-\u0121]|[\u0123-\u0123]|[\u0125-\u0125]|[\u0127-\u0127]|[\u0129-\u0129]|[\u012B-\u012B]|[\u012D-\u012D]|[\u012F-\u012F]|[\u0131-\u0131]|[\u0133-\u0133]|[\u0135-\u0135]|[\u0137-\u0138]|[\u013A-\u013A]|[\u013C-\u013C]|[\u013E-\u013E]|[\u0140-\u0140]|[\u0142-\u0142]|[\u0144-\u0144]|[\u0146-\u0146]|[\u0148-\u0149]|[\u014B-\u014B]|[\u014D-\u014D]|[\u014F-\u014F]|[\u0151-\u0151]|[\u0153-\u0153]|[\u0155-\u0155]|[\u0157-\u0157]|[\u0159-\u0159]|[\u015B-\u015B]|[\u015D-\u015D]|[\u015F-\u015F]|[\u0161-\u0161]|[\u0163-\u0163]|[\u0165-\u0165]|[\u0167-\u0167]|[\u0169-\u0169]|[\u016B-\u016B]|[\u016D-\u016D]|[\u016F-\u016F]|[\u0171-\u0171]|[\u0173-\u0173]|[\u0175-\u0175]|[\u0177-\u0177]|[\u017A-\u017A]|[\u017C-\u017C]|[\u017E-\u0180]|[\u0183-\u0183]|[\u0185-\u0185]|[\u0188-\u0188]|[\u018C-\u018D]|[\u0192-\u0192]|[\u0195-\u0195]|[\u0199-\u019B]|[\u019E-\u019E]|[\u01A1-\u01A1]|[\u01A3-\u01A3]|[\u01A5-\u01A5]|[\u01A8-\u01A8]|[\u01AB-\u01AB]|[\u01AD-\u01AD]|[\u01B0-\u01B0]|[\u01B4-\u01B4]|[\u01B6-\u01B6]|[\u01B9-\u01BA]|[\u01BD-\u01BD]|[\u01C6-\u01C6]|[\u01C9-\u01C9]|[\u01CC-\u01CC]|[\u01CE-\u01CE]|[\u01D0-\u01D0]|[\u01D2-\u01D2]|[\u01D4-\u01D4]|[\u01D6-\u01D6]|[\u01D8-\u01D8]|[\u01DA-\u01DA]|[\u01DC-\u01DD]|[\u01DF-\u01DF]|[\u01E1-\u01E1]|[\u01E3-\u01E3]|[\u01E5-\u01E5]|[\u01E7-\u01E7]|[\u01E9-\u01E9]|[\u01EB-\u01EB]|[\u01ED-\u01ED]|[\u01EF-\u01F0]|[\u01F3-\u01F3]|[\u01F5-\u01F5]|[\u01FB-\u01FB]|[\u01FD-\u01FD]|[\u01FF-\u01FF]|[\u0201-\u0201]|[\u0203-\u0203]|[\u0205-\u0205]|[\u0207-\u0207]|[\u0209-\u0209]|[\u020B-\u020B]|[\u020D-\u020D]|[\u020F-\u020F]|[\u0211-\u0211]|[\u0213-\u0213]|[\u0215-\u0215]|[\u0217-\u0217]|[\u0250-\u02A8]|[\u0390-\u0390]|[\u03AC-\u03CE]|[\u03D0-\u03D1]|[\u03D5-\u03D6]|[\u03E3-\u03E3]|[\u03E5-\u03E5]|[\u03E7-\u03E7]|[\u03E9-\u03E9]|[\u03EB-\u03EB]|[\u03ED-\u03ED]|[\u03EF-\u03F2]|[\u0430-\u044F]|[\u0451-\u045C]|[\u045E-\u045F]|[\u0461-\u0461]|[\u0463-\u0463]|[\u0465-\u0465]|[\u0467-\u0467]|[\u0469-\u0469]|[\u046B-\u046B]|[\u046D-\u046D]|[\u046F-\u046F]|[\u0471-\u0471]|[\u0473-\u0473]|[\u0475-\u0475]|[\u0477-\u0477]|[\u0479-\u0479]|[\u047B-\u047B]|[\u047D-\u047D]|[\u047F-\u047F]|[\u0481-\u0481]|[\u0491-\u0491]|[\u0493-\u0493]|[\u0495-\u0495]|[\u0497-\u0497]|[\u0499-\u0499]|[\u049B-\u049B]|[\u049D-\u049D]|[\u049F-\u049F]|[\u04A1-\u04A1]|[\u04A3-\u04A3]|[\u04A5-\u04A5]|[\u04A7-\u04A7]|[\u04A9-\u04A9]|[\u04AB-\u04AB]|[\u04AD-\u04AD]|[\u04AF-\u04AF]|[\u04B1-\u04B1]|[\u04B3-\u04B3]|[\u04B5-\u04B5]|[\u04B7-\u04B7]|[\u04B9-\u04B9]|[\u04BB-\u04BB]|[\u04BD-\u04BD]|[\u04BF-\u04BF]|[\u04C2-\u04C2]|[\u04C4-\u04C4]|[\u04C8-\u04C8]|[\u04CC-\u04CC]|[\u04D1-\u04D1]|[\u04D3-\u04D3]|[\u04D5-\u04D5]|[\u04D7-\u04D7]|[\u04D9-\u04D9]|[\u04DB-\u04DB]|[\u04DD-\u04DD]|[\u04DF-\u04DF]|[\u04E1-\u04E1]|[\u04E3-\u04E3]|[\u04E5-\u04E5]|[\u04E7-\u04E7]|[\u04E9-\u04E9]|[\u04EB-\u04EB]|[\u04EF-\u04EF]|[\u04F1-\u04F1]|[\u04F3-\u04F3]|[\u04F5-\u04F5]|[\u04F9-\u04F9]|[\u0561-\u0587]|[\u10D0-\u10F6]|[\u1E01-\u1E01]|[\u1E03-\u1E03]|[\u1E05-\u1E05]|[\u1E07-\u1E07]|[\u1E09-\u1E09]|[\u1E0B-\u1E0B]|[\u1E0D-\u1E0D]|[\u1E0F-\u1E0F]|[\u1E11-\u1E11]|[\u1E13-\u1E13]|[\u1E15-\u1E15]|[\u1E17-\u1E17]|[\u1E19-\u1E19]|[\u1E1B-\u1E1B]|[\u1E1D-\u1E1D]|[\u1E1F-\u1E1F]|[\u1E21-\u1E21]|[\u1E23-\u1E23]|[\u1E25-\u1E25]|[\u1E27-\u1E27]|[\u1E29-\u1E29]|[\u1E2B-\u1E2B]|[\u1E2D-\u1E2D]|[\u1E2F-\u1E2F]|[\u1E31-\u1E31]|[\u1E33-\u1E33]|[\u1E35-\u1E35]|[\u1E37-\u1E37]|[\u1E39-\u1E39]|[\u1E3B-\u1E3B]|[\u1E3D-\u1E3D]|[\u1E3F-\u1E3F]|[\u1E41-\u1E41]|[\u1E43-\u1E43]|[\u1E45-\u1E45]|[\u1E47-\u1E47]|[\u1E49-\u1E49]|[\u1E4B-\u1E4B]|[\u1E4D-\u1E4D]|[\u1E4F-\u1E4F]|[\u1E51-\u1E51]|[\u1E53-\u1E53]|[\u1E55-\u1E55]|[\u1E57-\u1E57]|[\u1E59-\u1E59]|[\u1E5B-\u1E5B]|[\u1E5D-\u1E5D]|[\u1E5F-\u1E5F]|[\u1E61-\u1E61]|[\u1E63-\u1E63]|[\u1E65-\u1E65]|[\u1E67-\u1E67]|[\u1E69-\u1E69]|[\u1E6B-\u1E6B]|[\u1E6D-\u1E6D]|[\u1E6F-\u1E6F]|[\u1E71-\u1E71]|[\u1E73-\u1E73]|[\u1E75-\u1E75]|[\u1E77-\u1E77]|[\u1E79-\u1E79]|[\u1E7B-\u1E7B]|[\u1E7D-\u1E7D]|[\u1E7F-\u1E7F]|[\u1E81-\u1E81]|[\u1E83-\u1E83]|[\u1E85-\u1E85]|[\u1E87-\u1E87]|[\u1E89-\u1E89]|[\u1E8B-\u1E8B]|[\u1E8D-\u1E8D]|[\u1E8F-\u1E8F]|[\u1E91-\u1E91]|[\u1E93-\u1E93]|[\u1E95-\u1E9B]|[\u1EA1-\u1EA1]|[\u1EA3-\u1EA3]|[\u1EA5-\u1EA5]|[\u1EA7-\u1EA7]|[\u1EA9-\u1EA9]|[\u1EAB-\u1EAB]|[\u1EAD-\u1EAD]|[\u1EAF-\u1EAF]|[\u1EB1-\u1EB1]|[\u1EB3-\u1EB3]|[\u1EB5-\u1EB5]|[\u1EB7-\u1EB7]|[\u1EB9-\u1EB9]|[\u1EBB-\u1EBB]|[\u1EBD-\u1EBD]|[\u1EBF-\u1EBF]|[\u1EC1-\u1EC1]|[\u1EC3-\u1EC3]|[\u1EC5-\u1EC5]|[\u1EC7-\u1EC7]|[\u1EC9-\u1EC9]|[\u1ECB-\u1ECB]|[\u1ECD-\u1ECD]|[\u1ECF-\u1ECF]|[\u1ED1-\u1ED1]|[\u1ED3-\u1ED3]|[\u1ED5-\u1ED5]|[\u1ED7-\u1ED7]|[\u1ED9-\u1ED9]|[\u1EDB-\u1EDB]|[\u1EDD-\u1EDD]|[\u1EDF-\u1EDF]|[\u1EE1-\u1EE1]|[\u1EE3-\u1EE3]|[\u1EE5-\u1EE5]|[\u1EE7-\u1EE7]|[\u1EE9-\u1EE9]|[\u1EEB-\u1EEB]|[\u1EED-\u1EED]|[\u1EEF-\u1EEF]|[\u1EF1-\u1EF1]|[\u1EF3-\u1EF3]|[\u1EF5-\u1EF5]|[\u1EF7-\u1EF7]|[\u1EF9-\u1EF9]|[\u1F00-\u1F07]|[\u1F10-\u1F15]|[\u1F20-\u1F27]|[\u1F30-\u1F37]|[\u1F40-\u1F45]|[\u1F50-\u1F57]|[\u1F60-\u1F67]|[\u1F70-\u1F7D]|[\u1F80-\u1F87]|[\u1F90-\u1F97]|[\u1FA0-\u1FA7]|[\u1FB0-\u1FB4]|[\u1FB6-\u1FB7]|[\u1FBE-\u1FBE]|[\u1FC2-\u1FC4]|[\u1FC6-\u1FC7]|[\u1FD0-\u1FD3]|[\u1FD6-\u1FD7]|[\u1FE0-\u1FE7]|[\u1FF2-\u1FF4]|[\u1FF6-\u1FF7]|[\u207F-\u207F]|[\u210A-\u210A]|[\u210E-\u210F]|[\u2113-\u2113]|[\u2118-\u2118]|[\u212E-\u212F]|[\u2134-\u2134]|[\uFB00-\uFB06]|[\uFB13-\uFB17]|[\uFF41-\uFF5A]|[\u01C5-\u01C5]|[\u01C8-\u01C8]|[\u01CB-\u01CB]|[\u01F2-\u01F2]|[\u02B0-\u02B8]|[\u02BB-\u02C1]|[\u02D0-\u02D1]|[\u02E0-\u02E4]|[\u037A-\u037A]|[\u0559-\u0559]|[\u0640-\u0640]|[\u06E5-\u06E6]|[\u0E46-\u0E46]|[\u0EC6-\u0EC6]|[\u3005-\u3005]|[\u3031-\u3035]|[\u309D-\u309E]|[\u30FC-\u30FE]|[\uFF70-\uFF70]|[\uFF9E-\uFF9F]|[\u01AA-\u01AA]|[\u01BB-\u01BB]|[\u01BE-\u01C3]|[\u03F3-\u03F3]|[\u04C0-\u04C0]|[\u05D0-\u05EA]|[\u05F0-\u05F2]|[\u0621-\u063A]|[\u0641-\u064A]|[\u0671-\u06B7]|[\u06BA-\u06BE]|[\u06C0-\u06CE]|[\u06D0-\u06D3]|[\u06D5-\u06D5]|[\u0905-\u0939]|[\u093D-\u093D]|[\u0950-\u0950]|[\u0958-\u0961]|[\u0985-\u098C]|[\u098F-\u0990]|[\u0993-\u09A8]|[\u09AA-\u09B0]|[\u09B2-\u09B2]|[\u09B6-\u09B9]|[\u09DC-\u09DD]|[\u09DF-\u09E1]|[\u09F0-\u09F1]|[\u0A05-\u0A0A]|[\u0A0F-\u0A10]|[\u0A13-\u0A28]|[\u0A2A-\u0A30]|[\u0A32-\u0A33]|[\u0A35-\u0A36]|[\u0A38-\u0A39]|[\u0A59-\u0A5C]|[\u0A5E-\u0A5E]|[\u0A72-\u0A74]|[\u0A85-\u0A8B]|[\u0A8D-\u0A8D]|[\u0A8F-\u0A91]|[\u0A93-\u0AA8]|[\u0AAA-\u0AB0]|[\u0AB2-\u0AB3]|[\u0AB5-\u0AB9]|[\u0ABD-\u0ABD]|[\u0AD0-\u0AD0]|[\u0AE0-\u0AE0]|[\u0B05-\u0B0C]|[\u0B0F-\u0B10]|[\u0B13-\u0B28]|[\u0B2A-\u0B30]|[\u0B32-\u0B33]|[\u0B36-\u0B39]|[\u0B3D-\u0B3D]|[\u0B5C-\u0B5D]|[\u0B5F-\u0B61]|[\u0B85-\u0B8A]|[\u0B8E-\u0B90]|[\u0B92-\u0B95]|[\u0B99-\u0B9A]|[\u0B9C-\u0B9C]|[\u0B9E-\u0B9F]|[\u0BA3-\u0BA4]|[\u0BA8-\u0BAA]|[\u0BAE-\u0BB5]|[\u0BB7-\u0BB9]|[\u0C05-\u0C0C]|[\u0C0E-\u0C10]|[\u0C12-\u0C28]|[\u0C2A-\u0C33]|[\u0C35-\u0C39]|[\u0C60-\u0C61]|[\u0C85-\u0C8C]|[\u0C8E-\u0C90]|[\u0C92-\u0CA8]|[\u0CAA-\u0CB3]|[\u0CB5-\u0CB9]|[\u0CDE-\u0CDE]|[\u0CE0-\u0CE1]|[\u0D05-\u0D0C]|[\u0D0E-\u0D10]|[\u0D12-\u0D28]|[\u0D2A-\u0D39]|[\u0D60-\u0D61]|[\u0E01-\u0E30]|[\u0E32-\u0E33]|[\u0E40-\u0E45]|[\u0E81-\u0E82]|[\u0E84-\u0E84]|[\u0E87-\u0E88]|[\u0E8A-\u0E8A]|[\u0E8D-\u0E8D]|[\u0E94-\u0E97]|[\u0E99-\u0E9F]|[\u0EA1-\u0EA3]|[\u0EA5-\u0EA5]|[\u0EA7-\u0EA7]|[\u0EAA-\u0EAB]|[\u0EAD-\u0EB0]|[\u0EB2-\u0EB3]|[\u0EBD-\u0EBD]|[\u0EC0-\u0EC4]|[\u0EDC-\u0EDD]|[\u0F00-\u0F00]|[\u0F40-\u0F47]|[\u0F49-\u0F69]|[\u0F88-\u0F8B]|[\u1100-\u1159]|[\u115F-\u11A2]|[\u11A8-\u11F9]|[\u2135-\u2138]|[\u3006-\u3006]|[\u3041-\u3094]|[\u30A1-\u30FA]|[\u3105-\u312C]|[\u3131-\u318E]|[\u4E00-\u9FA5]|[\uAC00-\uD7A3]|[\uF900-\uFA2D]|[\uFB1F-\uFB28]|[\uFB2A-\uFB36]|[\uFB38-\uFB3C]|[\uFB3E-\uFB3E]|[\uFB40-\uFB41]|[\uFB43-\uFB44]|[\uFB46-\uFBB1]|[\uFBD3-\uFD3D]|[\uFD50-\uFD8F]|[\uFD92-\uFDC7]|[\uFDF0-\uFDFB]|[\uFE70-\uFE72]|[\uFE74-\uFE74]|[\uFE76-\uFEFC]|[\uFF66-\uFF6F]|[\uFF71-\uFF9D]|[\uFFA0-\uFFBE]|[\uFFC2-\uFFC7]|[\uFFCA-\uFFCF]|[\uFFD2-\uFFD7]|[\uFFDA-\uFFDC]/,
	  Ltmo: /[\u01C5-\u01C5]|[\u01C8-\u01C8]|[\u01CB-\u01CB]|[\u01F2-\u01F2][\u02B0-\u02B8]|[\u02BB-\u02C1]|[\u02D0-\u02D1]|[\u02E0-\u02E4]|[\u037A-\u037A]|[\u0559-\u0559]|[\u0640-\u0640]|[\u06E5-\u06E6]|[\u0E46-\u0E46]|[\u0EC6-\u0EC6]|[\u3005-\u3005]|[\u3031-\u3035]|[\u309D-\u309E]|[\u30FC-\u30FE]|[\uFF70-\uFF70]|[\uFF9E-\uFF9F][\u01AA-\u01AA]|[\u01BB-\u01BB]|[\u01BE-\u01C3]|[\u03F3-\u03F3]|[\u04C0-\u04C0]|[\u05D0-\u05EA]|[\u05F0-\u05F2]|[\u0621-\u063A]|[\u0641-\u064A]|[\u0671-\u06B7]|[\u06BA-\u06BE]|[\u06C0-\u06CE]|[\u06D0-\u06D3]|[\u06D5-\u06D5]|[\u0905-\u0939]|[\u093D-\u093D]|[\u0950-\u0950]|[\u0958-\u0961]|[\u0985-\u098C]|[\u098F-\u0990]|[\u0993-\u09A8]|[\u09AA-\u09B0]|[\u09B2-\u09B2]|[\u09B6-\u09B9]|[\u09DC-\u09DD]|[\u09DF-\u09E1]|[\u09F0-\u09F1]|[\u0A05-\u0A0A]|[\u0A0F-\u0A10]|[\u0A13-\u0A28]|[\u0A2A-\u0A30]|[\u0A32-\u0A33]|[\u0A35-\u0A36]|[\u0A38-\u0A39]|[\u0A59-\u0A5C]|[\u0A5E-\u0A5E]|[\u0A72-\u0A74]|[\u0A85-\u0A8B]|[\u0A8D-\u0A8D]|[\u0A8F-\u0A91]|[\u0A93-\u0AA8]|[\u0AAA-\u0AB0]|[\u0AB2-\u0AB3]|[\u0AB5-\u0AB9]|[\u0ABD-\u0ABD]|[\u0AD0-\u0AD0]|[\u0AE0-\u0AE0]|[\u0B05-\u0B0C]|[\u0B0F-\u0B10]|[\u0B13-\u0B28]|[\u0B2A-\u0B30]|[\u0B32-\u0B33]|[\u0B36-\u0B39]|[\u0B3D-\u0B3D]|[\u0B5C-\u0B5D]|[\u0B5F-\u0B61]|[\u0B85-\u0B8A]|[\u0B8E-\u0B90]|[\u0B92-\u0B95]|[\u0B99-\u0B9A]|[\u0B9C-\u0B9C]|[\u0B9E-\u0B9F]|[\u0BA3-\u0BA4]|[\u0BA8-\u0BAA]|[\u0BAE-\u0BB5]|[\u0BB7-\u0BB9]|[\u0C05-\u0C0C]|[\u0C0E-\u0C10]|[\u0C12-\u0C28]|[\u0C2A-\u0C33]|[\u0C35-\u0C39]|[\u0C60-\u0C61]|[\u0C85-\u0C8C]|[\u0C8E-\u0C90]|[\u0C92-\u0CA8]|[\u0CAA-\u0CB3]|[\u0CB5-\u0CB9]|[\u0CDE-\u0CDE]|[\u0CE0-\u0CE1]|[\u0D05-\u0D0C]|[\u0D0E-\u0D10]|[\u0D12-\u0D28]|[\u0D2A-\u0D39]|[\u0D60-\u0D61]|[\u0E01-\u0E30]|[\u0E32-\u0E33]|[\u0E40-\u0E45]|[\u0E81-\u0E82]|[\u0E84-\u0E84]|[\u0E87-\u0E88]|[\u0E8A-\u0E8A]|[\u0E8D-\u0E8D]|[\u0E94-\u0E97]|[\u0E99-\u0E9F]|[\u0EA1-\u0EA3]|[\u0EA5-\u0EA5]|[\u0EA7-\u0EA7]|[\u0EAA-\u0EAB]|[\u0EAD-\u0EB0]|[\u0EB2-\u0EB3]|[\u0EBD-\u0EBD]|[\u0EC0-\u0EC4]|[\u0EDC-\u0EDD]|[\u0F00-\u0F00]|[\u0F40-\u0F47]|[\u0F49-\u0F69]|[\u0F88-\u0F8B]|[\u1100-\u1159]|[\u115F-\u11A2]|[\u11A8-\u11F9]|[\u2135-\u2138]|[\u3006-\u3006]|[\u3041-\u3094]|[\u30A1-\u30FA]|[\u3105-\u312C]|[\u3131-\u318E]|[\u4E00-\u9FA5]|[\uAC00-\uD7A3]|[\uF900-\uFA2D]|[\uFB1F-\uFB28]|[\uFB2A-\uFB36]|[\uFB38-\uFB3C]|[\uFB3E-\uFB3E]|[\uFB40-\uFB41]|[\uFB43-\uFB44]|[\uFB46-\uFBB1]|[\uFBD3-\uFD3D]|[\uFD50-\uFD8F]|[\uFD92-\uFDC7]|[\uFDF0-\uFDFB]|[\uFE70-\uFE72]|[\uFE74-\uFE74]|[\uFE76-\uFEFC]|[\uFF66-\uFF6F]|[\uFF71-\uFF9D]|[\uFFA0-\uFFBE]|[\uFFC2-\uFFC7]|[\uFFCA-\uFFCF]|[\uFFD2-\uFFD7]|[\uFFDA-\uFFDC]/
	};
	
	},{}]},{},[41,4])(41)
	});


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	// var HighlightingEditor = require("../highlightingEditor/interaction.js").HighlightingEditor,
	var GrammarView = __webpack_require__(16).GrammarView,
	    SemanticEditor = __webpack_require__(18).SemanticEditor,
	    utils = __webpack_require__(10),
	    treeUtils = __webpack_require__(9),
	    semanticsOperations = __webpack_require__(23);
	var initSemantics = semanticsOperations.initSemantics;
	var createElement = utils.createElement;
	
	var _ = function _(arr) {
	  return Array.prototype.slice.call(arr);
	};
	
	var GrammarSemantics = function () {
	  function GrammarSemantics(element, _ref) {
	    var _this = this;
	
	    var grammar = _ref.grammar;
	    var semantics = _ref.semantics;
	    var match = _ref.match;
	    var actions = _ref.actions;
	
	    _classCallCheck(this, GrammarSemantics);
	
	    this.grammar = grammar;
	    this.semantics = semantics;
	    initSemantics(this.semantics);
	
	    this.match = match;
	
	    this.actions = actions;
	    var grammarView = new GrammarView(element, { grammar: this.grammar });
	    var grammarDomTree = grammarView.element;
	
	    var ruleDOMNodes = Object.keys(grammar.ruleBodies).map(function (rule) {
	      return grammarView.getNode(rule);
	    });
	
	    this.ruleToDOM = new Map();
	    Object.keys(grammar.ruleBodies).forEach(function (rule, i) {
	      _this.ruleToDOM.set(rule, ruleDOMNodes[i]);
	    });
	
	    this.ruleTOSemanticFunc = new Map();
	    this.ruleTOSemanticEditor = new Map();
	    Object.keys(grammar.ruleBodies).forEach(function (ruleName, idx) {
	      var grammarNode = grammarView.getNode(ruleName);
	      if (grammarNode.tagName === 'RULE') {
	        //RULE? case insensitive
	        var altNode = grammarNode.querySelector('alt');
	        if (altNode.children.length > 1) {
	          return;
	        }
	      }
	
	      var semanticEditor = new SemanticEditor(ruleName, grammarNode, {
	        ruleTOSemanticFunc: _this.ruleTOSemanticFunc,
	        grammar: _this.grammar, semantics: _this.semantics,
	        match: _this.match, actions: actions
	      });
	    });
	
	    this.relevantRules = ["Program", "Stmts"];
	  }
	
	  _createClass(GrammarSemantics, [{
	    key: "highlight",
	    value: function highlight(simplifiedCSTNode) {
	      var ruleName = simplifiedCSTNode.ctorName;
	      if (ruleName === "terminal") {
	        ruleName = simplifiedCSTNode.cstNodes[0].ctorName;
	      }
	
	      var domNode = this.ruleToDOM.get(ruleName);
	      if (domNode) {
	        domNode.classList.add("hover");
	        if (this.previousTimeout) {
	          clearTimeout(this.previousTimeout);
	        }
	        this.previousTimeout = setTimeout(scrollToNode.bind(null, domNode), 200);
	      }
	    }
	  }, {
	    key: "unHighlight",
	    value: function unHighlight(simplifiedCSTNode) {
	      var ruleName = simplifiedCSTNode.ctorName;
	      if (ruleName === "terminal") {
	        ruleName = simplifiedCSTNode.cstNodes[0].ctorName;
	      }
	      var domNode = this.ruleToDOM.get(ruleName);
	      if (domNode) {
	        domNode.classList.remove("hover");
	      }
	    }
	  }, {
	    key: "split",
	    value: function split(simplifiedCSTNode) {
	      var children = simplifiedCSTNode._children ? simplifiedCSTNode._children : simplifiedCSTNode.children;
	
	      children.forEach(function (child) {
	        child.current = true;
	      });
	
	      var rules = [];
	      children.forEach(function (child) {
	        child.cstNodes.forEach(function (cstNode) {
	          var rule = cstNode.ctorName.split("_")[0];
	          rules.push(rule);
	        });
	      });
	
	      var nextRelevant = this.relevantRules.concat(rules); //.filter((ruleName)=> ruleName !== "terminal");
	      // console.log(Array.from(new Set(nextRelevant)));
	      this.relevantRules = Array.from(new Set(nextRelevant)); //unique
	    }
	  }, {
	    key: "join",
	    value: function join(simplifiedCSTNode) {
	      var descendants = treeUtils.descendants(simplifiedCSTNode, function (child) {
	        return child._children ? child._children : child.children;
	      });
	      descendants.forEach(function (desc) {
	        return desc.current = false;
	      });
	      simplifiedCSTNode.current = true;
	
	      var rules = [];
	      var frontier = [treeUtils.root(simplifiedCSTNode)];
	      while (frontier.length > 0) {
	        var current = frontier.shift();
	        current.cstNodes.forEach(function (cstNode) {
	          var rule = cstNode.ctorName.split("_")[0];
	          rules.push(rule);
	        });
	
	        var currentChildren = current.children ? current.children : []; //children visible to tree
	        frontier = frontier.concat(currentChildren);
	      }
	
	      // console.log(rules);
	      this.relevantRules = Array.from(new Set(rules));
	    }
	  }, {
	    key: "relevantRules",
	    get: function get() {
	      return this._relevantRules;
	    },
	    set: function set(relevantRules) {
	      var _this2 = this;
	
	      this._relevantRules = relevantRules.filter(function (rule) {
	        return _this2.grammar.ruleBodies.hasOwnProperty(rule);
	      });
	
	      //hide all rules
	      Array.from(this.ruleToDOM.keys()).filter(function (ruleName) {
	        return ruleName.split("_").length < 2;
	      }).map(function (key) {
	        return _this2.ruleToDOM.get(key);
	      }).forEach(function (domNode) {
	        return domNode.style.display = "none";
	      });
	
	      this._relevantRules.forEach(function (rule) {
	        _this2.ruleToDOM.get(rule).style.display = "initial";
	      });
	    }
	  }]);
	
	  return GrammarSemantics;
	}();
	
	var toExport = {
	  GrammarSemantics: GrammarSemantics
	};
	
	if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
	  module.exports = toExport;
	} else {
	  Object.assign(window, toExport);
	}
	
	function scrollToNode(domNode) {
	  var scrollable = domNode.closest("column#grammarSemantics");
	  var scrollViewHeight = scrollable.getBoundingClientRect().height;
	  var scrollViewY = scrollable.getBoundingClientRect().top;
	  var maxScroll = scrollable.scrollHeight - scrollViewHeight;
	
	  domNode.scrollIntoView({ block: "end", behavior: "smooth" });
	
	  var domNodeHeight = domNode.getBoundingClientRect().height;
	  var domNodeY = domNode.getBoundingClientRect().top;
	
	  var newScroll = scrollable.scrollTop + (domNodeY - scrollViewY - (scrollViewHeight - domNodeHeight) / 2);
	  if (newScroll < 0) {
	    scrollable.scrollTop = 0;
	  } else if (newScroll > maxScroll) {
	    scrollable.scrollTop = maxScroll;
	  } else {
	    scrollable.scrollTop = newScroll;
	  }
	}

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var lib = __webpack_require__(17);
	
	var _ = function _(arr) {
	  return Array.prototype.slice.call(arr);
	};
	var makeElement = lib.makeElement;
	
	var GrammarView = function () {
	  function GrammarView(element, _ref) {
	    var grammar = _ref.grammar;
	
	    _classCallCheck(this, GrammarView);
	
	    this.element = element;
	    this.current = element;
	
	    this.s = ohm.ohmGrammar.semantics();
	
	    var that = this;
	
	    this.s.addOperation('viz', {
	      Grammar: function Grammar(n, s, _l, rs, _r) {
	        that.enter('grammar');
	        that.add('name', n.viz());
	        s.viz();
	        that.enter('rules');
	        rs.viz();
	        that.leave();
	        that.leave();
	      },
	      SuperGrammar: function SuperGrammar(_, n) {
	        that.enter('super');
	        that.add('name', n.viz());
	        that.leave();
	      },
	      Rule: function Rule(expr) {
	        that.enter('rule');
	        expr.viz();
	        that.leave();
	      },
	      Rule_define: function Rule_define(n, fs, d, _equals, _optBar, b) {
	        that.add('name', n.viz());
	        d.viz();
	        that.enter('ruleDefineBody');
	        b.viz();
	        that.leave();
	      },
	      Rule_override: function Rule_override(n, fs, _colonEquals, _optBar, b) {
	        that.add('name', n.viz());
	        that.enter('ruleOverrideBody');
	        b.viz();
	        that.leave();
	      },
	      Rule_extend: function Rule_extend(n, fs, _plusEquals, _optBar, b) {
	        that.add('name', n.viz());
	        that.enter('ruleExtendBody');
	        b.viz();
	        that.leave();
	      },
	      ruleDescr: function ruleDescr(_l, t, _r) {
	        that.add('description', t.viz());
	      },
	      ruleDescrText: function ruleDescrText(_) {
	        return this.interval.contents;
	      },
	      Alt: function Alt(x, _, xs) {
	        that.enter('alt');
	        x.vizChoice();
	        xs.vizChoice();
	        that.leave();
	      },
	      Term: function Term(expr) {
	        expr.viz();
	      },
	      Term_inline: function Term_inline(x, n) {
	        x.viz();
	        n.viz();
	      },
	      caseName: function caseName(_d, _s1, n, _s2, _t) {
	        that.add('caseName', n.viz());
	      },
	      Seq: function Seq(expr) {
	        that.enter('seq');
	        expr.viz();
	        that.leave();
	      },
	      Iter: function Iter(expr) {
	        expr.viz();
	      },
	      Iter_star: function Iter_star(x, _) {
	        that.enter('star');
	        x.viz();
	        that.leave();
	      },
	      Iter_plus: function Iter_plus(x, _) {
	        that.enter('plus');
	        x.viz();
	        that.leave();
	      },
	      Iter_opt: function Iter_opt(x, _) {
	        that.enter('opt');
	        x.viz();
	        that.leave();
	      },
	      Pred: function Pred(expr) {
	        expr.viz();
	      },
	      Pred_not: function Pred_not(_, x) {
	        that.enter('not');
	        x.viz();
	        that.leave();
	      },
	      Pred_lookahead: function Pred_lookahead(_, x) {
	        that.enter('lookahead');
	        x.viz();
	        that.leave();
	      },
	      Base: function Base(expr) {
	        expr.viz();
	      },
	      Base_application: function Base_application(rule, ps) {
	        that.add('app', rule.viz());
	      },
	      Base_prim: function Base_prim(expr) {
	        expr.viz();
	      },
	      Base_paren: function Base_paren(_l, x, _r) {
	        that.enter('paren');
	        x.viz();
	        that.leave();
	      },
	      Base_arr: function Base_arr(_l, x, _r) {
	        that.enter('arr');
	        x.viz();
	        that.leave();
	      },
	      Base_obj: function Base_obj(_l, lenient, _r) {
	        throw 'TODO';
	      },
	      Base_objWithProps: function Base_objWithProps(_l, ps, _c, lenient, _r) {
	        throw 'TODO';
	      },
	      Props: function Props(p, _, ps) {
	        throw 'TODO';
	      },
	      ident: function ident(n) {
	        return n.viz();
	      },
	      name: function name(_first, _rest) {
	        return this.interval.contents;
	      },
	      string: function string(_lq, cs, _rq) {
	        that.add('string', escape(eval(this.interval.contents)));
	      },
	      number: function number(_neg, _digits) {
	        that.add('prim', this.interval.contents);
	      },
	      keyword: function keyword(expr) {
	        expr.viz();
	      },
	      keyword_null: function keyword_null(_) {
	        that.add('prim', 'null');
	      },
	      keyword_true: function keyword_true(_) {
	        that.add('prim', 'true');
	      },
	      keyword_false: function keyword_false(_) {
	        that.add('prim', 'false');
	      },
	      Prop: function Prop(n, _, p) {}
	    });
	
	    this.s.addOperation('vizChoice', {
	      _nonterminal: function _nonterminal(children) {
	        that.enter('choice');
	        this.viz();
	        that.leave();
	      }
	    });
	
	    var m = ohm.ohmGrammar.match(grammar.definitionInterval.contents, 'Grammar');
	    if (m.failed()) {
	      console.log(m.message);
	      // source.className = 'error';
	    } else {
	        // removeChildren(vizDiv);
	        this.s(m).viz();
	        // source.className = undefined;
	      }
	  }
	
	  //ACCESSORS
	
	
	  _createClass(GrammarView, [{
	    key: 'getNode',
	    value: function getNode(ruleName) {
	      var parts = ruleName.split("_");
	      var rule = parts[0];
	
	      var names = _(this.element.querySelectorAll("rule > name"));
	      var ruleNode = names.filter(function (name) {
	        return name.textContent === rule;
	      })[0].parentNode;
	
	      if (parts.length > 1) {
	        var caseNames = _(ruleNode.querySelectorAll("casename"));
	        return caseNames.filter(function (casename) {
	          return casename.textContent === parts[1];
	        })[0].parentNode;
	      } else {
	        return ruleNode;
	      }
	    }
	
	    //HELPERS
	
	  }, {
	    key: 'enter',
	    value: function enter(tag) {
	      var child = makeElement(tag);
	      this.current.appendChild(child);
	      this.current = child;
	    }
	  }, {
	    key: 'leave',
	    value: function leave() {
	      this.current = this.current.parentElement;
	    }
	  }, {
	    key: 'addNode',
	    value: function addNode(node) {
	      this.current.appendChild(node);
	    }
	  }, {
	    key: 'add',
	    value: function add() /* tagName, child1, child2, ... */{
	      this.addNode(makeElement.apply(this, arguments));
	    }
	  }]);
	
	  return GrammarView;
	}();
	
	function escape(str) {
	  var node = document.createElement('span');
	  for (var idx = 0; idx < str.length; idx++) {
	    if (str.charCodeAt(idx) < 32) {
	      var c;
	      switch (str.charAt(idx)) {
	        case '\r':
	          c = '\\r';
	          break;
	        case '\n':
	          c = '\\n';
	          break;
	        case '\t':
	          c = '\\t';
	          break;
	        default:
	          c = '(ascii ' + str.charCodeAt(idx) + ')';
	      }
	      node.appendChild(makeElement('specialChar', c));
	    } else if (str.charCodeAt(idx) > 127) {
	      c = "000" + str.charCodeAt(idx).toString(16);
	      c = '\\u' + c.substring(c.length - 4).toUpperCase();
	      node.appendChild(makeElement('unicodeChar', c));
	    } else {
	      node.appendChild(document.createTextNode(str.charAt(idx)));
	    }
	  }
	  return node;
	}
	
	var toExport = {
	  GrammarView: GrammarView
	};
	
	if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
	  module.exports = toExport;
	} else {
	  Object.assign(window, toExport);
	}

/***/ },
/* 17 */
/***/ function(module, exports) {

	'use strict';
	
	var toExport = {
	  makeElement,
	  removeChildren,
	  show,
	  repeat
	};
	
	if(typeof module !== "undefined" && typeof module.exports !== "undefined"){
	  module.exports = toExport;
	} else {
	  Object.assign(window, toExport);
	}
	
	function makeElement(tagName) {
	  var element = document.createElement(tagName);
	  for (var idx = 1; idx < arguments.length; idx++) {
	    var child = typeof arguments[idx] === 'string' ?
	        document.createTextNode(arguments[idx]) :
	        arguments[idx];
	    element.appendChild(child);
	  }
	  return element;
	};
	
	function removeChildren(element) {
	  while (element.firstChild) {
	    element.removeChild(element.firstChild);
	  }
	};
	
	function show(divId, what) {
	  if (!(what instanceof Node)) {
	    what = document.createTextNode('' + what);
	  }
	  var div = document.getElementById(divId);
	  while (div.firstChild) {
	    div.removeChild(div.firstChild);
	  }
	  div.appendChild(what);
	};
	
	function repeat(s, n) {
	  var arr = [];
	  while (n-- > 0) {
	    arr.push(s);
	  }
	  return arr.join('');
	};


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var SaveButton = __webpack_require__(19).SaveButton,
	    JSTextEditor = __webpack_require__(20).JSTextEditor;
	var mapSemantics = __webpack_require__(22),
	    semanticsOperations = __webpack_require__(23),
	    utils = __webpack_require__(10);
	var saveAction = semanticsOperations.saveAction,
	    reset = semanticsOperations.reset;
	var createElement = utils.createElement;
	
	var SemanticEditor = function SemanticEditor(ruleName, ruleDOMNode, _ref) {
	  var _this = this;
	
	  var ruleTOSemanticFunc = _ref.ruleTOSemanticFunc;
	  var grammar = _ref.grammar;
	  var semantics = _ref.semantics;
	  var match = _ref.match;
	  var actions = _ref.actions;
	
	  _classCallCheck(this, SemanticEditor);
	
	  this.ruleName = ruleName;
	  this.domNode = ruleDOMNode;
	  this.semanticFunc = retrieveFunc(ruleTOSemanticFunc, ruleName, semantics);
	
	  var currentNode = this.domNode;
	
	  var optArgStr = this.semanticFunc.args,
	      defaultArgs = getArgString(grammar.ruleBodies[ruleName]),
	      body = this.semanticFunc.body;
	
	  var seqNode = this.domNode.querySelector('seq');
	  var children = Array.from(seqNode.cloneNode(true).children);
	  seqNode.innerHTML = '';
	
	  //setup annotations for names
	  children.forEach(function (child, i) {
	    var block = seqNode.appendChild(createElement('.block'));
	    var nameTag = block.appendChild(child.cloneNode(true));
	    var nameEditor = block.appendChild(createElement('textarea'));
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
	
	    if (!_this.semanticFunc.args) {
	      _this.semanticFunc.args = [];
	    }
	    _this.semanticFunc.args[i] = nameEditor.value;
	
	    nameEditor.autofocus = true;
	    nameEditor.cols = Math.max(nameEditor.value.length, 1);
	    nameEditor.addEventListener('keyup', function () {
	      nameEditor.cols = Math.max(nameEditor.value.length, 1);
	      var args = this.ruleTOSemanticFunc.get(ruleName).args;
	      args[nameEditor._idx] = nameEditor.value;
	    });
	    nameTag.addEventListener('click', function (e) {
	      var editor = nameTag.nextSibling;
	      editor.hidden = !editor.hidden;
	      if (!editor.hidden && editor.value.length === 0) {
	        editor.focus();
	      }
	    });
	  });
	
	  if (this.domNode.tagName === 'RULE') {
	    currentNode = this.domNode.querySelector('choice');
	  }
	
	  this.bodyWrap = currentNode.appendChild(createElement('.bodyWrap'));
	  this.bodyWrap.appendChild(createElement('span.arrow', ''));
	  this.editorDom = this.bodyWrap.appendChild(createElement('.editorBody'));
	
	  this.jsEditor = new JSTextEditor(this.editorDom, {
	    body: body
	  });
	  this.jsEditor.editor.viewportMargin = Infinity;
	  this.jsEditor.changeListeners.push(function () {
	    _this.saveButton.saved = false;
	  });
	  this.jsEditor.settledChangeListeners.push(function (valid) {
	    if (!valid) {
	      return;
	    }
	
	    _this.saveButton.saved = true;
	    var previousFunc = ruleTOSemanticFunc.get(ruleName);
	
	    var before = previousFunc.body && previousFunc.body.trim() !== ''; //this.ruleName in semantics.getOperation('eval').actionDict;
	    var after = _this.jsEditor.editor.getValue().trim() !== '';
	    if (!(before && after) && !(!before && !after)) {
	      _this.bodyWrap.classList.toggle('defined');
	    }
	
	    saveAction(semantics.getOperation('eval').actionDict, ruleName, previousFunc, _this.jsEditor.editor.getValue());
	    try {
	      semanticsOperations.reset();
	      semantics(match).eval();
	    } catch (e) {
	      console.log(e);
	    }
	    console.log(semanticsOperations.resultMap);
	    var nodeToResult = mapSemantics.mapSemantics(semantics, "eval", match, semanticsOperations.resultMap);
	    // console.log(nodeToResult);
	    actions.updateSemanticResults(nodeToResult);
	  });
	
	  this.saveButton = new SaveButton();
	  this.editorDom.appendChild(this.saveButton.domNode);
	  this.saveButton.clickListeners.push(function () {
	    var previousFunc = ruleTOSemanticFunc.get(ruleName);
	
	    var before = previousFunc.body && previousFunc.body.trim() !== ''; //this.ruleName in semantics.getOperation('eval').actionDict;
	    var after = _this.jsEditor.editor.getValue().trim() !== '';
	    if (!(before && after) && !(!before && !after)) {
	      _this.bodyWrap.classList.toggle('defined');
	    }
	
	    saveAction(semantics.getOperation('eval').actionDict, ruleName, previousFunc, _this.jsEditor.editor.getValue());
	    try {
	      semanticsOperations.reset();
	      semantics(match).eval();
	    } catch (e) {
	      console.log(e);
	    }
	    console.log(semanticsOperations.resultMap);
	    var nodeToResult = mapSemantics.mapSemantics(semantics, "eval", match, semanticsOperations.resultMap);
	    // console.log(nodeToResult);
	    actions.updateSemanticResults(nodeToResult);
	  });
	
	  this.bodyWrap.hidden = true;
	};
	
	var toExport = {
	  SemanticEditor: SemanticEditor
	};
	
	if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
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
	    actionFnStr.substring(actionFnStr.indexOf('(') + 1, actionFnStr.indexOf(')')).split(',').forEach(function (arg) {
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

/***/ },
/* 19 */
/***/ function(module, exports) {

	"use strict";
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var SaveButton = function () {
	  function SaveButton() {
	    _classCallCheck(this, SaveButton);
	
	    this.domNode = document.createElement("div");
	    this.domNode.classList.add("saveButton");
	    this.clickListeners = [];
	
	    this._saved = false;
	
	    this.domNode.addEventListener("click", this.onClick.bind(this));
	  }
	
	  _createClass(SaveButton, [{
	    key: "onClick",
	    value: function onClick(evt) {
	      this.clickListeners.forEach(function (cl) {
	        return cl(evt);
	      });
	    }
	  }, {
	    key: "saved",
	    get: function get() {
	      return this._saved;
	    },
	    set: function set(saved) {
	      this._saved = saved;
	      this.domNode.classList.toggle("saved", saved);
	
	      return this._saved;
	    }
	  }]);
	
	  return SaveButton;
	}();
	
	var toExport = {
	  SaveButton: SaveButton
	};
	
	if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
	  module.exports = toExport;
	} else {
	  Object.assign(window, toExport);
	}

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var esprima = __webpack_require__(21);
	
	var JSTextEditor = function () {
	  function JSTextEditor(domNode, _ref) {
	    var _this = this;
	
	    var _ref$body = _ref.body;
	    var body = _ref$body === undefined ? '' : _ref$body;
	
	    _classCallCheck(this, JSTextEditor);
	
	    this.domNode = domNode;
	    this.editor = CodeMirror(this.domNode);
	    this.editor.setValue(body);
	
	    this.settledChangeListeners = [];
	    this.changeListeners = [];
	
	    this.previousTimeout = null;
	    this.marks = [];
	    this.editor.on('change', function () {
	      var match = undefined,
	          valid = undefined,
	          tokens = undefined;
	      try {
	        match = esprima.parse(_this.editor.getValue(), { range: true, tokens: true });
	        valid = true;
	        _this.marks.forEach(function (mark) {
	          return mark.clear();
	        });
	        _this.marks = [];
	        tokens = match.tokens;
	      } catch (e) {
	        valid = false;
	        tokens = esprima.tokenize(_this.editor.getValue(), { range: true });
	      }
	      _this._syntaxHighlight(tokens);
	      _this.onChange(valid);
	
	      if (_this.previousTimeout) {
	        clearTimeout(_this.previousTimeout);
	      }
	      _this.previousTimeout = setTimeout(_this.onSettledChange.bind(_this, valid), 500);
	    });
	  }
	
	  _createClass(JSTextEditor, [{
	    key: 'onSettledChange',
	    value: function onSettledChange(valid) {
	      this.settledChangeListeners.forEach(function (listener) {
	        return listener(valid);
	      });
	      this.previousTimeout = null;
	    }
	  }, {
	    key: 'onChange',
	    value: function onChange(valid) {
	      this.changeListeners.forEach(function (listener) {
	        return listener(valid);
	      });
	    }
	  }, {
	    key: '_syntaxHighlight',
	    value: function _syntaxHighlight(tokens) {
	      var _this2 = this;
	
	      tokens.forEach(function (token) {
	        var doc = _this2.editor.doc;
	        _this2.marks.push(doc.markText(doc.posFromIndex(token.range[0]), doc.posFromIndex(token.range[1]), { className: token.type }));
	      });
	    }
	  }]);
	
	  return JSTextEditor;
	}();
	
	var toExport = {
	  JSTextEditor: JSTextEditor
	};
	
	if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
	  module.exports = toExport;
	} else {
	  Object.assign(window, toExport);
	}

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
	  Copyright (c) jQuery Foundation, Inc. and Contributors, All Rights Reserved.
	
	  Redistribution and use in source and binary forms, with or without
	  modification, are permitted provided that the following conditions are met:
	
	    * Redistributions of source code must retain the above copyright
	      notice, this list of conditions and the following disclaimer.
	    * Redistributions in binary form must reproduce the above copyright
	      notice, this list of conditions and the following disclaimer in the
	      documentation and/or other materials provided with the distribution.
	
	  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
	  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
	  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
	  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
	  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
	  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
	  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	*/
	
	(function (root, factory) {
	    'use strict';
	
	    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
	    // Rhino, and plain browser loading.
	
	    /* istanbul ignore next */
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else if (typeof exports !== 'undefined') {
	        factory(exports);
	    } else {
	        factory((root.esprima = {}));
	    }
	}(this, function (exports) {
	    'use strict';
	
	    var Token,
	        TokenName,
	        FnExprTokens,
	        Syntax,
	        PlaceHolders,
	        Messages,
	        Regex,
	        source,
	        strict,
	        index,
	        lineNumber,
	        lineStart,
	        hasLineTerminator,
	        lastIndex,
	        lastLineNumber,
	        lastLineStart,
	        startIndex,
	        startLineNumber,
	        startLineStart,
	        scanning,
	        length,
	        lookahead,
	        state,
	        extra,
	        isBindingElement,
	        isAssignmentTarget,
	        firstCoverInitializedNameError;
	
	    Token = {
	        BooleanLiteral: 1,
	        EOF: 2,
	        Identifier: 3,
	        Keyword: 4,
	        NullLiteral: 5,
	        NumericLiteral: 6,
	        Punctuator: 7,
	        StringLiteral: 8,
	        RegularExpression: 9,
	        Template: 10
	    };
	
	    TokenName = {};
	    TokenName[Token.BooleanLiteral] = 'Boolean';
	    TokenName[Token.EOF] = '<end>';
	    TokenName[Token.Identifier] = 'Identifier';
	    TokenName[Token.Keyword] = 'Keyword';
	    TokenName[Token.NullLiteral] = 'Null';
	    TokenName[Token.NumericLiteral] = 'Numeric';
	    TokenName[Token.Punctuator] = 'Punctuator';
	    TokenName[Token.StringLiteral] = 'String';
	    TokenName[Token.RegularExpression] = 'RegularExpression';
	    TokenName[Token.Template] = 'Template';
	
	    // A function following one of those tokens is an expression.
	    FnExprTokens = ['(', '{', '[', 'in', 'typeof', 'instanceof', 'new',
	                    'return', 'case', 'delete', 'throw', 'void',
	                    // assignment operators
	                    '=', '+=', '-=', '*=', '/=', '%=', '<<=', '>>=', '>>>=',
	                    '&=', '|=', '^=', ',',
	                    // binary/unary operators
	                    '+', '-', '*', '/', '%', '++', '--', '<<', '>>', '>>>', '&',
	                    '|', '^', '!', '~', '&&', '||', '?', ':', '===', '==', '>=',
	                    '<=', '<', '>', '!=', '!=='];
	
	    Syntax = {
	        AssignmentExpression: 'AssignmentExpression',
	        AssignmentPattern: 'AssignmentPattern',
	        ArrayExpression: 'ArrayExpression',
	        ArrayPattern: 'ArrayPattern',
	        ArrowFunctionExpression: 'ArrowFunctionExpression',
	        BlockStatement: 'BlockStatement',
	        BinaryExpression: 'BinaryExpression',
	        BreakStatement: 'BreakStatement',
	        CallExpression: 'CallExpression',
	        CatchClause: 'CatchClause',
	        ClassBody: 'ClassBody',
	        ClassDeclaration: 'ClassDeclaration',
	        ClassExpression: 'ClassExpression',
	        ConditionalExpression: 'ConditionalExpression',
	        ContinueStatement: 'ContinueStatement',
	        DoWhileStatement: 'DoWhileStatement',
	        DebuggerStatement: 'DebuggerStatement',
	        EmptyStatement: 'EmptyStatement',
	        ExportAllDeclaration: 'ExportAllDeclaration',
	        ExportDefaultDeclaration: 'ExportDefaultDeclaration',
	        ExportNamedDeclaration: 'ExportNamedDeclaration',
	        ExportSpecifier: 'ExportSpecifier',
	        ExpressionStatement: 'ExpressionStatement',
	        ForStatement: 'ForStatement',
	        ForOfStatement: 'ForOfStatement',
	        ForInStatement: 'ForInStatement',
	        FunctionDeclaration: 'FunctionDeclaration',
	        FunctionExpression: 'FunctionExpression',
	        Identifier: 'Identifier',
	        IfStatement: 'IfStatement',
	        ImportDeclaration: 'ImportDeclaration',
	        ImportDefaultSpecifier: 'ImportDefaultSpecifier',
	        ImportNamespaceSpecifier: 'ImportNamespaceSpecifier',
	        ImportSpecifier: 'ImportSpecifier',
	        Literal: 'Literal',
	        LabeledStatement: 'LabeledStatement',
	        LogicalExpression: 'LogicalExpression',
	        MemberExpression: 'MemberExpression',
	        MetaProperty: 'MetaProperty',
	        MethodDefinition: 'MethodDefinition',
	        NewExpression: 'NewExpression',
	        ObjectExpression: 'ObjectExpression',
	        ObjectPattern: 'ObjectPattern',
	        Program: 'Program',
	        Property: 'Property',
	        RestElement: 'RestElement',
	        ReturnStatement: 'ReturnStatement',
	        SequenceExpression: 'SequenceExpression',
	        SpreadElement: 'SpreadElement',
	        Super: 'Super',
	        SwitchCase: 'SwitchCase',
	        SwitchStatement: 'SwitchStatement',
	        TaggedTemplateExpression: 'TaggedTemplateExpression',
	        TemplateElement: 'TemplateElement',
	        TemplateLiteral: 'TemplateLiteral',
	        ThisExpression: 'ThisExpression',
	        ThrowStatement: 'ThrowStatement',
	        TryStatement: 'TryStatement',
	        UnaryExpression: 'UnaryExpression',
	        UpdateExpression: 'UpdateExpression',
	        VariableDeclaration: 'VariableDeclaration',
	        VariableDeclarator: 'VariableDeclarator',
	        WhileStatement: 'WhileStatement',
	        WithStatement: 'WithStatement',
	        YieldExpression: 'YieldExpression'
	    };
	
	    PlaceHolders = {
	        ArrowParameterPlaceHolder: 'ArrowParameterPlaceHolder'
	    };
	
	    // Error messages should be identical to V8.
	    Messages = {
	        UnexpectedToken: 'Unexpected token %0',
	        UnexpectedNumber: 'Unexpected number',
	        UnexpectedString: 'Unexpected string',
	        UnexpectedIdentifier: 'Unexpected identifier',
	        UnexpectedReserved: 'Unexpected reserved word',
	        UnexpectedTemplate: 'Unexpected quasi %0',
	        UnexpectedEOS: 'Unexpected end of input',
	        NewlineAfterThrow: 'Illegal newline after throw',
	        InvalidRegExp: 'Invalid regular expression',
	        UnterminatedRegExp: 'Invalid regular expression: missing /',
	        InvalidLHSInAssignment: 'Invalid left-hand side in assignment',
	        InvalidLHSInForIn: 'Invalid left-hand side in for-in',
	        InvalidLHSInForLoop: 'Invalid left-hand side in for-loop',
	        MultipleDefaultsInSwitch: 'More than one default clause in switch statement',
	        NoCatchOrFinally: 'Missing catch or finally after try',
	        UnknownLabel: 'Undefined label \'%0\'',
	        Redeclaration: '%0 \'%1\' has already been declared',
	        IllegalContinue: 'Illegal continue statement',
	        IllegalBreak: 'Illegal break statement',
	        IllegalReturn: 'Illegal return statement',
	        StrictModeWith: 'Strict mode code may not include a with statement',
	        StrictCatchVariable: 'Catch variable may not be eval or arguments in strict mode',
	        StrictVarName: 'Variable name may not be eval or arguments in strict mode',
	        StrictParamName: 'Parameter name eval or arguments is not allowed in strict mode',
	        StrictParamDupe: 'Strict mode function may not have duplicate parameter names',
	        StrictFunctionName: 'Function name may not be eval or arguments in strict mode',
	        StrictOctalLiteral: 'Octal literals are not allowed in strict mode.',
	        StrictDelete: 'Delete of an unqualified identifier in strict mode.',
	        StrictLHSAssignment: 'Assignment to eval or arguments is not allowed in strict mode',
	        StrictLHSPostfix: 'Postfix increment/decrement may not have eval or arguments operand in strict mode',
	        StrictLHSPrefix: 'Prefix increment/decrement may not have eval or arguments operand in strict mode',
	        StrictReservedWord: 'Use of future reserved word in strict mode',
	        TemplateOctalLiteral: 'Octal literals are not allowed in template strings.',
	        ParameterAfterRestParameter: 'Rest parameter must be last formal parameter',
	        DefaultRestParameter: 'Unexpected token =',
	        ObjectPatternAsRestParameter: 'Unexpected token {',
	        DuplicateProtoProperty: 'Duplicate __proto__ fields are not allowed in object literals',
	        ConstructorSpecialMethod: 'Class constructor may not be an accessor',
	        DuplicateConstructor: 'A class may only have one constructor',
	        StaticPrototype: 'Classes may not have static property named prototype',
	        MissingFromClause: 'Unexpected token',
	        NoAsAfterImportNamespace: 'Unexpected token',
	        InvalidModuleSpecifier: 'Unexpected token',
	        IllegalImportDeclaration: 'Unexpected token',
	        IllegalExportDeclaration: 'Unexpected token',
	        DuplicateBinding: 'Duplicate binding %0'
	    };
	
	    // See also tools/generate-unicode-regex.js.
	    Regex = {
	        // ECMAScript 6/Unicode v7.0.0 NonAsciiIdentifierStart:
	        NonAsciiIdentifierStart: /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B2\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDE00-\uDE11\uDE13-\uDE2B\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF5D-\uDF61]|\uD805[\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDE00-\uDE2F\uDE44\uDE80-\uDEAA]|\uD806[\uDCA0-\uDCDF\uDCFF\uDEC0-\uDEF8]|\uD808[\uDC00-\uDF98]|\uD809[\uDC00-\uDC6E]|[\uD80C\uD840-\uD868\uD86A-\uD86C][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D]|\uD87E[\uDC00-\uDE1D]/,
	
	        // ECMAScript 6/Unicode v7.0.0 NonAsciiIdentifierPart:
	        NonAsciiIdentifierPart: /[\xAA\xB5\xB7\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B2\u08E4-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58\u0C59\u0C60-\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D60-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1369-\u1371\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA69D\uA69F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2D\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDD0-\uDDDA\uDE00-\uDE11\uDE13-\uDE37\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF01-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9]|\uD806[\uDCA0-\uDCE9\uDCFF\uDEC0-\uDEF8]|\uD808[\uDC00-\uDF98]|\uD809[\uDC00-\uDC6E]|[\uD80C\uD840-\uD868\uD86A-\uD86C][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF]/
	    };
	
	    // Ensure the condition is true, otherwise throw an error.
	    // This is only to have a better contract semantic, i.e. another safety net
	    // to catch a logic error. The condition shall be fulfilled in normal case.
	    // Do NOT use this to enforce a certain condition on any user input.
	
	    function assert(condition, message) {
	        /* istanbul ignore if */
	        if (!condition) {
	            throw new Error('ASSERT: ' + message);
	        }
	    }
	
	    function isDecimalDigit(ch) {
	        return (ch >= 0x30 && ch <= 0x39);   // 0..9
	    }
	
	    function isHexDigit(ch) {
	        return '0123456789abcdefABCDEF'.indexOf(ch) >= 0;
	    }
	
	    function isOctalDigit(ch) {
	        return '01234567'.indexOf(ch) >= 0;
	    }
	
	    function octalToDecimal(ch) {
	        // \0 is not octal escape sequence
	        var octal = (ch !== '0'), code = '01234567'.indexOf(ch);
	
	        if (index < length && isOctalDigit(source[index])) {
	            octal = true;
	            code = code * 8 + '01234567'.indexOf(source[index++]);
	
	            // 3 digits are only allowed when string starts
	            // with 0, 1, 2, 3
	            if ('0123'.indexOf(ch) >= 0 &&
	                    index < length &&
	                    isOctalDigit(source[index])) {
	                code = code * 8 + '01234567'.indexOf(source[index++]);
	            }
	        }
	
	        return {
	            code: code,
	            octal: octal
	        };
	    }
	
	    // ECMA-262 11.2 White Space
	
	    function isWhiteSpace(ch) {
	        return (ch === 0x20) || (ch === 0x09) || (ch === 0x0B) || (ch === 0x0C) || (ch === 0xA0) ||
	            (ch >= 0x1680 && [0x1680, 0x180E, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200A, 0x202F, 0x205F, 0x3000, 0xFEFF].indexOf(ch) >= 0);
	    }
	
	    // ECMA-262 11.3 Line Terminators
	
	    function isLineTerminator(ch) {
	        return (ch === 0x0A) || (ch === 0x0D) || (ch === 0x2028) || (ch === 0x2029);
	    }
	
	    // ECMA-262 11.6 Identifier Names and Identifiers
	
	    function fromCodePoint(cp) {
	        return (cp < 0x10000) ? String.fromCharCode(cp) :
	            String.fromCharCode(0xD800 + ((cp - 0x10000) >> 10)) +
	            String.fromCharCode(0xDC00 + ((cp - 0x10000) & 1023));
	    }
	
	    function isIdentifierStart(ch) {
	        return (ch === 0x24) || (ch === 0x5F) ||  // $ (dollar) and _ (underscore)
	            (ch >= 0x41 && ch <= 0x5A) ||         // A..Z
	            (ch >= 0x61 && ch <= 0x7A) ||         // a..z
	            (ch === 0x5C) ||                      // \ (backslash)
	            ((ch >= 0x80) && Regex.NonAsciiIdentifierStart.test(fromCodePoint(ch)));
	    }
	
	    function isIdentifierPart(ch) {
	        return (ch === 0x24) || (ch === 0x5F) ||  // $ (dollar) and _ (underscore)
	            (ch >= 0x41 && ch <= 0x5A) ||         // A..Z
	            (ch >= 0x61 && ch <= 0x7A) ||         // a..z
	            (ch >= 0x30 && ch <= 0x39) ||         // 0..9
	            (ch === 0x5C) ||                      // \ (backslash)
	            ((ch >= 0x80) && Regex.NonAsciiIdentifierPart.test(fromCodePoint(ch)));
	    }
	
	    // ECMA-262 11.6.2.2 Future Reserved Words
	
	    function isFutureReservedWord(id) {
	        switch (id) {
	        case 'enum':
	        case 'export':
	        case 'import':
	        case 'super':
	            return true;
	        default:
	            return false;
	        }
	    }
	
	    function isStrictModeReservedWord(id) {
	        switch (id) {
	        case 'implements':
	        case 'interface':
	        case 'package':
	        case 'private':
	        case 'protected':
	        case 'public':
	        case 'static':
	        case 'yield':
	        case 'let':
	            return true;
	        default:
	            return false;
	        }
	    }
	
	    function isRestrictedWord(id) {
	        return id === 'eval' || id === 'arguments';
	    }
	
	    // ECMA-262 11.6.2.1 Keywords
	
	    function isKeyword(id) {
	        switch (id.length) {
	        case 2:
	            return (id === 'if') || (id === 'in') || (id === 'do');
	        case 3:
	            return (id === 'var') || (id === 'for') || (id === 'new') ||
	                (id === 'try') || (id === 'let');
	        case 4:
	            return (id === 'this') || (id === 'else') || (id === 'case') ||
	                (id === 'void') || (id === 'with') || (id === 'enum');
	        case 5:
	            return (id === 'while') || (id === 'break') || (id === 'catch') ||
	                (id === 'throw') || (id === 'const') || (id === 'yield') ||
	                (id === 'class') || (id === 'super');
	        case 6:
	            return (id === 'return') || (id === 'typeof') || (id === 'delete') ||
	                (id === 'switch') || (id === 'export') || (id === 'import');
	        case 7:
	            return (id === 'default') || (id === 'finally') || (id === 'extends');
	        case 8:
	            return (id === 'function') || (id === 'continue') || (id === 'debugger');
	        case 10:
	            return (id === 'instanceof');
	        default:
	            return false;
	        }
	    }
	
	    // ECMA-262 11.4 Comments
	
	    function addComment(type, value, start, end, loc) {
	        var comment;
	
	        assert(typeof start === 'number', 'Comment must have valid position');
	
	        state.lastCommentStart = start;
	
	        comment = {
	            type: type,
	            value: value
	        };
	        if (extra.range) {
	            comment.range = [start, end];
	        }
	        if (extra.loc) {
	            comment.loc = loc;
	        }
	        extra.comments.push(comment);
	        if (extra.attachComment) {
	            extra.leadingComments.push(comment);
	            extra.trailingComments.push(comment);
	        }
	        if (extra.tokenize) {
	            comment.type = comment.type + 'Comment';
	            if (extra.delegate) {
	                comment = extra.delegate(comment);
	            }
	            extra.tokens.push(comment);
	        }
	    }
	
	    function skipSingleLineComment(offset) {
	        var start, loc, ch, comment;
	
	        start = index - offset;
	        loc = {
	            start: {
	                line: lineNumber,
	                column: index - lineStart - offset
	            }
	        };
	
	        while (index < length) {
	            ch = source.charCodeAt(index);
	            ++index;
	            if (isLineTerminator(ch)) {
	                hasLineTerminator = true;
	                if (extra.comments) {
	                    comment = source.slice(start + offset, index - 1);
	                    loc.end = {
	                        line: lineNumber,
	                        column: index - lineStart - 1
	                    };
	                    addComment('Line', comment, start, index - 1, loc);
	                }
	                if (ch === 13 && source.charCodeAt(index) === 10) {
	                    ++index;
	                }
	                ++lineNumber;
	                lineStart = index;
	                return;
	            }
	        }
	
	        if (extra.comments) {
	            comment = source.slice(start + offset, index);
	            loc.end = {
	                line: lineNumber,
	                column: index - lineStart
	            };
	            addComment('Line', comment, start, index, loc);
	        }
	    }
	
	    function skipMultiLineComment() {
	        var start, loc, ch, comment;
	
	        if (extra.comments) {
	            start = index - 2;
	            loc = {
	                start: {
	                    line: lineNumber,
	                    column: index - lineStart - 2
	                }
	            };
	        }
	
	        while (index < length) {
	            ch = source.charCodeAt(index);
	            if (isLineTerminator(ch)) {
	                if (ch === 0x0D && source.charCodeAt(index + 1) === 0x0A) {
	                    ++index;
	                }
	                hasLineTerminator = true;
	                ++lineNumber;
	                ++index;
	                lineStart = index;
	            } else if (ch === 0x2A) {
	                // Block comment ends with '*/'.
	                if (source.charCodeAt(index + 1) === 0x2F) {
	                    ++index;
	                    ++index;
	                    if (extra.comments) {
	                        comment = source.slice(start + 2, index - 2);
	                        loc.end = {
	                            line: lineNumber,
	                            column: index - lineStart
	                        };
	                        addComment('Block', comment, start, index, loc);
	                    }
	                    return;
	                }
	                ++index;
	            } else {
	                ++index;
	            }
	        }
	
	        // Ran off the end of the file - the whole thing is a comment
	        if (extra.comments) {
	            loc.end = {
	                line: lineNumber,
	                column: index - lineStart
	            };
	            comment = source.slice(start + 2, index);
	            addComment('Block', comment, start, index, loc);
	        }
	        tolerateUnexpectedToken();
	    }
	
	    function skipComment() {
	        var ch, start;
	        hasLineTerminator = false;
	
	        start = (index === 0);
	        while (index < length) {
	            ch = source.charCodeAt(index);
	
	            if (isWhiteSpace(ch)) {
	                ++index;
	            } else if (isLineTerminator(ch)) {
	                hasLineTerminator = true;
	                ++index;
	                if (ch === 0x0D && source.charCodeAt(index) === 0x0A) {
	                    ++index;
	                }
	                ++lineNumber;
	                lineStart = index;
	                start = true;
	            } else if (ch === 0x2F) { // U+002F is '/'
	                ch = source.charCodeAt(index + 1);
	                if (ch === 0x2F) {
	                    ++index;
	                    ++index;
	                    skipSingleLineComment(2);
	                    start = true;
	                } else if (ch === 0x2A) {  // U+002A is '*'
	                    ++index;
	                    ++index;
	                    skipMultiLineComment();
	                } else {
	                    break;
	                }
	            } else if (start && ch === 0x2D) { // U+002D is '-'
	                // U+003E is '>'
	                if ((source.charCodeAt(index + 1) === 0x2D) && (source.charCodeAt(index + 2) === 0x3E)) {
	                    // '-->' is a single-line comment
	                    index += 3;
	                    skipSingleLineComment(3);
	                } else {
	                    break;
	                }
	            } else if (ch === 0x3C) { // U+003C is '<'
	                if (source.slice(index + 1, index + 4) === '!--') {
	                    ++index; // `<`
	                    ++index; // `!`
	                    ++index; // `-`
	                    ++index; // `-`
	                    skipSingleLineComment(4);
	                } else {
	                    break;
	                }
	            } else {
	                break;
	            }
	        }
	    }
	
	    function scanHexEscape(prefix) {
	        var i, len, ch, code = 0;
	
	        len = (prefix === 'u') ? 4 : 2;
	        for (i = 0; i < len; ++i) {
	            if (index < length && isHexDigit(source[index])) {
	                ch = source[index++];
	                code = code * 16 + '0123456789abcdef'.indexOf(ch.toLowerCase());
	            } else {
	                return '';
	            }
	        }
	        return String.fromCharCode(code);
	    }
	
	    function scanUnicodeCodePointEscape() {
	        var ch, code;
	
	        ch = source[index];
	        code = 0;
	
	        // At least, one hex digit is required.
	        if (ch === '}') {
	            throwUnexpectedToken();
	        }
	
	        while (index < length) {
	            ch = source[index++];
	            if (!isHexDigit(ch)) {
	                break;
	            }
	            code = code * 16 + '0123456789abcdef'.indexOf(ch.toLowerCase());
	        }
	
	        if (code > 0x10FFFF || ch !== '}') {
	            throwUnexpectedToken();
	        }
	
	        return fromCodePoint(code);
	    }
	
	    function codePointAt(i) {
	        var cp, first, second;
	
	        cp = source.charCodeAt(i);
	        if (cp >= 0xD800 && cp <= 0xDBFF) {
	            second = source.charCodeAt(i + 1);
	            if (second >= 0xDC00 && second <= 0xDFFF) {
	                first = cp;
	                cp = (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
	            }
	        }
	
	        return cp;
	    }
	
	    function getComplexIdentifier() {
	        var cp, ch, id;
	
	        cp = codePointAt(index);
	        id = fromCodePoint(cp);
	        index += id.length;
	
	        // '\u' (U+005C, U+0075) denotes an escaped character.
	        if (cp === 0x5C) {
	            if (source.charCodeAt(index) !== 0x75) {
	                throwUnexpectedToken();
	            }
	            ++index;
	            if (source[index] === '{') {
	                ++index;
	                ch = scanUnicodeCodePointEscape();
	            } else {
	                ch = scanHexEscape('u');
	                cp = ch.charCodeAt(0);
	                if (!ch || ch === '\\' || !isIdentifierStart(cp)) {
	                    throwUnexpectedToken();
	                }
	            }
	            id = ch;
	        }
	
	        while (index < length) {
	            cp = codePointAt(index);
	            if (!isIdentifierPart(cp)) {
	                break;
	            }
	            ch = fromCodePoint(cp);
	            id += ch;
	            index += ch.length;
	
	            // '\u' (U+005C, U+0075) denotes an escaped character.
	            if (cp === 0x5C) {
	                id = id.substr(0, id.length - 1);
	                if (source.charCodeAt(index) !== 0x75) {
	                    throwUnexpectedToken();
	                }
	                ++index;
	                if (source[index] === '{') {
	                    ++index;
	                    ch = scanUnicodeCodePointEscape();
	                } else {
	                    ch = scanHexEscape('u');
	                    cp = ch.charCodeAt(0);
	                    if (!ch || ch === '\\' || !isIdentifierPart(cp)) {
	                        throwUnexpectedToken();
	                    }
	                }
	                id += ch;
	            }
	        }
	
	        return id;
	    }
	
	    function getIdentifier() {
	        var start, ch;
	
	        start = index++;
	        while (index < length) {
	            ch = source.charCodeAt(index);
	            if (ch === 0x5C) {
	                // Blackslash (U+005C) marks Unicode escape sequence.
	                index = start;
	                return getComplexIdentifier();
	            } else if (ch >= 0xD800 && ch < 0xDFFF) {
	                // Need to handle surrogate pairs.
	                index = start;
	                return getComplexIdentifier();
	            }
	            if (isIdentifierPart(ch)) {
	                ++index;
	            } else {
	                break;
	            }
	        }
	
	        return source.slice(start, index);
	    }
	
	    function scanIdentifier() {
	        var start, id, type;
	
	        start = index;
	
	        // Backslash (U+005C) starts an escaped character.
	        id = (source.charCodeAt(index) === 0x5C) ? getComplexIdentifier() : getIdentifier();
	
	        // There is no keyword or literal with only one character.
	        // Thus, it must be an identifier.
	        if (id.length === 1) {
	            type = Token.Identifier;
	        } else if (isKeyword(id)) {
	            type = Token.Keyword;
	        } else if (id === 'null') {
	            type = Token.NullLiteral;
	        } else if (id === 'true' || id === 'false') {
	            type = Token.BooleanLiteral;
	        } else {
	            type = Token.Identifier;
	        }
	
	        return {
	            type: type,
	            value: id,
	            lineNumber: lineNumber,
	            lineStart: lineStart,
	            start: start,
	            end: index
	        };
	    }
	
	
	    // ECMA-262 11.7 Punctuators
	
	    function scanPunctuator() {
	        var token, str;
	
	        token = {
	            type: Token.Punctuator,
	            value: '',
	            lineNumber: lineNumber,
	            lineStart: lineStart,
	            start: index,
	            end: index
	        };
	
	        // Check for most common single-character punctuators.
	        str = source[index];
	        switch (str) {
	
	        case '(':
	            if (extra.tokenize) {
	                extra.openParenToken = extra.tokenValues.length;
	            }
	            ++index;
	            break;
	
	        case '{':
	            if (extra.tokenize) {
	                extra.openCurlyToken = extra.tokenValues.length;
	            }
	            state.curlyStack.push('{');
	            ++index;
	            break;
	
	        case '.':
	            ++index;
	            if (source[index] === '.' && source[index + 1] === '.') {
	                // Spread operator: ...
	                index += 2;
	                str = '...';
	            }
	            break;
	
	        case '}':
	            ++index;
	            state.curlyStack.pop();
	            break;
	        case ')':
	        case ';':
	        case ',':
	        case '[':
	        case ']':
	        case ':':
	        case '?':
	        case '~':
	            ++index;
	            break;
	
	        default:
	            // 4-character punctuator.
	            str = source.substr(index, 4);
	            if (str === '>>>=') {
	                index += 4;
	            } else {
	
	                // 3-character punctuators.
	                str = str.substr(0, 3);
	                if (str === '===' || str === '!==' || str === '>>>' ||
	                    str === '<<=' || str === '>>=') {
	                    index += 3;
	                } else {
	
	                    // 2-character punctuators.
	                    str = str.substr(0, 2);
	                    if (str === '&&' || str === '||' || str === '==' || str === '!=' ||
	                        str === '+=' || str === '-=' || str === '*=' || str === '/=' ||
	                        str === '++' || str === '--' || str === '<<' || str === '>>' ||
	                        str === '&=' || str === '|=' || str === '^=' || str === '%=' ||
	                        str === '<=' || str === '>=' || str === '=>') {
	                        index += 2;
	                    } else {
	
	                        // 1-character punctuators.
	                        str = source[index];
	                        if ('<>=!+-*%&|^/'.indexOf(str) >= 0) {
	                            ++index;
	                        }
	                    }
	                }
	            }
	        }
	
	        if (index === token.start) {
	            throwUnexpectedToken();
	        }
	
	        token.end = index;
	        token.value = str;
	        return token;
	    }
	
	    // ECMA-262 11.8.3 Numeric Literals
	
	    function scanHexLiteral(start) {
	        var number = '';
	
	        while (index < length) {
	            if (!isHexDigit(source[index])) {
	                break;
	            }
	            number += source[index++];
	        }
	
	        if (number.length === 0) {
	            throwUnexpectedToken();
	        }
	
	        if (isIdentifierStart(source.charCodeAt(index))) {
	            throwUnexpectedToken();
	        }
	
	        return {
	            type: Token.NumericLiteral,
	            value: parseInt('0x' + number, 16),
	            lineNumber: lineNumber,
	            lineStart: lineStart,
	            start: start,
	            end: index
	        };
	    }
	
	    function scanBinaryLiteral(start) {
	        var ch, number;
	
	        number = '';
	
	        while (index < length) {
	            ch = source[index];
	            if (ch !== '0' && ch !== '1') {
	                break;
	            }
	            number += source[index++];
	        }
	
	        if (number.length === 0) {
	            // only 0b or 0B
	            throwUnexpectedToken();
	        }
	
	        if (index < length) {
	            ch = source.charCodeAt(index);
	            /* istanbul ignore else */
	            if (isIdentifierStart(ch) || isDecimalDigit(ch)) {
	                throwUnexpectedToken();
	            }
	        }
	
	        return {
	            type: Token.NumericLiteral,
	            value: parseInt(number, 2),
	            lineNumber: lineNumber,
	            lineStart: lineStart,
	            start: start,
	            end: index
	        };
	    }
	
	    function scanOctalLiteral(prefix, start) {
	        var number, octal;
	
	        if (isOctalDigit(prefix)) {
	            octal = true;
	            number = '0' + source[index++];
	        } else {
	            octal = false;
	            ++index;
	            number = '';
	        }
	
	        while (index < length) {
	            if (!isOctalDigit(source[index])) {
	                break;
	            }
	            number += source[index++];
	        }
	
	        if (!octal && number.length === 0) {
	            // only 0o or 0O
	            throwUnexpectedToken();
	        }
	
	        if (isIdentifierStart(source.charCodeAt(index)) || isDecimalDigit(source.charCodeAt(index))) {
	            throwUnexpectedToken();
	        }
	
	        return {
	            type: Token.NumericLiteral,
	            value: parseInt(number, 8),
	            octal: octal,
	            lineNumber: lineNumber,
	            lineStart: lineStart,
	            start: start,
	            end: index
	        };
	    }
	
	    function isImplicitOctalLiteral() {
	        var i, ch;
	
	        // Implicit octal, unless there is a non-octal digit.
	        // (Annex B.1.1 on Numeric Literals)
	        for (i = index + 1; i < length; ++i) {
	            ch = source[i];
	            if (ch === '8' || ch === '9') {
	                return false;
	            }
	            if (!isOctalDigit(ch)) {
	                return true;
	            }
	        }
	
	        return true;
	    }
	
	    function scanNumericLiteral() {
	        var number, start, ch;
	
	        ch = source[index];
	        assert(isDecimalDigit(ch.charCodeAt(0)) || (ch === '.'),
	            'Numeric literal must start with a decimal digit or a decimal point');
	
	        start = index;
	        number = '';
	        if (ch !== '.') {
	            number = source[index++];
	            ch = source[index];
	
	            // Hex number starts with '0x'.
	            // Octal number starts with '0'.
	            // Octal number in ES6 starts with '0o'.
	            // Binary number in ES6 starts with '0b'.
	            if (number === '0') {
	                if (ch === 'x' || ch === 'X') {
	                    ++index;
	                    return scanHexLiteral(start);
	                }
	                if (ch === 'b' || ch === 'B') {
	                    ++index;
	                    return scanBinaryLiteral(start);
	                }
	                if (ch === 'o' || ch === 'O') {
	                    return scanOctalLiteral(ch, start);
	                }
	
	                if (isOctalDigit(ch)) {
	                    if (isImplicitOctalLiteral()) {
	                        return scanOctalLiteral(ch, start);
	                    }
	                }
	            }
	
	            while (isDecimalDigit(source.charCodeAt(index))) {
	                number += source[index++];
	            }
	            ch = source[index];
	        }
	
	        if (ch === '.') {
	            number += source[index++];
	            while (isDecimalDigit(source.charCodeAt(index))) {
	                number += source[index++];
	            }
	            ch = source[index];
	        }
	
	        if (ch === 'e' || ch === 'E') {
	            number += source[index++];
	
	            ch = source[index];
	            if (ch === '+' || ch === '-') {
	                number += source[index++];
	            }
	            if (isDecimalDigit(source.charCodeAt(index))) {
	                while (isDecimalDigit(source.charCodeAt(index))) {
	                    number += source[index++];
	                }
	            } else {
	                throwUnexpectedToken();
	            }
	        }
	
	        if (isIdentifierStart(source.charCodeAt(index))) {
	            throwUnexpectedToken();
	        }
	
	        return {
	            type: Token.NumericLiteral,
	            value: parseFloat(number),
	            lineNumber: lineNumber,
	            lineStart: lineStart,
	            start: start,
	            end: index
	        };
	    }
	
	    // ECMA-262 11.8.4 String Literals
	
	    function scanStringLiteral() {
	        var str = '', quote, start, ch, unescaped, octToDec, octal = false;
	
	        quote = source[index];
	        assert((quote === '\'' || quote === '"'),
	            'String literal must starts with a quote');
	
	        start = index;
	        ++index;
	
	        while (index < length) {
	            ch = source[index++];
	
	            if (ch === quote) {
	                quote = '';
	                break;
	            } else if (ch === '\\') {
	                ch = source[index++];
	                if (!ch || !isLineTerminator(ch.charCodeAt(0))) {
	                    switch (ch) {
	                    case 'u':
	                    case 'x':
	                        if (source[index] === '{') {
	                            ++index;
	                            str += scanUnicodeCodePointEscape();
	                        } else {
	                            unescaped = scanHexEscape(ch);
	                            if (!unescaped) {
	                                throw throwUnexpectedToken();
	                            }
	                            str += unescaped;
	                        }
	                        break;
	                    case 'n':
	                        str += '\n';
	                        break;
	                    case 'r':
	                        str += '\r';
	                        break;
	                    case 't':
	                        str += '\t';
	                        break;
	                    case 'b':
	                        str += '\b';
	                        break;
	                    case 'f':
	                        str += '\f';
	                        break;
	                    case 'v':
	                        str += '\x0B';
	                        break;
	                    case '8':
	                    case '9':
	                        str += ch;
	                        tolerateUnexpectedToken();
	                        break;
	
	                    default:
	                        if (isOctalDigit(ch)) {
	                            octToDec = octalToDecimal(ch);
	
	                            octal = octToDec.octal || octal;
	                            str += String.fromCharCode(octToDec.code);
	                        } else {
	                            str += ch;
	                        }
	                        break;
	                    }
	                } else {
	                    ++lineNumber;
	                    if (ch === '\r' && source[index] === '\n') {
	                        ++index;
	                    }
	                    lineStart = index;
	                }
	            } else if (isLineTerminator(ch.charCodeAt(0))) {
	                break;
	            } else {
	                str += ch;
	            }
	        }
	
	        if (quote !== '') {
	            index = start;
	            throwUnexpectedToken();
	        }
	
	        return {
	            type: Token.StringLiteral,
	            value: str,
	            octal: octal,
	            lineNumber: startLineNumber,
	            lineStart: startLineStart,
	            start: start,
	            end: index
	        };
	    }
	
	    // ECMA-262 11.8.6 Template Literal Lexical Components
	
	    function scanTemplate() {
	        var cooked = '', ch, start, rawOffset, terminated, head, tail, restore, unescaped;
	
	        terminated = false;
	        tail = false;
	        start = index;
	        head = (source[index] === '`');
	        rawOffset = 2;
	
	        ++index;
	
	        while (index < length) {
	            ch = source[index++];
	            if (ch === '`') {
	                rawOffset = 1;
	                tail = true;
	                terminated = true;
	                break;
	            } else if (ch === '$') {
	                if (source[index] === '{') {
	                    state.curlyStack.push('${');
	                    ++index;
	                    terminated = true;
	                    break;
	                }
	                cooked += ch;
	            } else if (ch === '\\') {
	                ch = source[index++];
	                if (!isLineTerminator(ch.charCodeAt(0))) {
	                    switch (ch) {
	                    case 'n':
	                        cooked += '\n';
	                        break;
	                    case 'r':
	                        cooked += '\r';
	                        break;
	                    case 't':
	                        cooked += '\t';
	                        break;
	                    case 'u':
	                    case 'x':
	                        if (source[index] === '{') {
	                            ++index;
	                            cooked += scanUnicodeCodePointEscape();
	                        } else {
	                            restore = index;
	                            unescaped = scanHexEscape(ch);
	                            if (unescaped) {
	                                cooked += unescaped;
	                            } else {
	                                index = restore;
	                                cooked += ch;
	                            }
	                        }
	                        break;
	                    case 'b':
	                        cooked += '\b';
	                        break;
	                    case 'f':
	                        cooked += '\f';
	                        break;
	                    case 'v':
	                        cooked += '\v';
	                        break;
	
	                    default:
	                        if (ch === '0') {
	                            if (isDecimalDigit(source.charCodeAt(index))) {
	                                // Illegal: \01 \02 and so on
	                                throwError(Messages.TemplateOctalLiteral);
	                            }
	                            cooked += '\0';
	                        } else if (isOctalDigit(ch)) {
	                            // Illegal: \1 \2
	                            throwError(Messages.TemplateOctalLiteral);
	                        } else {
	                            cooked += ch;
	                        }
	                        break;
	                    }
	                } else {
	                    ++lineNumber;
	                    if (ch === '\r' && source[index] === '\n') {
	                        ++index;
	                    }
	                    lineStart = index;
	                }
	            } else if (isLineTerminator(ch.charCodeAt(0))) {
	                ++lineNumber;
	                if (ch === '\r' && source[index] === '\n') {
	                    ++index;
	                }
	                lineStart = index;
	                cooked += '\n';
	            } else {
	                cooked += ch;
	            }
	        }
	
	        if (!terminated) {
	            throwUnexpectedToken();
	        }
	
	        if (!head) {
	            state.curlyStack.pop();
	        }
	
	        return {
	            type: Token.Template,
	            value: {
	                cooked: cooked,
	                raw: source.slice(start + 1, index - rawOffset)
	            },
	            head: head,
	            tail: tail,
	            lineNumber: lineNumber,
	            lineStart: lineStart,
	            start: start,
	            end: index
	        };
	    }
	
	    // ECMA-262 11.8.5 Regular Expression Literals
	
	    function testRegExp(pattern, flags) {
	        // The BMP character to use as a replacement for astral symbols when
	        // translating an ES6 "u"-flagged pattern to an ES5-compatible
	        // approximation.
	        // Note: replacing with '\uFFFF' enables false positives in unlikely
	        // scenarios. For example, `[\u{1044f}-\u{10440}]` is an invalid
	        // pattern that would not be detected by this substitution.
	        var astralSubstitute = '\uFFFF',
	            tmp = pattern;
	
	        if (flags.indexOf('u') >= 0) {
	            tmp = tmp
	                // Replace every Unicode escape sequence with the equivalent
	                // BMP character or a constant ASCII code point in the case of
	                // astral symbols. (See the above note on `astralSubstitute`
	                // for more information.)
	                .replace(/\\u\{([0-9a-fA-F]+)\}|\\u([a-fA-F0-9]{4})/g, function ($0, $1, $2) {
	                    var codePoint = parseInt($1 || $2, 16);
	                    if (codePoint > 0x10FFFF) {
	                        throwUnexpectedToken(null, Messages.InvalidRegExp);
	                    }
	                    if (codePoint <= 0xFFFF) {
	                        return String.fromCharCode(codePoint);
	                    }
	                    return astralSubstitute;
	                })
	                // Replace each paired surrogate with a single ASCII symbol to
	                // avoid throwing on regular expressions that are only valid in
	                // combination with the "u" flag.
	                .replace(
	                    /[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
	                    astralSubstitute
	                );
	        }
	
	        // First, detect invalid regular expressions.
	        try {
	            RegExp(tmp);
	        } catch (e) {
	            throwUnexpectedToken(null, Messages.InvalidRegExp);
	        }
	
	        // Return a regular expression object for this pattern-flag pair, or
	        // `null` in case the current environment doesn't support the flags it
	        // uses.
	        try {
	            return new RegExp(pattern, flags);
	        } catch (exception) {
	            return null;
	        }
	    }
	
	    function scanRegExpBody() {
	        var ch, str, classMarker, terminated, body;
	
	        ch = source[index];
	        assert(ch === '/', 'Regular expression literal must start with a slash');
	        str = source[index++];
	
	        classMarker = false;
	        terminated = false;
	        while (index < length) {
	            ch = source[index++];
	            str += ch;
	            if (ch === '\\') {
	                ch = source[index++];
	                // ECMA-262 7.8.5
	                if (isLineTerminator(ch.charCodeAt(0))) {
	                    throwUnexpectedToken(null, Messages.UnterminatedRegExp);
	                }
	                str += ch;
	            } else if (isLineTerminator(ch.charCodeAt(0))) {
	                throwUnexpectedToken(null, Messages.UnterminatedRegExp);
	            } else if (classMarker) {
	                if (ch === ']') {
	                    classMarker = false;
	                }
	            } else {
	                if (ch === '/') {
	                    terminated = true;
	                    break;
	                } else if (ch === '[') {
	                    classMarker = true;
	                }
	            }
	        }
	
	        if (!terminated) {
	            throwUnexpectedToken(null, Messages.UnterminatedRegExp);
	        }
	
	        // Exclude leading and trailing slash.
	        body = str.substr(1, str.length - 2);
	        return {
	            value: body,
	            literal: str
	        };
	    }
	
	    function scanRegExpFlags() {
	        var ch, str, flags, restore;
	
	        str = '';
	        flags = '';
	        while (index < length) {
	            ch = source[index];
	            if (!isIdentifierPart(ch.charCodeAt(0))) {
	                break;
	            }
	
	            ++index;
	            if (ch === '\\' && index < length) {
	                ch = source[index];
	                if (ch === 'u') {
	                    ++index;
	                    restore = index;
	                    ch = scanHexEscape('u');
	                    if (ch) {
	                        flags += ch;
	                        for (str += '\\u'; restore < index; ++restore) {
	                            str += source[restore];
	                        }
	                    } else {
	                        index = restore;
	                        flags += 'u';
	                        str += '\\u';
	                    }
	                    tolerateUnexpectedToken();
	                } else {
	                    str += '\\';
	                    tolerateUnexpectedToken();
	                }
	            } else {
	                flags += ch;
	                str += ch;
	            }
	        }
	
	        return {
	            value: flags,
	            literal: str
	        };
	    }
	
	    function scanRegExp() {
	        var start, body, flags, value;
	        scanning = true;
	
	        lookahead = null;
	        skipComment();
	        start = index;
	
	        body = scanRegExpBody();
	        flags = scanRegExpFlags();
	        value = testRegExp(body.value, flags.value);
	        scanning = false;
	        if (extra.tokenize) {
	            return {
	                type: Token.RegularExpression,
	                value: value,
	                regex: {
	                    pattern: body.value,
	                    flags: flags.value
	                },
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                start: start,
	                end: index
	            };
	        }
	
	        return {
	            literal: body.literal + flags.literal,
	            value: value,
	            regex: {
	                pattern: body.value,
	                flags: flags.value
	            },
	            start: start,
	            end: index
	        };
	    }
	
	    function collectRegex() {
	        var pos, loc, regex, token;
	
	        skipComment();
	
	        pos = index;
	        loc = {
	            start: {
	                line: lineNumber,
	                column: index - lineStart
	            }
	        };
	
	        regex = scanRegExp();
	
	        loc.end = {
	            line: lineNumber,
	            column: index - lineStart
	        };
	
	        /* istanbul ignore next */
	        if (!extra.tokenize) {
	            // Pop the previous token, which is likely '/' or '/='
	            if (extra.tokens.length > 0) {
	                token = extra.tokens[extra.tokens.length - 1];
	                if (token.range[0] === pos && token.type === 'Punctuator') {
	                    if (token.value === '/' || token.value === '/=') {
	                        extra.tokens.pop();
	                    }
	                }
	            }
	
	            extra.tokens.push({
	                type: 'RegularExpression',
	                value: regex.literal,
	                regex: regex.regex,
	                range: [pos, index],
	                loc: loc
	            });
	        }
	
	        return regex;
	    }
	
	    function isIdentifierName(token) {
	        return token.type === Token.Identifier ||
	            token.type === Token.Keyword ||
	            token.type === Token.BooleanLiteral ||
	            token.type === Token.NullLiteral;
	    }
	
	    // Using the following algorithm:
	    // https://github.com/mozilla/sweet.js/wiki/design
	
	    function advanceSlash() {
	        var regex, previous, check;
	
	        function testKeyword(value) {
	            return value && (value.length > 1) && (value[0] >= 'a') && (value[0] <= 'z');
	        }
	
	        previous = extra.tokenValues[extra.tokens.length - 1];
	        regex = (previous !== null);
	
	        switch (previous) {
	        case 'this':
	        case ']':
	            regex = false;
	            break;
	
	        case ')':
	            check = extra.tokenValues[extra.openParenToken - 1];
	            regex = (check === 'if' || check === 'while' || check === 'for' || check === 'with');
	            break;
	
	        case '}':
	            // Dividing a function by anything makes little sense,
	            // but we have to check for that.
	            regex = false;
	            if (testKeyword(extra.tokenValues[extra.openCurlyToken - 3])) {
	                // Anonymous function, e.g. function(){} /42
	                check = extra.tokenValues[extra.openCurlyToken - 4];
	                regex = check ? (FnExprTokens.indexOf(check) < 0) : false;
	            } else if (testKeyword(extra.tokenValues[extra.openCurlyToken - 4])) {
	                // Named function, e.g. function f(){} /42/
	                check = extra.tokenValues[extra.openCurlyToken - 5];
	                regex = check ? (FnExprTokens.indexOf(check) < 0) : true;
	            }
	        }
	
	        return regex ? collectRegex() : scanPunctuator();
	    }
	
	    function advance() {
	        var cp, token;
	
	        if (index >= length) {
	            return {
	                type: Token.EOF,
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                start: index,
	                end: index
	            };
	        }
	
	        cp = source.charCodeAt(index);
	
	        if (isIdentifierStart(cp)) {
	            token = scanIdentifier();
	            if (strict && isStrictModeReservedWord(token.value)) {
	                token.type = Token.Keyword;
	            }
	            return token;
	        }
	
	        // Very common: ( and ) and ;
	        if (cp === 0x28 || cp === 0x29 || cp === 0x3B) {
	            return scanPunctuator();
	        }
	
	        // String literal starts with single quote (U+0027) or double quote (U+0022).
	        if (cp === 0x27 || cp === 0x22) {
	            return scanStringLiteral();
	        }
	
	        // Dot (.) U+002E can also start a floating-point number, hence the need
	        // to check the next character.
	        if (cp === 0x2E) {
	            if (isDecimalDigit(source.charCodeAt(index + 1))) {
	                return scanNumericLiteral();
	            }
	            return scanPunctuator();
	        }
	
	        if (isDecimalDigit(cp)) {
	            return scanNumericLiteral();
	        }
	
	        // Slash (/) U+002F can also start a regex.
	        if (extra.tokenize && cp === 0x2F) {
	            return advanceSlash();
	        }
	
	        // Template literals start with ` (U+0060) for template head
	        // or } (U+007D) for template middle or template tail.
	        if (cp === 0x60 || (cp === 0x7D && state.curlyStack[state.curlyStack.length - 1] === '${')) {
	            return scanTemplate();
	        }
	
	        // Possible identifier start in a surrogate pair.
	        if (cp >= 0xD800 && cp < 0xDFFF) {
	            cp = codePointAt(index);
	            if (isIdentifierStart(cp)) {
	                return scanIdentifier();
	            }
	        }
	
	        return scanPunctuator();
	    }
	
	    function collectToken() {
	        var loc, token, value, entry;
	
	        loc = {
	            start: {
	                line: lineNumber,
	                column: index - lineStart
	            }
	        };
	
	        token = advance();
	        loc.end = {
	            line: lineNumber,
	            column: index - lineStart
	        };
	
	        if (token.type !== Token.EOF) {
	            value = source.slice(token.start, token.end);
	            entry = {
	                type: TokenName[token.type],
	                value: value,
	                range: [token.start, token.end],
	                loc: loc
	            };
	            if (token.regex) {
	                entry.regex = {
	                    pattern: token.regex.pattern,
	                    flags: token.regex.flags
	                };
	            }
	            if (extra.tokenValues) {
	                extra.tokenValues.push((entry.type === 'Punctuator' || entry.type === 'Keyword') ? entry.value : null);
	            }
	            if (extra.tokenize) {
	                if (!extra.range) {
	                    delete entry.range;
	                }
	                if (!extra.loc) {
	                    delete entry.loc;
	                }
	                if (extra.delegate) {
	                    entry = extra.delegate(entry);
	                }
	            }
	            extra.tokens.push(entry);
	        }
	
	        return token;
	    }
	
	    function lex() {
	        var token;
	        scanning = true;
	
	        lastIndex = index;
	        lastLineNumber = lineNumber;
	        lastLineStart = lineStart;
	
	        skipComment();
	
	        token = lookahead;
	
	        startIndex = index;
	        startLineNumber = lineNumber;
	        startLineStart = lineStart;
	
	        lookahead = (typeof extra.tokens !== 'undefined') ? collectToken() : advance();
	        scanning = false;
	        return token;
	    }
	
	    function peek() {
	        scanning = true;
	
	        skipComment();
	
	        lastIndex = index;
	        lastLineNumber = lineNumber;
	        lastLineStart = lineStart;
	
	        startIndex = index;
	        startLineNumber = lineNumber;
	        startLineStart = lineStart;
	
	        lookahead = (typeof extra.tokens !== 'undefined') ? collectToken() : advance();
	        scanning = false;
	    }
	
	    function Position() {
	        this.line = startLineNumber;
	        this.column = startIndex - startLineStart;
	    }
	
	    function SourceLocation() {
	        this.start = new Position();
	        this.end = null;
	    }
	
	    function WrappingSourceLocation(startToken) {
	        this.start = {
	            line: startToken.lineNumber,
	            column: startToken.start - startToken.lineStart
	        };
	        this.end = null;
	    }
	
	    function Node() {
	        if (extra.range) {
	            this.range = [startIndex, 0];
	        }
	        if (extra.loc) {
	            this.loc = new SourceLocation();
	        }
	    }
	
	    function WrappingNode(startToken) {
	        if (extra.range) {
	            this.range = [startToken.start, 0];
	        }
	        if (extra.loc) {
	            this.loc = new WrappingSourceLocation(startToken);
	        }
	    }
	
	    WrappingNode.prototype = Node.prototype = {
	
	        processComment: function () {
	            var lastChild,
	                innerComments,
	                leadingComments,
	                trailingComments,
	                bottomRight = extra.bottomRightStack,
	                i,
	                comment,
	                last = bottomRight[bottomRight.length - 1];
	
	            if (this.type === Syntax.Program) {
	                if (this.body.length > 0) {
	                    return;
	                }
	            }
	            /**
	             * patch innnerComments for properties empty block
	             * `function a() {/** comments **\/}`
	             */
	
	            if (this.type === Syntax.BlockStatement && this.body.length === 0) {
	                innerComments = [];
	                for (i = extra.leadingComments.length - 1; i >= 0; --i) {
	                    comment = extra.leadingComments[i];
	                    if (this.range[1] >= comment.range[1]) {
	                        innerComments.unshift(comment);
	                        extra.leadingComments.splice(i, 1);
	                        extra.trailingComments.splice(i, 1);
	                    }
	                }
	                if (innerComments.length) {
	                    this.innerComments = innerComments;
	                    //bottomRight.push(this);
	                    return;
	                }
	            }
	
	            if (extra.trailingComments.length > 0) {
	                trailingComments = [];
	                for (i = extra.trailingComments.length - 1; i >= 0; --i) {
	                    comment = extra.trailingComments[i];
	                    if (comment.range[0] >= this.range[1]) {
	                        trailingComments.unshift(comment);
	                        extra.trailingComments.splice(i, 1);
	                    }
	                }
	                extra.trailingComments = [];
	            } else {
	                if (last && last.trailingComments && last.trailingComments[0].range[0] >= this.range[1]) {
	                    trailingComments = last.trailingComments;
	                    delete last.trailingComments;
	                }
	            }
	
	            // Eating the stack.
	            while (last && last.range[0] >= this.range[0]) {
	                lastChild = bottomRight.pop();
	                last = bottomRight[bottomRight.length - 1];
	            }
	
	            if (lastChild) {
	                if (lastChild.leadingComments) {
	                    leadingComments = [];
	                    for (i = lastChild.leadingComments.length - 1; i >= 0; --i) {
	                        comment = lastChild.leadingComments[i];
	                        if (comment.range[1] <= this.range[0]) {
	                            leadingComments.unshift(comment);
	                            lastChild.leadingComments.splice(i, 1);
	                        }
	                    }
	
	                    if (!lastChild.leadingComments.length) {
	                        lastChild.leadingComments = undefined;
	                    }
	                }
	            } else if (extra.leadingComments.length > 0) {
	                leadingComments = [];
	                for (i = extra.leadingComments.length - 1; i >= 0; --i) {
	                    comment = extra.leadingComments[i];
	                    if (comment.range[1] <= this.range[0]) {
	                        leadingComments.unshift(comment);
	                        extra.leadingComments.splice(i, 1);
	                    }
	                }
	            }
	
	
	            if (leadingComments && leadingComments.length > 0) {
	                this.leadingComments = leadingComments;
	            }
	            if (trailingComments && trailingComments.length > 0) {
	                this.trailingComments = trailingComments;
	            }
	
	            bottomRight.push(this);
	        },
	
	        finish: function () {
	            if (extra.range) {
	                this.range[1] = lastIndex;
	            }
	            if (extra.loc) {
	                this.loc.end = {
	                    line: lastLineNumber,
	                    column: lastIndex - lastLineStart
	                };
	                if (extra.source) {
	                    this.loc.source = extra.source;
	                }
	            }
	
	            if (extra.attachComment) {
	                this.processComment();
	            }
	        },
	
	        finishArrayExpression: function (elements) {
	            this.type = Syntax.ArrayExpression;
	            this.elements = elements;
	            this.finish();
	            return this;
	        },
	
	        finishArrayPattern: function (elements) {
	            this.type = Syntax.ArrayPattern;
	            this.elements = elements;
	            this.finish();
	            return this;
	        },
	
	        finishArrowFunctionExpression: function (params, defaults, body, expression) {
	            this.type = Syntax.ArrowFunctionExpression;
	            this.id = null;
	            this.params = params;
	            this.defaults = defaults;
	            this.body = body;
	            this.generator = false;
	            this.expression = expression;
	            this.finish();
	            return this;
	        },
	
	        finishAssignmentExpression: function (operator, left, right) {
	            this.type = Syntax.AssignmentExpression;
	            this.operator = operator;
	            this.left = left;
	            this.right = right;
	            this.finish();
	            return this;
	        },
	
	        finishAssignmentPattern: function (left, right) {
	            this.type = Syntax.AssignmentPattern;
	            this.left = left;
	            this.right = right;
	            this.finish();
	            return this;
	        },
	
	        finishBinaryExpression: function (operator, left, right) {
	            this.type = (operator === '||' || operator === '&&') ? Syntax.LogicalExpression : Syntax.BinaryExpression;
	            this.operator = operator;
	            this.left = left;
	            this.right = right;
	            this.finish();
	            return this;
	        },
	
	        finishBlockStatement: function (body) {
	            this.type = Syntax.BlockStatement;
	            this.body = body;
	            this.finish();
	            return this;
	        },
	
	        finishBreakStatement: function (label) {
	            this.type = Syntax.BreakStatement;
	            this.label = label;
	            this.finish();
	            return this;
	        },
	
	        finishCallExpression: function (callee, args) {
	            this.type = Syntax.CallExpression;
	            this.callee = callee;
	            this.arguments = args;
	            this.finish();
	            return this;
	        },
	
	        finishCatchClause: function (param, body) {
	            this.type = Syntax.CatchClause;
	            this.param = param;
	            this.body = body;
	            this.finish();
	            return this;
	        },
	
	        finishClassBody: function (body) {
	            this.type = Syntax.ClassBody;
	            this.body = body;
	            this.finish();
	            return this;
	        },
	
	        finishClassDeclaration: function (id, superClass, body) {
	            this.type = Syntax.ClassDeclaration;
	            this.id = id;
	            this.superClass = superClass;
	            this.body = body;
	            this.finish();
	            return this;
	        },
	
	        finishClassExpression: function (id, superClass, body) {
	            this.type = Syntax.ClassExpression;
	            this.id = id;
	            this.superClass = superClass;
	            this.body = body;
	            this.finish();
	            return this;
	        },
	
	        finishConditionalExpression: function (test, consequent, alternate) {
	            this.type = Syntax.ConditionalExpression;
	            this.test = test;
	            this.consequent = consequent;
	            this.alternate = alternate;
	            this.finish();
	            return this;
	        },
	
	        finishContinueStatement: function (label) {
	            this.type = Syntax.ContinueStatement;
	            this.label = label;
	            this.finish();
	            return this;
	        },
	
	        finishDebuggerStatement: function () {
	            this.type = Syntax.DebuggerStatement;
	            this.finish();
	            return this;
	        },
	
	        finishDoWhileStatement: function (body, test) {
	            this.type = Syntax.DoWhileStatement;
	            this.body = body;
	            this.test = test;
	            this.finish();
	            return this;
	        },
	
	        finishEmptyStatement: function () {
	            this.type = Syntax.EmptyStatement;
	            this.finish();
	            return this;
	        },
	
	        finishExpressionStatement: function (expression) {
	            this.type = Syntax.ExpressionStatement;
	            this.expression = expression;
	            this.finish();
	            return this;
	        },
	
	        finishForStatement: function (init, test, update, body) {
	            this.type = Syntax.ForStatement;
	            this.init = init;
	            this.test = test;
	            this.update = update;
	            this.body = body;
	            this.finish();
	            return this;
	        },
	
	        finishForOfStatement: function (left, right, body) {
	            this.type = Syntax.ForOfStatement;
	            this.left = left;
	            this.right = right;
	            this.body = body;
	            this.finish();
	            return this;
	        },
	
	        finishForInStatement: function (left, right, body) {
	            this.type = Syntax.ForInStatement;
	            this.left = left;
	            this.right = right;
	            this.body = body;
	            this.each = false;
	            this.finish();
	            return this;
	        },
	
	        finishFunctionDeclaration: function (id, params, defaults, body, generator) {
	            this.type = Syntax.FunctionDeclaration;
	            this.id = id;
	            this.params = params;
	            this.defaults = defaults;
	            this.body = body;
	            this.generator = generator;
	            this.expression = false;
	            this.finish();
	            return this;
	        },
	
	        finishFunctionExpression: function (id, params, defaults, body, generator) {
	            this.type = Syntax.FunctionExpression;
	            this.id = id;
	            this.params = params;
	            this.defaults = defaults;
	            this.body = body;
	            this.generator = generator;
	            this.expression = false;
	            this.finish();
	            return this;
	        },
	
	        finishIdentifier: function (name) {
	            this.type = Syntax.Identifier;
	            this.name = name;
	            this.finish();
	            return this;
	        },
	
	        finishIfStatement: function (test, consequent, alternate) {
	            this.type = Syntax.IfStatement;
	            this.test = test;
	            this.consequent = consequent;
	            this.alternate = alternate;
	            this.finish();
	            return this;
	        },
	
	        finishLabeledStatement: function (label, body) {
	            this.type = Syntax.LabeledStatement;
	            this.label = label;
	            this.body = body;
	            this.finish();
	            return this;
	        },
	
	        finishLiteral: function (token) {
	            this.type = Syntax.Literal;
	            this.value = token.value;
	            this.raw = source.slice(token.start, token.end);
	            if (token.regex) {
	                this.regex = token.regex;
	            }
	            this.finish();
	            return this;
	        },
	
	        finishMemberExpression: function (accessor, object, property) {
	            this.type = Syntax.MemberExpression;
	            this.computed = accessor === '[';
	            this.object = object;
	            this.property = property;
	            this.finish();
	            return this;
	        },
	
	        finishMetaProperty: function (meta, property) {
	            this.type = Syntax.MetaProperty;
	            this.meta = meta;
	            this.property = property;
	            this.finish();
	            return this;
	        },
	
	        finishNewExpression: function (callee, args) {
	            this.type = Syntax.NewExpression;
	            this.callee = callee;
	            this.arguments = args;
	            this.finish();
	            return this;
	        },
	
	        finishObjectExpression: function (properties) {
	            this.type = Syntax.ObjectExpression;
	            this.properties = properties;
	            this.finish();
	            return this;
	        },
	
	        finishObjectPattern: function (properties) {
	            this.type = Syntax.ObjectPattern;
	            this.properties = properties;
	            this.finish();
	            return this;
	        },
	
	        finishPostfixExpression: function (operator, argument) {
	            this.type = Syntax.UpdateExpression;
	            this.operator = operator;
	            this.argument = argument;
	            this.prefix = false;
	            this.finish();
	            return this;
	        },
	
	        finishProgram: function (body, sourceType) {
	            this.type = Syntax.Program;
	            this.body = body;
	            this.sourceType = sourceType;
	            this.finish();
	            return this;
	        },
	
	        finishProperty: function (kind, key, computed, value, method, shorthand) {
	            this.type = Syntax.Property;
	            this.key = key;
	            this.computed = computed;
	            this.value = value;
	            this.kind = kind;
	            this.method = method;
	            this.shorthand = shorthand;
	            this.finish();
	            return this;
	        },
	
	        finishRestElement: function (argument) {
	            this.type = Syntax.RestElement;
	            this.argument = argument;
	            this.finish();
	            return this;
	        },
	
	        finishReturnStatement: function (argument) {
	            this.type = Syntax.ReturnStatement;
	            this.argument = argument;
	            this.finish();
	            return this;
	        },
	
	        finishSequenceExpression: function (expressions) {
	            this.type = Syntax.SequenceExpression;
	            this.expressions = expressions;
	            this.finish();
	            return this;
	        },
	
	        finishSpreadElement: function (argument) {
	            this.type = Syntax.SpreadElement;
	            this.argument = argument;
	            this.finish();
	            return this;
	        },
	
	        finishSwitchCase: function (test, consequent) {
	            this.type = Syntax.SwitchCase;
	            this.test = test;
	            this.consequent = consequent;
	            this.finish();
	            return this;
	        },
	
	        finishSuper: function () {
	            this.type = Syntax.Super;
	            this.finish();
	            return this;
	        },
	
	        finishSwitchStatement: function (discriminant, cases) {
	            this.type = Syntax.SwitchStatement;
	            this.discriminant = discriminant;
	            this.cases = cases;
	            this.finish();
	            return this;
	        },
	
	        finishTaggedTemplateExpression: function (tag, quasi) {
	            this.type = Syntax.TaggedTemplateExpression;
	            this.tag = tag;
	            this.quasi = quasi;
	            this.finish();
	            return this;
	        },
	
	        finishTemplateElement: function (value, tail) {
	            this.type = Syntax.TemplateElement;
	            this.value = value;
	            this.tail = tail;
	            this.finish();
	            return this;
	        },
	
	        finishTemplateLiteral: function (quasis, expressions) {
	            this.type = Syntax.TemplateLiteral;
	            this.quasis = quasis;
	            this.expressions = expressions;
	            this.finish();
	            return this;
	        },
	
	        finishThisExpression: function () {
	            this.type = Syntax.ThisExpression;
	            this.finish();
	            return this;
	        },
	
	        finishThrowStatement: function (argument) {
	            this.type = Syntax.ThrowStatement;
	            this.argument = argument;
	            this.finish();
	            return this;
	        },
	
	        finishTryStatement: function (block, handler, finalizer) {
	            this.type = Syntax.TryStatement;
	            this.block = block;
	            this.guardedHandlers = [];
	            this.handlers = handler ? [handler] : [];
	            this.handler = handler;
	            this.finalizer = finalizer;
	            this.finish();
	            return this;
	        },
	
	        finishUnaryExpression: function (operator, argument) {
	            this.type = (operator === '++' || operator === '--') ? Syntax.UpdateExpression : Syntax.UnaryExpression;
	            this.operator = operator;
	            this.argument = argument;
	            this.prefix = true;
	            this.finish();
	            return this;
	        },
	
	        finishVariableDeclaration: function (declarations) {
	            this.type = Syntax.VariableDeclaration;
	            this.declarations = declarations;
	            this.kind = 'var';
	            this.finish();
	            return this;
	        },
	
	        finishLexicalDeclaration: function (declarations, kind) {
	            this.type = Syntax.VariableDeclaration;
	            this.declarations = declarations;
	            this.kind = kind;
	            this.finish();
	            return this;
	        },
	
	        finishVariableDeclarator: function (id, init) {
	            this.type = Syntax.VariableDeclarator;
	            this.id = id;
	            this.init = init;
	            this.finish();
	            return this;
	        },
	
	        finishWhileStatement: function (test, body) {
	            this.type = Syntax.WhileStatement;
	            this.test = test;
	            this.body = body;
	            this.finish();
	            return this;
	        },
	
	        finishWithStatement: function (object, body) {
	            this.type = Syntax.WithStatement;
	            this.object = object;
	            this.body = body;
	            this.finish();
	            return this;
	        },
	
	        finishExportSpecifier: function (local, exported) {
	            this.type = Syntax.ExportSpecifier;
	            this.exported = exported || local;
	            this.local = local;
	            this.finish();
	            return this;
	        },
	
	        finishImportDefaultSpecifier: function (local) {
	            this.type = Syntax.ImportDefaultSpecifier;
	            this.local = local;
	            this.finish();
	            return this;
	        },
	
	        finishImportNamespaceSpecifier: function (local) {
	            this.type = Syntax.ImportNamespaceSpecifier;
	            this.local = local;
	            this.finish();
	            return this;
	        },
	
	        finishExportNamedDeclaration: function (declaration, specifiers, src) {
	            this.type = Syntax.ExportNamedDeclaration;
	            this.declaration = declaration;
	            this.specifiers = specifiers;
	            this.source = src;
	            this.finish();
	            return this;
	        },
	
	        finishExportDefaultDeclaration: function (declaration) {
	            this.type = Syntax.ExportDefaultDeclaration;
	            this.declaration = declaration;
	            this.finish();
	            return this;
	        },
	
	        finishExportAllDeclaration: function (src) {
	            this.type = Syntax.ExportAllDeclaration;
	            this.source = src;
	            this.finish();
	            return this;
	        },
	
	        finishImportSpecifier: function (local, imported) {
	            this.type = Syntax.ImportSpecifier;
	            this.local = local || imported;
	            this.imported = imported;
	            this.finish();
	            return this;
	        },
	
	        finishImportDeclaration: function (specifiers, src) {
	            this.type = Syntax.ImportDeclaration;
	            this.specifiers = specifiers;
	            this.source = src;
	            this.finish();
	            return this;
	        },
	
	        finishYieldExpression: function (argument, delegate) {
	            this.type = Syntax.YieldExpression;
	            this.argument = argument;
	            this.delegate = delegate;
	            this.finish();
	            return this;
	        }
	    };
	
	
	    function recordError(error) {
	        var e, existing;
	
	        for (e = 0; e < extra.errors.length; e++) {
	            existing = extra.errors[e];
	            // Prevent duplicated error.
	            /* istanbul ignore next */
	            if (existing.index === error.index && existing.message === error.message) {
	                return;
	            }
	        }
	
	        extra.errors.push(error);
	    }
	
	    function constructError(msg, column) {
	        var error = new Error(msg);
	        try {
	            throw error;
	        } catch (base) {
	            /* istanbul ignore else */
	            if (Object.create && Object.defineProperty) {
	                error = Object.create(base);
	                Object.defineProperty(error, 'column', { value: column });
	            }
	        } finally {
	            return error;
	        }
	    }
	
	    function createError(line, pos, description) {
	        var msg, column, error;
	
	        msg = 'Line ' + line + ': ' + description;
	        column = pos - (scanning ? lineStart : lastLineStart) + 1;
	        error = constructError(msg, column);
	        error.lineNumber = line;
	        error.description = description;
	        error.index = pos;
	        return error;
	    }
	
	    // Throw an exception
	
	    function throwError(messageFormat) {
	        var args, msg;
	
	        args = Array.prototype.slice.call(arguments, 1);
	        msg = messageFormat.replace(/%(\d)/g,
	            function (whole, idx) {
	                assert(idx < args.length, 'Message reference must be in range');
	                return args[idx];
	            }
	        );
	
	        throw createError(lastLineNumber, lastIndex, msg);
	    }
	
	    function tolerateError(messageFormat) {
	        var args, msg, error;
	
	        args = Array.prototype.slice.call(arguments, 1);
	        /* istanbul ignore next */
	        msg = messageFormat.replace(/%(\d)/g,
	            function (whole, idx) {
	                assert(idx < args.length, 'Message reference must be in range');
	                return args[idx];
	            }
	        );
	
	        error = createError(lineNumber, lastIndex, msg);
	        if (extra.errors) {
	            recordError(error);
	        } else {
	            throw error;
	        }
	    }
	
	    // Throw an exception because of the token.
	
	    function unexpectedTokenError(token, message) {
	        var value, msg = message || Messages.UnexpectedToken;
	
	        if (token) {
	            if (!message) {
	                msg = (token.type === Token.EOF) ? Messages.UnexpectedEOS :
	                    (token.type === Token.Identifier) ? Messages.UnexpectedIdentifier :
	                    (token.type === Token.NumericLiteral) ? Messages.UnexpectedNumber :
	                    (token.type === Token.StringLiteral) ? Messages.UnexpectedString :
	                    (token.type === Token.Template) ? Messages.UnexpectedTemplate :
	                    Messages.UnexpectedToken;
	
	                if (token.type === Token.Keyword) {
	                    if (isFutureReservedWord(token.value)) {
	                        msg = Messages.UnexpectedReserved;
	                    } else if (strict && isStrictModeReservedWord(token.value)) {
	                        msg = Messages.StrictReservedWord;
	                    }
	                }
	            }
	
	            value = (token.type === Token.Template) ? token.value.raw : token.value;
	        } else {
	            value = 'ILLEGAL';
	        }
	
	        msg = msg.replace('%0', value);
	
	        return (token && typeof token.lineNumber === 'number') ?
	            createError(token.lineNumber, token.start, msg) :
	            createError(scanning ? lineNumber : lastLineNumber, scanning ? index : lastIndex, msg);
	    }
	
	    function throwUnexpectedToken(token, message) {
	        throw unexpectedTokenError(token, message);
	    }
	
	    function tolerateUnexpectedToken(token, message) {
	        var error = unexpectedTokenError(token, message);
	        if (extra.errors) {
	            recordError(error);
	        } else {
	            throw error;
	        }
	    }
	
	    // Expect the next token to match the specified punctuator.
	    // If not, an exception will be thrown.
	
	    function expect(value) {
	        var token = lex();
	        if (token.type !== Token.Punctuator || token.value !== value) {
	            throwUnexpectedToken(token);
	        }
	    }
	
	    /**
	     * @name expectCommaSeparator
	     * @description Quietly expect a comma when in tolerant mode, otherwise delegates
	     * to <code>expect(value)</code>
	     * @since 2.0
	     */
	    function expectCommaSeparator() {
	        var token;
	
	        if (extra.errors) {
	            token = lookahead;
	            if (token.type === Token.Punctuator && token.value === ',') {
	                lex();
	            } else if (token.type === Token.Punctuator && token.value === ';') {
	                lex();
	                tolerateUnexpectedToken(token);
	            } else {
	                tolerateUnexpectedToken(token, Messages.UnexpectedToken);
	            }
	        } else {
	            expect(',');
	        }
	    }
	
	    // Expect the next token to match the specified keyword.
	    // If not, an exception will be thrown.
	
	    function expectKeyword(keyword) {
	        var token = lex();
	        if (token.type !== Token.Keyword || token.value !== keyword) {
	            throwUnexpectedToken(token);
	        }
	    }
	
	    // Return true if the next token matches the specified punctuator.
	
	    function match(value) {
	        return lookahead.type === Token.Punctuator && lookahead.value === value;
	    }
	
	    // Return true if the next token matches the specified keyword
	
	    function matchKeyword(keyword) {
	        return lookahead.type === Token.Keyword && lookahead.value === keyword;
	    }
	
	    // Return true if the next token matches the specified contextual keyword
	    // (where an identifier is sometimes a keyword depending on the context)
	
	    function matchContextualKeyword(keyword) {
	        return lookahead.type === Token.Identifier && lookahead.value === keyword;
	    }
	
	    // Return true if the next token is an assignment operator
	
	    function matchAssign() {
	        var op;
	
	        if (lookahead.type !== Token.Punctuator) {
	            return false;
	        }
	        op = lookahead.value;
	        return op === '=' ||
	            op === '*=' ||
	            op === '/=' ||
	            op === '%=' ||
	            op === '+=' ||
	            op === '-=' ||
	            op === '<<=' ||
	            op === '>>=' ||
	            op === '>>>=' ||
	            op === '&=' ||
	            op === '^=' ||
	            op === '|=';
	    }
	
	    function consumeSemicolon() {
	        // Catch the very common case first: immediately a semicolon (U+003B).
	        if (source.charCodeAt(startIndex) === 0x3B || match(';')) {
	            lex();
	            return;
	        }
	
	        if (hasLineTerminator) {
	            return;
	        }
	
	        // FIXME(ikarienator): this is seemingly an issue in the previous location info convention.
	        lastIndex = startIndex;
	        lastLineNumber = startLineNumber;
	        lastLineStart = startLineStart;
	
	        if (lookahead.type !== Token.EOF && !match('}')) {
	            throwUnexpectedToken(lookahead);
	        }
	    }
	
	    // Cover grammar support.
	    //
	    // When an assignment expression position starts with an left parenthesis, the determination of the type
	    // of the syntax is to be deferred arbitrarily long until the end of the parentheses pair (plus a lookahead)
	    // or the first comma. This situation also defers the determination of all the expressions nested in the pair.
	    //
	    // There are three productions that can be parsed in a parentheses pair that needs to be determined
	    // after the outermost pair is closed. They are:
	    //
	    //   1. AssignmentExpression
	    //   2. BindingElements
	    //   3. AssignmentTargets
	    //
	    // In order to avoid exponential backtracking, we use two flags to denote if the production can be
	    // binding element or assignment target.
	    //
	    // The three productions have the relationship:
	    //
	    //   BindingElements ⊆ AssignmentTargets ⊆ AssignmentExpression
	    //
	    // with a single exception that CoverInitializedName when used directly in an Expression, generates
	    // an early error. Therefore, we need the third state, firstCoverInitializedNameError, to track the
	    // first usage of CoverInitializedName and report it when we reached the end of the parentheses pair.
	    //
	    // isolateCoverGrammar function runs the given parser function with a new cover grammar context, and it does not
	    // effect the current flags. This means the production the parser parses is only used as an expression. Therefore
	    // the CoverInitializedName check is conducted.
	    //
	    // inheritCoverGrammar function runs the given parse function with a new cover grammar context, and it propagates
	    // the flags outside of the parser. This means the production the parser parses is used as a part of a potential
	    // pattern. The CoverInitializedName check is deferred.
	    function isolateCoverGrammar(parser) {
	        var oldIsBindingElement = isBindingElement,
	            oldIsAssignmentTarget = isAssignmentTarget,
	            oldFirstCoverInitializedNameError = firstCoverInitializedNameError,
	            result;
	        isBindingElement = true;
	        isAssignmentTarget = true;
	        firstCoverInitializedNameError = null;
	        result = parser();
	        if (firstCoverInitializedNameError !== null) {
	            throwUnexpectedToken(firstCoverInitializedNameError);
	        }
	        isBindingElement = oldIsBindingElement;
	        isAssignmentTarget = oldIsAssignmentTarget;
	        firstCoverInitializedNameError = oldFirstCoverInitializedNameError;
	        return result;
	    }
	
	    function inheritCoverGrammar(parser) {
	        var oldIsBindingElement = isBindingElement,
	            oldIsAssignmentTarget = isAssignmentTarget,
	            oldFirstCoverInitializedNameError = firstCoverInitializedNameError,
	            result;
	        isBindingElement = true;
	        isAssignmentTarget = true;
	        firstCoverInitializedNameError = null;
	        result = parser();
	        isBindingElement = isBindingElement && oldIsBindingElement;
	        isAssignmentTarget = isAssignmentTarget && oldIsAssignmentTarget;
	        firstCoverInitializedNameError = oldFirstCoverInitializedNameError || firstCoverInitializedNameError;
	        return result;
	    }
	
	    // ECMA-262 13.3.3 Destructuring Binding Patterns
	
	    function parseArrayPattern(params, kind) {
	        var node = new Node(), elements = [], rest, restNode;
	        expect('[');
	
	        while (!match(']')) {
	            if (match(',')) {
	                lex();
	                elements.push(null);
	            } else {
	                if (match('...')) {
	                    restNode = new Node();
	                    lex();
	                    params.push(lookahead);
	                    rest = parseVariableIdentifier(kind);
	                    elements.push(restNode.finishRestElement(rest));
	                    break;
	                } else {
	                    elements.push(parsePatternWithDefault(params, kind));
	                }
	                if (!match(']')) {
	                    expect(',');
	                }
	            }
	
	        }
	
	        expect(']');
	
	        return node.finishArrayPattern(elements);
	    }
	
	    function parsePropertyPattern(params, kind) {
	        var node = new Node(), key, keyToken, computed = match('['), init;
	        if (lookahead.type === Token.Identifier) {
	            keyToken = lookahead;
	            key = parseVariableIdentifier();
	            if (match('=')) {
	                params.push(keyToken);
	                lex();
	                init = parseAssignmentExpression();
	
	                return node.finishProperty(
	                    'init', key, false,
	                    new WrappingNode(keyToken).finishAssignmentPattern(key, init), false, true);
	            } else if (!match(':')) {
	                params.push(keyToken);
	                return node.finishProperty('init', key, false, key, false, true);
	            }
	        } else {
	            key = parseObjectPropertyKey();
	        }
	        expect(':');
	        init = parsePatternWithDefault(params, kind);
	        return node.finishProperty('init', key, computed, init, false, false);
	    }
	
	    function parseObjectPattern(params, kind) {
	        var node = new Node(), properties = [];
	
	        expect('{');
	
	        while (!match('}')) {
	            properties.push(parsePropertyPattern(params, kind));
	            if (!match('}')) {
	                expect(',');
	            }
	        }
	
	        lex();
	
	        return node.finishObjectPattern(properties);
	    }
	
	    function parsePattern(params, kind) {
	        if (match('[')) {
	            return parseArrayPattern(params, kind);
	        } else if (match('{')) {
	            return parseObjectPattern(params, kind);
	        } else if (matchKeyword('let')) {
	            if (kind === 'const' || kind === 'let') {
	                tolerateUnexpectedToken(lookahead, Messages.UnexpectedToken);
	            }
	        }
	
	        params.push(lookahead);
	        return parseVariableIdentifier(kind);
	    }
	
	    function parsePatternWithDefault(params, kind) {
	        var startToken = lookahead, pattern, previousAllowYield, right;
	        pattern = parsePattern(params, kind);
	        if (match('=')) {
	            lex();
	            previousAllowYield = state.allowYield;
	            state.allowYield = true;
	            right = isolateCoverGrammar(parseAssignmentExpression);
	            state.allowYield = previousAllowYield;
	            pattern = new WrappingNode(startToken).finishAssignmentPattern(pattern, right);
	        }
	        return pattern;
	    }
	
	    // ECMA-262 12.2.5 Array Initializer
	
	    function parseArrayInitializer() {
	        var elements = [], node = new Node(), restSpread;
	
	        expect('[');
	
	        while (!match(']')) {
	            if (match(',')) {
	                lex();
	                elements.push(null);
	            } else if (match('...')) {
	                restSpread = new Node();
	                lex();
	                restSpread.finishSpreadElement(inheritCoverGrammar(parseAssignmentExpression));
	
	                if (!match(']')) {
	                    isAssignmentTarget = isBindingElement = false;
	                    expect(',');
	                }
	                elements.push(restSpread);
	            } else {
	                elements.push(inheritCoverGrammar(parseAssignmentExpression));
	
	                if (!match(']')) {
	                    expect(',');
	                }
	            }
	        }
	
	        lex();
	
	        return node.finishArrayExpression(elements);
	    }
	
	    // ECMA-262 12.2.6 Object Initializer
	
	    function parsePropertyFunction(node, paramInfo, isGenerator) {
	        var previousStrict, body;
	
	        isAssignmentTarget = isBindingElement = false;
	
	        previousStrict = strict;
	        body = isolateCoverGrammar(parseFunctionSourceElements);
	
	        if (strict && paramInfo.firstRestricted) {
	            tolerateUnexpectedToken(paramInfo.firstRestricted, paramInfo.message);
	        }
	        if (strict && paramInfo.stricted) {
	            tolerateUnexpectedToken(paramInfo.stricted, paramInfo.message);
	        }
	
	        strict = previousStrict;
	        return node.finishFunctionExpression(null, paramInfo.params, paramInfo.defaults, body, isGenerator);
	    }
	
	    function parsePropertyMethodFunction() {
	        var params, method, node = new Node(),
	            previousAllowYield = state.allowYield;
	
	        state.allowYield = false;
	        params = parseParams();
	        state.allowYield = previousAllowYield;
	
	        state.allowYield = false;
	        method = parsePropertyFunction(node, params, false);
	        state.allowYield = previousAllowYield;
	
	        return method;
	    }
	
	    function parseObjectPropertyKey() {
	        var token, node = new Node(), expr;
	
	        token = lex();
	
	        // Note: This function is called only from parseObjectProperty(), where
	        // EOF and Punctuator tokens are already filtered out.
	
	        switch (token.type) {
	        case Token.StringLiteral:
	        case Token.NumericLiteral:
	            if (strict && token.octal) {
	                tolerateUnexpectedToken(token, Messages.StrictOctalLiteral);
	            }
	            return node.finishLiteral(token);
	        case Token.Identifier:
	        case Token.BooleanLiteral:
	        case Token.NullLiteral:
	        case Token.Keyword:
	            return node.finishIdentifier(token.value);
	        case Token.Punctuator:
	            if (token.value === '[') {
	                expr = isolateCoverGrammar(parseAssignmentExpression);
	                expect(']');
	                return expr;
	            }
	            break;
	        }
	        throwUnexpectedToken(token);
	    }
	
	    function lookaheadPropertyName() {
	        switch (lookahead.type) {
	        case Token.Identifier:
	        case Token.StringLiteral:
	        case Token.BooleanLiteral:
	        case Token.NullLiteral:
	        case Token.NumericLiteral:
	        case Token.Keyword:
	            return true;
	        case Token.Punctuator:
	            return lookahead.value === '[';
	        }
	        return false;
	    }
	
	    // This function is to try to parse a MethodDefinition as defined in 14.3. But in the case of object literals,
	    // it might be called at a position where there is in fact a short hand identifier pattern or a data property.
	    // This can only be determined after we consumed up to the left parentheses.
	    //
	    // In order to avoid back tracking, it returns `null` if the position is not a MethodDefinition and the caller
	    // is responsible to visit other options.
	    function tryParseMethodDefinition(token, key, computed, node) {
	        var value, options, methodNode, params,
	            previousAllowYield = state.allowYield;
	
	        if (token.type === Token.Identifier) {
	            // check for `get` and `set`;
	
	            if (token.value === 'get' && lookaheadPropertyName()) {
	                computed = match('[');
	                key = parseObjectPropertyKey();
	                methodNode = new Node();
	                expect('(');
	                expect(')');
	
	                state.allowYield = false;
	                value = parsePropertyFunction(methodNode, {
	                    params: [],
	                    defaults: [],
	                    stricted: null,
	                    firstRestricted: null,
	                    message: null
	                }, false);
	                state.allowYield = previousAllowYield;
	
	                return node.finishProperty('get', key, computed, value, false, false);
	            } else if (token.value === 'set' && lookaheadPropertyName()) {
	                computed = match('[');
	                key = parseObjectPropertyKey();
	                methodNode = new Node();
	                expect('(');
	
	                options = {
	                    params: [],
	                    defaultCount: 0,
	                    defaults: [],
	                    firstRestricted: null,
	                    paramSet: {}
	                };
	                if (match(')')) {
	                    tolerateUnexpectedToken(lookahead);
	                } else {
	                    state.allowYield = false;
	                    parseParam(options);
	                    state.allowYield = previousAllowYield;
	                    if (options.defaultCount === 0) {
	                        options.defaults = [];
	                    }
	                }
	                expect(')');
	
	                state.allowYield = false;
	                value = parsePropertyFunction(methodNode, options, false);
	                state.allowYield = previousAllowYield;
	
	                return node.finishProperty('set', key, computed, value, false, false);
	            }
	        } else if (token.type === Token.Punctuator && token.value === '*' && lookaheadPropertyName()) {
	            computed = match('[');
	            key = parseObjectPropertyKey();
	            methodNode = new Node();
	
	            state.allowYield = true;
	            params = parseParams();
	            state.allowYield = previousAllowYield;
	
	            state.allowYield = false;
	            value = parsePropertyFunction(methodNode, params, true);
	            state.allowYield = previousAllowYield;
	
	            return node.finishProperty('init', key, computed, value, true, false);
	        }
	
	        if (key && match('(')) {
	            value = parsePropertyMethodFunction();
	            return node.finishProperty('init', key, computed, value, true, false);
	        }
	
	        // Not a MethodDefinition.
	        return null;
	    }
	
	    function parseObjectProperty(hasProto) {
	        var token = lookahead, node = new Node(), computed, key, maybeMethod, proto, value;
	
	        computed = match('[');
	        if (match('*')) {
	            lex();
	        } else {
	            key = parseObjectPropertyKey();
	        }
	        maybeMethod = tryParseMethodDefinition(token, key, computed, node);
	        if (maybeMethod) {
	            return maybeMethod;
	        }
	
	        if (!key) {
	            throwUnexpectedToken(lookahead);
	        }
	
	        // Check for duplicated __proto__
	        if (!computed) {
	            proto = (key.type === Syntax.Identifier && key.name === '__proto__') ||
	                (key.type === Syntax.Literal && key.value === '__proto__');
	            if (hasProto.value && proto) {
	                tolerateError(Messages.DuplicateProtoProperty);
	            }
	            hasProto.value |= proto;
	        }
	
	        if (match(':')) {
	            lex();
	            value = inheritCoverGrammar(parseAssignmentExpression);
	            return node.finishProperty('init', key, computed, value, false, false);
	        }
	
	        if (token.type === Token.Identifier) {
	            if (match('=')) {
	                firstCoverInitializedNameError = lookahead;
	                lex();
	                value = isolateCoverGrammar(parseAssignmentExpression);
	                return node.finishProperty('init', key, computed,
	                    new WrappingNode(token).finishAssignmentPattern(key, value), false, true);
	            }
	            return node.finishProperty('init', key, computed, key, false, true);
	        }
	
	        throwUnexpectedToken(lookahead);
	    }
	
	    function parseObjectInitializer() {
	        var properties = [], hasProto = {value: false}, node = new Node();
	
	        expect('{');
	
	        while (!match('}')) {
	            properties.push(parseObjectProperty(hasProto));
	
	            if (!match('}')) {
	                expectCommaSeparator();
	            }
	        }
	
	        expect('}');
	
	        return node.finishObjectExpression(properties);
	    }
	
	    function reinterpretExpressionAsPattern(expr) {
	        var i;
	        switch (expr.type) {
	        case Syntax.Identifier:
	        case Syntax.MemberExpression:
	        case Syntax.RestElement:
	        case Syntax.AssignmentPattern:
	            break;
	        case Syntax.SpreadElement:
	            expr.type = Syntax.RestElement;
	            reinterpretExpressionAsPattern(expr.argument);
	            break;
	        case Syntax.ArrayExpression:
	            expr.type = Syntax.ArrayPattern;
	            for (i = 0; i < expr.elements.length; i++) {
	                if (expr.elements[i] !== null) {
	                    reinterpretExpressionAsPattern(expr.elements[i]);
	                }
	            }
	            break;
	        case Syntax.ObjectExpression:
	            expr.type = Syntax.ObjectPattern;
	            for (i = 0; i < expr.properties.length; i++) {
	                reinterpretExpressionAsPattern(expr.properties[i].value);
	            }
	            break;
	        case Syntax.AssignmentExpression:
	            expr.type = Syntax.AssignmentPattern;
	            reinterpretExpressionAsPattern(expr.left);
	            break;
	        default:
	            // Allow other node type for tolerant parsing.
	            break;
	        }
	    }
	
	    // ECMA-262 12.2.9 Template Literals
	
	    function parseTemplateElement(option) {
	        var node, token;
	
	        if (lookahead.type !== Token.Template || (option.head && !lookahead.head)) {
	            throwUnexpectedToken();
	        }
	
	        node = new Node();
	        token = lex();
	
	        return node.finishTemplateElement({ raw: token.value.raw, cooked: token.value.cooked }, token.tail);
	    }
	
	    function parseTemplateLiteral() {
	        var quasi, quasis, expressions, node = new Node();
	
	        quasi = parseTemplateElement({ head: true });
	        quasis = [quasi];
	        expressions = [];
	
	        while (!quasi.tail) {
	            expressions.push(parseExpression());
	            quasi = parseTemplateElement({ head: false });
	            quasis.push(quasi);
	        }
	
	        return node.finishTemplateLiteral(quasis, expressions);
	    }
	
	    // ECMA-262 12.2.10 The Grouping Operator
	
	    function parseGroupExpression() {
	        var expr, expressions, startToken, i, params = [];
	
	        expect('(');
	
	        if (match(')')) {
	            lex();
	            if (!match('=>')) {
	                expect('=>');
	            }
	            return {
	                type: PlaceHolders.ArrowParameterPlaceHolder,
	                params: [],
	                rawParams: []
	            };
	        }
	
	        startToken = lookahead;
	        if (match('...')) {
	            expr = parseRestElement(params);
	            expect(')');
	            if (!match('=>')) {
	                expect('=>');
	            }
	            return {
	                type: PlaceHolders.ArrowParameterPlaceHolder,
	                params: [expr]
	            };
	        }
	
	        isBindingElement = true;
	        expr = inheritCoverGrammar(parseAssignmentExpression);
	
	        if (match(',')) {
	            isAssignmentTarget = false;
	            expressions = [expr];
	
	            while (startIndex < length) {
	                if (!match(',')) {
	                    break;
	                }
	                lex();
	
	                if (match('...')) {
	                    if (!isBindingElement) {
	                        throwUnexpectedToken(lookahead);
	                    }
	                    expressions.push(parseRestElement(params));
	                    expect(')');
	                    if (!match('=>')) {
	                        expect('=>');
	                    }
	                    isBindingElement = false;
	                    for (i = 0; i < expressions.length; i++) {
	                        reinterpretExpressionAsPattern(expressions[i]);
	                    }
	                    return {
	                        type: PlaceHolders.ArrowParameterPlaceHolder,
	                        params: expressions
	                    };
	                }
	
	                expressions.push(inheritCoverGrammar(parseAssignmentExpression));
	            }
	
	            expr = new WrappingNode(startToken).finishSequenceExpression(expressions);
	        }
	
	
	        expect(')');
	
	        if (match('=>')) {
	            if (expr.type === Syntax.Identifier && expr.name === 'yield') {
	                return {
	                    type: PlaceHolders.ArrowParameterPlaceHolder,
	                    params: [expr]
	                };
	            }
	
	            if (!isBindingElement) {
	                throwUnexpectedToken(lookahead);
	            }
	
	            if (expr.type === Syntax.SequenceExpression) {
	                for (i = 0; i < expr.expressions.length; i++) {
	                    reinterpretExpressionAsPattern(expr.expressions[i]);
	                }
	            } else {
	                reinterpretExpressionAsPattern(expr);
	            }
	
	            expr = {
	                type: PlaceHolders.ArrowParameterPlaceHolder,
	                params: expr.type === Syntax.SequenceExpression ? expr.expressions : [expr]
	            };
	        }
	        isBindingElement = false;
	        return expr;
	    }
	
	
	    // ECMA-262 12.2 Primary Expressions
	
	    function parsePrimaryExpression() {
	        var type, token, expr, node;
	
	        if (match('(')) {
	            isBindingElement = false;
	            return inheritCoverGrammar(parseGroupExpression);
	        }
	
	        if (match('[')) {
	            return inheritCoverGrammar(parseArrayInitializer);
	        }
	
	        if (match('{')) {
	            return inheritCoverGrammar(parseObjectInitializer);
	        }
	
	        type = lookahead.type;
	        node = new Node();
	
	        if (type === Token.Identifier) {
	            if (state.sourceType === 'module' && lookahead.value === 'await') {
	                tolerateUnexpectedToken(lookahead);
	            }
	            expr = node.finishIdentifier(lex().value);
	        } else if (type === Token.StringLiteral || type === Token.NumericLiteral) {
	            isAssignmentTarget = isBindingElement = false;
	            if (strict && lookahead.octal) {
	                tolerateUnexpectedToken(lookahead, Messages.StrictOctalLiteral);
	            }
	            expr = node.finishLiteral(lex());
	        } else if (type === Token.Keyword) {
	            if (!strict && state.allowYield && matchKeyword('yield')) {
	                return parseNonComputedProperty();
	            }
	            if (!strict && matchKeyword('let')) {
	                return node.finishIdentifier(lex().value);
	            }
	            isAssignmentTarget = isBindingElement = false;
	            if (matchKeyword('function')) {
	                return parseFunctionExpression();
	            }
	            if (matchKeyword('this')) {
	                lex();
	                return node.finishThisExpression();
	            }
	            if (matchKeyword('class')) {
	                return parseClassExpression();
	            }
	            throwUnexpectedToken(lex());
	        } else if (type === Token.BooleanLiteral) {
	            isAssignmentTarget = isBindingElement = false;
	            token = lex();
	            token.value = (token.value === 'true');
	            expr = node.finishLiteral(token);
	        } else if (type === Token.NullLiteral) {
	            isAssignmentTarget = isBindingElement = false;
	            token = lex();
	            token.value = null;
	            expr = node.finishLiteral(token);
	        } else if (match('/') || match('/=')) {
	            isAssignmentTarget = isBindingElement = false;
	            index = startIndex;
	
	            if (typeof extra.tokens !== 'undefined') {
	                token = collectRegex();
	            } else {
	                token = scanRegExp();
	            }
	            lex();
	            expr = node.finishLiteral(token);
	        } else if (type === Token.Template) {
	            expr = parseTemplateLiteral();
	        } else {
	            throwUnexpectedToken(lex());
	        }
	
	        return expr;
	    }
	
	    // ECMA-262 12.3 Left-Hand-Side Expressions
	
	    function parseArguments() {
	        var args = [], expr;
	
	        expect('(');
	
	        if (!match(')')) {
	            while (startIndex < length) {
	                if (match('...')) {
	                    expr = new Node();
	                    lex();
	                    expr.finishSpreadElement(isolateCoverGrammar(parseAssignmentExpression));
	                } else {
	                    expr = isolateCoverGrammar(parseAssignmentExpression);
	                }
	                args.push(expr);
	                if (match(')')) {
	                    break;
	                }
	                expectCommaSeparator();
	            }
	        }
	
	        expect(')');
	
	        return args;
	    }
	
	    function parseNonComputedProperty() {
	        var token, node = new Node();
	
	        token = lex();
	
	        if (!isIdentifierName(token)) {
	            throwUnexpectedToken(token);
	        }
	
	        return node.finishIdentifier(token.value);
	    }
	
	    function parseNonComputedMember() {
	        expect('.');
	
	        return parseNonComputedProperty();
	    }
	
	    function parseComputedMember() {
	        var expr;
	
	        expect('[');
	
	        expr = isolateCoverGrammar(parseExpression);
	
	        expect(']');
	
	        return expr;
	    }
	
	    // ECMA-262 12.3.3 The new Operator
	
	    function parseNewExpression() {
	        var callee, args, node = new Node();
	
	        expectKeyword('new');
	
	        if (match('.')) {
	            lex();
	            if (lookahead.type === Token.Identifier && lookahead.value === 'target') {
	                if (state.inFunctionBody) {
	                    lex();
	                    return node.finishMetaProperty('new', 'target');
	                }
	            }
	            throwUnexpectedToken(lookahead);
	        }
	
	        callee = isolateCoverGrammar(parseLeftHandSideExpression);
	        args = match('(') ? parseArguments() : [];
	
	        isAssignmentTarget = isBindingElement = false;
	
	        return node.finishNewExpression(callee, args);
	    }
	
	    // ECMA-262 12.3.4 Function Calls
	
	    function parseLeftHandSideExpressionAllowCall() {
	        var quasi, expr, args, property, startToken, previousAllowIn = state.allowIn;
	
	        startToken = lookahead;
	        state.allowIn = true;
	
	        if (matchKeyword('super') && state.inFunctionBody) {
	            expr = new Node();
	            lex();
	            expr = expr.finishSuper();
	            if (!match('(') && !match('.') && !match('[')) {
	                throwUnexpectedToken(lookahead);
	            }
	        } else {
	            expr = inheritCoverGrammar(matchKeyword('new') ? parseNewExpression : parsePrimaryExpression);
	        }
	
	        for (;;) {
	            if (match('.')) {
	                isBindingElement = false;
	                isAssignmentTarget = true;
	                property = parseNonComputedMember();
	                expr = new WrappingNode(startToken).finishMemberExpression('.', expr, property);
	            } else if (match('(')) {
	                isBindingElement = false;
	                isAssignmentTarget = false;
	                args = parseArguments();
	                expr = new WrappingNode(startToken).finishCallExpression(expr, args);
	            } else if (match('[')) {
	                isBindingElement = false;
	                isAssignmentTarget = true;
	                property = parseComputedMember();
	                expr = new WrappingNode(startToken).finishMemberExpression('[', expr, property);
	            } else if (lookahead.type === Token.Template && lookahead.head) {
	                quasi = parseTemplateLiteral();
	                expr = new WrappingNode(startToken).finishTaggedTemplateExpression(expr, quasi);
	            } else {
	                break;
	            }
	        }
	        state.allowIn = previousAllowIn;
	
	        return expr;
	    }
	
	    // ECMA-262 12.3 Left-Hand-Side Expressions
	
	    function parseLeftHandSideExpression() {
	        var quasi, expr, property, startToken;
	        assert(state.allowIn, 'callee of new expression always allow in keyword.');
	
	        startToken = lookahead;
	
	        if (matchKeyword('super') && state.inFunctionBody) {
	            expr = new Node();
	            lex();
	            expr = expr.finishSuper();
	            if (!match('[') && !match('.')) {
	                throwUnexpectedToken(lookahead);
	            }
	        } else {
	            expr = inheritCoverGrammar(matchKeyword('new') ? parseNewExpression : parsePrimaryExpression);
	        }
	
	        for (;;) {
	            if (match('[')) {
	                isBindingElement = false;
	                isAssignmentTarget = true;
	                property = parseComputedMember();
	                expr = new WrappingNode(startToken).finishMemberExpression('[', expr, property);
	            } else if (match('.')) {
	                isBindingElement = false;
	                isAssignmentTarget = true;
	                property = parseNonComputedMember();
	                expr = new WrappingNode(startToken).finishMemberExpression('.', expr, property);
	            } else if (lookahead.type === Token.Template && lookahead.head) {
	                quasi = parseTemplateLiteral();
	                expr = new WrappingNode(startToken).finishTaggedTemplateExpression(expr, quasi);
	            } else {
	                break;
	            }
	        }
	        return expr;
	    }
	
	    // ECMA-262 12.4 Postfix Expressions
	
	    function parsePostfixExpression() {
	        var expr, token, startToken = lookahead;
	
	        expr = inheritCoverGrammar(parseLeftHandSideExpressionAllowCall);
	
	        if (!hasLineTerminator && lookahead.type === Token.Punctuator) {
	            if (match('++') || match('--')) {
	                // ECMA-262 11.3.1, 11.3.2
	                if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
	                    tolerateError(Messages.StrictLHSPostfix);
	                }
	
	                if (!isAssignmentTarget) {
	                    tolerateError(Messages.InvalidLHSInAssignment);
	                }
	
	                isAssignmentTarget = isBindingElement = false;
	
	                token = lex();
	                expr = new WrappingNode(startToken).finishPostfixExpression(token.value, expr);
	            }
	        }
	
	        return expr;
	    }
	
	    // ECMA-262 12.5 Unary Operators
	
	    function parseUnaryExpression() {
	        var token, expr, startToken;
	
	        if (lookahead.type !== Token.Punctuator && lookahead.type !== Token.Keyword) {
	            expr = parsePostfixExpression();
	        } else if (match('++') || match('--')) {
	            startToken = lookahead;
	            token = lex();
	            expr = inheritCoverGrammar(parseUnaryExpression);
	            // ECMA-262 11.4.4, 11.4.5
	            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
	                tolerateError(Messages.StrictLHSPrefix);
	            }
	
	            if (!isAssignmentTarget) {
	                tolerateError(Messages.InvalidLHSInAssignment);
	            }
	            expr = new WrappingNode(startToken).finishUnaryExpression(token.value, expr);
	            isAssignmentTarget = isBindingElement = false;
	        } else if (match('+') || match('-') || match('~') || match('!')) {
	            startToken = lookahead;
	            token = lex();
	            expr = inheritCoverGrammar(parseUnaryExpression);
	            expr = new WrappingNode(startToken).finishUnaryExpression(token.value, expr);
	            isAssignmentTarget = isBindingElement = false;
	        } else if (matchKeyword('delete') || matchKeyword('void') || matchKeyword('typeof')) {
	            startToken = lookahead;
	            token = lex();
	            expr = inheritCoverGrammar(parseUnaryExpression);
	            expr = new WrappingNode(startToken).finishUnaryExpression(token.value, expr);
	            if (strict && expr.operator === 'delete' && expr.argument.type === Syntax.Identifier) {
	                tolerateError(Messages.StrictDelete);
	            }
	            isAssignmentTarget = isBindingElement = false;
	        } else {
	            expr = parsePostfixExpression();
	        }
	
	        return expr;
	    }
	
	    function binaryPrecedence(token, allowIn) {
	        var prec = 0;
	
	        if (token.type !== Token.Punctuator && token.type !== Token.Keyword) {
	            return 0;
	        }
	
	        switch (token.value) {
	        case '||':
	            prec = 1;
	            break;
	
	        case '&&':
	            prec = 2;
	            break;
	
	        case '|':
	            prec = 3;
	            break;
	
	        case '^':
	            prec = 4;
	            break;
	
	        case '&':
	            prec = 5;
	            break;
	
	        case '==':
	        case '!=':
	        case '===':
	        case '!==':
	            prec = 6;
	            break;
	
	        case '<':
	        case '>':
	        case '<=':
	        case '>=':
	        case 'instanceof':
	            prec = 7;
	            break;
	
	        case 'in':
	            prec = allowIn ? 7 : 0;
	            break;
	
	        case '<<':
	        case '>>':
	        case '>>>':
	            prec = 8;
	            break;
	
	        case '+':
	        case '-':
	            prec = 9;
	            break;
	
	        case '*':
	        case '/':
	        case '%':
	            prec = 11;
	            break;
	
	        default:
	            break;
	        }
	
	        return prec;
	    }
	
	    // ECMA-262 12.6 Multiplicative Operators
	    // ECMA-262 12.7 Additive Operators
	    // ECMA-262 12.8 Bitwise Shift Operators
	    // ECMA-262 12.9 Relational Operators
	    // ECMA-262 12.10 Equality Operators
	    // ECMA-262 12.11 Binary Bitwise Operators
	    // ECMA-262 12.12 Binary Logical Operators
	
	    function parseBinaryExpression() {
	        var marker, markers, expr, token, prec, stack, right, operator, left, i;
	
	        marker = lookahead;
	        left = inheritCoverGrammar(parseUnaryExpression);
	
	        token = lookahead;
	        prec = binaryPrecedence(token, state.allowIn);
	        if (prec === 0) {
	            return left;
	        }
	        isAssignmentTarget = isBindingElement = false;
	        token.prec = prec;
	        lex();
	
	        markers = [marker, lookahead];
	        right = isolateCoverGrammar(parseUnaryExpression);
	
	        stack = [left, token, right];
	
	        while ((prec = binaryPrecedence(lookahead, state.allowIn)) > 0) {
	
	            // Reduce: make a binary expression from the three topmost entries.
	            while ((stack.length > 2) && (prec <= stack[stack.length - 2].prec)) {
	                right = stack.pop();
	                operator = stack.pop().value;
	                left = stack.pop();
	                markers.pop();
	                expr = new WrappingNode(markers[markers.length - 1]).finishBinaryExpression(operator, left, right);
	                stack.push(expr);
	            }
	
	            // Shift.
	            token = lex();
	            token.prec = prec;
	            stack.push(token);
	            markers.push(lookahead);
	            expr = isolateCoverGrammar(parseUnaryExpression);
	            stack.push(expr);
	        }
	
	        // Final reduce to clean-up the stack.
	        i = stack.length - 1;
	        expr = stack[i];
	        markers.pop();
	        while (i > 1) {
	            expr = new WrappingNode(markers.pop()).finishBinaryExpression(stack[i - 1].value, stack[i - 2], expr);
	            i -= 2;
	        }
	
	        return expr;
	    }
	
	
	    // ECMA-262 12.13 Conditional Operator
	
	    function parseConditionalExpression() {
	        var expr, previousAllowIn, consequent, alternate, startToken;
	
	        startToken = lookahead;
	
	        expr = inheritCoverGrammar(parseBinaryExpression);
	        if (match('?')) {
	            lex();
	            previousAllowIn = state.allowIn;
	            state.allowIn = true;
	            consequent = isolateCoverGrammar(parseAssignmentExpression);
	            state.allowIn = previousAllowIn;
	            expect(':');
	            alternate = isolateCoverGrammar(parseAssignmentExpression);
	
	            expr = new WrappingNode(startToken).finishConditionalExpression(expr, consequent, alternate);
	            isAssignmentTarget = isBindingElement = false;
	        }
	
	        return expr;
	    }
	
	    // ECMA-262 14.2 Arrow Function Definitions
	
	    function parseConciseBody() {
	        if (match('{')) {
	            return parseFunctionSourceElements();
	        }
	        return isolateCoverGrammar(parseAssignmentExpression);
	    }
	
	    function checkPatternParam(options, param) {
	        var i;
	        switch (param.type) {
	        case Syntax.Identifier:
	            validateParam(options, param, param.name);
	            break;
	        case Syntax.RestElement:
	            checkPatternParam(options, param.argument);
	            break;
	        case Syntax.AssignmentPattern:
	            checkPatternParam(options, param.left);
	            break;
	        case Syntax.ArrayPattern:
	            for (i = 0; i < param.elements.length; i++) {
	                if (param.elements[i] !== null) {
	                    checkPatternParam(options, param.elements[i]);
	                }
	            }
	            break;
	        case Syntax.YieldExpression:
	            break;
	        default:
	            assert(param.type === Syntax.ObjectPattern, 'Invalid type');
	            for (i = 0; i < param.properties.length; i++) {
	                checkPatternParam(options, param.properties[i].value);
	            }
	            break;
	        }
	    }
	    function reinterpretAsCoverFormalsList(expr) {
	        var i, len, param, params, defaults, defaultCount, options, token;
	
	        defaults = [];
	        defaultCount = 0;
	        params = [expr];
	
	        switch (expr.type) {
	        case Syntax.Identifier:
	            break;
	        case PlaceHolders.ArrowParameterPlaceHolder:
	            params = expr.params;
	            break;
	        default:
	            return null;
	        }
	
	        options = {
	            paramSet: {}
	        };
	
	        for (i = 0, len = params.length; i < len; i += 1) {
	            param = params[i];
	            switch (param.type) {
	            case Syntax.AssignmentPattern:
	                params[i] = param.left;
	                if (param.right.type === Syntax.YieldExpression) {
	                    if (param.right.argument) {
	                        throwUnexpectedToken(lookahead);
	                    }
	                    param.right.type = Syntax.Identifier;
	                    param.right.name = 'yield';
	                    delete param.right.argument;
	                    delete param.right.delegate;
	                }
	                defaults.push(param.right);
	                ++defaultCount;
	                checkPatternParam(options, param.left);
	                break;
	            default:
	                checkPatternParam(options, param);
	                params[i] = param;
	                defaults.push(null);
	                break;
	            }
	        }
	
	        if (strict || !state.allowYield) {
	            for (i = 0, len = params.length; i < len; i += 1) {
	                param = params[i];
	                if (param.type === Syntax.YieldExpression) {
	                    throwUnexpectedToken(lookahead);
	                }
	            }
	        }
	
	        if (options.message === Messages.StrictParamDupe) {
	            token = strict ? options.stricted : options.firstRestricted;
	            throwUnexpectedToken(token, options.message);
	        }
	
	        if (defaultCount === 0) {
	            defaults = [];
	        }
	
	        return {
	            params: params,
	            defaults: defaults,
	            stricted: options.stricted,
	            firstRestricted: options.firstRestricted,
	            message: options.message
	        };
	    }
	
	    function parseArrowFunctionExpression(options, node) {
	        var previousStrict, previousAllowYield, body;
	
	        if (hasLineTerminator) {
	            tolerateUnexpectedToken(lookahead);
	        }
	        expect('=>');
	
	        previousStrict = strict;
	        previousAllowYield = state.allowYield;
	        state.allowYield = true;
	
	        body = parseConciseBody();
	
	        if (strict && options.firstRestricted) {
	            throwUnexpectedToken(options.firstRestricted, options.message);
	        }
	        if (strict && options.stricted) {
	            tolerateUnexpectedToken(options.stricted, options.message);
	        }
	
	        strict = previousStrict;
	        state.allowYield = previousAllowYield;
	
	        return node.finishArrowFunctionExpression(options.params, options.defaults, body, body.type !== Syntax.BlockStatement);
	    }
	
	    // ECMA-262 14.4 Yield expression
	
	    function parseYieldExpression() {
	        var argument, expr, delegate, previousAllowYield;
	
	        argument = null;
	        expr = new Node();
	        delegate = false;
	
	        expectKeyword('yield');
	
	        if (!hasLineTerminator) {
	            previousAllowYield = state.allowYield;
	            state.allowYield = false;
	            delegate = match('*');
	            if (delegate) {
	                lex();
	                argument = parseAssignmentExpression();
	            } else {
	                if (!match(';') && !match('}') && !match(')') && lookahead.type !== Token.EOF) {
	                    argument = parseAssignmentExpression();
	                }
	            }
	            state.allowYield = previousAllowYield;
	        }
	
	        return expr.finishYieldExpression(argument, delegate);
	    }
	
	    // ECMA-262 12.14 Assignment Operators
	
	    function parseAssignmentExpression() {
	        var token, expr, right, list, startToken;
	
	        startToken = lookahead;
	        token = lookahead;
	
	        if (!state.allowYield && matchKeyword('yield')) {
	            return parseYieldExpression();
	        }
	
	        expr = parseConditionalExpression();
	
	        if (expr.type === PlaceHolders.ArrowParameterPlaceHolder || match('=>')) {
	            isAssignmentTarget = isBindingElement = false;
	            list = reinterpretAsCoverFormalsList(expr);
	
	            if (list) {
	                firstCoverInitializedNameError = null;
	                return parseArrowFunctionExpression(list, new WrappingNode(startToken));
	            }
	
	            return expr;
	        }
	
	        if (matchAssign()) {
	            if (!isAssignmentTarget) {
	                tolerateError(Messages.InvalidLHSInAssignment);
	            }
	
	            // ECMA-262 12.1.1
	            if (strict && expr.type === Syntax.Identifier) {
	                if (isRestrictedWord(expr.name)) {
	                    tolerateUnexpectedToken(token, Messages.StrictLHSAssignment);
	                }
	                if (isStrictModeReservedWord(expr.name)) {
	                    tolerateUnexpectedToken(token, Messages.StrictReservedWord);
	                }
	            }
	
	            if (!match('=')) {
	                isAssignmentTarget = isBindingElement = false;
	            } else {
	                reinterpretExpressionAsPattern(expr);
	            }
	
	            token = lex();
	            right = isolateCoverGrammar(parseAssignmentExpression);
	            expr = new WrappingNode(startToken).finishAssignmentExpression(token.value, expr, right);
	            firstCoverInitializedNameError = null;
	        }
	
	        return expr;
	    }
	
	    // ECMA-262 12.15 Comma Operator
	
	    function parseExpression() {
	        var expr, startToken = lookahead, expressions;
	
	        expr = isolateCoverGrammar(parseAssignmentExpression);
	
	        if (match(',')) {
	            expressions = [expr];
	
	            while (startIndex < length) {
	                if (!match(',')) {
	                    break;
	                }
	                lex();
	                expressions.push(isolateCoverGrammar(parseAssignmentExpression));
	            }
	
	            expr = new WrappingNode(startToken).finishSequenceExpression(expressions);
	        }
	
	        return expr;
	    }
	
	    // ECMA-262 13.2 Block
	
	    function parseStatementListItem() {
	        if (lookahead.type === Token.Keyword) {
	            switch (lookahead.value) {
	            case 'export':
	                if (state.sourceType !== 'module') {
	                    tolerateUnexpectedToken(lookahead, Messages.IllegalExportDeclaration);
	                }
	                return parseExportDeclaration();
	            case 'import':
	                if (state.sourceType !== 'module') {
	                    tolerateUnexpectedToken(lookahead, Messages.IllegalImportDeclaration);
	                }
	                return parseImportDeclaration();
	            case 'const':
	                return parseLexicalDeclaration({inFor: false});
	            case 'function':
	                return parseFunctionDeclaration(new Node());
	            case 'class':
	                return parseClassDeclaration();
	            }
	        }
	
	        if (matchKeyword('let') && isLexicalDeclaration()) {
	            return parseLexicalDeclaration({inFor: false});
	        }
	
	        return parseStatement();
	    }
	
	    function parseStatementList() {
	        var list = [];
	        while (startIndex < length) {
	            if (match('}')) {
	                break;
	            }
	            list.push(parseStatementListItem());
	        }
	
	        return list;
	    }
	
	    function parseBlock() {
	        var block, node = new Node();
	
	        expect('{');
	
	        block = parseStatementList();
	
	        expect('}');
	
	        return node.finishBlockStatement(block);
	    }
	
	    // ECMA-262 13.3.2 Variable Statement
	
	    function parseVariableIdentifier(kind) {
	        var token, node = new Node();
	
	        token = lex();
	
	        if (token.type === Token.Keyword && token.value === 'yield') {
	            if (strict) {
	                tolerateUnexpectedToken(token, Messages.StrictReservedWord);
	            } if (!state.allowYield) {
	                throwUnexpectedToken(token);
	            }
	        } else if (token.type !== Token.Identifier) {
	            if (strict && token.type === Token.Keyword && isStrictModeReservedWord(token.value)) {
	                tolerateUnexpectedToken(token, Messages.StrictReservedWord);
	            } else {
	                if (strict || token.value !== 'let' || kind !== 'var') {
	                    throwUnexpectedToken(token);
	                }
	            }
	        } else if (state.sourceType === 'module' && token.type === Token.Identifier && token.value === 'await') {
	            tolerateUnexpectedToken(token);
	        }
	
	        return node.finishIdentifier(token.value);
	    }
	
	    function parseVariableDeclaration(options) {
	        var init = null, id, node = new Node(), params = [];
	
	        id = parsePattern(params, 'var');
	
	        // ECMA-262 12.2.1
	        if (strict && isRestrictedWord(id.name)) {
	            tolerateError(Messages.StrictVarName);
	        }
	
	        if (match('=')) {
	            lex();
	            init = isolateCoverGrammar(parseAssignmentExpression);
	        } else if (id.type !== Syntax.Identifier && !options.inFor) {
	            expect('=');
	        }
	
	        return node.finishVariableDeclarator(id, init);
	    }
	
	    function parseVariableDeclarationList(options) {
	        var opt, list;
	
	        opt = { inFor: options.inFor };
	        list = [parseVariableDeclaration(opt)];
	
	        while (match(',')) {
	            lex();
	            list.push(parseVariableDeclaration(opt));
	        }
	
	        return list;
	    }
	
	    function parseVariableStatement(node) {
	        var declarations;
	
	        expectKeyword('var');
	
	        declarations = parseVariableDeclarationList({ inFor: false });
	
	        consumeSemicolon();
	
	        return node.finishVariableDeclaration(declarations);
	    }
	
	    // ECMA-262 13.3.1 Let and Const Declarations
	
	    function parseLexicalBinding(kind, options) {
	        var init = null, id, node = new Node(), params = [];
	
	        id = parsePattern(params, kind);
	
	        // ECMA-262 12.2.1
	        if (strict && id.type === Syntax.Identifier && isRestrictedWord(id.name)) {
	            tolerateError(Messages.StrictVarName);
	        }
	
	        if (kind === 'const') {
	            if (!matchKeyword('in') && !matchContextualKeyword('of')) {
	                expect('=');
	                init = isolateCoverGrammar(parseAssignmentExpression);
	            }
	        } else if ((!options.inFor && id.type !== Syntax.Identifier) || match('=')) {
	            expect('=');
	            init = isolateCoverGrammar(parseAssignmentExpression);
	        }
	
	        return node.finishVariableDeclarator(id, init);
	    }
	
	    function parseBindingList(kind, options) {
	        var list = [parseLexicalBinding(kind, options)];
	
	        while (match(',')) {
	            lex();
	            list.push(parseLexicalBinding(kind, options));
	        }
	
	        return list;
	    }
	
	
	    function tokenizerState() {
	        return {
	            index: index,
	            lineNumber: lineNumber,
	            lineStart: lineStart,
	            hasLineTerminator: hasLineTerminator,
	            lastIndex: lastIndex,
	            lastLineNumber: lastLineNumber,
	            lastLineStart: lastLineStart,
	            startIndex: startIndex,
	            startLineNumber: startLineNumber,
	            startLineStart: startLineStart,
	            lookahead: lookahead,
	            tokenCount: extra.tokens ? extra.tokens.length : 0
	        };
	    }
	
	    function resetTokenizerState(ts) {
	        index = ts.index;
	        lineNumber = ts.lineNumber;
	        lineStart = ts.lineStart;
	        hasLineTerminator = ts.hasLineTerminator;
	        lastIndex = ts.lastIndex;
	        lastLineNumber = ts.lastLineNumber;
	        lastLineStart = ts.lastLineStart;
	        startIndex = ts.startIndex;
	        startLineNumber = ts.startLineNumber;
	        startLineStart = ts.startLineStart;
	        lookahead = ts.lookahead;
	        if (extra.tokens) {
	            extra.tokens.splice(ts.tokenCount, extra.tokens.length);
	        }
	    }
	
	    function isLexicalDeclaration() {
	        var lexical, ts;
	
	        ts = tokenizerState();
	
	        lex();
	        lexical = (lookahead.type === Token.Identifier) || match('[') || match('{') ||
	            matchKeyword('let') || matchKeyword('yield');
	
	        resetTokenizerState(ts);
	
	        return lexical;
	    }
	
	    function parseLexicalDeclaration(options) {
	        var kind, declarations, node = new Node();
	
	        kind = lex().value;
	        assert(kind === 'let' || kind === 'const', 'Lexical declaration must be either let or const');
	
	        declarations = parseBindingList(kind, options);
	
	        consumeSemicolon();
	
	        return node.finishLexicalDeclaration(declarations, kind);
	    }
	
	    function parseRestElement(params) {
	        var param, node = new Node();
	
	        lex();
	
	        if (match('{')) {
	            throwError(Messages.ObjectPatternAsRestParameter);
	        }
	
	        params.push(lookahead);
	
	        param = parseVariableIdentifier();
	
	        if (match('=')) {
	            throwError(Messages.DefaultRestParameter);
	        }
	
	        if (!match(')')) {
	            throwError(Messages.ParameterAfterRestParameter);
	        }
	
	        return node.finishRestElement(param);
	    }
	
	    // ECMA-262 13.4 Empty Statement
	
	    function parseEmptyStatement(node) {
	        expect(';');
	        return node.finishEmptyStatement();
	    }
	
	    // ECMA-262 12.4 Expression Statement
	
	    function parseExpressionStatement(node) {
	        var expr = parseExpression();
	        consumeSemicolon();
	        return node.finishExpressionStatement(expr);
	    }
	
	    // ECMA-262 13.6 If statement
	
	    function parseIfStatement(node) {
	        var test, consequent, alternate;
	
	        expectKeyword('if');
	
	        expect('(');
	
	        test = parseExpression();
	
	        expect(')');
	
	        consequent = parseStatement();
	
	        if (matchKeyword('else')) {
	            lex();
	            alternate = parseStatement();
	        } else {
	            alternate = null;
	        }
	
	        return node.finishIfStatement(test, consequent, alternate);
	    }
	
	    // ECMA-262 13.7 Iteration Statements
	
	    function parseDoWhileStatement(node) {
	        var body, test, oldInIteration;
	
	        expectKeyword('do');
	
	        oldInIteration = state.inIteration;
	        state.inIteration = true;
	
	        body = parseStatement();
	
	        state.inIteration = oldInIteration;
	
	        expectKeyword('while');
	
	        expect('(');
	
	        test = parseExpression();
	
	        expect(')');
	
	        if (match(';')) {
	            lex();
	        }
	
	        return node.finishDoWhileStatement(body, test);
	    }
	
	    function parseWhileStatement(node) {
	        var test, body, oldInIteration;
	
	        expectKeyword('while');
	
	        expect('(');
	
	        test = parseExpression();
	
	        expect(')');
	
	        oldInIteration = state.inIteration;
	        state.inIteration = true;
	
	        body = parseStatement();
	
	        state.inIteration = oldInIteration;
	
	        return node.finishWhileStatement(test, body);
	    }
	
	    function parseForStatement(node) {
	        var init, forIn, initSeq, initStartToken, test, update, left, right, kind, declarations,
	            body, oldInIteration, previousAllowIn = state.allowIn;
	
	        init = test = update = null;
	        forIn = true;
	
	        expectKeyword('for');
	
	        expect('(');
	
	        if (match(';')) {
	            lex();
	        } else {
	            if (matchKeyword('var')) {
	                init = new Node();
	                lex();
	
	                state.allowIn = false;
	                declarations = parseVariableDeclarationList({ inFor: true });
	                state.allowIn = previousAllowIn;
	
	                if (declarations.length === 1 && matchKeyword('in')) {
	                    init = init.finishVariableDeclaration(declarations);
	                    lex();
	                    left = init;
	                    right = parseExpression();
	                    init = null;
	                } else if (declarations.length === 1 && declarations[0].init === null && matchContextualKeyword('of')) {
	                    init = init.finishVariableDeclaration(declarations);
	                    lex();
	                    left = init;
	                    right = parseAssignmentExpression();
	                    init = null;
	                    forIn = false;
	                } else {
	                    init = init.finishVariableDeclaration(declarations);
	                    expect(';');
	                }
	            } else if (matchKeyword('const') || matchKeyword('let')) {
	                init = new Node();
	                kind = lex().value;
	
	                if (!strict && lookahead.value === 'in') {
	                    init = init.finishIdentifier(kind);
	                    lex();
	                    left = init;
	                    right = parseExpression();
	                    init = null;
	                } else {
	                    state.allowIn = false;
	                    declarations = parseBindingList(kind, {inFor: true});
	                    state.allowIn = previousAllowIn;
	
	                    if (declarations.length === 1 && declarations[0].init === null && matchKeyword('in')) {
	                        init = init.finishLexicalDeclaration(declarations, kind);
	                        lex();
	                        left = init;
	                        right = parseExpression();
	                        init = null;
	                    } else if (declarations.length === 1 && declarations[0].init === null && matchContextualKeyword('of')) {
	                        init = init.finishLexicalDeclaration(declarations, kind);
	                        lex();
	                        left = init;
	                        right = parseAssignmentExpression();
	                        init = null;
	                        forIn = false;
	                    } else {
	                        consumeSemicolon();
	                        init = init.finishLexicalDeclaration(declarations, kind);
	                    }
	                }
	            } else {
	                initStartToken = lookahead;
	                state.allowIn = false;
	                init = inheritCoverGrammar(parseAssignmentExpression);
	                state.allowIn = previousAllowIn;
	
	                if (matchKeyword('in')) {
	                    if (!isAssignmentTarget) {
	                        tolerateError(Messages.InvalidLHSInForIn);
	                    }
	
	                    lex();
	                    reinterpretExpressionAsPattern(init);
	                    left = init;
	                    right = parseExpression();
	                    init = null;
	                } else if (matchContextualKeyword('of')) {
	                    if (!isAssignmentTarget) {
	                        tolerateError(Messages.InvalidLHSInForLoop);
	                    }
	
	                    lex();
	                    reinterpretExpressionAsPattern(init);
	                    left = init;
	                    right = parseAssignmentExpression();
	                    init = null;
	                    forIn = false;
	                } else {
	                    if (match(',')) {
	                        initSeq = [init];
	                        while (match(',')) {
	                            lex();
	                            initSeq.push(isolateCoverGrammar(parseAssignmentExpression));
	                        }
	                        init = new WrappingNode(initStartToken).finishSequenceExpression(initSeq);
	                    }
	                    expect(';');
	                }
	            }
	        }
	
	        if (typeof left === 'undefined') {
	
	            if (!match(';')) {
	                test = parseExpression();
	            }
	            expect(';');
	
	            if (!match(')')) {
	                update = parseExpression();
	            }
	        }
	
	        expect(')');
	
	        oldInIteration = state.inIteration;
	        state.inIteration = true;
	
	        body = isolateCoverGrammar(parseStatement);
	
	        state.inIteration = oldInIteration;
	
	        return (typeof left === 'undefined') ?
	                node.finishForStatement(init, test, update, body) :
	                forIn ? node.finishForInStatement(left, right, body) :
	                    node.finishForOfStatement(left, right, body);
	    }
	
	    // ECMA-262 13.8 The continue statement
	
	    function parseContinueStatement(node) {
	        var label = null, key;
	
	        expectKeyword('continue');
	
	        // Optimize the most common form: 'continue;'.
	        if (source.charCodeAt(startIndex) === 0x3B) {
	            lex();
	
	            if (!state.inIteration) {
	                throwError(Messages.IllegalContinue);
	            }
	
	            return node.finishContinueStatement(null);
	        }
	
	        if (hasLineTerminator) {
	            if (!state.inIteration) {
	                throwError(Messages.IllegalContinue);
	            }
	
	            return node.finishContinueStatement(null);
	        }
	
	        if (lookahead.type === Token.Identifier) {
	            label = parseVariableIdentifier();
	
	            key = '$' + label.name;
	            if (!Object.prototype.hasOwnProperty.call(state.labelSet, key)) {
	                throwError(Messages.UnknownLabel, label.name);
	            }
	        }
	
	        consumeSemicolon();
	
	        if (label === null && !state.inIteration) {
	            throwError(Messages.IllegalContinue);
	        }
	
	        return node.finishContinueStatement(label);
	    }
	
	    // ECMA-262 13.9 The break statement
	
	    function parseBreakStatement(node) {
	        var label = null, key;
	
	        expectKeyword('break');
	
	        // Catch the very common case first: immediately a semicolon (U+003B).
	        if (source.charCodeAt(lastIndex) === 0x3B) {
	            lex();
	
	            if (!(state.inIteration || state.inSwitch)) {
	                throwError(Messages.IllegalBreak);
	            }
	
	            return node.finishBreakStatement(null);
	        }
	
	        if (hasLineTerminator) {
	            if (!(state.inIteration || state.inSwitch)) {
	                throwError(Messages.IllegalBreak);
	            }
	        } else if (lookahead.type === Token.Identifier) {
	            label = parseVariableIdentifier();
	
	            key = '$' + label.name;
	            if (!Object.prototype.hasOwnProperty.call(state.labelSet, key)) {
	                throwError(Messages.UnknownLabel, label.name);
	            }
	        }
	
	        consumeSemicolon();
	
	        if (label === null && !(state.inIteration || state.inSwitch)) {
	            throwError(Messages.IllegalBreak);
	        }
	
	        return node.finishBreakStatement(label);
	    }
	
	    // ECMA-262 13.10 The return statement
	
	    function parseReturnStatement(node) {
	        var argument = null;
	
	        expectKeyword('return');
	
	        if (!state.inFunctionBody) {
	            tolerateError(Messages.IllegalReturn);
	        }
	
	        // 'return' followed by a space and an identifier is very common.
	        if (source.charCodeAt(lastIndex) === 0x20) {
	            if (isIdentifierStart(source.charCodeAt(lastIndex + 1))) {
	                argument = parseExpression();
	                consumeSemicolon();
	                return node.finishReturnStatement(argument);
	            }
	        }
	
	        if (hasLineTerminator) {
	            // HACK
	            return node.finishReturnStatement(null);
	        }
	
	        if (!match(';')) {
	            if (!match('}') && lookahead.type !== Token.EOF) {
	                argument = parseExpression();
	            }
	        }
	
	        consumeSemicolon();
	
	        return node.finishReturnStatement(argument);
	    }
	
	    // ECMA-262 13.11 The with statement
	
	    function parseWithStatement(node) {
	        var object, body;
	
	        if (strict) {
	            tolerateError(Messages.StrictModeWith);
	        }
	
	        expectKeyword('with');
	
	        expect('(');
	
	        object = parseExpression();
	
	        expect(')');
	
	        body = parseStatement();
	
	        return node.finishWithStatement(object, body);
	    }
	
	    // ECMA-262 13.12 The switch statement
	
	    function parseSwitchCase() {
	        var test, consequent = [], statement, node = new Node();
	
	        if (matchKeyword('default')) {
	            lex();
	            test = null;
	        } else {
	            expectKeyword('case');
	            test = parseExpression();
	        }
	        expect(':');
	
	        while (startIndex < length) {
	            if (match('}') || matchKeyword('default') || matchKeyword('case')) {
	                break;
	            }
	            statement = parseStatementListItem();
	            consequent.push(statement);
	        }
	
	        return node.finishSwitchCase(test, consequent);
	    }
	
	    function parseSwitchStatement(node) {
	        var discriminant, cases, clause, oldInSwitch, defaultFound;
	
	        expectKeyword('switch');
	
	        expect('(');
	
	        discriminant = parseExpression();
	
	        expect(')');
	
	        expect('{');
	
	        cases = [];
	
	        if (match('}')) {
	            lex();
	            return node.finishSwitchStatement(discriminant, cases);
	        }
	
	        oldInSwitch = state.inSwitch;
	        state.inSwitch = true;
	        defaultFound = false;
	
	        while (startIndex < length) {
	            if (match('}')) {
	                break;
	            }
	            clause = parseSwitchCase();
	            if (clause.test === null) {
	                if (defaultFound) {
	                    throwError(Messages.MultipleDefaultsInSwitch);
	                }
	                defaultFound = true;
	            }
	            cases.push(clause);
	        }
	
	        state.inSwitch = oldInSwitch;
	
	        expect('}');
	
	        return node.finishSwitchStatement(discriminant, cases);
	    }
	
	    // ECMA-262 13.14 The throw statement
	
	    function parseThrowStatement(node) {
	        var argument;
	
	        expectKeyword('throw');
	
	        if (hasLineTerminator) {
	            throwError(Messages.NewlineAfterThrow);
	        }
	
	        argument = parseExpression();
	
	        consumeSemicolon();
	
	        return node.finishThrowStatement(argument);
	    }
	
	    // ECMA-262 13.15 The try statement
	
	    function parseCatchClause() {
	        var param, params = [], paramMap = {}, key, i, body, node = new Node();
	
	        expectKeyword('catch');
	
	        expect('(');
	        if (match(')')) {
	            throwUnexpectedToken(lookahead);
	        }
	
	        param = parsePattern(params);
	        for (i = 0; i < params.length; i++) {
	            key = '$' + params[i].value;
	            if (Object.prototype.hasOwnProperty.call(paramMap, key)) {
	                tolerateError(Messages.DuplicateBinding, params[i].value);
	            }
	            paramMap[key] = true;
	        }
	
	        // ECMA-262 12.14.1
	        if (strict && isRestrictedWord(param.name)) {
	            tolerateError(Messages.StrictCatchVariable);
	        }
	
	        expect(')');
	        body = parseBlock();
	        return node.finishCatchClause(param, body);
	    }
	
	    function parseTryStatement(node) {
	        var block, handler = null, finalizer = null;
	
	        expectKeyword('try');
	
	        block = parseBlock();
	
	        if (matchKeyword('catch')) {
	            handler = parseCatchClause();
	        }
	
	        if (matchKeyword('finally')) {
	            lex();
	            finalizer = parseBlock();
	        }
	
	        if (!handler && !finalizer) {
	            throwError(Messages.NoCatchOrFinally);
	        }
	
	        return node.finishTryStatement(block, handler, finalizer);
	    }
	
	    // ECMA-262 13.16 The debugger statement
	
	    function parseDebuggerStatement(node) {
	        expectKeyword('debugger');
	
	        consumeSemicolon();
	
	        return node.finishDebuggerStatement();
	    }
	
	    // 13 Statements
	
	    function parseStatement() {
	        var type = lookahead.type,
	            expr,
	            labeledBody,
	            key,
	            node;
	
	        if (type === Token.EOF) {
	            throwUnexpectedToken(lookahead);
	        }
	
	        if (type === Token.Punctuator && lookahead.value === '{') {
	            return parseBlock();
	        }
	        isAssignmentTarget = isBindingElement = true;
	        node = new Node();
	
	        if (type === Token.Punctuator) {
	            switch (lookahead.value) {
	            case ';':
	                return parseEmptyStatement(node);
	            case '(':
	                return parseExpressionStatement(node);
	            default:
	                break;
	            }
	        } else if (type === Token.Keyword) {
	            switch (lookahead.value) {
	            case 'break':
	                return parseBreakStatement(node);
	            case 'continue':
	                return parseContinueStatement(node);
	            case 'debugger':
	                return parseDebuggerStatement(node);
	            case 'do':
	                return parseDoWhileStatement(node);
	            case 'for':
	                return parseForStatement(node);
	            case 'function':
	                return parseFunctionDeclaration(node);
	            case 'if':
	                return parseIfStatement(node);
	            case 'return':
	                return parseReturnStatement(node);
	            case 'switch':
	                return parseSwitchStatement(node);
	            case 'throw':
	                return parseThrowStatement(node);
	            case 'try':
	                return parseTryStatement(node);
	            case 'var':
	                return parseVariableStatement(node);
	            case 'while':
	                return parseWhileStatement(node);
	            case 'with':
	                return parseWithStatement(node);
	            default:
	                break;
	            }
	        }
	
	        expr = parseExpression();
	
	        // ECMA-262 12.12 Labelled Statements
	        if ((expr.type === Syntax.Identifier) && match(':')) {
	            lex();
	
	            key = '$' + expr.name;
	            if (Object.prototype.hasOwnProperty.call(state.labelSet, key)) {
	                throwError(Messages.Redeclaration, 'Label', expr.name);
	            }
	
	            state.labelSet[key] = true;
	            labeledBody = parseStatement();
	            delete state.labelSet[key];
	            return node.finishLabeledStatement(expr, labeledBody);
	        }
	
	        consumeSemicolon();
	
	        return node.finishExpressionStatement(expr);
	    }
	
	    // ECMA-262 14.1 Function Definition
	
	    function parseFunctionSourceElements() {
	        var statement, body = [], token, directive, firstRestricted,
	            oldLabelSet, oldInIteration, oldInSwitch, oldInFunctionBody,
	            node = new Node();
	
	        expect('{');
	
	        while (startIndex < length) {
	            if (lookahead.type !== Token.StringLiteral) {
	                break;
	            }
	            token = lookahead;
	
	            statement = parseStatementListItem();
	            body.push(statement);
	            if (statement.expression.type !== Syntax.Literal) {
	                // this is not directive
	                break;
	            }
	            directive = source.slice(token.start + 1, token.end - 1);
	            if (directive === 'use strict') {
	                strict = true;
	                if (firstRestricted) {
	                    tolerateUnexpectedToken(firstRestricted, Messages.StrictOctalLiteral);
	                }
	            } else {
	                if (!firstRestricted && token.octal) {
	                    firstRestricted = token;
	                }
	            }
	        }
	
	        oldLabelSet = state.labelSet;
	        oldInIteration = state.inIteration;
	        oldInSwitch = state.inSwitch;
	        oldInFunctionBody = state.inFunctionBody;
	
	        state.labelSet = {};
	        state.inIteration = false;
	        state.inSwitch = false;
	        state.inFunctionBody = true;
	
	        while (startIndex < length) {
	            if (match('}')) {
	                break;
	            }
	            body.push(parseStatementListItem());
	        }
	
	        expect('}');
	
	        state.labelSet = oldLabelSet;
	        state.inIteration = oldInIteration;
	        state.inSwitch = oldInSwitch;
	        state.inFunctionBody = oldInFunctionBody;
	
	        return node.finishBlockStatement(body);
	    }
	
	    function validateParam(options, param, name) {
	        var key = '$' + name;
	        if (strict) {
	            if (isRestrictedWord(name)) {
	                options.stricted = param;
	                options.message = Messages.StrictParamName;
	            }
	            if (Object.prototype.hasOwnProperty.call(options.paramSet, key)) {
	                options.stricted = param;
	                options.message = Messages.StrictParamDupe;
	            }
	        } else if (!options.firstRestricted) {
	            if (isRestrictedWord(name)) {
	                options.firstRestricted = param;
	                options.message = Messages.StrictParamName;
	            } else if (isStrictModeReservedWord(name)) {
	                options.firstRestricted = param;
	                options.message = Messages.StrictReservedWord;
	            } else if (Object.prototype.hasOwnProperty.call(options.paramSet, key)) {
	                options.stricted = param;
	                options.message = Messages.StrictParamDupe;
	            }
	        }
	        options.paramSet[key] = true;
	    }
	
	    function parseParam(options) {
	        var token, param, params = [], i, def;
	
	        token = lookahead;
	        if (token.value === '...') {
	            param = parseRestElement(params);
	            validateParam(options, param.argument, param.argument.name);
	            options.params.push(param);
	            options.defaults.push(null);
	            return false;
	        }
	
	        param = parsePatternWithDefault(params);
	        for (i = 0; i < params.length; i++) {
	            validateParam(options, params[i], params[i].value);
	        }
	
	        if (param.type === Syntax.AssignmentPattern) {
	            def = param.right;
	            param = param.left;
	            ++options.defaultCount;
	        }
	
	        options.params.push(param);
	        options.defaults.push(def);
	
	        return !match(')');
	    }
	
	    function parseParams(firstRestricted) {
	        var options;
	
	        options = {
	            params: [],
	            defaultCount: 0,
	            defaults: [],
	            firstRestricted: firstRestricted
	        };
	
	        expect('(');
	
	        if (!match(')')) {
	            options.paramSet = {};
	            while (startIndex < length) {
	                if (!parseParam(options)) {
	                    break;
	                }
	                expect(',');
	            }
	        }
	
	        expect(')');
	
	        if (options.defaultCount === 0) {
	            options.defaults = [];
	        }
	
	        return {
	            params: options.params,
	            defaults: options.defaults,
	            stricted: options.stricted,
	            firstRestricted: options.firstRestricted,
	            message: options.message
	        };
	    }
	
	    function parseFunctionDeclaration(node, identifierIsOptional) {
	        var id = null, params = [], defaults = [], body, token, stricted, tmp, firstRestricted, message, previousStrict,
	            isGenerator, previousAllowYield;
	
	        previousAllowYield = state.allowYield;
	
	        expectKeyword('function');
	
	        isGenerator = match('*');
	        if (isGenerator) {
	            lex();
	        }
	
	        if (!identifierIsOptional || !match('(')) {
	            token = lookahead;
	            id = parseVariableIdentifier();
	            if (strict) {
	                if (isRestrictedWord(token.value)) {
	                    tolerateUnexpectedToken(token, Messages.StrictFunctionName);
	                }
	            } else {
	                if (isRestrictedWord(token.value)) {
	                    firstRestricted = token;
	                    message = Messages.StrictFunctionName;
	                } else if (isStrictModeReservedWord(token.value)) {
	                    firstRestricted = token;
	                    message = Messages.StrictReservedWord;
	                }
	            }
	        }
	
	        state.allowYield = !isGenerator;
	        tmp = parseParams(firstRestricted);
	        params = tmp.params;
	        defaults = tmp.defaults;
	        stricted = tmp.stricted;
	        firstRestricted = tmp.firstRestricted;
	        if (tmp.message) {
	            message = tmp.message;
	        }
	
	
	        previousStrict = strict;
	        body = parseFunctionSourceElements();
	        if (strict && firstRestricted) {
	            throwUnexpectedToken(firstRestricted, message);
	        }
	        if (strict && stricted) {
	            tolerateUnexpectedToken(stricted, message);
	        }
	
	        strict = previousStrict;
	        state.allowYield = previousAllowYield;
	
	        return node.finishFunctionDeclaration(id, params, defaults, body, isGenerator);
	    }
	
	    function parseFunctionExpression() {
	        var token, id = null, stricted, firstRestricted, message, tmp,
	            params = [], defaults = [], body, previousStrict, node = new Node(),
	            isGenerator, previousAllowYield;
	
	        previousAllowYield = state.allowYield;
	
	        expectKeyword('function');
	
	        isGenerator = match('*');
	        if (isGenerator) {
	            lex();
	        }
	
	        state.allowYield = !isGenerator;
	        if (!match('(')) {
	            token = lookahead;
	            id = (!strict && !isGenerator && matchKeyword('yield')) ? parseNonComputedProperty() : parseVariableIdentifier();
	            if (strict) {
	                if (isRestrictedWord(token.value)) {
	                    tolerateUnexpectedToken(token, Messages.StrictFunctionName);
	                }
	            } else {
	                if (isRestrictedWord(token.value)) {
	                    firstRestricted = token;
	                    message = Messages.StrictFunctionName;
	                } else if (isStrictModeReservedWord(token.value)) {
	                    firstRestricted = token;
	                    message = Messages.StrictReservedWord;
	                }
	            }
	        }
	
	        tmp = parseParams(firstRestricted);
	        params = tmp.params;
	        defaults = tmp.defaults;
	        stricted = tmp.stricted;
	        firstRestricted = tmp.firstRestricted;
	        if (tmp.message) {
	            message = tmp.message;
	        }
	
	        previousStrict = strict;
	        body = parseFunctionSourceElements();
	        if (strict && firstRestricted) {
	            throwUnexpectedToken(firstRestricted, message);
	        }
	        if (strict && stricted) {
	            tolerateUnexpectedToken(stricted, message);
	        }
	        strict = previousStrict;
	        state.allowYield = previousAllowYield;
	
	        return node.finishFunctionExpression(id, params, defaults, body, isGenerator);
	    }
	
	    // ECMA-262 14.5 Class Definitions
	
	    function parseClassBody() {
	        var classBody, token, isStatic, hasConstructor = false, body, method, computed, key;
	
	        classBody = new Node();
	
	        expect('{');
	        body = [];
	        while (!match('}')) {
	            if (match(';')) {
	                lex();
	            } else {
	                method = new Node();
	                token = lookahead;
	                isStatic = false;
	                computed = match('[');
	                if (match('*')) {
	                    lex();
	                } else {
	                    key = parseObjectPropertyKey();
	                    if (key.name === 'static' && (lookaheadPropertyName() || match('*'))) {
	                        token = lookahead;
	                        isStatic = true;
	                        computed = match('[');
	                        if (match('*')) {
	                            lex();
	                        } else {
	                            key = parseObjectPropertyKey();
	                        }
	                    }
	                }
	                method = tryParseMethodDefinition(token, key, computed, method);
	                if (method) {
	                    method['static'] = isStatic; // jscs:ignore requireDotNotation
	                    if (method.kind === 'init') {
	                        method.kind = 'method';
	                    }
	                    if (!isStatic) {
	                        if (!method.computed && (method.key.name || method.key.value.toString()) === 'constructor') {
	                            if (method.kind !== 'method' || !method.method || method.value.generator) {
	                                throwUnexpectedToken(token, Messages.ConstructorSpecialMethod);
	                            }
	                            if (hasConstructor) {
	                                throwUnexpectedToken(token, Messages.DuplicateConstructor);
	                            } else {
	                                hasConstructor = true;
	                            }
	                            method.kind = 'constructor';
	                        }
	                    } else {
	                        if (!method.computed && (method.key.name || method.key.value.toString()) === 'prototype') {
	                            throwUnexpectedToken(token, Messages.StaticPrototype);
	                        }
	                    }
	                    method.type = Syntax.MethodDefinition;
	                    delete method.method;
	                    delete method.shorthand;
	                    body.push(method);
	                } else {
	                    throwUnexpectedToken(lookahead);
	                }
	            }
	        }
	        lex();
	        return classBody.finishClassBody(body);
	    }
	
	    function parseClassDeclaration(identifierIsOptional) {
	        var id = null, superClass = null, classNode = new Node(), classBody, previousStrict = strict;
	        strict = true;
	
	        expectKeyword('class');
	
	        if (!identifierIsOptional || lookahead.type === Token.Identifier) {
	            id = parseVariableIdentifier();
	        }
	
	        if (matchKeyword('extends')) {
	            lex();
	            superClass = isolateCoverGrammar(parseLeftHandSideExpressionAllowCall);
	        }
	        classBody = parseClassBody();
	        strict = previousStrict;
	
	        return classNode.finishClassDeclaration(id, superClass, classBody);
	    }
	
	    function parseClassExpression() {
	        var id = null, superClass = null, classNode = new Node(), classBody, previousStrict = strict;
	        strict = true;
	
	        expectKeyword('class');
	
	        if (lookahead.type === Token.Identifier) {
	            id = parseVariableIdentifier();
	        }
	
	        if (matchKeyword('extends')) {
	            lex();
	            superClass = isolateCoverGrammar(parseLeftHandSideExpressionAllowCall);
	        }
	        classBody = parseClassBody();
	        strict = previousStrict;
	
	        return classNode.finishClassExpression(id, superClass, classBody);
	    }
	
	    // ECMA-262 15.2 Modules
	
	    function parseModuleSpecifier() {
	        var node = new Node();
	
	        if (lookahead.type !== Token.StringLiteral) {
	            throwError(Messages.InvalidModuleSpecifier);
	        }
	        return node.finishLiteral(lex());
	    }
	
	    // ECMA-262 15.2.3 Exports
	
	    function parseExportSpecifier() {
	        var exported, local, node = new Node(), def;
	        if (matchKeyword('default')) {
	            // export {default} from 'something';
	            def = new Node();
	            lex();
	            local = def.finishIdentifier('default');
	        } else {
	            local = parseVariableIdentifier();
	        }
	        if (matchContextualKeyword('as')) {
	            lex();
	            exported = parseNonComputedProperty();
	        }
	        return node.finishExportSpecifier(local, exported);
	    }
	
	    function parseExportNamedDeclaration(node) {
	        var declaration = null,
	            isExportFromIdentifier,
	            src = null, specifiers = [];
	
	        // non-default export
	        if (lookahead.type === Token.Keyword) {
	            // covers:
	            // export var f = 1;
	            switch (lookahead.value) {
	                case 'let':
	                case 'const':
	                    declaration = parseLexicalDeclaration({inFor: false});
	                    return node.finishExportNamedDeclaration(declaration, specifiers, null);
	                case 'var':
	                case 'class':
	                case 'function':
	                    declaration = parseStatementListItem();
	                    return node.finishExportNamedDeclaration(declaration, specifiers, null);
	            }
	        }
	
	        expect('{');
	        while (!match('}')) {
	            isExportFromIdentifier = isExportFromIdentifier || matchKeyword('default');
	            specifiers.push(parseExportSpecifier());
	            if (!match('}')) {
	                expect(',');
	                if (match('}')) {
	                    break;
	                }
	            }
	        }
	        expect('}');
	
	        if (matchContextualKeyword('from')) {
	            // covering:
	            // export {default} from 'foo';
	            // export {foo} from 'foo';
	            lex();
	            src = parseModuleSpecifier();
	            consumeSemicolon();
	        } else if (isExportFromIdentifier) {
	            // covering:
	            // export {default}; // missing fromClause
	            throwError(lookahead.value ?
	                    Messages.UnexpectedToken : Messages.MissingFromClause, lookahead.value);
	        } else {
	            // cover
	            // export {foo};
	            consumeSemicolon();
	        }
	        return node.finishExportNamedDeclaration(declaration, specifiers, src);
	    }
	
	    function parseExportDefaultDeclaration(node) {
	        var declaration = null,
	            expression = null;
	
	        // covers:
	        // export default ...
	        expectKeyword('default');
	
	        if (matchKeyword('function')) {
	            // covers:
	            // export default function foo () {}
	            // export default function () {}
	            declaration = parseFunctionDeclaration(new Node(), true);
	            return node.finishExportDefaultDeclaration(declaration);
	        }
	        if (matchKeyword('class')) {
	            declaration = parseClassDeclaration(true);
	            return node.finishExportDefaultDeclaration(declaration);
	        }
	
	        if (matchContextualKeyword('from')) {
	            throwError(Messages.UnexpectedToken, lookahead.value);
	        }
	
	        // covers:
	        // export default {};
	        // export default [];
	        // export default (1 + 2);
	        if (match('{')) {
	            expression = parseObjectInitializer();
	        } else if (match('[')) {
	            expression = parseArrayInitializer();
	        } else {
	            expression = parseAssignmentExpression();
	        }
	        consumeSemicolon();
	        return node.finishExportDefaultDeclaration(expression);
	    }
	
	    function parseExportAllDeclaration(node) {
	        var src;
	
	        // covers:
	        // export * from 'foo';
	        expect('*');
	        if (!matchContextualKeyword('from')) {
	            throwError(lookahead.value ?
	                    Messages.UnexpectedToken : Messages.MissingFromClause, lookahead.value);
	        }
	        lex();
	        src = parseModuleSpecifier();
	        consumeSemicolon();
	
	        return node.finishExportAllDeclaration(src);
	    }
	
	    function parseExportDeclaration() {
	        var node = new Node();
	        if (state.inFunctionBody) {
	            throwError(Messages.IllegalExportDeclaration);
	        }
	
	        expectKeyword('export');
	
	        if (matchKeyword('default')) {
	            return parseExportDefaultDeclaration(node);
	        }
	        if (match('*')) {
	            return parseExportAllDeclaration(node);
	        }
	        return parseExportNamedDeclaration(node);
	    }
	
	    // ECMA-262 15.2.2 Imports
	
	    function parseImportSpecifier() {
	        // import {<foo as bar>} ...;
	        var local, imported, node = new Node();
	
	        imported = parseNonComputedProperty();
	        if (matchContextualKeyword('as')) {
	            lex();
	            local = parseVariableIdentifier();
	        }
	
	        return node.finishImportSpecifier(local, imported);
	    }
	
	    function parseNamedImports() {
	        var specifiers = [];
	        // {foo, bar as bas}
	        expect('{');
	        while (!match('}')) {
	            specifiers.push(parseImportSpecifier());
	            if (!match('}')) {
	                expect(',');
	                if (match('}')) {
	                    break;
	                }
	            }
	        }
	        expect('}');
	        return specifiers;
	    }
	
	    function parseImportDefaultSpecifier() {
	        // import <foo> ...;
	        var local, node = new Node();
	
	        local = parseNonComputedProperty();
	
	        return node.finishImportDefaultSpecifier(local);
	    }
	
	    function parseImportNamespaceSpecifier() {
	        // import <* as foo> ...;
	        var local, node = new Node();
	
	        expect('*');
	        if (!matchContextualKeyword('as')) {
	            throwError(Messages.NoAsAfterImportNamespace);
	        }
	        lex();
	        local = parseNonComputedProperty();
	
	        return node.finishImportNamespaceSpecifier(local);
	    }
	
	    function parseImportDeclaration() {
	        var specifiers = [], src, node = new Node();
	
	        if (state.inFunctionBody) {
	            throwError(Messages.IllegalImportDeclaration);
	        }
	
	        expectKeyword('import');
	
	        if (lookahead.type === Token.StringLiteral) {
	            // import 'foo';
	            src = parseModuleSpecifier();
	        } else {
	
	            if (match('{')) {
	                // import {bar}
	                specifiers = specifiers.concat(parseNamedImports());
	            } else if (match('*')) {
	                // import * as foo
	                specifiers.push(parseImportNamespaceSpecifier());
	            } else if (isIdentifierName(lookahead) && !matchKeyword('default')) {
	                // import foo
	                specifiers.push(parseImportDefaultSpecifier());
	                if (match(',')) {
	                    lex();
	                    if (match('*')) {
	                        // import foo, * as foo
	                        specifiers.push(parseImportNamespaceSpecifier());
	                    } else if (match('{')) {
	                        // import foo, {bar}
	                        specifiers = specifiers.concat(parseNamedImports());
	                    } else {
	                        throwUnexpectedToken(lookahead);
	                    }
	                }
	            } else {
	                throwUnexpectedToken(lex());
	            }
	
	            if (!matchContextualKeyword('from')) {
	                throwError(lookahead.value ?
	                        Messages.UnexpectedToken : Messages.MissingFromClause, lookahead.value);
	            }
	            lex();
	            src = parseModuleSpecifier();
	        }
	
	        consumeSemicolon();
	        return node.finishImportDeclaration(specifiers, src);
	    }
	
	    // ECMA-262 15.1 Scripts
	
	    function parseScriptBody() {
	        var statement, body = [], token, directive, firstRestricted;
	
	        while (startIndex < length) {
	            token = lookahead;
	            if (token.type !== Token.StringLiteral) {
	                break;
	            }
	
	            statement = parseStatementListItem();
	            body.push(statement);
	            if (statement.expression.type !== Syntax.Literal) {
	                // this is not directive
	                break;
	            }
	            directive = source.slice(token.start + 1, token.end - 1);
	            if (directive === 'use strict') {
	                strict = true;
	                if (firstRestricted) {
	                    tolerateUnexpectedToken(firstRestricted, Messages.StrictOctalLiteral);
	                }
	            } else {
	                if (!firstRestricted && token.octal) {
	                    firstRestricted = token;
	                }
	            }
	        }
	
	        while (startIndex < length) {
	            statement = parseStatementListItem();
	            /* istanbul ignore if */
	            if (typeof statement === 'undefined') {
	                break;
	            }
	            body.push(statement);
	        }
	        return body;
	    }
	
	    function parseProgram() {
	        var body, node;
	
	        peek();
	        node = new Node();
	
	        body = parseScriptBody();
	        return node.finishProgram(body, state.sourceType);
	    }
	
	    function filterTokenLocation() {
	        var i, entry, token, tokens = [];
	
	        for (i = 0; i < extra.tokens.length; ++i) {
	            entry = extra.tokens[i];
	            token = {
	                type: entry.type,
	                value: entry.value
	            };
	            if (entry.regex) {
	                token.regex = {
	                    pattern: entry.regex.pattern,
	                    flags: entry.regex.flags
	                };
	            }
	            if (extra.range) {
	                token.range = entry.range;
	            }
	            if (extra.loc) {
	                token.loc = entry.loc;
	            }
	            tokens.push(token);
	        }
	
	        extra.tokens = tokens;
	    }
	
	    function tokenize(code, options, delegate) {
	        var toString,
	            tokens;
	
	        toString = String;
	        if (typeof code !== 'string' && !(code instanceof String)) {
	            code = toString(code);
	        }
	
	        source = code;
	        index = 0;
	        lineNumber = (source.length > 0) ? 1 : 0;
	        lineStart = 0;
	        startIndex = index;
	        startLineNumber = lineNumber;
	        startLineStart = lineStart;
	        length = source.length;
	        lookahead = null;
	        state = {
	            allowIn: true,
	            allowYield: true,
	            labelSet: {},
	            inFunctionBody: false,
	            inIteration: false,
	            inSwitch: false,
	            lastCommentStart: -1,
	            curlyStack: []
	        };
	
	        extra = {};
	
	        // Options matching.
	        options = options || {};
	
	        // Of course we collect tokens here.
	        options.tokens = true;
	        extra.tokens = [];
	        extra.tokenValues = [];
	        extra.tokenize = true;
	        extra.delegate = delegate;
	
	        // The following two fields are necessary to compute the Regex tokens.
	        extra.openParenToken = -1;
	        extra.openCurlyToken = -1;
	
	        extra.range = (typeof options.range === 'boolean') && options.range;
	        extra.loc = (typeof options.loc === 'boolean') && options.loc;
	
	        if (typeof options.comment === 'boolean' && options.comment) {
	            extra.comments = [];
	        }
	        if (typeof options.tolerant === 'boolean' && options.tolerant) {
	            extra.errors = [];
	        }
	
	        try {
	            peek();
	            if (lookahead.type === Token.EOF) {
	                return extra.tokens;
	            }
	
	            lex();
	            while (lookahead.type !== Token.EOF) {
	                try {
	                    lex();
	                } catch (lexError) {
	                    if (extra.errors) {
	                        recordError(lexError);
	                        // We have to break on the first error
	                        // to avoid infinite loops.
	                        break;
	                    } else {
	                        throw lexError;
	                    }
	                }
	            }
	
	            tokens = extra.tokens;
	            if (typeof extra.errors !== 'undefined') {
	                tokens.errors = extra.errors;
	            }
	        } catch (e) {
	            throw e;
	        } finally {
	            extra = {};
	        }
	        return tokens;
	    }
	
	    function parse(code, options) {
	        var program, toString;
	
	        toString = String;
	        if (typeof code !== 'string' && !(code instanceof String)) {
	            code = toString(code);
	        }
	
	        source = code;
	        index = 0;
	        lineNumber = (source.length > 0) ? 1 : 0;
	        lineStart = 0;
	        startIndex = index;
	        startLineNumber = lineNumber;
	        startLineStart = lineStart;
	        length = source.length;
	        lookahead = null;
	        state = {
	            allowIn: true,
	            allowYield: true,
	            labelSet: {},
	            inFunctionBody: false,
	            inIteration: false,
	            inSwitch: false,
	            lastCommentStart: -1,
	            curlyStack: [],
	            sourceType: 'script'
	        };
	        strict = false;
	
	        extra = {};
	        if (typeof options !== 'undefined') {
	            extra.range = (typeof options.range === 'boolean') && options.range;
	            extra.loc = (typeof options.loc === 'boolean') && options.loc;
	            extra.attachComment = (typeof options.attachComment === 'boolean') && options.attachComment;
	
	            if (extra.loc && options.source !== null && options.source !== undefined) {
	                extra.source = toString(options.source);
	            }
	
	            if (typeof options.tokens === 'boolean' && options.tokens) {
	                extra.tokens = [];
	            }
	            if (typeof options.comment === 'boolean' && options.comment) {
	                extra.comments = [];
	            }
	            if (typeof options.tolerant === 'boolean' && options.tolerant) {
	                extra.errors = [];
	            }
	            if (extra.attachComment) {
	                extra.range = true;
	                extra.comments = [];
	                extra.bottomRightStack = [];
	                extra.trailingComments = [];
	                extra.leadingComments = [];
	            }
	            if (options.sourceType === 'module') {
	                // very restrictive condition for now
	                state.sourceType = options.sourceType;
	                strict = true;
	            }
	        }
	
	        try {
	            program = parseProgram();
	            if (typeof extra.comments !== 'undefined') {
	                program.comments = extra.comments;
	            }
	            if (typeof extra.tokens !== 'undefined') {
	                filterTokenLocation();
	                program.tokens = extra.tokens;
	            }
	            if (typeof extra.errors !== 'undefined') {
	                program.errors = extra.errors;
	            }
	        } catch (e) {
	            throw e;
	        } finally {
	            extra = {};
	        }
	
	        return program;
	    }
	
	    // Sync with *.json manifests.
	    exports.version = '2.7.2';
	
	    exports.tokenize = tokenize;
	
	    exports.parse = parse;
	
	    // Deep copy.
	    /* istanbul ignore next */
	    exports.Syntax = (function () {
	        var name, types = {};
	
	        if (typeof Object.create === 'function') {
	            types = Object.create(null);
	        }
	
	        for (name in Syntax) {
	            if (Syntax.hasOwnProperty(name)) {
	                types[name] = Syntax[name];
	            }
	        }
	
	        if (typeof Object.freeze === 'function') {
	            Object.freeze(types);
	        }
	
	        return types;
	    }());
	
	}));
	/* vim: set sw=4 ts=4 et tw=80 : */


/***/ },
/* 22 */
/***/ function(module, exports) {

	'use strict';
	
	var toExport = {
	  registerMapSemantics: registerMapSemantics,
	  mapSemantics: mapSemantics
	};
	
	if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
	  module.exports = toExport;
	} else {
	  Object.assign(window, toExport);
	}
	
	function registerMapSemantics(semantics) {
	  semantics.addOperation("mapSemantics(action, nodeToResults, resultMap)", {
	    _nonterminal: function _nonterminal(children) {
	      var _this = this;
	
	      // let examplePiece = this.interval.contents;
	      var key = this._node.ctorName + '_from_' + this.interval.startIdx + '_to_' + this.interval.endIdx;
	      // let result;
	      // try {
	      //   // let match = grammar.match(examplePiece, this._node.ctorName);
	      //   result = this.args.resultMap[key];
	      // } catch(e) {
	      //   // console.error(e);
	      //   result = e;//new Error(`${this._node.ctorName}: ${this.interval.contents}`);
	      // }
	
	      // console.log(typeof this.args.resultMap, this.args.resultMap.constructor && this.args.resultMap.constructor.name )
	      if (key in this.args.resultMap) {
	        this.args.nodeToResults.set(this._node, this.args.resultMap[key]); //result
	      }
	
	      children.forEach(function (child) {
	        return child.mapSemantics(_this.args.action, _this.args.nodeToResults, _this.args.resultMap);
	      });
	    }
	  });
	}
	
	function mapSemantics(semantics, action, match, resultMap) {
	  var nodeToResults = new Map();
	
	  semantics(match).mapSemantics(action, nodeToResults, resultMap);
	
	  return nodeToResults;
	}

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var language = __webpack_require__(13);
	
	var resultMap, todo, passThrough;
	var toExport = {
	  initSemantics: initSemantics,
	  saveAction: saveAction,
	  resultMap: resultMap,
	  reset: reset
	};
	
	if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
	  module.exports = toExport;
	} else {
	  Object.assign(window, toExport);
	}
	
	function reset() {
	  toExport.resultMap = Object.create(null);
	  todo = null;
	}
	
	function initSemantics(semantics) {
	  semantics.addOperation('eval', {
	    _nonterminal: function _nonterminal(children) {
	      console.info(this.ctorName, "nonterminal called");
	      try {
	        var key = toKey(this);
	        var ans = function () {
	          if (children.length === 1) {
	            if (!passThrough) {
	              passThrough = [];
	            }
	            passThrough.push(key);
	            return children[0].eval();
	          } else {
	            if (!todo) {
	              todo = [];
	            }
	            todo.push(key);
	          }
	        }();
	      } catch (error) {
	        if (!todo) {
	          if (!error.expression) {
	            error.expression = key;
	          }
	          toExport.resultMap[key] = error;
	        }
	      } finally {
	        if (toExport.resultMap[key] instanceof Error) {
	          throw toExport.resultMap[key];
	        }
	        if (!ans && todo) {
	          ans = new Error("TODO");
	        }
	        toExport.resultMap[key] = ans;
	        return ans;
	      }
	    }
	  });
	}
	
	function saveAction(actionDict, ruleName, funcObj, bodyStr) {
	  console.info("saving " + ruleName);
	  var func;
	  if (bodyStr.trim().length !== 0) {
	    var match = language.InferBraces.match(bodyStr, "NoBraces");
	    var wrappedBodyStr = "(" + bodyStr + ")";
	    if (match.failed()) {
	      wrappedBodyStr = "(()=>{" + bodyStr + "})()";
	      console.log(wrappedBodyStr);
	    }
	
	    var code = "(function(" + funcObj.args.join(',') + "){\n      var key = toKey(this);\n      var ans;\n\n      try{\n        ans = " + wrappedBodyStr + ";\n        var aChildHasTodo = this.children.some(\n          child => todo && todo.includes(toKey(child))\n        );\n        if(aChildHasTodo){\n          ans = new Error('TODO '+todo.toString());\n        }\n      } catch(error) {\n        if(todo){\n          ans = new Error('TODO '+todo.toString());\n        } else {\n          ans = new Error(error);\n          if(!ans.expression){\n            ans.expression = key;\n          }\n          throw ans;\n        }\n      } finally {\n        toExport.resultMap[key] = ans;\n      }\n      return ans;\n    })";
	    func = eval(code);
	    actionDict[ruleName] = func;
	  } else {
	    delete actionDict[ruleName];
	  }
	  funcObj.body = bodyStr;
	}
	
	function toKey(semNode) {
	  return semNode.ctorName + "_from_" + semNode.interval.startIdx + "_to_" + semNode.interval.endIdx;
	}

/***/ },
/* 24 */
/***/ function(module, exports) {

	'use strict';
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var SimplifiedCSTNode = function () {
	  function SimplifiedCSTNode(_ref) {
	    var cstNodes = _ref.cstNodes;
	    var parent = _ref.parent;
	    var children = _ref.children;
	
	    _classCallCheck(this, SimplifiedCSTNode);
	
	    // this.ctorName = ctorName;
	    this.cstNodes = cstNodes;
	    this.parent = parent;
	    this.children = children;
	    this._children = children;
	  }
	
	  _createClass(SimplifiedCSTNode, [{
	    key: "originalChildren",
	    value: function originalChildren() {
	      return this._children ? this._children : this.children;
	    }
	  }, {
	    key: "splittable",
	    value: function splittable() {
	      var children = this.originalChildren();
	      return !this.leaf && children && children.length > 0;
	    }
	  }, {
	    key: "ctorName",
	    get: function get() {
	      return this.bottomCSTNode.ctorName;
	    }
	  }, {
	    key: "topCSTNode",
	    get: function get() {
	      return this.cstNodes[0];
	    }
	  }, {
	    key: "bottomCSTNode",
	    get: function get() {
	      return this.cstNodes.slice(-1)[0];
	    }
	  }]);
	
	  return SimplifiedCSTNode;
	}();
	
	function registerSimplifyAction(semantics) {
	  var sameInterval = function sameInterval(a, b) {
	    return a.interval.contents === b.interval.contents;
	  };
	  var xor = function xor(a, b) {
	    return (a || b) && !(a && b);
	  };
	
	  semantics.addOperation("simplifyCST(simplifiedParentNode, nodeToSimplified)", {
	    _nonterminal: function _nonterminal(children) {
	      var simplifiedNode = undefined;
	      if (this.args.simplifiedParentNode && sameInterval(this.args.simplifiedParentNode.cstNodes[0], this) && !xor(this.isSyntactic(), this.args.simplifiedParentNode.bottomCSTNode.isSyntactic())) {
	        simplifiedNode = this.args.simplifiedParentNode;
	        simplifiedNode.cstNodes.push(this._node);
	      } else {
	        simplifiedNode = new SimplifiedCSTNode({
	          cstNodes: [this._node],
	          parent: this.args.simplifiedParentNode,
	          children: []
	        });
	
	        if (this.args.simplifiedParentNode && xor(this.isSyntactic(), this.args.simplifiedParentNode.bottomCSTNode.isSyntactic())) {
	          simplifiedNode.leaf = true;
	        }
	
	        if (this.args.simplifiedParentNode) {
	          this.args.simplifiedParentNode.children.push(simplifiedNode);
	        }
	      }
	
	      this.args.nodeToSimplified.set(this._node, simplifiedNode);
	
	      for (var i = 0; i < children.length; i++) {
	        var child = children[i];
	        if (child.constructor.name === "IterationNode") {
	          //makes iterations children of current node
	          //collect iterations for same interval
	          var run = [child];
	          var j = i + 1;
	          while (children[j].interval.contents === child.interval.contents) {
	            run.push(children[j]);
	            j++;
	          }
	
	          var runLength = run.length,
	              iterLength = run[0].length;
	          for (var k = 0; k < runLength * iterLength; k++) {
	            var iterIdx = k % runLength;
	            var childIdx = Math.floor(k / iterLength);
	
	            run[iterIdx].children[childIdx].simplifyCST(simplifiedNode, this.args.nodeToSimplified);
	          }
	
	          i = j - 1; //so that i++ = j
	        } else {
	            child.simplifyCST(simplifiedNode, this.args.nodeToSimplified);
	          }
	      }
	
	      return simplifiedNode;
	    },
	    _terminal: function _terminal() {
	      var simplifiedNode = undefined;
	      if (this.args.simplifiedParentNode && sameInterval(this, this.args.simplifiedParentNode.topCSTNode)) {
	        simplifiedNode = this.args.simplifiedParentNode;
	        simplifiedNode.cstNodes.push(this._node);
	      } else {
	        simplifiedNode = new SimplifiedCSTNode({
	          cstNodes: [this._node],
	          parent: this.args.simplifiedParentNode,
	          children: []
	        });
	        simplifiedNode.leaf = true;
	
	        if (this.args.simplifiedParentNode) {
	          this.args.simplifiedParentNode.children.push(simplifiedNode);
	        }
	      }
	
	      this.args.nodeToSimplified.set(this._node, simplifiedNode);
	      return simplifiedNode;
	    }
	  });
	}
	
	var toExport = {
	  registerSimplifyAction: registerSimplifyAction,
	  SimplifiedCSTNode: SimplifiedCSTNode
	};
	
	if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
	  module.exports = toExport;
	} else {
	  Object.assign(window, toExport);
	}

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var classes = __webpack_require__(26);
	
	var toExport = {
	  registerToAST: registerToAST
	};
	
	if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
	  module.exports = toExport;
	} else {
	  Object.assign(window, toExport);
	}
	
	function registerToAST(semantics) {
	  semantics.addOperation('toAST', {
	    // Program: function(stmts) {
	    //   return new classes.Program(stmts.toAST());
	    // },
	    //
	    // Stmts: function(ss, optE) {
	    //   var e = optE.toAST()[0];
	    //   return ss.toAST().concat(e ? new classes.ExpStmt(e) : []);
	    // },
	    //
	    // Stmt_classDecl: function(_class, C, _optExtends, optS, _optWith, optXs, _sc) {
	    //   return new classes.ClassDecl(
	    //     C.toAST(),
	    //     optS.toAST()[0] || 'Obj',
	    //     optXs.toAST()[0] || []);
	    // },
	    //
	    // Stmt_methodDeclJava: function(_def, C, _dot, m, _op, xs, _cp, b) {
	    //   return new classes.MethodDecl(
	    //     C.toAST(),
	    //     m.toAST(),
	    //     xs.toAST(),
	    //     b.toAST());
	    // },
	    //
	    // Stmt_methodDeclKeyword: function(_def, C, ms, _commas, xs, b) {
	    //   return new classes.MethodDecl(
	    //     C.toAST(),
	    //     ms.toAST().reduce((m, part) => m + part.charAt(0).toUpperCase() + part.substr(1)),
	    //     xs.toAST(),
	    //     b.toAST());
	    // },
	    //
	    // Stmt_methodDeclBinary: function(_def, C, m, x, b) {
	    //   return new classes.MethodDecl(
	    //     C.toAST(),
	    //     m.toAST(),
	    //     [x.toAST()],
	    //     b.toAST());
	    // },
	    //
	    // Stmt_methodDeclCall: function(_def, C, _op, xs, _cp, b) {
	    //   return new classes.MethodDecl(
	    //     C.toAST(),
	    //     'call',
	    //     xs.toAST(),
	    //     b.toAST());
	    // },
	    //
	    // Stmt_varDecl: function(_var, x, _eq, e, _sc) {
	    //   return new classes.VarDecl(x.toAST(), e.toAST());
	    // },
	    //
	    // Stmt_varAssign: function(x, _eq, e, _sc) {
	    //   return new classes.VarAssign(x.toAST(), e.toAST());
	    // },
	    //
	    // Stmt_instVarAssign: function(_this, _dot, x, _eq, e, _sc) {
	    //   return new classes.InstVarAssign(x.toAST(), e.toAST());
	    // },
	    //
	    // Stmt_return: function(_return, e, _sc) {
	    //   return new classes.Return(e.toAST());
	    // },
	    //
	    // Stmt_exp: function(e, _sc) {
	    //   return new classes.ExpStmt(e.toAST());
	    // },
	
	    MethodBody_exp: function MethodBody_exp(_eq, e, _sc) {
	      return [new classes.Return(e.toAST())];
	    },
	
	    MethodBody_stmt: function MethodBody_stmt(_oc, ss, _cc) {
	      return ss.toAST();
	    },
	
	    KWSendExp_send: function KWSendExp_send(e, ms, _colons, es) {
	      return new classes.Send(e.toAST(), ms.toAST().reduce(function (m, part) {
	        return m + part.charAt(0).toUpperCase() + part.substr(1);
	      }), es.toAST());
	    },
	
	    KWSendExp_super: function KWSendExp_super(_this, ms, _colons, es) {
	      return new classes.SuperSend(ms.toAST().reduce(function (m, part) {
	        return m + part.charAt(0).toUpperCase() + part.substr(1);
	      }), es.toAST());
	    },
	
	    EqExp_eq: function EqExp_eq(x, op, y) {
	      return new classes.BinOp(op.toAST(), x.toAST(), y.toAST());
	    },
	
	    RelExp_rel: function RelExp_rel(x, op, y) {
	      return new classes.BinOp(op.toAST(), x.toAST(), y.toAST());
	    },
	
	    AddExp_add: function AddExp_add(x, op, y) {
	      return new classes.BinOp(op.toAST(), x.toAST(), y.toAST());
	    },
	
	    MulExp_mul: function MulExp_mul(x, op, y) {
	      return new classes.BinOp(op.toAST(), x.toAST(), y.toAST());
	    },
	
	    DotExp_send: function DotExp_send(e, _dot, m, _op, es, _cp) {
	      return new classes.Send(e.toAST(), m.toAST(), es.toAST());
	    },
	
	    DotExp_super: function DotExp_super(_super, _dot, m, _op, es, _cp) {
	      return new classes.SuperSend(m.toAST(), es.toAST());
	    },
	
	    // DotExp_instVarAccess: function(_this, _dot, x) {
	    //   return new classes.InstVar(x.toAST());
	    // },
	
	    UnExp_neg: function UnExp_neg(_minus, x) {
	      return new classes.BinOp('-', new classes.Lit(0), x.toAST());
	    },
	
	    CallExp_call: function CallExp_call(b, _op, es, _cp) {
	      return new classes.Send(b.toAST(), 'call', es.toAST());
	    },
	
	    PriExp_paren: function PriExp_paren(_op, e, _cp) {
	      return e.toAST();
	    },
	
	    PriExp_block: function PriExp_block(_oc, xs, ss, _cc) {
	      return new classes.BlockLit(xs.toAST(), ss.toAST());
	    },
	
	    PriExp_new: function PriExp_new(_new, C, _op, es, _cp) {
	      return new classes.New(C.toAST(), es.toAST());
	    },
	
	    PriExp_str: function PriExp_str(s) {
	      return new classes.Lit(s.toAST());
	    },
	
	    PriExp_ident: function PriExp_ident(n) {
	      return new classes.Var(n.toAST());
	    },
	
	    PriExp_number: function PriExp_number(_) {
	      return new classes.Lit(parseFloat(this.interval.contents));
	    },
	
	    PriExp_this: function PriExp_this(_) {
	      return new classes.This();
	    },
	
	    PriExp_true: function PriExp_true(_) {
	      return new classes.Lit(true);
	    },
	
	    PriExp_false: function PriExp_false(_) {
	      return new classes.Lit(false);
	    },
	
	    PriExp_null: function PriExp_null(_) {
	      return new classes.Lit(null);
	    },
	
	    BlockArgNames_some: function BlockArgNames_some(xs, _bar) {
	      return xs.toAST();
	    },
	
	    BlockArgNames_none: function BlockArgNames_none() {
	      return [];
	    },
	
	    ident: function ident(_first, _rest) {
	      return this.interval.contents;
	    },
	
	    string: function string(_oq, cs, _cq) {
	      var chars = [];
	      var idx = 0;
	      cs = cs.toAST();
	      while (idx < cs.length) {
	        var c = cs[idx++];
	        if (c === '\\' && idx < cs.length) {
	          c = cs[idx++];
	          switch (c) {
	            case 'n':
	              c = '\n';break;
	            case 't':
	              c = '\t';break;
	            default:
	              idx--;
	          }
	        }
	        chars.push(c);
	      }
	      return chars.join('');
	    },
	
	    NonemptyListOf: function NonemptyListOf(x, _seps, xs) {
	      return [x.toAST()].concat(xs.toAST());
	    },
	
	    EmptyListOf: function EmptyListOf() {
	      return [];
	    }
	
	  });
	}

/***/ },
/* 26 */
/***/ function(module, exports) {

	'use strict';
	
	// ---------------------------------------------------------
	// "Classes" that represent AST nodes
	// ---------------------------------------------------------
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var AST = function AST() {
	  _classCallCheck(this, AST);
	};
	
	var Program = function (_AST) {
	  _inherits(Program, _AST);
	
	  function Program(ss) {
	    _classCallCheck(this, Program);
	
	    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Program).call(this));
	
	    _this.ss = ss;
	    return _this;
	  }
	
	  return Program;
	}(AST);
	
	// Statements
	
	var Stmt = function (_AST2) {
	  _inherits(Stmt, _AST2);
	
	  function Stmt() {
	    _classCallCheck(this, Stmt);
	
	    return _possibleConstructorReturn(this, Object.getPrototypeOf(Stmt).call(this));
	  }
	
	  return Stmt;
	}(AST);
	
	var ClassDecl = function (_Stmt) {
	  _inherits(ClassDecl, _Stmt);
	
	  function ClassDecl(C, S, xs) {
	    _classCallCheck(this, ClassDecl);
	
	    var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(ClassDecl).call(this));
	
	    _this3.C = C;
	    _this3.S = S;
	    _this3.xs = xs;
	    return _this3;
	  }
	
	  return ClassDecl;
	}(Stmt);
	
	var MethodDecl = function (_Stmt2) {
	  _inherits(MethodDecl, _Stmt2);
	
	  function MethodDecl(C, m, xs, ss) {
	    _classCallCheck(this, MethodDecl);
	
	    var _this4 = _possibleConstructorReturn(this, Object.getPrototypeOf(MethodDecl).call(this));
	
	    _this4.C = C;
	    _this4.m = m;
	    _this4.xs = xs;
	    _this4.ss = ss;
	    return _this4;
	  }
	
	  return MethodDecl;
	}(Stmt);
	
	var VarDecl = function (_Stmt3) {
	  _inherits(VarDecl, _Stmt3);
	
	  function VarDecl(x, e) {
	    _classCallCheck(this, VarDecl);
	
	    var _this5 = _possibleConstructorReturn(this, Object.getPrototypeOf(VarDecl).call(this));
	
	    _this5.x = x;
	    _this5.e = e;
	    return _this5;
	  }
	
	  return VarDecl;
	}(Stmt);
	
	var VarAssign = function (_Stmt4) {
	  _inherits(VarAssign, _Stmt4);
	
	  function VarAssign(x, e) {
	    _classCallCheck(this, VarAssign);
	
	    var _this6 = _possibleConstructorReturn(this, Object.getPrototypeOf(VarAssign).call(this));
	
	    _this6.x = x;
	    _this6.e = e;
	    return _this6;
	  }
	
	  return VarAssign;
	}(Stmt);
	
	var InstVarAssign = function (_Stmt5) {
	  _inherits(InstVarAssign, _Stmt5);
	
	  function InstVarAssign(x, e) {
	    _classCallCheck(this, InstVarAssign);
	
	    var _this7 = _possibleConstructorReturn(this, Object.getPrototypeOf(InstVarAssign).call(this));
	
	    _this7.x = x;
	    _this7.e = e;
	    return _this7;
	  }
	
	  return InstVarAssign;
	}(Stmt);
	
	var Return = function (_Stmt6) {
	  _inherits(Return, _Stmt6);
	
	  function Return(e) {
	    _classCallCheck(this, Return);
	
	    var _this8 = _possibleConstructorReturn(this, Object.getPrototypeOf(Return).call(this));
	
	    _this8.e = e;
	    return _this8;
	  }
	
	  return Return;
	}(Stmt);
	
	var ExpStmt = function (_Stmt7) {
	  _inherits(ExpStmt, _Stmt7);
	
	  function ExpStmt(e) {
	    _classCallCheck(this, ExpStmt);
	
	    var _this9 = _possibleConstructorReturn(this, Object.getPrototypeOf(ExpStmt).call(this));
	
	    _this9.e = e;
	    return _this9;
	  }
	
	  return ExpStmt;
	}(Stmt);
	
	// Expressions
	
	var Exp = function (_AST3) {
	  _inherits(Exp, _AST3);
	
	  function Exp() {
	    _classCallCheck(this, Exp);
	
	    return _possibleConstructorReturn(this, Object.getPrototypeOf(Exp).call(this));
	  }
	
	  return Exp;
	}(AST);
	
	var Lit = function (_Exp) {
	  _inherits(Lit, _Exp);
	
	  function Lit(primValue) {
	    _classCallCheck(this, Lit);
	
	    var _this11 = _possibleConstructorReturn(this, Object.getPrototypeOf(Lit).call(this));
	
	    _this11.primValue = primValue;
	    return _this11;
	  }
	
	  return Lit;
	}(Exp);
	
	var Var = function (_Exp2) {
	  _inherits(Var, _Exp2);
	
	  function Var(x) {
	    _classCallCheck(this, Var);
	
	    var _this12 = _possibleConstructorReturn(this, Object.getPrototypeOf(Var).call(this));
	
	    _this12.x = x;
	    return _this12;
	  }
	
	  return Var;
	}(Exp);
	
	var BinOp = function (_Exp3) {
	  _inherits(BinOp, _Exp3);
	
	  function BinOp(op, e1, e2) {
	    _classCallCheck(this, BinOp);
	
	    var _this13 = _possibleConstructorReturn(this, Object.getPrototypeOf(BinOp).call(this));
	
	    _this13.op = op;
	    _this13.e1 = e1;
	    _this13.e2 = e2;
	    return _this13;
	  }
	
	  return BinOp;
	}(Exp);
	
	var This = function (_Exp4) {
	  _inherits(This, _Exp4);
	
	  function This() {
	    _classCallCheck(this, This);
	
	    return _possibleConstructorReturn(this, Object.getPrototypeOf(This).call(this));
	  }
	
	  return This;
	}(Exp);
	
	var InstVar = function (_Exp5) {
	  _inherits(InstVar, _Exp5);
	
	  function InstVar(x) {
	    _classCallCheck(this, InstVar);
	
	    var _this15 = _possibleConstructorReturn(this, Object.getPrototypeOf(InstVar).call(this));
	
	    _this15.x = x;
	    return _this15;
	  }
	
	  return InstVar;
	}(Exp);
	
	var New = function (_Exp6) {
	  _inherits(New, _Exp6);
	
	  function New(C, es) {
	    _classCallCheck(this, New);
	
	    var _this16 = _possibleConstructorReturn(this, Object.getPrototypeOf(New).call(this));
	
	    _this16.C = C;
	    _this16.es = es;
	    return _this16;
	  }
	
	  return New;
	}(Exp);
	
	var Send = function (_Exp7) {
	  _inherits(Send, _Exp7);
	
	  function Send(erecv, m, es) {
	    _classCallCheck(this, Send);
	
	    var _this17 = _possibleConstructorReturn(this, Object.getPrototypeOf(Send).call(this));
	
	    _this17.erecv = erecv;
	    _this17.m = m;
	    _this17.es = es;
	    return _this17;
	  }
	
	  return Send;
	}(Exp);
	
	var SuperSend = function (_Exp8) {
	  _inherits(SuperSend, _Exp8);
	
	  function SuperSend(m, es) {
	    _classCallCheck(this, SuperSend);
	
	    var _this18 = _possibleConstructorReturn(this, Object.getPrototypeOf(SuperSend).call(this));
	
	    _this18.m = m;
	    _this18.es = es;
	    return _this18;
	  }
	
	  return SuperSend;
	}(Exp);
	
	var BlockLit = function (_AST4) {
	  _inherits(BlockLit, _AST4);
	
	  function BlockLit(xs, ss) {
	    _classCallCheck(this, BlockLit);
	
	    var _this19 = _possibleConstructorReturn(this, Object.getPrototypeOf(BlockLit).call(this));
	
	    _this19.xs = xs;
	    _this19.ss = ss;
	    return _this19;
	  }
	
	  return BlockLit;
	}(AST);
	
	var toExport = {
	  AST: AST,
	  Program: Program,
	  Stmt: Stmt,
	  ClassDecl: ClassDecl,
	  MethodDecl: MethodDecl,
	  VarDecl: VarDecl,
	  VarAssign: VarAssign,
	  InstVarAssign: InstVarAssign,
	  Return: Return,
	  ExpStmt: ExpStmt,
	  Exp: Exp,
	  Lit: Lit,
	  Var: Var,
	  BinOp: BinOp,
	  This: This,
	  InstVar: InstVar,
	  New: New,
	  Send: Send,
	  SuperSend: SuperSend,
	  BlockLit: BlockLit
	};
	
	if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
	  module.exports = toExport;
	} else {
	  Object.assign(window, toExport);
	}

/***/ },
/* 27 */
/***/ function(module, exports) {

	"use strict";
	
	var toExport = {
	  grammarSlice: grammarSlice
	};
	
	if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
	  module.exports = toExport;
	} else {
	  Object.assign(window, toExport);
	}
	
	function grammarSlice(grammar, relevantRules) {
	  var bodies = relevantRules.map(function (rule) {
	    return grammar.ruleBodies[rule].definitionInterval.contents;
	  });
	  var intervals = [];
	  var _iteratorNormalCompletion = true;
	  var _didIteratorError = false;
	  var _iteratorError = undefined;
	
	  try {
	    for (var _iterator = bodies[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	      var body = _step.value;
	
	      var startIdx = intervals.length > 0 ? intervals.slice(-1)[0].endIdx + 2 : 0,
	          endIdx = startIdx + body.length,
	          contents = body;
	      intervals.push({
	        startIdx: startIdx,
	        endIdx: endIdx,
	        contents: contents
	      });
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
	
	  return [bodies.join("\n\n"), intervals];
	}

/***/ }
]);
//# sourceMappingURL=semanticEditor.bundle.js.map