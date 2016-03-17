var toExport = {
  compare,
  getWithInit,
  mapObject,
  mergeObjects,
  isLexical,
  memobind,
  createElement
};

if(typeof module !== "undefined" && typeof module.exports !== "undefined"){
  module.exports = toExport;
} else {
  Object.assign(window, toExport);
}

function isLexical(name){
  return name[0].toLowerCase() === name[0];
}

function compare(a, b){
  if(a > b){
    return 1;
  } else if(a < b){
    return -1;
  } else {
    return 0;
  }
}

function getWithInit(object, key, defaultValue){
  if(!object.hasOwnProperty(key)){
    object[key] = defaultValue;
  }

  return object[key];
}

function mapObject(object, fun){
  var out = {};
  Object.keys(object).forEach(function(key){
    out[key] = fun(object[key]);
  });

  return out;
}

function mergeObjects(a, b, fun){
  var out = {};
  Object.keys(a).forEach(function(key){
    if(b.hasOwnProperty(key)){
      out[key] = fun(a[key], b[key]);
    } else {
      out[key] = a[key];
    }
  });

  return Object.assign({}, b, out); //if conflict between b and out, prefer out.
}

//returns a function bound to an arg, and remembers return values, so comparison
// using '===' works
let memo = new Map();
function memobind(...args){
  let argStack = args.slice();
  let current = memo;
  let currentItem;
  while(argStack.length > 0 && current.has(argStack[0])){
    currentItem = argStack.shift();
    current = current.get(currentItem);
  }
  if(argStack.length === 0){
    return current;
  } else {
    while(argStack.length > 1){
      currentItem = argStack.shift();
      let nextCurrent = new Map();
      current.set(currentItem, nextCurrent);
      current = nextCurrent;
    }
    let bound = args[0].bind(...(args.slice(1)));
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
