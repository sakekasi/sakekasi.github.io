class ExpanderButton{
  constructor(){
    this.domNode = document.createElement("div");
    this.domNode.classList.add("expanderButton");
    this.clickListeners = [];

    this.domNode.addEventListener("click", this.onClick.bind(this));
  }

  onClick(evt){
    this.domNode.classList.toggle("expanded");
    this.clickListeners.forEach((cl)=> cl.click(evt));
  }
}

var toExport = {
  ExpanderButton
};

if(typeof module !== "undefined" && typeof module.exports !== "undefined"){
  module.exports = toExport;
} else {
  Object.assign(window, toExport);
}
