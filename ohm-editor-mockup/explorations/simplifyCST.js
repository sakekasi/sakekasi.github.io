'use strict';

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
      }
    });
}
