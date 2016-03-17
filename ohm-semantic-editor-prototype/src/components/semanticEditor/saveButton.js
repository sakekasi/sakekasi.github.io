class SaveButton{
  constructor(){
    this.domNode = document.createElement("div");
    this.domNode.classList.add("saveButton");
    this.clickListeners = [];

    this._saved = false;

    this.domNode.addEventListener("click", this.onClick.bind(this));
  }

  onClick(evt){
    this.clickListeners.forEach((cl)=> cl(evt));
  }

  get saved(){
    return this._saved;
  }

  set saved(saved){
    this._saved = saved;
    this.domNode.classList.toggle("saved", saved);

    return this._saved;
  }
}

var toExport = {
  SaveButton
};

if(typeof module !== "undefined" && typeof module.exports !== "undefined"){
  module.exports = toExport;
} else {
  Object.assign(window, toExport);
}
