"use strict";

var util = require("./util.js"),
    reifyES = require("./reifyES.js");
var $ = require("jquery"),
    chroma = require("chroma-js");

var compare = util.compare,
    reifyES = reifyES.reifyES;

var identColor = "hsla(58, 100%, 80%, 1)"

var focusedItems = null;

var _ = function(x){ return Array.prototype.slice.call(x)};

document.addEventListener("DOMContentLoaded", function(){

  _(document.querySelectorAll('action')).forEach((action)=>{
    action.innerHTML = reifyES(action.textContent);
  });

  var scale = chroma.scale(
    [chroma.hsl(0, 0, 1), chroma.hsl(0, 0, 0.96)]
  ).domain([0,5])
  .mode('lch');

  _(document.querySelectorAll('rule')).forEach((rule)=>{
    _(rule.querySelectorAll('rule > ruledefinebody > alt > choice')).forEach((choice, i)=>{
      let color = scale(i%5);
      $(choice).css("background-color", color.css('hsl'));
      getAction($(choice)).css("background-color", color.css('hsl'));
    });
  });

  parallelHighlight('rule choice',
    function(ruleChoice){ return ruleChoice.parent(); }, "parentHover",
    function(ruleChoice){ return getAction(ruleChoice); }, "hover"
  );
  $('rule choice').mouseover(function(){
    var action = getAction($(this));
    moveToIdealNonOverlapping($('action'), action.get()[0]);
  }).mouseout(function(){
    moveToIdealNonOverlapping($('action'), null);
  }).click(function(){
    flipFocusedItems(
      this,
      getAction($(this)).get()[0]
    );
  });

  parallelHighlight('rule > name, rule > description',
    function(ruleDesc){ return ruleDesc.parent(); }, "hover",
    function(ruleDesc){ return ruleDesc.parent().find("choice"); }, "hover",
    function(ruleDesc){ return getActionsForRule(ruleDesc.parent()); }, "hover"
  );
  $('rule > name, rule > description').click(function(){
    let rule = $(this).parent();
    flipFocusedItems(
      this,
      rule.get()[0],
      ...(rule.find('choice').get()),
      ...(getActionsForRule(rule).get())
    )
  })

  parallelHighlight('action',
    function(action){ return getRule(action); }, "parentHover",
    function(action){
      return getAlts(action).length === 0?
        getRule(action):
        getAlts(action);
    }, "hover"
  );
  $('action').click(function(){
    flipFocusedItems(
      this,
      getAlts($(this)).get()[0]
    );
  });

  moveToIdealNonOverlapping($('action'));
})

//INTERACTION HELPERS
/////////////////////////
function parallelHighlight(selector /*, accessor, color, ... */){
  var parallels = Array.prototype.slice.call(arguments, 1);
  var accessors = parallels.filter(function(_, i){ return i%2 === 0; }),
      classes = parallels.filter(function(_, i){ return i%2 === 1; });

  var parallelElements = function(currentElement){
    return accessors.map(function(acc){
      return acc(currentElement);
    });
  }

  $(selector).mouseover(function(){
    $(this).addClass("hover");//css("background-color", highlightedColor);
    parallelElements($(this)).forEach(function(element, i){
      element.addClass(classes[i]);
    });
  }).mouseout(function(){
    if(!isFocused(this)){
      $(this).removeClass("hover");
      parallelElements($(this)).forEach(function(element, i){
        element.removeClass(classes[i]);
      });
    }
  });
}

function flipFocusedItems(...nodes){
  if(focusedItems){
    let onlyNew = nodes.filter((node)=> !focusedItems.includes(node));
    if(onlyNew.length > 0){
      let onlyOld = focusedItems.filter(node=> !nodes.includes(node));
      focusedItems = nodes;
      onlyOld.forEach(node=>{
        $(node).mouseout();
      });

    } else {
      focusedItems = null;
    }
  } else {
    focusedItems = nodes;
  }
}

var isFocused = (item)=> focusedItems && focusedItems.indexOf(item) !== -1;

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
  let alts = getAlts(action);

  let idealPos;

  if(alts.length > 0){
    idealPos = alts.offset().top;
  } else if(getRule(action).children('name').length > 0){
    idealPos = getRule(action).children('name').offset().top;
  } else {
    idealPos = action.offset().top;
  }

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
    element.get()[0].style.top = top + delta;//.css("top", )
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
      // console.log(this.getBoundingClientRect().height);
      return Math.floor(this.getBoundingClientRect().height +
        parseInt($(this).css("margin-top"), 10) +
        parseInt($(this).css("margin-bottom"), 10));
    })
  );

  // console.log(height.length, height, sortedActions.length);

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
