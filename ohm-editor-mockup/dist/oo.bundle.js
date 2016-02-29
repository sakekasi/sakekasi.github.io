webpackJsonp([1],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	__webpack_require__(1);
	__webpack_require__(16);

/***/ },
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */,
/* 13 */,
/* 14 */,
/* 15 */,
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	//maybe we want to do this using WebComponents
	'use strict';
	
	var $ = __webpack_require__(6);
	var reify = __webpack_require__(17),
	    mapSemantics = __webpack_require__(18),
	    simplifyCST = __webpack_require__(19),
	    language = __webpack_require__(10),
	    TreeViz = __webpack_require__(20).TreeViz,
	    treeUtils = __webpack_require__(23),
	    toAST = __webpack_require__(24); //TODO: make this language agnostic
	
	var _ = function _(x) {
	  return Array.prototype.slice.call(x);
	};
	
	var domToOhm, ohmToDom, nodeToSimplified, nodeToResults, treeVisualization;
	
	document.addEventListener("DOMContentLoaded", function (event) {
	  var grammar = language.grammar,
	      semantics = language.semantics;
	
	  //register semantic actions
	  reify.registerReifyActions(semantics);
	  mapSemantics.registerMapSemantics(grammar, semantics);
	  simplifyCST.registerSimplifyAction(semantics);
	
	  toAST.registerToAST(semantics);
	
	  //get semantics match
	  var exampleNode = document.querySelector('pre#example');
	  var example = exampleNode.textContent;
	  var match = undefined;
	  var semmatch = undefined;
	  try {
	    match = grammar.match(example);
	    semmatch = semantics(match);
	  } catch (e) {
	    console.error(match.message);
	  }
	
	  //reify the CST to DOM
	  var reified = reify.reify(semantics, match);
	  var DOM = reified[0];
	  domToOhm = reified[1];
	  ohmToDom = reified[2];
	
	  exampleNode.textContent = "";
	  exampleNode.appendChild(DOM);
	
	  //generate simplified CST
	  nodeToSimplified = new Map();
	  var simplifiedCST = semmatch.simplifyCST(null, nodeToSimplified);
	  nodeToResults = mapSemantics.mapSemantics(semantics, "toAST", match);
	
	  var _iteratorNormalCompletion = true;
	  var _didIteratorError = false;
	  var _iteratorError = undefined;
	
	  try {
	    for (var _iterator = ohmToDom.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	      var key = _step.value;
	
	      var domNode = ohmToDom.get(key);
	      var simplifiedNode = nodeToSimplified.get(key);
	
	      if (!(key.constructor.name === "TerminalNode")) {
	        if (nodeToResults.has(key)) {
	          var result = nodeToResults.get(key);
	
	          ohmToDom.get(simplifiedNode.cstNodes[0]).setAttribute("possibleCurrent", "true");
	
	          key.result = result;
	          domNode.setAttribute("result", result instanceof Error ? "error" : "success");
	        }
	      } else {
	        var parent = domNode.parentNode;
	        if (Array.prototype.slice.call(parent.children).find(function (child) {
	          return child.tagName.toLowerCase() !== "terminal";
	        })) {
	          domNode.classList.add("landmark");
	          simplifiedNode.landmark = true;
	        }
	      }
	    }
	
	    //setup "exploding" behaviour
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
	
	  DOM.classList.add("current");
	  nodeToSimplified.get(domToOhm.get(DOM)).current = true;
	
	  treeVisualization = new TreeViz(document.querySelector("svg"), simplifiedCST, ohmToDom, {
	    splitNode: splitNode,
	    joinNode: joinNode,
	    highlightNode: highlightNode,
	    unHighlightNode: unHighlightNode
	  });
	
	  DOM.addEventListener("click", memobind1(onClick, DOM));
	  DOM.addEventListener("mouseover", memobind1(onMouseover, DOM));
	  DOM.addEventListener("mouseout", memobind1(onMouseout, DOM));
	});
	
	var memo = new Map();
	function memobind1(fn, arg) {
	  if (memo.has(fn) && memo.get(fn).has(arg)) {
	    return memo.get(fn).get(arg);
	  } else {
	    var bound = fn.bind(null, arg);
	    if (!memo.has(fn)) {
	      memo.set(fn, new Map());
	    }
	
	    memo.get(fn).set(arg, bound);
	    return bound;
	  }
	}
	
	//EVENT LISTENERS
	function onClick(currentNode, event) {
	  var currentSimplified = nodeToSimplified.get(domToOhm.get(currentNode));
	  if (event.altKey || event.ctrlKey) {
	    currentSimplified = currentSimplified.parent || currentSimplified;
	    joinNode(currentSimplified);
	  } else {
	    splitNode(currentSimplified);
	  }
	  event.stopPropagation();
	}
	
	function onMouseover(currentNode, event) {
	  var currentSimplified = nodeToSimplified.get(domToOhm.get(currentNode));
	  highlightNode(currentSimplified);
	}
	
	function onMouseout(currentNode, event) {
	  var currentSimplified = nodeToSimplified.get(domToOhm.get(currentNode));
	  unHighlightNode(currentSimplified);
	}
	
	function makeCurrent(simplifiedCSTNode) {
	  var domNode = ohmToDom.get(simplifiedCSTNode.cstNodes[0]);
	  domNode.classList.add("current");
	
	  domNode.addEventListener("click", memobind1(onClick, domNode));
	  domNode.addEventListener("mouseover", memobind1(onMouseover, domNode));
	  domNode.addEventListener("mouseout", memobind1(onMouseout, domNode));
	}
	
	function makeNonCurrent(simplifiedCSTNode) {
	  var domNode = ohmToDom.get(simplifiedCSTNode.cstNodes[0]);
	  domNode.classList.remove("current");
	
	  domNode.removeEventListener("click", memobind1(onClick, domNode));
	  domNode.removeEventListener("mouseover", memobind1(onMouseover, domNode));
	  domNode.removeEventListener("mouseout", memobind1(onMouseout, domNode));
	
	  onMouseout(domNode);
	}
	
	//VISUALIZATION OPERATIONS
	function splitNode(simplifiedCSTNode) {
	  var children = simplifiedCSTNode._children ? simplifiedCSTNode._children : simplifiedCSTNode.children;
	
	  if (children && children.length > 0) {
	    //make cst node's children current
	    simplifiedCSTNode.current = false;
	    makeNonCurrent(simplifiedCSTNode);
	
	    //make corresponding dom node's children current
	    children.forEach(function (child) {
	      return child.current = true;
	    });
	    children.forEach(makeCurrent);
	
	    //split tree visualization
	    treeVisualization.split(simplifiedCSTNode);
	  }
	}
	
	function joinNode(simplifiedCSTNode) {
	  var descendants = treeUtils.descendants(simplifiedCSTNode, function (child) {
	    return child._children ? child._children : child.children;
	  });
	
	  //remove cst node's children's noncurrent
	  descendants.forEach(function (child) {
	    return child.current = false;
	  });
	  descendants.forEach(makeNonCurrent);
	
	  //make corresponding dom node current
	  simplifiedCSTNode.current = true;
	  makeCurrent(simplifiedCSTNode);
	
	  //join tree visualization
	  treeVisualization.join(simplifiedCSTNode);
	}
	
	function highlightNode(simplifiedCSTNode) {
	  //highlight corresponding dom node
	  var domNode = ohmToDom.get(simplifiedCSTNode.cstNodes[0]);
	  domNode.classList.add("active");
	
	  //highlight tree visualization
	  treeVisualization.highlight(simplifiedCSTNode);
	}
	
	function unHighlightNode(simplifiedCSTNode) {
	  //unhighlight corresponding dom node
	  var domNode = ohmToDom.get(simplifiedCSTNode.cstNodes[0]);
	  domNode.classList.remove("active");
	
	  //unhighlight tree viz
	  treeVisualization.unHighlight(simplifiedCSTNode);
	}

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var util = __webpack_require__(2);
	
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
/* 18 */
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
	
	function registerMapSemantics(grammar, semantics) {
	  semantics.addOperation("mapSemantics(action, nodeToResults)", {
	    _nonterminal: function _nonterminal(children) {
	      var _this = this;
	
	      var examplePiece = this.interval.contents;
	
	      var result = undefined;
	      try {
	        var match = grammar.match(examplePiece, this._node.ctorName);
	        result = semantics(match)[this.args.action]();
	      } catch (e) {
	        // console.error(e);
	        result = e; //new Error(`${this._node.ctorName}: ${this.interval.contents}`);
	      }
	
	      this.args.nodeToResults.set(this._node, result);
	
	      children.forEach(function (child) {
	        return child.mapSemantics(_this.args.action, _this.args.nodeToResults);
	      });
	    }
	  });
	}
	
	function mapSemantics(semantics, action, match) {
	  var nodeToResults = new Map();
	
	  semantics(match).mapSemantics(action, nodeToResults);
	
	  return nodeToResults;
	}

/***/ },
/* 19 */
/***/ function(module, exports) {

	'use strict';
	
	var toExport = {
	  registerSimplifyAction: registerSimplifyAction
	};
	
	if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
	  module.exports = toExport;
	} else {
	  Object.assign(window, toExport);
	}
	
	function registerSimplifyAction(semantics) {
	  semantics.addOperation("simplifyCST(simplifiedParentNode, nodeToSimplified)", {
	    _nonterminal: function _nonterminal(children) {
	      var simplifiedNode = undefined;
	      if (this.args.simplifiedParentNode && this.args.simplifiedParentNode.cstNodes[0].interval.contents === this.interval.contents) {
	        simplifiedNode = this.args.simplifiedParentNode;
	        simplifiedNode.cstNodes.push(this._node);
	        simplifiedNode.ctorName = this._node.ctorName;
	      } else {
	        simplifiedNode = {
	          ctorName: this._node.ctorName,
	          cstNodes: [this._node],
	          parent: this.args.simplifiedParentNode,
	          children: []
	        };
	
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
	      if (this.args.simplifiedParentNode && this.args.simplifiedParentNode.cstNodes[0].interval.contents === this.interval.contents) {
	        simplifiedNode = this.args.simplifiedParentNode;
	        simplifiedNode.cstNodes.push(this._node);
	        simplifiedNode.ctorName = "terminal";
	      } else {
	        simplifiedNode = {
	          ctorName: "terminal",
	          cstNodes: [this._node],
	          parent: this.args.simplifiedParentNode,
	          children: []
	        };
	
	        if (this.args.simplifiedParentNode) {
	          this.args.simplifiedParentNode.children.push(simplifiedNode);
	        }
	      }
	
	      this.args.nodeToSimplified.set(this._node, simplifiedNode);
	      return simplifiedNode;
	    }
	  });
	}

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var textures = __webpack_require__(21);
	
	var treeUtils = __webpack_require__(23);
	
	var duration = 100;
	var curId = 0;
	
	var TreeViz = function () {
	  function TreeViz(svg, root, ohmToDom, actions) {
	    _classCallCheck(this, TreeViz);
	
	    this.ohmToDom = ohmToDom;
	    this.actions = actions;
	
	    this.svg = d3.select(svg);
	
	    this.texture = textures.lines().size(3).strokeWidth(1).stroke("hsla(0, 0%, 0%, 0.5)").background("hsla(0, 0%, 0%, 0.2)");
	
	    this.svg.call(this.texture);
	
	    this.svg = this.svg.append("g").attr("transform", "translate(10, 10)");
	
	    var boundingRect = svg.getBoundingClientRect();
	    this.width = boundingRect.width - 50;
	    this.height = boundingRect.height - 50;
	
	    this.tree = d3.layout.tree().children(function (n) {
	      if (n.children && !n.hasOwnProperty('_children')) {
	        n._children = n.children;
	      }
	
	      if (n._children && n._children.length > 0) {
	        var descendants = treeUtils.descendants(n, function (child) {
	          if (child.children && !child._children) {
	            child._children = child.children;
	          }
	
	          return child._children;
	        });
	
	        if (descendants.reduce(function (a, b) {
	          return b.current || a;
	        }, false)) {
	          return n._children;
	        }
	      }
	
	      return null;
	    }).size([this.height, this.width]);
	
	    this.voronoi = d3.geom.voronoi().x(function (d) {
	      return d.y;
	    }).y(function (d) {
	      return d.x;
	    }).clipExtent([[-10, -10], [this.width, this.height]]);
	
	    this.root = root;
	    this.root.x0 = this.height / 2;
	    this.root.y0 = 0;
	
	    this.update(root);
	  }
	
	  _createClass(TreeViz, [{
	    key: "update",
	    value: function update(parent) {
	      var _this = this;
	
	      var nodes = this.tree.nodes(this.root),
	          //.reverse(),
	      links = this.tree.links(nodes);
	
	      var svgNode = this.svg.selectAll("g.node").data(nodes, function (d) {
	        //assign each object an id since d3 can't do object equality apparently :/
	        if (d.id) {
	          return d.id;
	        } else {
	          d.id = curId++;
	          return d.id;
	        }
	      });
	
	      var svgNodeEnter = svgNode.enter().append("g").attr("class", "node").attr("transform", "translate(" + parent.y0 + ", " + parent.x0 + ")").attr("id", function (d) {
	        return d.id;
	      }).append("circle").attr("r", function (node) {
	        return node.landmark ? 3 : 5;
	      });
	
	      var treeviz = this;
	      var svgNodeUpdate = svgNode.on("mouseover", function (datum) {
	        treeviz.actions.highlightNode(datum);
	      }, true).on("mouseout", function (datum) {
	        treeviz.actions.unHighlightNode(datum);
	      }, true).on("click", function (datum) {
	        if (d3.event.altKey || d3.event.ctrlKey) {
	          treeviz.actions.joinNode(datum);
	        } else if (datum.current) {
	          treeviz.actions.splitNode(datum);
	        }
	      }, true).transition().duration(duration).attr("transform", function (n) {
	        return "translate(" + n.y + ", " + n.x + ")";
	      }).style("fill", function (n) {
	        if (n.landmark) {
	          return "hsla(0, 0%, 0%, 0.7)";
	          // console.log(this.texture.url());
	          return _this.texture.url();
	        } else if (n.cstNodes[0].result instanceof Error) {
	          return "red";
	        } else {
	          return "green";
	        }
	      });
	
	      var svgNodeExit = svgNode.exit().transition().duration(duration).attr("transform", function (n) {
	        return "translate(" + parent.y0 + ", " + parent.x0 + ")";
	      }).remove();
	
	      var polygon = function polygon(d) {
	        return "M" + d.join("L") + "Z";
	      };
	
	      //Create the Voronoi grid
	      var paths = this.svg.selectAll("path").data(this.voronoi(nodes));
	
	      paths.enter().append("path");
	      paths.exit().remove();
	
	      paths.attr("d", function (d, i) {
	        return "M" + d.join("L") + "Z";
	      }).datum(function (d, i) {
	        return d.point;
	      })
	      //Give each cell a unique class where the unique part corresponds to the circle classes
	      .attr("class", function (d, i) {
	        return "voronoi " + d.CountryCode;
	      })
	      // .style("stroke", "#2074A0") //If you want to look at the cells
	      .style("fill", "none").style("pointer-events", "all").on("mouseover", function (datum) {
	        treeviz.actions.highlightNode(datum);
	      }).on("mouseout", function (datum) {
	        treeviz.actions.unHighlightNode(datum);
	      }).on("click", function (datum) {
	        if (d3.event.altKey || d3.event.ctrlKey) {
	          treeviz.actions.joinNode(datum);
	        } else if (datum.current) {
	          treeviz.actions.splitNode(datum);
	        }
	      }, true);
	
	      nodes.forEach(function (n) {
	        n.x0 = n.x;
	        n.y0 = n.y;
	      });
	    }
	  }, {
	    key: "split",
	    value: function split(node) {
	      // node.clicked = true;
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
	      d3.select("g.node[id=\"" + node.id + "\"]").selectAll("circle").transition().duration(duration).attr("r", 8);
	    }
	  }, {
	    key: "unHighlight",
	    value: function unHighlight(node) {
	      d3.select("g.node[id=\"" + node.id + "\"]").selectAll("circle").transition().duration(duration).attr("r", node.landmark ? 3 : 5);
	    }
	  }]);
	
	  return TreeViz;
	}();
	
	var toExport = {
	  TreeViz: TreeViz
	};
	
	if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
	  module.exports = toExport;
	} else {
	  Object.assign(window, toExport);
	}

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(22)


