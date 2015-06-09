var $          = require('jquery'),
    React      = require('react'),
    Immutable  = require('immutable'),
    beautify   = require('js-beautify').js_beautify,
    blocks     = require('./blocks.es6'),
    hash       = require('object-hash');

//props:
// path, offset
var ColumnLayer = React.createClass({
  getInitialState: function(){
    return {
      layers: Immutable.List(),
      current: -1,
      enabled: Immutable.List(),
      offset: this.props.offset
    };
  },

  render: function(){
    var currentLayer = this.state.layers.get(this.state.current);
    return (
      <div className="columnLayer" style={this.props.style}>
        <Column ref="column"
                path={this.props.path}
                offset={this.state.offset}
                type={this.props.type}

                addPath={this.addLayer}
                adjustOffset={this.adjustOffset}/>

        <div className="columnChildren">{
          this.state.layers.map((layer, index) =>
            <ColumnLayer key={index}
                         ref={index}
                         style={
                                  this.state.enabled.get(index) ?
                                    (
                                      (index === this.state.current) ?
                                        {opacity: 1, zIndex: '1'} :
                                        {opacity: 0.1, zIndex: '0'}
                                    ) :
                                    {display: 'none'}
                                }
                         {...layer}/>
          )
        }</div>
      </div>
    );
  },

  addLayer: function(path, {type, prepend}, offset){
    var current = this.state.layers.findIndex((s) => path === s.path);
    var layerState = {path, offset, type};

    if(prepend){
      this.refs.column.prepend({path, type, offset});
    } else {
      if(current === -1){
        this.setState({
          layers: this.state.layers.push(layerState),
          current: this.state.layers.size,
          enabled: this.state.enabled.push(true)
        });
      } else {
        this.setState({
          layers: this.state.layers.set(current, layerState),
          current: current,
          enabled: this.state.enabled.set(current,
                                          /*!*/this.state.enabled.get(current))
        });
      }
    }
  },

  adjustOffset: function(delta){
    this.setState({
      offset: this.state.offset + delta
    })
  }
});

var Column = React.createClass({
  render: function(){
    return (
      <div className="column columnSet">
        <MainColumn ref="main"
                    {...this.props}/>
        <SideColumn ref="side"
                    path={commentPath(this.props.path)}
                    getOffset={this.getOffset}
                    addPath={this.props.addPath}/>
      </div>
    )
  },

  getOffset: function(block){
    return this.refs.main.getOffset(block);
  },

  prepend: function(block){
    var that = this;
    $.ajax({
      url: block.path,
      dataType: 'text'
    }).done((code) => {
      block.code = code;
      that.refs.main.prepend(block);
    }).fail((err)=>{
      console.log(this);
    });
  }
});

var commentPath = (path) => path.replace('blocks', 'comments')
                                .replace('js', 'json');


//props:
// path, getOffset
var SideColumn = React.createClass({
  getInitialState: function(){
    return {
      blocks: Immutable.List()
    };
  },

  componentDidMount: function(){
    $.ajax({
      url: this.props.path,
      dataType: 'json'
    }).done((comments) => {
      this.setState({
        blocks: Immutable.List(comments)
      });
    });
  },

  render: function(){
    return(
      this.state.blocks.size > 0 ?
        <div className="column sideColumn">{
          this.state.blocks.map((comment, index) =>
            <blocks.CommentBlock key={index}
                                 text={comment.text}
                                 offset={this.props.getOffset(comment.block)}
                                 addPath={this.props.addPath}/>
          )
        }</div> :
        <div></div>
    );
  }
});

//props:
// path, offset, type, addPath
var MainColumn = React.createClass({
  getInitialState: function(){
    return {
      blocks: Immutable.List()
    };
  },

  componentDidMount: function(){
    var column = this;
    $.ajax({
      url: this.props.path,
      dataType: 'text'
    }).done((data) => {
      switch(column.props.type){
      case "code":
        var code = beautify(data, {
                                    indent_size: 2
                                  });
        column.setState({
          blocks: Immutable.List(code.split('\n\n')).map((code)=>{
            return {code, type: "code"};
          })
        });
        break;
      case "documentation":
        var code = data;
        column.setState({
          blocks: Immutable.List([{code, type: "documentation"}])
        });
      }
    }).fail((xhr, text, thrown)=>{
      console.error(xhr);
    });
  },

  render: function(){
    return (
      <div className="column mainColumn">
      <span className="title">{this.props.path}</span>
      {
        this.state.blocks.map((block, index) => {
          var props = {
                        code: block.code,
                        adjust: block.adjust,
                        path: this.props.path,
                        offset: this.props.offset,
                        addPath: this.props.addPath,
                        adjustOffset: this.props.adjustOffset
                      };
          switch(block.type){
          case "code":
            return <blocks.CodeBlock key={hash(block)} ref={index} {...props}/>
          case "documentation":
            return <blocks.MarkdownBlock key={hash(block)} ref={index} {...props}/>
          }
        })
      }</div>
    );
  },

  getOffset: function(block){
    if(this.refs[block]){
      return $(React.findDOMNode(this.refs[block])).offset().top;
    } else {
      return 0;
    }
  },

  prepend: function(block){
    if(this.state.blocks.findIndex((b)=> block.path === b.path) === -1){
      block.adjust=true;
      this.setState({
        blocks: this.state.blocks.unshift(block)
      });
    }
  }
});


exports.ColumnLayer = ColumnLayer;
