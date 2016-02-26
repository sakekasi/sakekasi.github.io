'use strict';

var duration = 100;
var curId = 0;

class TreeViz{
  constructor(svg, root, ohmToDom){
    this.ohmToDom = ohmToDom;

    this.svg = d3.select(svg)
               .append("g")
                 .attr("transform", "translate(10, 10)");

    let boundingRect = svg.getBoundingClientRect();
    this.width = boundingRect.width - 20;
    this.height = boundingRect.height - 20;

    this.tree = d3.layout.tree()
      .children(function(n){
        if(n.children){
          n._children = n.children;
        }

        if(n._children
           && n._children.length > 0
           && n._children[0].current !== undefined){
          return n.children? n.children: n.children = n._children;
        }

        return null;
      })
      .size([this.height, this.width]);

    this.root = root;
    this.root.x0 = this.height/2;
    this.root.y0 = 0;

    this.update(root);
  }

  update(parent){
    let nodes = this.tree.nodes(this.root);//.reverse();
    let voronoi = d3.geom.voronoi()
    	.x(function(d) { return d.x; })
    	.y(function(d) { return d.y; })
    	.clipExtent([[-10, -10], [this.width, this.height]]);



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
      .attr("r", 5);

    let treeviz = this;
    // .on("mouseover", function(datum){
    //   this.classList.add("active");
    //   treeviz.ohmToDom.get(datum.cstNodes.slice(-1)[0]).classList.add("active");
    // }).on("mouseout", function(datum){
    //   this.classList.remove("active");
    //   treeviz.ohmToDom.get(datum.cstNodes.slice(-1)[0]).classList.remove("active");
    // })
    let svgNodeUpdate = svgNode
    .transition().duration(duration)
      .attr("transform", (n)=> `translate(${n.y}, ${n.x})`)
      .style("fill", (n)=> {
        // if(n.clicked){
        //   return "gray";
      /*} else */if( n.cstNodes.slice(-1)[0].result instanceof Error ){
          return  "red";
        } else {
          return "green";
        }
      });

    let svgNodeExit = svgNode.exit().transition()
      .duration(duration)
      .attr("transform", (n)=> `translate(${parent.y0}, ${parent.x0})`)
      .remove();

    console.log(voronoi(nodes));

    let polygon = function(d) {
      return "M" + d.join("L") + "Z";
    };
    //Create the Voronoi grid
    this.svg.selectAll("path")
      .data(voronoi(nodes), polygon)
      .enter().append("path")
      .attr("d", polygon)
      .datum(function(d, i) { return d.point; })
      //Give each cell a unique class where the unique part corresponds to the circle classes
      .attr("class", function(d,i) { return "voronoi " + d.CountryCode; })
      //.style("stroke", "#2074A0") //If you want to look at the cells
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mouseover", function(datum){
        this.classList.add("active");
        treeviz.ohmToDom.get(datum.cstNodes.slice(-1)[0]).classList.add("active");
      })
      .on("mouseout",  function(datum){
        this.classList.remove("active");
        treeviz.ohmToDom.get(datum.cstNodes.slice(-1)[0]).classList.remove("active");
      });

    nodes.forEach((n)=>{
      n.x0 = n.x;
      n.y0 = n.y;
    });
  }

  split(node){
    node.clicked = true;
    this.update(node);
  }

  highlight(node){
    d3.select(`g.node[id="${node.id}"]`).selectAll("circle").transition().duration(duration)
      .attr("r", 8);
  }

  unHighlight(node){
    d3.select(`g.node[id="${node.id}"]`).selectAll("circle").transition().duration(duration)
      .attr("r", 5);
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
