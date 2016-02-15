"use strict";

var highlightedColor = "hsl(0,0%,85%)";
var lightHighlightedColor = "hsl(0,0%,97%)";
var unHighlightedColor = "hsla(0,0%,100%, 0)";

var identColor = "hsla(58, 100%, 80%, 1)"


$(document).ready(function(){
  var idents = $('rule > name');
  var currentIdent = 0;

  $(idents[currentIdent]).css("background-color", identColor);

  $('action').each(function(){
    var reified = reifyAST($(this).text());
    $(this).html(reified);
  });

  $(document).keypress(function(){
    console.log("key pressed");
    $(idents[currentIdent++ % idents.length]).css("background-color", unHighlightedColor);
    $(idents[currentIdent % idents.length]).css("background-color", identColor);
  });

  parallelHighlight('rule choice',
    function(ruleChoice){ return ruleChoice.parent(); }, lightHighlightedColor,
    function(ruleChoice){ return getAction(ruleChoice); }, highlightedColor
  );

  $('rule choice').mouseover(function(){
    var action = getAction($(this));
    moveToIdealNonOverlapping($('action'), action.get()[0], 100);
  }).mouseout(function(){
    moveToIdealNonOverlapping($('action'), null, 100);
  });

  parallelHighlight('rule > name, rule > description',
    function(ruleDesc){ return ruleDesc.parent(); }, highlightedColor,
    function(ruleDesc){ return getActionsForRule(ruleDesc.parent()); }, highlightedColor
  );
  $('rule > name, rule > description').mouseover(function(){
    // moveToIdealNonOverlapping($('action'), null, 100);
  }).mouseout(function(){
    // moveToIdealNonOverlapping($('action'), null, 100);
  })

  parallelHighlight('action',
    function(action){ return getRule(action); }, lightHighlightedColor,
    function(action){
      return getAlts(action).length === 0?
        getRule(action):
        getAlts(action);
    }, highlightedColor
  );
  $('action').mouseover(function(){
    $(idents[currentIdent % idents.length]).css("background-color", unHighlightedColor);

    idents = getRule($(this)).find('choice app');
    currentIdent = 0;

    $(idents[currentIdent]).css("background-color", identColor);
    // moveToIdealNonOverlapping($('action'), null, 100);
  }).mouseout(function(){
    $(idents[currentIdent % idents.length]).css("background-color", unHighlightedColor);
    idents = $('rule > name');
    currentIdent = 0;

    $(idents[currentIdent]).css("background-color", identColor);
    // moveToIdealNonOverlapping($('action'), null, 100);
  });

  moveToIdealNonOverlapping($('action'));
})

//INTERACTION HELPERS
/////////////////////////
function parallelHighlight(selector /*, accessor, color, ... */){
  var parallels = Array.prototype.slice.call(arguments, 1);
  var accessors = parallels.filter(function(_, i){ return i%2 === 0; }),
      colors = parallels.filter(function(_, i){ return i%2 === 1; });

  var parallelElements = function(currentElement){
    return accessors.map(function(acc){
      return acc(currentElement);
    });
  }

  $(selector).mouseover(function(){
    console.log(selector, "mouseover");

    $(this).css("background-color", highlightedColor);
    parallelElements($(this)).forEach(function(element, i){
      element.css("background-color", colors[i]);
    });
  }).mouseout(function(){
    console.log(selector, "mouseout");

    $(this).css("background-color", unHighlightedColor);
    parallelElements($(this)).forEach(function(element){
      element.css("background-color", unHighlightedColor);
    })
  });
}

//ACCESSORS
/////////////
function getRule(action){
  var ruleName = action.attr("ruleId").split("_")[0];
  return $('rule > name').filter(function(){
    return $(this).text() === ruleName;
  }).parent();
}

function getAlts(action){
  var ruleId = action.attr("ruleId");
  ruleId = ruleId.split("_");

  var alts = getRule(action).find('choice'); //set of alts
  if(ruleId.length === 2){
    return alts.children('casename')
      .filter(function(){
        return $(this).text() === ruleId[1];
      }).parent();
  } else if(ruleId.length === 1){
    return alts.filter(function(){
      return $(this).children('casename').length === 0;
    });
  }
}

function getAction(alt){
  var ruleName = alt.closest('rule').children('name').text();
  var altName = alt.children('casename');
  altName = altName.length > 0?
    altName.text():
    "";

  return $('action').filter(function(){
    return $(this).attr("ruleId") === ruleName+
      (altName !== "" ? "_": "")+
      altName;
  });
}

function getActionsForRule(rule){
  var ruleName = rule.children('name').text();

  return $('action').filter(function(){
    return $(this).attr("ruleId").split("_")[0] === ruleName;
  })
}

//LAYOUT HELPERS
///////////////////
function idealPosition(action){
  var alts = getAlts(action);

  var idealPos = alts.length > 0?
    alts.offset().top:
    getRule(action).children('name').offset().top;

  return idealPos;
}

