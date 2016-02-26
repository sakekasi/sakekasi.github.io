'use strict';

var classes = require("./classes.js");

var toExport = {
  registerToAST
};

if(typeof module !== "undefined" && typeof module.exports !== "undefined"){
  module.exports = toExport;
} else {
  Object.assign(window, toExport);
}

function registerToAST(semantics){
  semantics.addOperation('toAST', {
    Program: function(stmts) {
      return new classes.Program(stmts.toAST());
    },

    Stmts: function(ss, optE) {
      var e = optE.toAST()[0];
      return ss.toAST().concat(e ? new classes.ExpStmt(e) : []);
    },

    Stmt_classDecl: function(_class, C, _optExtends, optS, _optWith, optXs, _sc) {
      return new classes.ClassDecl(
        C.toAST(),
        optS.toAST()[0] || 'Obj',
        optXs.toAST()[0] || []);
    },

    Stmt_methodDeclJava: function(_def, C, _dot, m, _op, xs, _cp, b) {
      return new classes.MethodDecl(
        C.toAST(),
        m.toAST(),
        xs.toAST(),
        b.toAST());
    },

    Stmt_methodDeclKeyword: function(_def, C, ms, _commas, xs, b) {
      return new classes.MethodDecl(
        C.toAST(),
        ms.toAST().reduce((m, part) => m + part.charAt(0).toUpperCase() + part.substr(1)),
        xs.toAST(),
        b.toAST());
    },

    Stmt_methodDeclBinary: function(_def, C, m, x, b) {
      return new classes.MethodDecl(
        C.toAST(),
        m.toAST(),
        [x.toAST()],
        b.toAST());
    },

    Stmt_methodDeclCall: function(_def, C, _op, xs, _cp, b) {
      return new classes.MethodDecl(
        C.toAST(),
        'call',
        xs.toAST(),
        b.toAST());
    },

    Stmt_varDecl: function(_var, x, _eq, e, _sc) {
      return new classes.VarDecl(x.toAST(), e.toAST());
    },

    Stmt_varAssign: function(x, _eq, e, _sc) {
      return new classes.VarAssign(x.toAST(), e.toAST());
    },

    Stmt_instVarAssign: function(_this, _dot, x, _eq, e, _sc) {
      return new classes.InstVarAssign(x.toAST(), e.toAST());
    },

    Stmt_return: function(_return, e, _sc) {
      return new classes.Return(e.toAST());
    },

    Stmt_exp: function(e, _sc) {
      return new classes.ExpStmt(e.toAST());
    },

    MethodBody_exp: function(_eq, e, _sc) {
      return [new classes.Return(e.toAST())];
    },

    MethodBody_stmt: function(_oc, ss, _cc) {
      return ss.toAST();
    },

    KWSendExp_send: function(e, ms, _colons, es) {
      return new classes.Send(
        e.toAST(),
        ms.toAST().reduce((m, part) => m + part.charAt(0).toUpperCase() + part.substr(1)),
        es.toAST());
    },

    KWSendExp_super: function(_this, ms, _colons, es) {
      return new classes.SuperSend(
        ms.toAST().reduce((m, part) => m + part.charAt(0).toUpperCase() + part.substr(1)),
        es.toAST());
    },

    EqExp_eq: function(x, op, y) {
      return new classes.BinOp(op.toAST(), x.toAST(), y.toAST());
    },

    RelExp_rel: function(x, op, y) {
      return new classes.BinOp(op.toAST(), x.toAST(), y.toAST());
    },

    AddExp_add: function(x, op, y) {
      return new classes.BinOp(op.toAST(), x.toAST(), y.toAST());
    },

    MulExp_mul: function(x, op, y) {
      return new classes.BinOp(op.toAST(), x.toAST(), y.toAST());
    },

    DotExp_send: function(e, _dot, m, _op, es, _cp) {
      return new classes.Send(e.toAST(), m.toAST(), es.toAST());
    },

    DotExp_super: function(_super, _dot, m, _op, es, _cp) {
      return new classes.SuperSend(m.toAST(), es.toAST());
    },

    // DotExp_instVarAccess: function(_this, _dot, x) {
    //   return new classes.InstVar(x.toAST());
    // },

    UnExp_neg: function(_minus, x) {
      return new classes.BinOp('-', new classes.Lit(0), x.toAST());
    },

    CallExp_call: function(b, _op, es, _cp) {
      return new classes.Send(b.toAST(), 'call', es.toAST());
    },

    PriExp_paren: function(_op, e, _cp) {
      return e.toAST();
    },

    PriExp_block: function(_oc, xs, ss, _cc) {
      return new classes.BlockLit(xs.toAST(), ss.toAST());
    },

    PriExp_new: function(_new, C, _op, es, _cp) {
      return new classes.New(C.toAST(), es.toAST());
    },

    PriExp_str: function(s) {
      return new classes.Lit(s.toAST());
    },

    PriExp_ident: function(n) {
      return new classes.Var(n.toAST());
    },

    PriExp_number: function(_) {
      return new classes.Lit(parseFloat(this.interval.contents));
    },

    PriExp_this: function(_) {
      return new classes.This();
    },

    PriExp_true: function(_) {
      return new classes.Lit(true);
    },

    PriExp_false: function(_) {
      return new classes.Lit(false);
    },

    PriExp_null: function(_) {
      return new classes.Lit(null);
    },

    BlockArgNames_some: function(xs, _bar) {
      return xs.toAST();
    },

    BlockArgNames_none: function() {
      return [];
    },

    ident: function(_first, _rest) {
      return this.interval.contents;
    },

    string: function(_oq, cs, _cq) {
      var chars = [];
      var idx = 0;
      cs = cs.toAST();
      while (idx < cs.length) {
        var c = cs[idx++];
        if (c === '\\' && idx < cs.length) {
          c = cs[idx++];
          switch (c) {
            case 'n': c = '\n'; break;
            case 't': c = '\t'; break;
            default: idx--;
          }
        }
        chars.push(c);
      }
      return chars.join('');
    },

    NonemptyListOf: function(x, _seps, xs) {
      return [x.toAST()].concat(xs.toAST());
    },

    EmptyListOf: function() {
      return [];
    }

  });
}
