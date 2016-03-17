'use strict';

class HighlightingEditor {
  constructor(element, grammar, pparse = false){
    this.grammar = grammar;
    this.pparse = pparse;

    let editor = this.editor = CodeMirror(element);
    this.editor.setOption("extraKeys", {
      Tab: function(cm){
        var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
        cm.replaceSelection(spaces);
      }
    });

    let that = this;
    this.count = 0;
    this.marks = [];
    this.nodeToMark = new Map();
    this.markToNode = new Map();

    //*ref https://gitlab.com/cdg/ppls/raw/master/lib/playground.js
    this.semantics = grammar && grammar.semantics().addOperation('syntaxHighlight', {
      _nonterminal: function(children) {
        // console.log(children[0].ctorName, that.count++);
        let ruleName = this.ctorName;
        let doc = that.editor.doc;

        let currentMark = doc.markText(
          doc.posFromIndex(this.interval.startIdx),
          doc.posFromIndex(this.interval.endIdx),
          {className: ruleName}
        );

        that.marks.push(currentMark);
        that.nodeToMark.set(this._node, currentMark);
        that.markToNode.set(currentMark, this._node);

        // that.markInterval( this.interval, ruleName, false );

        // Only bother to mark up the first level of lexical rule.
        // (We don't care about the decomposition of a token for syntax highlighting.)
        if (this.isSyntactic() ||
            ruleName === 'tokens' || ruleName === 'keyword' || ruleName === 'space' || ruleName === 'spaces') {
          children.forEach(function(child) { child.syntaxHighlight() });
        }
      }
    });
  }

  setValue(contents){
    this.editor.setValue(contents);
    this.count = 0;
    if(this.pparse){
      this.clearMarks();
      this.nodeToMark = new Map();
      this.markToNode = new Map();
      this._syntaxHighlight(contents);
    }
  }

  //*ref https://raw.githubusercontent.com/cdglabs/ohm/master/visualizer/cmUtil.js
  markInterval(interval, className, canHighlightBlocks){
    var startPos = this.editor.posFromIndex(interval.startIdx - 1);
    var endPos = this.editor.posFromIndex(interval.endIdx);

    // See if the selection can be expanded to a block selection.
    if (canHighlightBlocks && isBlockSelectable(this.editor, startPos, endPos)) {
      return markBlock(this.editor, startPos.line, endPos.line, className);
    }
    return this.editor.markText(startPos, endPos, {className: className});
  }

  //*ref https://raw.githubusercontent.com/cdglabs/ohm/master/visualizer/cmUtil.js
  clearMark(mark){
    if (mark) {
      mark.clear();
    }
  }

  clearMarks(){
    let mark;
    while(mark = this.marks.shift()){
      mark.clear();
    }
  }

  //*ref https://raw.githubusercontent.com/cdglabs/ohm/master/visualizer/cmUtil.js
  scrollToInterval(interval){
    var startHeight = indexToHeight(this.editor, interval.startIdx);
    var endHeight = indexToHeight(this.editor, interval.endIdx);
    var scrollInfo = this.editor.getScrollInfo();
    var margin = scrollInfo.clientHeight - (endHeight - startHeight);
    if (startHeight < scrollInfo.top  ||
        endHeight > (scrollInfo.top + scrollInfo.clientHeight)) {
      this.editor.scrollIntoView({left: 0, top: startHeight,
                         right: 0, bottom: endHeight},
                        margin > 0 ? margin / 2 : undefined);
    }
  }

  _syntaxHighlight(src){
    console.log("_syntaxHighlight start");
    //*ref https://gitlab.com/cdg/ppls/raw/master/lib/playground.js
    let matchResult = this.grammar.match(src);
    console.log("matchresult");
    if (matchResult.succeeded()) {
      console.log("succeeded");
      console.log("starting semact 1");
      this.semantics(matchResult).syntaxHighlight();
      console.log("starting semact 2");
      this.semantics(matchResult.getDiscardedSpaces()).syntaxHighlight();
    } else {
      console.log("failed");
      // The input didn't parse, but we can at least highlight tokens individually.
      matchResult = this.grammar.match(src, 'tokens');
      console.log("starting semact");
      this.semantics(matchResult).syntaxHighlight();
    }

    console.log("_syntaxHighlight end");
  }
}


var toExport = {
  HighlightingEditor
};

if(typeof module !== "undefined" && typeof module.exports !== "undefined"){
  module.exports = toExport;
} else {
  Object.assign(window, toExport);
}


//HELPERS
///////////////

function isSyntactic(ruleName) {
  var firstLetter = ruleName.charAt(0).toLowerCase();
  return 'a' <= firstLetter && firstLetter <= 'z';
}

function countLeadingWhitespace(str) {
  return str.match(/^\s*/)[0].length;
}

function countTrailingWhitespace(str) {
  return str.match(/\s*$/)[0].length;
}

function indexToHeight(cm, index) {
  var pos = cm.posFromIndex(index);
  return cm.heightAtLine(pos.line, 'local');
}

function isBlockSelectable(cm, startPos, endPos) {
  var lastLine = cm.getLine(endPos.line);
  return countLeadingWhitespace(cm.getLine(startPos.line)) === startPos.ch &&
         (lastLine.length - countTrailingWhitespace(lastLine)) === endPos.ch;
}

// Mark a block of text with `className` by marking entire lines.
function markBlock(cm, startLine, endLine, className) {
  for (var i = startLine; i <= endLine; ++i) {
    cm.addLineClass(i, 'wrap', className);
  }
  return {
    clear: function() {
      for (var i = startLine; i <= endLine; ++i) {
        cm.removeLineClass(i, 'wrap', className);
      }
    }
  };
}
