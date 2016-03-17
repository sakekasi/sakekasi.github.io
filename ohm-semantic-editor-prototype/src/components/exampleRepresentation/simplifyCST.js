'use strict';

class SimplifiedCSTNode {
  constructor({cstNodes, parent, children}){
    // this.ctorName = ctorName;
    this.cstNodes = cstNodes;
    this.parent = parent;
    this.children = children;
    this._children = children;
  }

  originalChildren(){
    return this._children?
      this._children:
      this.children;
  }

  splittable(){
    let children = this.originalChildren();
    return !this.leaf
      && children
      && children.length > 0;
  }

  get ctorName(){
    return this.bottomCSTNode.ctorName;
  }

  get topCSTNode(){
    return this.cstNodes[0];
  }

  get bottomCSTNode(){
    return this.cstNodes.slice(-1)[0];
  }
}

function registerSimplifyAction(semantics){
  let sameInterval = function(a, b){
    return a.interval.contents === b.interval.contents;
  };
  let xor = function(a, b){
    return (a || b) && !(a && b);
  }

  semantics.addOperation("simplifyCST(simplifiedParentNode, nodeToSimplified)", {
    _nonterminal(children){
      let simplifiedNode;
      if(this.args.simplifiedParentNode
        && sameInterval(this.args.simplifiedParentNode.cstNodes[0], this)
        && !xor(this.isSyntactic(),
                 this.args.simplifiedParentNode.bottomCSTNode.isSyntactic())){
          simplifiedNode = this.args.simplifiedParentNode;
          simplifiedNode.cstNodes.push(this._node);
        } else {
          simplifiedNode = new SimplifiedCSTNode({
            cstNodes: [this._node],
            parent: this.args.simplifiedParentNode,
            children: []
          });

          if(this.args.simplifiedParentNode
             && xor(this.isSyntactic(),
                  this.args.simplifiedParentNode.bottomCSTNode.isSyntactic())){
            simplifiedNode.leaf = true;
          }

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
          && sameInterval(this, this.args.simplifiedParentNode.topCSTNode)){
          simplifiedNode = this.args.simplifiedParentNode;
          simplifiedNode.cstNodes.push(this._node);
        } else {
          simplifiedNode = new SimplifiedCSTNode({
            cstNodes: [this._node],
            parent: this.args.simplifiedParentNode,
            children: []
          });
          simplifiedNode.leaf = true;

          if(this.args.simplifiedParentNode){
            this.args.simplifiedParentNode.children.push(simplifiedNode);
          }
        }

        this.args.nodeToSimplified.set(this._node, simplifiedNode);
        return simplifiedNode;
      }
    });
}

var toExport = {
  registerSimplifyAction,
  SimplifiedCSTNode
};

if(typeof module !== "undefined" && typeof module.exports !== "undefined"){
  module.exports = toExport;
} else {
  Object.assign(window, toExport);
}
