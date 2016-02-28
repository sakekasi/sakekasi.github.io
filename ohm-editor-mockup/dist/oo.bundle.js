webpackJsonp([1],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

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
	    language = __webpack_require__ (10),
	    TreeViz = __webpack_require__(20).TreeViz,
	    treeUtils = __webpack_require__(21),
	
	    toAST = __webpack_require__(22); //TODO: make this language agnostic
	
	var _ = function(x){ return Array.prototype.slice.call(x)};
	
	var domToOhm, ohmToDom, nodeToSimplified, nodeToResults, treeVisualization;
	
	document.addEventListener("DOMContentLoaded", function(event) {
	  let grammar = language.grammar,
	      semantics = language.semantics;
	
	  //register semantic actions
	  reify.registerReifyActions(semantics);
	  mapSemantics.registerMapSemantics(grammar, semantics);
	  simplifyCST.registerSimplifyAction(semantics);
	
	  toAST.registerToAST(semantics);
	
	  //get semantics match
	  let exampleNode = document.querySelector('pre#example');
	  let example = exampleNode.textContent;
	  let match;
	  let semmatch;
	  try {
	    match = grammar.match(example);
	    semmatch = semantics(match);
	  } catch (e) {
	    console.error(match.message);
	  }
	
	
	  //reify the CST to DOM
	  let reified = reify.reify(semantics, match);
	  let DOM = reified[0];
	  domToOhm = reified[1];
	  ohmToDom = reified[2];
	
	  exampleNode.textContent = "";
	  exampleNode.appendChild(DOM);
	
	  //generate simplified CST
	  nodeToSimplified = new Map();
	  let simplifiedCST = semmatch.simplifyCST(null, nodeToSimplified);
	  nodeToResults = mapSemantics.mapSemantics(semantics, "toAST", match);
	
	  for(let key of ohmToDom.keys()){
	    let domNode = ohmToDom.get(key);
	    let simplifiedNode = nodeToSimplified.get(key);
	
	    if(! (key.constructor.name === "TerminalNode")){
	      if(nodeToResults.has(key)){
	        let result = nodeToResults.get(key);
	
	        ohmToDom.get(simplifiedNode.cstNodes[0]).setAttribute("possibleCurrent", "true");
	
	        key.result = result;
	        domNode.setAttribute("result", result instanceof Error? "error": "success");
	      }
	    } else {
	      let parent = domNode.parentNode;
	      if( Array.prototype.slice.call(parent.children).find(child=> child.tagName.toLowerCase() !== "terminal")  ){
	        domNode.classList.add("landmark");
	        simplifiedNode.landmark = true;
	      }
	    }
	  }
	
	  //setup "exploding" behaviour
	  DOM.classList.add("current");
	  nodeToSimplified.get(domToOhm.get(DOM)).current = true;
	
	  treeVisualization = new TreeViz(
	    document.querySelector("svg"),
	    simplifiedCST,
	    ohmToDom,
	    {
	      splitNode,
	      joinNode,
	      highlightNode,
	      unHighlightNode
	    }
	  );
	
	  DOM.addEventListener("click", memobind1(onClick, DOM));
	  DOM.addEventListener("mouseover", memobind1(onMouseover, DOM));
	  DOM.addEventListener("mouseout", memobind1(onMouseout, DOM));
	
	
	});
	
	let memo = new Map();
	function memobind1(fn, arg){
	  if(memo.has(fn) && memo.get(fn).has(arg)){
	    return memo.get(fn).get(arg);
	  } else {
	    let bound = fn.bind(null, arg);
	    if( !memo.has(fn) ){
	      memo.set(fn, new Map());
	    }
	
	    memo.get(fn).set(arg, bound);
	    return bound;
	  }
	}
	
	//EVENT LISTENERS
	function onClick(currentNode, event){
	  let currentSimplified = nodeToSimplified.get(domToOhm.get(currentNode));
	  if(event.altKey || event.ctrlKey){
	    currentSimplified = currentSimplified.parent || currentSimplified;
	    joinNode(currentSimplified);
	  } else {
	    splitNode(currentSimplified);
	  }
	  event.stopPropagation();
	}
	
	function onMouseover(currentNode, event){
	  let currentSimplified = nodeToSimplified.get(domToOhm.get(currentNode));
	  highlightNode(currentSimplified);
	}
	
	function onMouseout(currentNode, event){
	  let currentSimplified = nodeToSimplified.get(domToOhm.get(currentNode));
	  unHighlightNode(currentSimplified);
	}
	
	function makeCurrent(simplifiedCSTNode){
	  let domNode = ohmToDom.get(simplifiedCSTNode.cstNodes[0]);
	  domNode.classList.add("current");
	
	  domNode.addEventListener("click", memobind1(onClick, domNode));
	  domNode.addEventListener("mouseover", memobind1(onMouseover, domNode));
	  domNode.addEventListener("mouseout", memobind1(onMouseout, domNode));
	}
	
	function makeNonCurrent(simplifiedCSTNode){
	  let domNode = ohmToDom.get(simplifiedCSTNode.cstNodes[0]);
	  domNode.classList.remove("current");
	
	  domNode.removeEventListener("click", memobind1(onClick, domNode));
	  domNode.removeEventListener("mouseover", memobind1(onMouseover, domNode));
	  domNode.removeEventListener("mouseout", memobind1(onMouseout, domNode));
	
	  onMouseout(domNode);
	}
	
	
	//VISUALIZATION OPERATIONS
	function splitNode(simplifiedCSTNode){
	  let children = simplifiedCSTNode._children? simplifiedCSTNode._children: simplifiedCSTNode.children;
	
	  if(children && children.length > 0){
	    //make cst node's children current
	    simplifiedCSTNode.current = false;
	    makeNonCurrent(simplifiedCSTNode);
	
	    //make corresponding dom node's children current
	    children.forEach(child=> child.current = true);
	    children.forEach(makeCurrent);
	
	    //split tree visualization
	    treeVisualization.split(simplifiedCSTNode);
	  }
	}
	
	function joinNode(simplifiedCSTNode){
	  let descendants = treeUtils.descendants(simplifiedCSTNode, (child)=>
	    child._children? child._children: child.children);
	
	  //remove cst node's children's noncurrent
	  descendants.forEach(child=> child.current = false);
	  descendants.forEach(makeNonCurrent);
	
	  //make corresponding dom node current
	  simplifiedCSTNode.current = true;
	  makeCurrent(simplifiedCSTNode);
	
	  //join tree visualization
	  treeVisualization.join(simplifiedCSTNode);
	}
	
	function highlightNode(simplifiedCSTNode){
	  //highlight corresponding dom node
	  let domNode = ohmToDom.get(simplifiedCSTNode.cstNodes[0]);
	  domNode.classList.add("active");
	
	  //highlight tree visualization
	  treeVisualization.highlight(simplifiedCSTNode);
	}
	
	function unHighlightNode(simplifiedCSTNode){
	  //unhighlight corresponding dom node
	  let domNode = ohmToDom.get(simplifiedCSTNode.cstNodes[0]);
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
	  registerReifyActions,
	  reify
	};
	
	if(typeof module !== "undefined" && typeof module.exports !== "undefined"){
	  module.exports = toExport;
	} else {
	  Object.assign(window, toExport);
	}
	
	function closeTag(tagName){
	  return `</${tagName}>`;
	}
	
	function openTag(tagName){
	  return `<${tagName}>`;
	}
	
	function registerReifyActions(semantics){
	  semantics.addOperation("reifyAST(tagPositions)", {
	    _nonterminal(children){
	      let start = this.interval.startIdx,
	          end = this.interval.endIdx;
	      let tagName = this._node.ctorName;
	
	      getWithInit(this.args.tagPositions, start, []).push(openTag(tagName));
	
	      for(let i=0; i < children.length; i++){
	        let child = children[i];
	        if(child._node.ctorName === "_iter"){
	          let iters = [child];
	          while(children[i+1] && children[i+1]._node.ctorName === "_iter"){
	            if(children[i+1].interval.contents === iters[0].interval.contents){
	              iters.push(children[++i]);
	            } else {
	              break;
	            }
	          }
	
	          let iterChildren = iters.map((iter)=>Array.prototype.slice.call(iter.children));
	          let interleavedChildren = [];
	          while(iterChildren[0].length > 0){
	            iterChildren.forEach((iterC)=>{
	              interleavedChildren.push(iterC.shift());
	            });
	          }
	
	          interleavedChildren.forEach(child=> child.reifyAST(this.args.tagPositions));
	        } else {
	          child.reifyAST(this.args.tagPositions);
	        }
	      }
	
	      // children.forEach(child=> child.reifyAST(this.args.tagPositions));
	      getWithInit(this.args.tagPositions, end, []).push(closeTag(tagName));
	    },
	    _terminal(){
	      let start = this.interval.startIdx,
	          end = this.interval.endIdx;
	      let tagName = "terminal";
	
	      getWithInit(this.args.tagPositions, start, []).push(openTag(tagName));
	      getWithInit(this.args.tagPositions, end, []).push(closeTag(tagName));
	    }
	  });
	
	  semantics.addOperation("mapDOM(DOMNode, domToOhm, ohmToDom)", {
	    _nonterminal(children){
	      this.args.domToOhm.set(this.args.DOMNode, this._node);
	      this.args.ohmToDom.set(this._node, this.args.DOMNode);
	
	      let DOMChildren = Array.prototype.slice.apply(this.args.DOMNode.children);
	      for(let i=0; i < children.length; i++){
	        let child = children[i];
	        if(child._node.ctorName === "_iter"){
	          let iters = [child];
	          while(children[i+1] && children[i+1]._node.ctorName === "_iter"){
	            if(children[i+1].interval.contents === iters[0].interval.contents){
	              iters.push(children[++i]);
	            } else {
	              break;
	            }
	          }
	
	          let numDOMChildrenCovered = iters.reduce((agg, b)=>agg + b.children.length, 0);
	          let DOMChildrenCovered = DOMChildren.slice(0, numDOMChildrenCovered);
	          DOMChildren = DOMChildren.slice(numDOMChildrenCovered);
	
	          let iterDOMChildren = iters.map(()=>[]);
	          DOMChildrenCovered.forEach((domChild, i)=>{
	            iterDOMChildren[i % iterDOMChildren.length].push(domChild);
	          });
	
	          iterDOMChildren.forEach((domChildren, i)=>{
	            iters[i].mapDOM(domChildren, this.args.domToOhm, this.args.ohmToDom);
	          });
	        } else {
	          child.mapDOM(DOMChildren.shift(), this.args.domToOhm, this.args.ohmToDom);
	        }
	      }
	    },
	    _iter(children){
	      let DOMNodes = this.args.DOMNode;
	      if(children.length !== DOMNodes.length){
	        throw new Error(`ERROR: iterator node got a different number of dom nodes(${DOMNodes.length}) than children(${children.length})`);
	        return;
	      }
	
	      children.forEach((child, i)=> child.mapDOM(DOMNodes[i], this.args.domToOhm, this.args.ohmToDom));
	    },
	    _terminal(){
	      this.args.domToOhm.set(this.args.DOMNode, this._node);
	      this.args.ohmToDom.set(this._node, this.args.DOMNode);
	    }
	  });
	}
	
	function reify(semantics, match){
	  let tagPositions = {};
	  let domToOhm = new Map(),
	      ohmToDom = new Map();
	  let example = match._cst.interval.contents;
	
	  let semmatch = semantics(match);
	
	  semmatch.reifyAST(tagPositions);
	
	  tagPositions = mapObject(tagPositions, function(tags){
	    return tags.join("");
	  });
	
	  var positionsToInsert = Object.keys(tagPositions);
	  var stringsToInsert = Object.keys(tagPositions).map((key)=>tagPositions[key]);
	
	  var start = 0,
	      end;
	  var splitExampleString = [];
	  while(positionsToInsert.length > 0){
	    end = positionsToInsert.shift();
	    splitExampleString.push(
	      example.substring(start, end)
	    );
	
	    start = end;
	  }
	  splitExampleString.push(
	    example.substring(start)
	  );
	
	  var annotatedExamplePieces = [];
	  annotatedExamplePieces.push(splitExampleString.shift());
	  while(stringsToInsert.length > 0){
	    annotatedExamplePieces.push(stringsToInsert.shift());
	    annotatedExamplePieces.push(splitExampleString.shift());
	  }
	  annotatedExamplePieces.push(splitExampleString.shift());
	
	  let annotatedExample = annotatedExamplePieces.join("");
	  let parser = new DOMParser();
	  let DOM = parser.parseFromString(annotatedExample, "text/html");
	  DOM = DOM.querySelector('body').children[0];
	
	  semmatch.mapDOM(DOM, domToOhm, ohmToDom);
	
	  return [DOM, domToOhm, ohmToDom];
	}


/***/ },
/* 18 */
/***/ function(module, exports) {

	'use strict';
	
	var toExport = {
	  registerMapSemantics,
	  mapSemantics
	};
	
	if(typeof module !== "undefined" && typeof module.exports !== "undefined"){
	  module.exports = toExport;
	} else {
	  Object.assign(window, toExport);
	}
	
	function registerMapSemantics(grammar, semantics){
	  semantics.addOperation("mapSemantics(action, nodeToResults)", {
	    _nonterminal(children){
	      let examplePiece = this.interval.contents;
	
	      let result;
	      try {
	        let match = grammar.match(examplePiece, this._node.ctorName);
	        result = semantics(match)[this.args.action]();
	      } catch(e) {
	        // console.error(e);
	        result = e;//new Error(`${this._node.ctorName}: ${this.interval.contents}`);
	      }
	
	      this.args.nodeToResults.set(this._node, result);
	
	      children.forEach(child=> child.mapSemantics(this.args.action, this.args.nodeToResults));
	    }
	  });
	}
	
	function mapSemantics(semantics, action, match){
	  let nodeToResults = new Map();
	
	  semantics(match).mapSemantics(action, nodeToResults);
	
	  return nodeToResults;
	}


/***/ },
/* 19 */
/***/ function(module, exports) {

	'use strict';
	
	var toExport = {
	  registerSimplifyAction
	};
	
	if(typeof module !== "undefined" && typeof module.exports !== "undefined"){
	  module.exports = toExport;
	} else {
	  Object.assign(window, toExport);
	}
	
	function registerSimplifyAction(semantics){
	  semantics.addOperation("simplifyCST(simplifiedParentNode, nodeToSimplified)", {
	    _nonterminal(children){
	      let simplifiedNode;
	      if(this.args.simplifiedParentNode
	        && this.args.simplifiedParentNode.cstNodes[0].interval.contents ===
	        this.interval.contents){
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
	
	          if(this.args.simplifiedParentNode){
	            this.args.simplifiedParentNode.children.push(simplifiedNode);
	          }
	        }
	
	        this.args.nodeToSimplified.set(this._node, simplifiedNode);
	
	        for(let i = 0; i < children.length; i++){
	          let child = children[i];
	          if(child.constructor.name === "IterationNode"){ //makes iterations children of current node
	            //collect iterations for same interval
	            let run = [child];
	            let j = i + 1;
	            while(children[j].interval.contents === child.interval.contents){
	              run.push(children[j]);
	              j++;
	            }
	
	            let runLength = run.length,
	            iterLength = run[0].length;
	            for(let k = 0; k < runLength * iterLength; k++){
	              let iterIdx = k % runLength;
	              let childIdx = Math.floor(k / iterLength);
	
	              run[iterIdx].children[childIdx].simplifyCST(simplifiedNode, this.args.nodeToSimplified);
	            }
	
	            i = j - 1; //so that i++ = j
	          } else {
	            child.simplifyCST(simplifiedNode, this.args.nodeToSimplified);
	          }
	        }
	
	        return simplifiedNode;
	      },
	      _terminal(){
	        let simplifiedNode;
	        if(this.args.simplifiedParentNode
	          && this.args.simplifiedParentNode.cstNodes[0].interval.contents ===
	          this.interval.contents){
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
	
	          if(this.args.simplifiedParentNode){
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
	
	var treeUtils = __webpack_require__(21);
	
	var duration = 100;
	var curId = 0;
	
	class TreeViz{
	  constructor(svg, root, ohmToDom, actions){
	    this.ohmToDom = ohmToDom;
	    this.actions = actions;
	
	    this.svg = d3.select(svg)
	               .append("g")
	                 .attr("transform", "translate(10, 10)");
	
	    let boundingRect = svg.getBoundingClientRect();
	    this.width = boundingRect.width - 20;
	    this.height = boundingRect.height - 20;
	
	    this.tree = d3.layout.tree()
	      .children(function(n){
	        if(n.children && !n.hasOwnProperty('_children')){
	          n._children = n.children;
	        }
	
	        if(n._children
	           && n._children.length > 0){
	          let descendants = treeUtils.descendants(n, function(child){
	            if(child.children && !child._children){
	              child._children = child.children;
	            }
	
	            return child._children;
	          });
	
	          if(descendants.reduce((a,b)=> b.current || a, false)){
	            return n._children;
	          }
	        }
	
	        return null;
	      })
	      .size([this.height, this.width]);
	
	    this.voronoi = d3.geom.voronoi()
	    	.x(function(d) { return d.y; })
	    	.y(function(d) { return d.x; })
	    	.clipExtent([[-10, -10], [this.width, this.height]]);
	
	    this.root = root;
	    this.root.x0 = this.height/2;
	    this.root.y0 = 0;
	
	    this.update(root);
	  }
	
	  update(parent){
	    let nodes = this.tree.nodes(this.root).reverse(),
	        links = this.tree.links(nodes);
	
	    let svgNode = this.svg.selectAll("g.node")
	      .data(nodes, function(d){ //assign each object an id since d3 can't do object equality apparently :/
	        if(d.id){
	          return d.id;
	        } else {
	          d.id = curId++;
	          return d.id;
	        }
	      });
	
	    let svgNodeEnter = svgNode.enter().append("g")
	      .attr("class", "node")
	      .attr("transform", `translate(${parent.y0}, ${parent.x0})`)
	      .attr("id", (d)=>d.id)
	    .append("circle")
	      .attr("r", (node)=>
	        node.landmark? 8: 5);
	
	    let treeviz = this;
	    let svgNodeUpdate = svgNode
	      .on("mouseover", function(datum){
	        treeviz.actions.highlightNode(datum);
	      }, true)
	      .on("mouseout",  function(datum){
	        treeviz.actions.unHighlightNode(datum);
	      }, true)
	      .on("click", function(datum){
	        if(d3.event.altKey || d3.event.ctrlKey){
	          treeviz.actions.joinNode(datum);
	        } else if(datum.current){
	          treeviz.actions.splitNode(datum);
	        }
	      }, true)
	    .transition().duration(duration)
	      .attr("transform", (n)=> `translate(${n.y}, ${n.x})`)
	      .style("fill", (n)=> {
	        if( n.landmark ){
	          return "gray";
	        } else if( n.cstNodes[0].result instanceof Error ){
	          return  "red";
	        } else {
	          return "green";
	        }
	      });
	
	    let svgNodeExit = svgNode.exit().transition()
	      .duration(duration)
	      .attr("transform", (n)=> `translate(${parent.y0}, ${parent.x0})`)
	      .remove();
	
	    let polygon = function(d) {
	      return "M" + d.join("L") + "Z";
	    };
	
	    //Create the Voronoi grid
	    let paths = this.svg.selectAll("path")
	      .data(this.voronoi(nodes));
	
	    paths.enter().append("path");
	    paths.exit().remove();
	
	    paths.attr("d", function(d, i) { return "M" + d.join("L") + "Z"; })
	      .datum(function(d, i) { return d.point; })
	            //Give each cell a unique class where the unique part corresponds to the circle classes
	      .attr("class", function(d,i) { return "voronoi " + d.CountryCode; })
	      // .style("stroke", "#2074A0") //If you want to look at the cells
	      .style("fill", "none")
	      .style("pointer-events", "all")
	      .on("mouseover", function(datum){
	        treeviz.actions.highlightNode(datum);
	      })
	      .on("mouseout",  function(datum){
	        treeviz.actions.unHighlightNode(datum);
	      })
	      .on("click", function(datum){
	        if(d3.event.altKey || d3.event.ctrlKey){
	          treeviz.actions.joinNode(datum);
	        } else if(datum.current){
	          treeviz.actions.splitNode(datum);
	        }
	      }, true);
	
	    nodes.forEach((n)=>{
	      n.x0 = n.x;
	      n.y0 = n.y;
	    });
	  }
	
	  split(node){
	    // node.clicked = true;
	    this.update(node);
	  }
	
	  join(node){
	    this.update(node);
	  }
	
	  highlight(node){
	    d3.select(`g.node[id="${node.id}"]`).selectAll("circle").transition().duration(duration)
	      .attr("r", 8);
	  }
	
	  unHighlight(node){
	    d3.select(`g.node[id="${node.id}"]`).selectAll("circle").transition().duration(duration)
	      .attr("r", 5);
	  }
	}
	
	var toExport = {
	  TreeViz
	};
	
	if(typeof module !== "undefined" && typeof module.exports !== "undefined"){
	  module.exports = toExport;
	} else {
	  Object.assign(window, toExport);
	}


/***/ },
/* 21 */
/***/ function(module, exports) {

	'use strict';
	
	var toExport = {
	  descendants
	};
	
	if(typeof module !== "undefined" && typeof module.exports !== "undefined"){
	  module.exports = toExport;
	} else {
	  Object.assign(window, toExport);
	}
	
	function descendants(node, children = function(n){return n.children; }){
	  let childrenQueue = Array.prototype.slice.call(children(node));
	  let descendants = [];
	  while(childrenQueue.length > 0){
	    let child = childrenQueue.shift();
	
	    descendants.push(child);
	    childrenQueue = childrenQueue.concat(children(child));
	  }
	
	  return descendants;
	};


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var classes = __webpack_require__(23);
	
	var toExport = {
	  registerToAST
	};
	
	if(typeof module !== "undefined" && typeof module.exports !== "undefined"){
	  module.exports = toExport;
	} else {
	  Object.assign(window, toExport);
	}
	
	function registerToAST(semantics){
	  semantics.addOperation('toAST', {
	    Program: function(stmts) {
	      return new classes.Program(stmts.toAST());
	    },
	
	    Stmts: function(ss, optE) {
	      var e = optE.toAST()[0];
	      return ss.toAST().concat(e ? new classes.ExpStmt(e) : []);
	    },
	
	    Stmt_classDecl: function(_class, C, _optExtends, optS, _optWith, optXs, _sc) {
	      return new classes.ClassDecl(
	        C.toAST(),
	        optS.toAST()[0] || 'Obj',
	        optXs.toAST()[0] || []);
	    },
	
	    Stmt_methodDeclJava: function(_def, C, _dot, m, _op, xs, _cp, b) {
	      return new classes.MethodDecl(
	        C.toAST(),
	        m.toAST(),
	        xs.toAST(),
	        b.toAST());
	    },
	
	    Stmt_methodDeclKeyword: function(_def, C, ms, _commas, xs, b) {
	      return new classes.MethodDecl(
	        C.toAST(),
	        ms.toAST().reduce((m, part) => m + part.charAt(0).toUpperCase() + part.substr(1)),
	        xs.toAST(),
	        b.toAST());
	    },
	
	    Stmt_methodDeclBinary: function(_def, C, m, x, b) {
	      return new classes.MethodDecl(
	        C.toAST(),
	        m.toAST(),
	        [x.toAST()],
	        b.toAST());
	    },
	
	    Stmt_methodDeclCall: function(_def, C, _op, xs, _cp, b) {
	      return new classes.MethodDecl(
	        C.toAST(),
	        'call',
	        xs.toAST(),
	        b.toAST());
	    },
	
	    Stmt_varDecl: function(_var, x, _eq, e, _sc) {
	      return new classes.VarDecl(x.toAST(), e.toAST());
	    },
	
	    Stmt_varAssign: function(x, _eq, e, _sc) {
	      return new classes.VarAssign(x.toAST(), e.toAST());
	    },
	
	    Stmt_instVarAssign: function(_this, _dot, x, _eq, e, _sc) {
	      return new classes.InstVarAssign(x.toAST(), e.toAST());
	    },
	
	    Stmt_return: function(_return, e, _sc) {
	      return new classes.Return(e.toAST());
	    },
	
	    Stmt_exp: function(e, _sc) {
	      return new classes.ExpStmt(e.toAST());
	    },
	
	    MethodBody_exp: function(_eq, e, _sc) {
	      return [new classes.Return(e.toAST())];
	    },
	
	    MethodBody_stmt: function(_oc, ss, _cc) {
	      return ss.toAST();
	    },
	
	    KWSendExp_send: function(e, ms, _colons, es) {
	      return new classes.Send(
	        e.toAST(),
	        ms.toAST().reduce((m, part) => m + part.charAt(0).toUpperCase() + part.substr(1)),
	        es.toAST());
	    },
	
	    KWSendExp_super: function(_this, ms, _colons, es) {
	      return new classes.SuperSend(
	        ms.toAST().reduce((m, part) => m + part.charAt(0).toUpperCase() + part.substr(1)),
	        es.toAST());
	    },
	
	    EqExp_eq: function(x, op, y) {
	      return new classes.BinOp(op.toAST(), x.toAST(), y.toAST());
	    },
	
	    RelExp_rel: function(x, op, y) {
	      return new classes.BinOp(op.toAST(), x.toAST(), y.toAST());
	    },
	
	    AddExp_add: function(x, op, y) {
	      return new classes.BinOp(op.toAST(), x.toAST(), y.toAST());
	    },
	
	    MulExp_mul: function(x, op, y) {
	      return new classes.BinOp(op.toAST(), x.toAST(), y.toAST());
	    },
	
	    DotExp_send: function(e, _dot, m, _op, es, _cp) {
	      return new classes.Send(e.toAST(), m.toAST(), es.toAST());
	    },
	
	    DotExp_super: function(_super, _dot, m, _op, es, _cp) {
	      return new classes.SuperSend(m.toAST(), es.toAST());
	    },
	
	    // DotExp_instVarAccess: function(_this, _dot, x) {
	    //   return new classes.InstVar(x.toAST());
	    // },
	
	    UnExp_neg: function(_minus, x) {
	      return new classes.BinOp('-', new classes.Lit(0), x.toAST());
	    },
	
	    CallExp_call: function(b, _op, es, _cp) {
	      return new classes.Send(b.toAST(), 'call', es.toAST());
	    },
	
	    PriExp_paren: function(_op, e, _cp) {
	      return e.toAST();
	    },
	
	    PriExp_block: function(_oc, xs, ss, _cc) {
	      return new classes.BlockLit(xs.toAST(), ss.toAST());
	    },
	
	    PriExp_new: function(_new, C, _op, es, _cp) {
	      return new classes.New(C.toAST(), es.toAST());
	    },
	
	    PriExp_str: function(s) {
	      return new classes.Lit(s.toAST());
	    },
	
	    PriExp_ident: function(n) {
	      return new classes.Var(n.toAST());
	    },
	
	    PriExp_number: function(_) {
	      return new classes.Lit(parseFloat(this.interval.contents));
	    },
	
	    PriExp_this: function(_) {
	      return new classes.This();
	    },
	
	    PriExp_true: function(_) {
	      return new classes.Lit(true);
	    },
	
	    PriExp_false: function(_) {
	      return new classes.Lit(false);
	    },
	
	    PriExp_null: function(_) {
	      return new classes.Lit(null);
	    },
	
	    BlockArgNames_some: function(xs, _bar) {
	      return xs.toAST();
	    },
	
	    BlockArgNames_none: function() {
	      return [];
	    },
	
	    ident: function(_first, _rest) {
	      return this.interval.contents;
	    },
	
	    string: function(_oq, cs, _cq) {
	      var chars = [];
	      var idx = 0;
	      cs = cs.toAST();
	      while (idx < cs.length) {
	        var c = cs[idx++];
	        if (c === '\\' && idx < cs.length) {
	          c = cs[idx++];
	          switch (c) {
	            case 'n': c = '\n'; break;
	            case 't': c = '\t'; break;
	            default: idx--;
	          }
	        }
	        chars.push(c);
	      }
	      return chars.join('');
	    },
	
	    NonemptyListOf: function(x, _seps, xs) {
	      return [x.toAST()].concat(xs.toAST());
	    },
	
	    EmptyListOf: function() {
	      return [];
	    }
	
	  });
	}


/***/ },
/* 23 */
/***/ function(module, exports) {

	'use strict';
	
	
	// ---------------------------------------------------------
	// "Classes" that represent AST nodes
	// ---------------------------------------------------------
	
	class AST {}
	
	class Program extends AST {
	  constructor(ss) {
	    super();
	    this.ss = ss;
	  }
	}
	
	// Statements
	
	class Stmt extends AST {
	  constructor() {
	    super();
	  }
	}
	
	class ClassDecl extends Stmt {
	  constructor(C, S, xs) {
	    super();
	    this.C = C;
	    this.S = S;
	    this.xs = xs;
	  }
	}
	
	class MethodDecl extends Stmt {
	  constructor(C, m, xs, ss) {
	    super();
	    this.C = C;
	    this.m = m;
	    this.xs = xs;
	    this.ss = ss;
	  }
	}
	
	class VarDecl extends Stmt {
	  constructor(x, e) {
	    super();
	    this.x = x;
	    this.e = e;
	  }
	}
	
	class VarAssign extends Stmt {
	  constructor(x, e) {
	    super();
	    this.x = x;
	    this.e = e;
	  }
	}
	
	class InstVarAssign extends Stmt {
	  constructor(x, e) {
	    super();
	    this.x = x;
	    this.e = e;
	  }
	}
	
	class Return extends Stmt {
	  constructor(e) {
	    super();
	    this.e = e;
	  }
	}
	
	class ExpStmt extends Stmt {
	  constructor(e) {
	    super();
	    this.e = e;
	  }
	}
	
	// Expressions
	
	class Exp extends AST {
	  constructor() {
	    super();
	  }
	}
	
	class Lit extends Exp {
	  constructor(primValue) {
	    super();
	    this.primValue = primValue;
	  }
	}
	
	class Var extends Exp {
	  constructor(x) {
	    super();
	    this.x = x;
	  }
	}
	
	class BinOp extends Exp {
	  constructor(op, e1, e2) {
	    super();
	    this.op = op;
	    this.e1 = e1;
	    this.e2 = e2;
	  }
	}
	
	class This extends Exp {
	  constructor() {
	    super();
	  }
	}
	
	class InstVar extends Exp {
	  constructor(x) {
	    super();
	    this.x = x;
	  }
	}
	
	class New extends Exp {
	  constructor(C, es) {
	    super();
	    this.C = C;
	    this.es = es;
	  }
	}
	
	class Send extends Exp {
	  constructor(erecv, m, es) {
	    super();
	    this.erecv = erecv;
	    this.m = m;
	    this.es = es;
	  }
	}
	
	class SuperSend extends Exp {
	  constructor(m, es) {
	    super();
	    this.m = m;
	    this.es = es;
	  }
	}
	
	class BlockLit extends AST {
	  constructor(xs, ss) {
	    super();
	    this.xs = xs;
	    this.ss = ss;
	  }
	}
	
	var toExport = {
	  AST,
	  Program,
	  Stmt,
	  ClassDecl,
	  MethodDecl,
	  VarDecl,
	  VarAssign,
	  InstVarAssign,
	  Return,
	  ExpStmt,
	  Exp,
	  Lit,
	  Var,
	  BinOp,
	  This,
	  InstVar,
	  New,
	  Send,
	  SuperSend,
	  BlockLit
	};
	
	if(typeof module !== "undefined" && typeof module.exports !== "undefined"){
	  module.exports = toExport;
	} else {
	  Object.assign(window, toExport);
	}


/***/ }
]);
//# sourceMappingURL=oo.bundle.js.map