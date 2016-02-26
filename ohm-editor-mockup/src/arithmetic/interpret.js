'use strict';

var toExport = {
  registerInterpret
};

if(typeof module !== "undefined" && typeof module.exports !== "undefined"){
  module.exports = toExport;
} else {
  Object.assign(window, toExport);
}

var constants = {pi: Math.PI, e: Math.E};

function registerInterpret(semantics){
  semantics.addOperation('interpret', {
    Exp: function(e) {
      return e.interpret();  // Note that operations are accessed as methods on the CST nodes.
    },

    AddExp: function(e) {
      return e.interpret();
    },
    AddExp_plus: function(x, _, y) {
      return x.interpret() + y.interpret();
    },
    // AddExp_minus: function(x, _, y) {
    //   return x.interpret() - y.interpret();
    // },

    MulExp:        function(e)         { return e.interpret(); },
    MulExp_times:  function(x, _, y)   { return x.interpret() * y.interpret(); },
    MulExp_divide: function(x, _, y)   { return x.interpret() / y.interpret(); },
    ExpExp:        function(e)         { return e.interpret(); },
    ExpExp_power:  function(x, _, y)   { return Math.pow(x.interpret(), y.interpret()); },
    PriExp:        function(e)         { return e.interpret(); },
    PriExp_paren:  function(_l, e, _r) { return e.interpret(); },
    PriExp_pos:    function(_, e)      { return e.interpret(); },
    PriExp_neg:    function(_, e)      { return -e.interpret(); },

    ident: function(_l, _ns) {
      return constants[this.interval.contents] || 0;
    },
    number: function(_) {
      return parseFloat(this.interval.contents);
    }
  });
}
