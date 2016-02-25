var util = require("./util.js");
var esprima = require("esprima"),
    traverse = require("ast-traverse")

var getWithInit = util.getWithInit,
    mapObject = util.mapObject,
    mergeObjects = util.mergeObjects;

var toExport = {
  reifyES
};

if(typeof module !== "undefined" && typeof module.exports !== "undefined"){
  module.exports = toExport;
} else {
  Object.assign(window, toExport);
}

//=========================
function reifyES(jsProgram){
  var AST = esprima.parse(jsProgram, {range: true, tokens: true, tolerant: true});
  var tokens = AST.tokens;
  delete AST.tokens;
  var tagPositions = {};

  traverse(AST, {
    pre: function(node){
      var start = node.range[0];
      var tagName = node.type;

      if(tagName){
        getWithInit(tagPositions, start, []).push(`<${tagName}>`);
      }
    }
  })

  // tokens get first priority
  tokens.forEach(function(token){
    var start = token.range[0],
        end = token.range[1];

    var tagName = token.type;

    if(tagName){
      getWithInit(tagPositions, start, []).push(`<${tagName}>`);
      getWithInit(tagPositions, end, []).push(`</${tagName}>`);
    }
  });

  traverse(AST, {
    post: function(node){
      var end = node.range[1];
      var tagName = node.type;

      if(tagName){
        getWithInit(tagPositions, end, []).push(`</${tagName}>`);
      }
    }
  });


  tagPositions = mapObject(tagPositions, function(tags){
    return tags.join("");
  });

  var positionsToInsert = Object.keys(tagPositions);
  var stringsToInsert = Object.keys(tagPositions).map((key)=>tagPositions[key]);

  var start = 0,
      end;
  var splitProgramString = [];
  while(positionsToInsert.length > 0){
    end = positionsToInsert.shift();
    splitProgramString.push(
      jsProgram.substring(start, end)
    );

    start = end;
  }
  splitProgramString.push(
    jsProgram.substring(start)
  );

  var annotatedProgramPieces = [];
  annotatedProgramPieces.push(splitProgramString.shift());
  while(stringsToInsert.length > 0){
    annotatedProgramPieces.push(stringsToInsert.shift());
    annotatedProgramPieces.push(splitProgramString.shift());
  }
  annotatedProgramPieces.push(splitProgramString.shift());

  return annotatedProgramPieces.join("");
}
