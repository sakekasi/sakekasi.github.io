'use strict';

var toExport = {
  descendants,
  root
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

function root(node, parent = function(n){return n.parent; }){
  while(node.parent){
    node = node.parent;
  }

  return node;
}
