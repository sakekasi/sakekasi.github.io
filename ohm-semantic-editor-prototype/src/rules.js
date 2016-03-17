'use strict';

var language = require("./language.js");

var toExport = {
  rules
};

if(typeof module !== "undefined" && typeof module.exports !== "undefined"){
  module.exports = toExport;
} else {
  Object.assign(window, toExport);
}

var rules = [];

document.addEventListener("DOMContentLoaded", function(){
  // language.ohmSemantics.addOperation("")
  Object.keys(language.grammar.ruleBodies).forEach((ruleBody)=>{
    
  });
    toExport.rules = []
});
