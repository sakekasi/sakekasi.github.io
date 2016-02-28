'use strict';

var textures = require("textures");

var treeUtils = require("./treeUtils.js");

var duration = 100;
var curId = 0;

class TreeViz{
  constructor(svg, root, ohmToDom, actions){
    this.ohmToDom = ohmToDom;
    this.actions = actions;

    this.svg = d3.select(svg);

    this.texture = textures.lines()
                     .size(3)
                     .strokeWidth(1)
                     .stroke("hsla(0, 0%, 0%, 0.5)")
                     .background("hsla(0, 0%, 0%, 0.2)");

    this.svg.call(this.texture);


    this.svg = this.svg.append("g")
       .attr("transform", "translate(10, 10)");


    let boundingRect = svg.getBoundingClientRect();
    this.width = boundingRect.width - 50;
    this.height = boundingRect.height - 50;

    this.tree = d3.layout.tree()
      .children(function(n){
        if(n.children && !n.hasOwnProperty('_children')){
          n._children = n.children;
        }

        if(n._children
           && n._children.length > 0){
          let descendants = treeUtils.descendants(n, function(child){
            if(child.children && !child._children){
              child._children = child.children;
            }

            return child._children;
          });

          if(descendants.reduce((a,b)=> b.current || a, false)){
            return n._children;
          }
        }

        return null;
      })
      .size([this.height, this.width]);

    this.voronoi = d3.geom.voronoi()
    	.x(function(d) { return d.y; })
    	.y(function(d) { return d.x; })
    	.clipExtent([[-10, -10], [this.width, this.height]]);

    this.root = root;
    this.root.x0 = this.height/2;
    this.root.y0 = 0;

    this.update(root);
  }

  update(parent){
    let nodes = this.tree.nodes(this.root),//.reverse(),
        links = this.tree.links(nodes);

    let svgNode = this.svg.selectAll("g.node")
      .data(nodes, function(d){ //assign each object an id since d3 can't do object equality apparently :/
        if(d.id){
          return d.id;
        } else {
          d.id = curId++;
          return d.id;
        }
      });

    let svgNodeEnter = svgNode.enter().append("g")
      .attr("class", "node")
      .attr("transform", `translate(${parent.y0}, ${parent.x0})`)
      .attr("id", (d)=>d.id)
    .append("circle")
      .attr("r", (node)=>
        node.landmark? 3: 5);

    let treeviz = this;
    let svgNodeUpdate = svgNode
      .on("mouseover", function(datum){
        treeviz.actions.highlightNode(datum);
      }, true)
      .on("mouseout",  function(datum){
        treeviz.actions.unHighlightNode(datum);
      }, true)
      .on("click", function(datum){
        if(d3.event.altKey || d3.event.ctrlKey){
          treeviz.actions.joinNode(datum);
        } else if(datum.current){
          treeviz.actions.splitNode(datum);
        }
      }, true)
    .transition().duration(duration)
      .attr("transform", (n)=> `translate(${n.y}, ${n.x})`)
      .style("fill", (n)=> {
        if( n.landmark ){
          return "hsla(0, 0%, 0%, 0.7)";
          // console.log(this.texture.url());
          return this.texture.url();
        } else if( n.cstNodes[0].result instanceof Error ){
          return  "red";
        } else {
          return "green";
        }
      });

    let svgNodeExit = svgNode.exit().transition()
      .duration(duration)
      .attr("transform", (n)=> `translate(${parent.y0}, ${parent.x0})`)
      .remove();

    let polygon = function(d) {
      return "M" + d.join("L") + "Z";
    };

    //Create the Voronoi grid
    let paths = this.svg.selectAll("path")
      .data(this.voronoi(nodes));

    paths.enter().append("path");
    paths.exit().remove();

    paths.attr("d", function(d, i) { return "M" + d.join("L") + "Z"; })
      .datum(function(d, i) { return d.point; })
            //Give each cell a unique class where the unique part corresponds to the circle classes
      .attr("class", function(d,i) { return "voronoi " + d.CountryCode; })
      // .style("stroke", "#2074A0") //If you want to look at the cells
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mouseover", function(datum){
        treeviz.actions.highlightNode(datum);
      })
      .on("mouseout",  function(datum){
        treeviz.actions.unHighlightNode(datum);
      })
      .on("click", function(datum){
        if(d3.event.altKey || d3.event.ctrlKey){
          treeviz.actions.joinNode(datum);
        } else if(datum.current){
          treeviz.actions.splitNode(datum);
        }
      }, true);

    nodes.forEach((n)=>{
      n.x0 = n.x;
      n.y0 = n.y;
    });
  }

  split(node){
    // node.clicked = true;
    this.update(node);
  }

  join(node){
    this.update(node);
  }

  highlight(node){
    d3.select(`g.node[id="${node.id}"]`).selectAll("circle").transition().duration(duration)
      .attr("r", 8);
  }

  unHighlight(node){
    d3.select(`g.node[id="${node.id}"]`).selectAll("circle").transition().duration(duration)
      .attr("r", node.landmark? 3 : 5);
  }
}

var toExport = {
  TreeViz
};

if(typeof module !== "undefined" && typeof module.exports !== "undefined"){
  module.exports = toExport;
} else {
  Object.assign(window, toExport);
}
