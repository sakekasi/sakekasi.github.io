var React  = require('react'),
    $      = require('jquery'),
    ColumnLayer = require('./layout.es6').ColumnLayer;


React.render(
  <ColumnLayer path='blocks/selection/selection.js'
               offset='35'
               type='code'
               style={{}}/>,
  document.body
);

$('body > .columnLayer').offset({left: $(document).width()/2 - 350});

global.$ = $;
