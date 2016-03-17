'use strict';
var lib = require("./lib.js");

var _ = function(arr){return Array.prototype.slice.call(arr)};
var makeElement = lib.makeElement;

class GrammarView {
  constructor(element, {grammar}){
    this.element = element;
    this.current = element;

    this.s = ohm.ohmGrammar.semantics();

    let that = this;

    this.s.addOperation('viz', {
      Grammar:        function(n, s, _l, rs, _r) {
                           that.enter('grammar');
                             that.add('name', n.viz());
                             s.viz();
                             that.enter('rules');
                               rs.viz();
                             that.leave();
                           that.leave();
                         },
      SuperGrammar:function(_, n) {
                           that.enter('super');
                             that.add('name', n.viz());
                           that.leave();
                         },
      Rule:            function(expr) {
                           that.enter('rule');
                             expr.viz();
                           that.leave();
                         },
      Rule_define:   function(n, fs, d, _equals, _optBar, b) {
                           that.add('name', n.viz());
                           d.viz();
                           that.enter('ruleDefineBody');
                             b.viz();
                           that.leave();
                         },
      Rule_override:function(n, fs, _colonEquals, _optBar, b) {
                           that.add('name', n.viz());
                           that.enter('ruleOverrideBody');
                             b.viz();
                           that.leave();
                         },
      Rule_extend:function(n, fs, _plusEquals, _optBar, b) {
                           that.add('name', n.viz());
                           that.enter('ruleExtendBody');
                             b.viz();
                           that.leave();
                         },
      ruleDescr:     function(_l, t, _r) {
                           that.add('description', t.viz());
                         },
      ruleDescrText: function(_) {
                           return this.interval.contents;
                         },
      Alt:               function(x, _, xs) {
                           that.enter('alt');
                             x.vizChoice();
                             xs.vizChoice();
                           that.leave();
                         },
      Term:              function(expr) {
                           expr.viz();
                         },
      Term_inline:       function(x, n) {
                           x.viz();
                           n.viz();
                         },
      caseName:          function(_d, _s1, n, _s2, _t) {
                           that.add('caseName', n.viz());
                         },
      Seq:               function(expr) {
                           that.enter('seq');
                             expr.viz();
                           that.leave();
                         },
      Iter:              function(expr) {
                           expr.viz();
                         },
      Iter_star:         function(x, _) {
                           that.enter('star');
                             x.viz();
                           that.leave();
                         },
      Iter_plus:         function(x, _) {
                           that.enter('plus');
                             x.viz();
                           that.leave();
                         },
      Iter_opt:          function(x, _) {
                           that.enter('opt');
                             x.viz();
                           that.leave();
                         },
      Pred:              function(expr) {
                           expr.viz();
                         },
      Pred_not:          function(_, x) {
                           that.enter('not');
                             x.viz();
                           that.leave();
                         },
      Pred_lookahead:    function(_, x) {
                           that.enter('lookahead');
                             x.viz();
                           that.leave();
                         },
      Base:              function(expr) {
                           expr.viz();
                         },
      Base_application:  function(rule, ps) {
                           that.add('app', rule.viz());
                         },
      Base_prim:         function(expr) {
                           expr.viz();
                         },
      Base_paren:        function(_l, x, _r) {
                           that.enter('paren');
                             x.viz();
                           that.leave();
                         },
      Base_arr:          function(_l, x, _r) {
                           that.enter('arr');
                             x.viz();
                           that.leave();
                         },
      Base_obj:          function(_l, lenient, _r) {
                           throw 'TODO';
                         },
      Base_objWithProps: function(_l, ps, _c, lenient, _r) {
                           throw 'TODO';
                         },
      Props:             function(p, _, ps) {
                           throw 'TODO';
                         },
      ident:             function(n) {
                           return n.viz();
                         },
      name:              function(_first, _rest) {
                           return this.interval.contents;
                         },
      string:            function(_lq, cs, _rq) {
                           that.add('string', escape(eval(this.interval.contents)));
                         },
      number:            function(_neg, _digits) {
                           that.add('prim', this.interval.contents);
                         },
      keyword:           function(expr) {
                           expr.viz();
                         },
      keyword_null:      function(_) {
                           that.add('prim', 'null');
                         },
      keyword_true:      function(_) {
                           that.add('prim', 'true');
                         },
      keyword_false:     function(_) {
                           that.add('prim', 'false');
                         },
      Prop:              function(n, _, p) {}
    });

    this.s.addOperation('vizChoice', {
      _nonterminal:      function(children) {
                           that.enter('choice');
                             this.viz();
                           that.leave();
                         }
    });

    let m = ohm.ohmGrammar.match(
      grammar.definitionInterval.contents,
      'Grammar'
    );
    if (m.failed()) {
      console.log(m.message);
      // source.className = 'error';
    } else {
      // removeChildren(vizDiv);
      this.s(m).viz();
      // source.className = undefined;
    }
  }

  //ACCESSORS
  getNode(ruleName){
    let parts = ruleName.split("_");
    let rule = parts[0];

    let names = _(this.element.querySelectorAll("rule > name"));
    let ruleNode = names.filter(name=>
      name.textContent === rule
    )[0].parentNode;

    if(parts.length > 1){
      let caseNames = _(ruleNode.querySelectorAll("casename"));
      return caseNames.filter(casename=>
        casename.textContent === parts[1]
      )[0].parentNode;
    } else {
      return ruleNode;
    }
  }

  //HELPERS
  enter(tag) {
    var child = makeElement(tag);
    this.current.appendChild(child);
    this.current = child;
  }

  leave() {
    this.current = this.current.parentElement;
  }

  addNode(node) {
    this.current.appendChild(node);
  }

  add(/* tagName, child1, child2, ... */) {
    this.addNode(makeElement.apply(this, arguments));
  }
}

function escape(str) {
  var node = document.createElement('span');
  for (var idx = 0; idx < str.length; idx++) {
    if (str.charCodeAt(idx) < 32) {
      var c;
      switch (str.charAt(idx)) {
        case '\r':
          c = '\\r';
          break;
        case '\n':
          c = '\\n';
          break;
        case '\t':
          c = '\\t';
          break;
        default:
          c = '(ascii ' + str.charCodeAt(idx) + ')';
      }
      node.appendChild(makeElement('specialChar', c));
    } else if(str.charCodeAt(idx) > 127){
      c = ("000"+str.charCodeAt(idx).toString(16));
      c = "\\u" + (c.substring(c.length-4).toUpperCase());
      node.appendChild(makeElement('unicodeChar', c));
    } else {
      node.appendChild(document.createTextNode(str.charAt(idx)));
    }
  }
  return node;
}


var toExport = {
  GrammarView
};

if(typeof module !== "undefined" && typeof module.exports !== "undefined"){
  module.exports = toExport;
} else {
  Object.assign(window, toExport);
}
