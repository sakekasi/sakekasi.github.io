var $          = require('jquery'),
    React      = require('react'),
    Immutable  = require('immutable'),
    esprima    = require('esprima'),
    estraverse = require('estraverse'),
    path       = require('path'),
    marked     = require('marked'),
    console    = require('console-browserify');

//props:
// text, offset
var CommentBlock= React.createClass({
  render: function(){
    var style = { top: this.props.offset };
    return (
      <div className="block commentBlock" style={style}
           dangerouslySetInnerHTML={{__html: marked(this.props.text)}}/>
    );
  },

  componentDidMount: function(){
    var block = this;
    $(React.findDOMNode(this)).find('a').click(function(e){
      e.preventDefault();


      block.props.addPath($(this).attr('href'),
                         {type: 'documentation'},
                         $(React.findDOMNode(this)).offset().top);
    })
  }
})

//props:
// code, offset
var CodeBlock = React.createClass({
  render: function(){
    var style = {
                  top: this.props.offset - 35 //35 is a magic number. we'll
                                              //get rid of it soon
                };
    return (
      <div className="block codeBlock highlight" style={style}>
        <pre>{
            toDom(this.props.code, this.props.path, this.props.addPath)
        }</pre>
      </div>
    );
  }
});

//props:
// code, offset
var MarkdownBlock = React.createClass({
  render: function(){
    var style = {
      top: this.props.offset - 35
    };

    return (
      <div className="block markdownBlock" style={style}
           dangerouslySetInnerHTML={{__html: marked(this.props.code)}}/>
    );
  },

  componentDidMount: function(){
    if(this.props.adjust){
      this.props.adjustOffset(-$(React.findDOMNode(this)).height() - 30);
    }

    var block = this;
    $(React.findDOMNode(this)).find('a').click(function(e){
      e.preventDefault();

      var params = {type: 'documentation'},
          path = $(this).attr('href');
      if($(this).attr('href').substring(0, 3) === '$up'){
        params.prepend = true;
        path = $(this).attr('href').substring(3);
      }
      block.props.addPath(path,
                          params,
                          $(React.findDOMNode(this)).offset().top);
    })
  }
});



//props:
// path, addPath
var ImportDeclaration = React.createClass({
  render: function(){
    return (
      <span className="import" onClick={this.handleClick}>{
        this.props.children
      }</span>
    );
  },

  handleClick: function(event){
    var newPath = relativeFrom(this.props.path,
                               this.props.children.split('"')[1]);
    this.props.addPath(newPath,
                       {type: "code"},
                       $(React.findDOMNode(this)).offset().top);
  }
});

function toDom(code, path, addPath){
  var nodes = [];
  try {
    var ast = esprima.parse(code, {
      range: true,
      raw: true,
      tolerant: true
    });
  } catch (e) {
    return [code];
  }

  estraverse.traverse(ast, {
    enter: function(node, parent){
      var codeFragment =
                    code.substring(node.range[0],node.range[1]) +
                      ((parent!==null && parent.type==="Program") ? "\n" : "");

      if(node.type === "ImportDeclaration"){
          nodes.push(
            <ImportDeclaration path={path} addPath={addPath}>{
              codeFragment
            }</ImportDeclaration>
          )

      } else if(node.type !== "Program"){
          nodes.push(
            <span>{
              codeFragment
            }</span>
          );
      }

      if(node.type !== "Program"){
        this.skip();
      }
    }
  });

  return nodes;
}

var relativeFrom = (base, relPath) =>
    path.resolve(path.dirname(base),relPath).substring(1)+".js";

exports.CodeBlock     = CodeBlock;
exports.CommentBlock  = CommentBlock;
exports.MarkdownBlock = MarkdownBlock;
