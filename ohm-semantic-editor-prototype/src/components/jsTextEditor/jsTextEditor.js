var esprima = require("esprima");

class JSTextEditor {
  constructor(domNode, {
    body = ''
  }){
    this.domNode = domNode;
    this.editor = CodeMirror(this.domNode);
    this.editor.setValue(body);

    this.settledChangeListeners = [];
    this.changeListeners = [];

    this.previousTimeout = null;
    this.marks = [];
    this.editor.on('change', ()=>{
      let match, valid, tokens;
      try{
        match = esprima.parse(this.editor.getValue(), {range: true, tokens: true});
        valid = true;
        this.marks.forEach(mark=> mark.clear());
        this.marks = [];
        tokens = match.tokens;
      } catch(e){
        valid = false;
        tokens = esprima.tokenize(this.editor.getValue(), {range: true});
      }
      this._syntaxHighlight(tokens);
      this.onChange(valid);

      if(this.previousTimeout){
          clearTimeout(this.previousTimeout);
      }
      this.previousTimeout = setTimeout(this.onSettledChange.bind(this, valid), 500);
    });
  }

  onSettledChange(valid){
    this.settledChangeListeners.forEach(listener=> listener(valid));
    this.previousTimeout = null;
  }

  onChange(valid){
    this.changeListeners.forEach(listener=> listener(valid));
  }

  _syntaxHighlight(tokens){
    tokens.forEach((token)=>{
      var doc = this.editor.doc;
      this.marks.push(doc.markText(
          doc.posFromIndex(token.range[0]),
          doc.posFromIndex(token.range[1]),
          {className: token.type}
      ));
    });
  }
}

var toExport = {
  JSTextEditor
};

if(typeof module !== "undefined" && typeof module.exports !== "undefined"){
  module.exports = toExport;
} else {
  Object.assign(window, toExport);
}
