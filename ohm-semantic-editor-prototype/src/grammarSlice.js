var toExport = {
  grammarSlice
};

if(typeof module !== "undefined" && typeof module.exports !== "undefined"){
  module.exports = toExport;
} else {
  Object.assign(window, toExport);
}

function grammarSlice(grammar, relevantRules){
  let bodies = relevantRules.map(rule=>grammar.ruleBodies[rule].definitionInterval.contents);
  let intervals = [];
  for(let body of bodies){
    let startIdx =  intervals.length > 0? intervals.slice(-1)[0].endIdx + 2: 0,
         endIdx = startIdx + body.length,
         contents = body;
    intervals.push({
      startIdx,
      endIdx,
      contents
    });
  }

  return [bodies.join("\n\n"), intervals]
}