function idealPositions(actions){
  return actions.map(function(){
    return idealPosition($(this));
  });
}

function moveElementToY(element, y, transition){
  var current = element.offset().top,
      top = parseInt(element.css("top"), 10),
      delta = y - current;

  if(!transition){
    element.css("top", top + delta);
  } else {
    element.stop().animate({
      top: "+=" + delta.toString()
    }, transition);
  }
}

function moveToIdeal(actions, transition){
  var ideal = idealPositions(actions);
  actions.each(function(i){
    moveElementToY($(this), ideal[i], transition);
  });
}

function moveToIdealNonOverlapping(actions, preferredItem, transition){
  var sortedActions = actions.sort(function(a, b){
    var ideala = idealPosition($(a)),
        idealb = idealPosition($(b));

    return compare(ideala, idealb);
  })

  var ideal = Array.prototype.slice.call(
    idealPositions(sortedActions)
  );

  var weights;
  if(preferredItem){
    weights = Array.prototype.slice.call(
      sortedActions.map(function(){
        return this === preferredItem?
               100:
               1;
      })
    );
  } else {
    weights = Array.prototype.slice.call(
      sortedActions.map(function(){ return 1;})
    );
  }

  var height = Array.prototype.slice.call(
    sortedActions.map(function(){
      // return $(this).outerHeight(true);
      console.log(this.getBoundingClientRect().height);
      return Math.floor(this.getBoundingClientRect().height +
        parseInt($(this).css("margin-top"), 10) +
        parseInt($(this).css("margin-bottom"), 10));
    })
  );

  console.log(height.length, height, sortedActions.length);

  var err = function(y, i){ //for now. should weight this
    return weights[i] * Math.abs(ideal[i] - y);
  };
  var errRest = function(y, i){
    return ideal.slice(i).reduce(function(p, _, i){
      return p + err(y, i);
    },0);
  };

  var maxY = Math.floor(ideal.slice(-1)[0] + 1000);
  var minY = 0;

  var OPT = [];
  for(var y = minY; y <= maxY; y++){
    OPT[y-minY] = [];
  }

  //edge cases
  for(var y = minY; y <= maxY; y++){
    OPT[y-minY][sortedActions.length] = 0;
  }

  //memoize
  for(var i = sortedActions.length - 1; i >= 0; i--){
    for(var y = maxY; y >= minY; y--){
      if(y+height[i] > maxY){
        OPT[y-minY][i] = errRest(y, i);
        continue;
      }

      var placeHere = err(y, i)+OPT[y+height[i] - minY][i+1];
      var stepToNext = OPT[y+1 - minY][i];

      OPT[y-minY][i] = Math.min(
        placeHere,
        stepToNext
      );
    }
  }

  //find answer
  var positions = [];
  var i = 0,
      y = minY;
  while(positions.length < sortedActions.length && y <= maxY){
    // console.log(OPT[y-minY][i], OPT[y+height[i] - minY][i+1]);
    var placeHere = err(y, i)+OPT[y+height[i] - minY][i+1];
    if(y+height[i] <= maxY &&
       OPT[y-minY][i] === placeHere){//place
      positions.push(y);
      y += height[i];
      i++;
    } else {
      y++;
    }
  }

  //mutate state
  sortedActions.each(function(i){
    moveElementToY($(this), positions[i], transition);
  });
}

//GENERIC HELPERS
////////////////////
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

function reifyAST(jsProgram){
  var AST = esprima.parse(jsProgram, {range: true, tokens: true, tolerant: true});
  var tokens = AST.tokens;
  delete AST.tokens;
  var openTagPositions = {},
      closeTagPositions = {};

  // tokens get first priority
  tokens.forEach(function(token){
    var start = token.range[0],
        end = token.range[1];

    var tagName = token.type;

    if(tagName){
      getWithInit(openTagPositions, start, []).push(tagName);
      getWithInit(closeTagPositions, end, []).push(tagName);
    }
  });

  //tagnames are inserted bottom-up
  traverse(AST, {
    post: function(node){
      var start = node.range[0],
          end = node.range[1];

      var tagName = node.type;

      if(tagName){
        getWithInit(openTagPositions, start, []).push(tagName);
        getWithInit(closeTagPositions, end, []).push(tagName);
      }
    }
  });

  openTagPositions = mapObject(openTagPositions, function(tags){
    return tags.reverse().map((tag) => `<${tag}>`).join("");
  });

  closeTagPositions = mapObject(closeTagPositions, function(tags){
    return tags.map((tag) => `</${tag}>`).join("");
  });

  //TODO: this may be incorrect
  var stringsToInsert = mergeObjects(openTagPositions, closeTagPositions, function(openStr, closeStr){
    return closeStr + openStr;
  });

  var positionsToInsert = Object.keys(stringsToInsert);
  stringsToInsert = Object.keys(stringsToInsert).map((key)=>stringsToInsert[key]);

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
