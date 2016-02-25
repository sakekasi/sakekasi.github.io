'use strict';

var duration = 500;
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
    .append("circle")
      .attr("r", 5);

    let treeviz = this;
    let svgNodeUpdate = svgNode
      .on("mouseover", function(datum){
        this.classList.add("active");
        treeviz.ohmToDom.get(datum.cstNodes.slice(-1)[0]).classList.add("active");
      }).on("mouseout", function(datum){
        this.classList.remove("active");
        treeviz.ohmToDom.get(datum.cstNodes.slice(-1)[0]).classList.remove("active");
      })
    .transition().duration(duration)
      .attr("transform", (n)=> `translate(${n.y}, ${n.x})`)
      .style("fill", (n)=> {
        if(n.clicked){
          return "gray";
        } else if( n.cstNodes.slice(-1)[0].result instanceof Error ){
          return  "red";
        } else {
          return "green";
        }
      });

    let svgNodeExit = svgNode.exit().transition()
      .duration(duration)
      .attr("transform", (n)=> `translate(${parent.y0}, ${parent.x0})`)
      .remove();

    nodes.forEach((n)=>{
      n.x0 = n.x;
      n.y0 = n.y;
    });
  }

  split(node){
    node.clicked = true;
    this.update(node);
  }
}

window.TreeViz = TreeViz;
