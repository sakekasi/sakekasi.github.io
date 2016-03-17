var language = require("./language.js");

var resultMap, todo, passThrough;
var toExport = {
  initSemantics,
  saveAction,
  resultMap,
  reset
};

if(typeof module !== "undefined" && typeof module.exports !== "undefined"){
  module.exports = toExport;
} else {
  Object.assign(window, toExport);
}

function reset(){
  toExport.resultMap = Object.create(null);
  todo = null;
}

function initSemantics(semantics) {
  semantics.addOperation('eval', {
    _nonterminal: function(children) {
      console.info(this.ctorName, "nonterminal called");
      try {
        var key = toKey(this);
        var ans = (() => {
          if (children.length === 1) {
            if (!passThrough) {
              passThrough = [];
            }
            passThrough.push(key);
            return children[0].eval();
          } else {
            if (!todo) {
              todo = [];
            }
            todo.push(key);
          }
        })();
      } catch (error) {
        if (!todo) {
          if (!error.expression) {
            error.expression = key;
          }
          toExport.resultMap[key] = error;
        }
      } finally {
        if (toExport.resultMap[key] instanceof Error) {
          throw toExport.resultMap[key];
        }
        if (!ans && todo) {
          ans = new Error("TODO");
        }
        toExport.resultMap[key] = ans;
        return ans;
      }
    }
  });
}

function saveAction(actionDict, ruleName, funcObj, bodyStr) {
  console.info(`saving ${ruleName}`);
  var func;
  if (bodyStr.trim().length !== 0) {
    let match = language.InferBraces.match(bodyStr, "NoBraces");
    let wrappedBodyStr = `(${bodyStr})`;
    if(match.failed()){
      wrappedBodyStr = `(()=>{${bodyStr}})()`;
      console.log(wrappedBodyStr);
    }

    var code = `(function(${funcObj.args.join(',')}){
      var key = toKey(this);
      var ans;

      try{
        ans = ${wrappedBodyStr};
        var aChildHasTodo = this.children.some(
          child => todo && todo.includes(toKey(child))
        );
        if(aChildHasTodo){
          ans = new Error('TODO '+todo.toString());
        }
      } catch(error) {
        if(todo){
          ans = new Error('TODO '+todo.toString());
        } else {
          ans = new Error(error);
          if(!ans.expression){
            ans.expression = key;
          }
          throw ans;
        }
      } finally {
        toExport.resultMap[key] = ans;
      }
      return ans;
    })`;
    func = eval(code);
    actionDict[ruleName] = func;
  } else {
    delete actionDict[ruleName];
  }
  funcObj.body = bodyStr;
}

function toKey(semNode){
  return semNode.ctorName + "_from_" +
    semNode.interval.startIdx + "_to_" +
    semNode.interval.endIdx
}
