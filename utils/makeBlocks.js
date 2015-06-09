var fs = require('fs'),
    path = require('path');

var fileString = fs.readFileSync('doc.md', {encoding: 'utf8'});
var re = /(?:\n(#+) ([\w&]+(?: [\w&]+)*))|(?:\n<a(?: name="\w+")? href="(?:Selections)?#(?:\w+)">#<\/a> (\w+.)<b>([a-zA-Z]+)<\/b>(?:\([a-zA-Z0-9, \[\]<>\/…]*\))?)/m;

var blocks = fileString.split(re)
               .map(function(x,i,a){
                      if(i === 0){
                        return {text: x,
                                matches: [
                                  '#',
                                  'Selections',
                                  undefined,
                                  undefined
                                ]}
                      } else if(i%5 === 1){
                        return {text: a[i+4],
                                matches: [a[i],
                                          a[i+1],
                                          a[i+2],
                                          a[i+3]]}
                      }
                    })
               .filter(function(x){return x!==undefined;})
               .map(function(b){
                     var identifier;
                     if(b.matches[2] && b.matches[3]){
                       identifier = b.matches[2]+b.matches[3];
                     } else {
                       identifier = b.matches[0]+" "+b.matches[1];
                     }
                     b.text = identifier+"\n\n"+b.text;
                     b.heading = identifier[0]==='#' ?
                                   b.matches[0].length :
                                   4;

                     return b;
                   });

var root = blocks[0];
var stack = [root];
var parent = root;

//double check. this algo really sucks but it should work
for(var i = 1; i < blocks.length; i++){
    var last = stack[stack.length-1];
    //lower node, add to lower tree
    if(blocks[i].heading > last.heading){
      if(last.children){
        last.children.push(blocks[i]);
      } else {
        last.children = [blocks[i]];
      }
      parent = last;
      stack.push(blocks[i]);

    //same level. continue as before
    } else if(blocks[i].heading === last.heading){
      stack.push(blocks[i]);
      parent.children.push(blocks[i]);

    //higher node. sibling of ancestor
    } else {
      //console.log(blocks[i], stack);
      while(blocks[i].heading <= stack[stack.length-1].heading){
        stack.pop();
      }
      parent = stack[stack.length-1];
      parent.children.push(blocks[i]);
      stack.push(blocks[i]);
    }
}

function processTree(node, currentDirectory){
  var title, fileName;
  var isParent = node.children && (node.children.length > 0);

  if(isParent){
    title = node.matches[1].replace(' ','_');
    currentDirectory = path.resolve(currentDirectory,
                                    title);
    fileName = path.resolve(currentDirectory, 'index');

    fs.mkdirSync(currentDirectory);
  } else {
    title = node.matches[2]+node.matches[3];
    fileName = path.resolve(currentDirectory, title);
  }

  var file = fs.openSync(fileName, 'w');
  fs.writeSync(file, node.text);
  fs.closeSync(file);

  if(isParent){
    node.children.forEach(function(n){
      processTree(n, currentDirectory);
    });
  }
}

processTree(root,
            "/home/sakekasi/UCLA/Spring3/CS137B/project/prototype/3/docblocks");