/***/ },
/* 22 */
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
/* 23 */
/***/ function(module, exports) {

	'use strict';
	
	var toExport = {
	  descendants: descendants
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

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var classes = __webpack_require__(25);
	
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
	    Program: function Program(stmts) {
	      return new classes.Program(stmts.toAST());
	    },
	
	    Stmts: function Stmts(ss, optE) {
	      var e = optE.toAST()[0];
	      return ss.toAST().concat(e ? new classes.ExpStmt(e) : []);
	    },
	
	    Stmt_classDecl: function Stmt_classDecl(_class, C, _optExtends, optS, _optWith, optXs, _sc) {
	      return new classes.ClassDecl(C.toAST(), optS.toAST()[0] || 'Obj', optXs.toAST()[0] || []);
	    },
	
	    Stmt_methodDeclJava: function Stmt_methodDeclJava(_def, C, _dot, m, _op, xs, _cp, b) {
	      return new classes.MethodDecl(C.toAST(), m.toAST(), xs.toAST(), b.toAST());
	    },
	
	    Stmt_methodDeclKeyword: function Stmt_methodDeclKeyword(_def, C, ms, _commas, xs, b) {
	      return new classes.MethodDecl(C.toAST(), ms.toAST().reduce(function (m, part) {
	        return m + part.charAt(0).toUpperCase() + part.substr(1);
	      }), xs.toAST(), b.toAST());
	    },
	
	    Stmt_methodDeclBinary: function Stmt_methodDeclBinary(_def, C, m, x, b) {
	      return new classes.MethodDecl(C.toAST(), m.toAST(), [x.toAST()], b.toAST());
	    },
	
	    Stmt_methodDeclCall: function Stmt_methodDeclCall(_def, C, _op, xs, _cp, b) {
	      return new classes.MethodDecl(C.toAST(), 'call', xs.toAST(), b.toAST());
	    },
	
	    Stmt_varDecl: function Stmt_varDecl(_var, x, _eq, e, _sc) {
	      return new classes.VarDecl(x.toAST(), e.toAST());
	    },
	
	    Stmt_varAssign: function Stmt_varAssign(x, _eq, e, _sc) {
	      return new classes.VarAssign(x.toAST(), e.toAST());
	    },
	
	    Stmt_instVarAssign: function Stmt_instVarAssign(_this, _dot, x, _eq, e, _sc) {
	      return new classes.InstVarAssign(x.toAST(), e.toAST());
	    },
	
	    Stmt_return: function Stmt_return(_return, e, _sc) {
	      return new classes.Return(e.toAST());
	    },
	
	    Stmt_exp: function Stmt_exp(e, _sc) {
	      return new classes.ExpStmt(e.toAST());
	    },
	
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
/* 25 */
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

/***/ }
]);
//# sourceMappingURL=oo.bundle.js.map