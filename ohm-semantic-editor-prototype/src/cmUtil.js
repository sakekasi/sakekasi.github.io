"use strict";

var toExport = {
  markInterval,
  clearMark,
  scrollToInterval
};

if(typeof module !== "undefined" && typeof module.exports !== "undefined"){
  module.exports = toExport;
} else {
  Object.assign(window, toExport);
}

function markInterval(cm, interval, className, canHighlightBlocks) {
  var startPos = cm.posFromIndex(interval.startIdx - 1);
  var endPos = cm.posFromIndex(interval.endIdx);

  // See if the selection can be expanded to a block selection.
  if (canHighlightBlocks && isBlockSelectable(cm, startPos, endPos)) {
    return markBlock(cm, startPos.line, endPos.line, className);
  }
  return cm.markText(startPos, endPos, {className: className});
}

function clearMark(mark) {
  if (mark) {
    mark.clear();
  }
}

function scrollToInterval(cm, interval) {
  var startHeight = indexToHeight(cm, interval.startIdx);
  var endHeight = indexToHeight(cm, interval.endIdx);
  var scrollInfo = cm.getScrollInfo();
  var margin = scrollInfo.clientHeight - (endHeight - startHeight);
  if (startHeight < scrollInfo.top  ||
      endHeight > (scrollInfo.top + scrollInfo.clientHeight)) {
    cm.scrollIntoView({left: 0, top: startHeight,
                       right: 0, bottom: endHeight},
                      margin > 0 ? margin / 2 : undefined);
  }
}
