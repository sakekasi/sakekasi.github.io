var HighlightingEditor = require("./components/highlightingEditor/interaction.js").HighlightingEditor,
     ThirdEyeExampleVisualization = require("./components/exampleRepresentation/interaction.js").ThirdEyeExampleVisualization,
     GrammarSemantics  = require("./components/grammarSemantics/interaction.js").GrammarSemantics,
     mapSemantics = require("./components/exampleRepresentation/mapSemantics.js"),
     simplifyCST = require("./components/exampleRepresentation/simplifyCST.js"),
     reify = require("./components/exampleRepresentation/reify.js");

var language = require("./language.js"),
    toAST = require("./toAST.js"),
    grammarSlice = require("./grammarSlice.js").grammarSlice;

var keywordTags = [
  "keyword",
  "class",
  "def",
  "extends",
  "falseK",
  "new",
  "nullK",
  "return",
  "super",
  "this",
  "trueK",
  "var",
  "with",
];

document.addEventListener("DOMContentLoaded", function(event) {
  let grammar = language.grammar,
      semantics = language.semantics;

  toAST.registerToAST(semantics);
  mapSemantics.registerMapSemantics(semantics);
  simplifyCST.registerSimplifyAction(semantics);
  reify.registerReifyActions(semantics);

  let exampleNode = document.querySelector('pre#example');
  let example = exampleNode.textContent;
  exampleNode.textContent = "";
  let match;
  try {
    match = grammar.match(example);
  } catch (e) {
    console.error(e, match.message);
  }

  let grammarSemantics, thirdEyeViz;
  let gsActions = {
    highlight(...args){return grammarSemantics.highlight(...args);},
    unHighlight(...args){return grammarSemantics.unHighlight(...args);},
    split(...args){return grammarSemantics.split(...args);},
    join(...args){return grammarSemantics.join(...args);}
  };
  let thirdEyeActions = {
    highlight(...args){return thirdEyeViz.highlight(...args);},
    unHighlight(...args){return thirdEyeViz.unHighlight(...args);},
    split(...args){return thirdEyeViz.split(...args);},
    join(...args){return thirdEyeViz.join(...args);},
    updateSemanticResults(...args){return thirdEyeViz.updateSemanticResults(...args);}
  };

  thirdEyeViz = new ThirdEyeExampleVisualization(
    document.querySelector('example'),{
      semantics, match, keywordTags, actions: gsActions
  });

  grammarSemantics = new GrammarSemantics(
    document.querySelector('.editorWrapper'),{
      grammar, semantics, match, actions: thirdEyeActions
  });
});
