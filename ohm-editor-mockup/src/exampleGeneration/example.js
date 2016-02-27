var language = require('../language.js'),
    chroma = require("chroma-js");


function renderExample(exampleStr){
  let example = document.createElement('example');
  example.textContent = exampleStr;

  try{
    let match = language.grammar.match(exampleStr);
    let interpreted = language.semantics(match).interpret();
    // example.textContent += ` ${interpreted.toString()}`;
    example.style.color = chroma("green").css("hsl");
  }catch (e){
    console.log(e);
    example.style.color = chroma("red").css("hsl");
  }

  return example;
}

module.exports = renderExample;
