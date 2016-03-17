var path = require("path");
var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin")

module.exports = {
  entry: {
      semanticEditor: "./src/index.js"
  },
  output: {
      path: path.join(__dirname, "dist"),
      filename: "[name].bundle.js",
      chunkFilename: "[id].chunk.js"
  },
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: new RegExp("node_modules|lib"),
        query: {
          presets: ['es2015', 'react']
        }
      }
    ]
  },
  plugins: [
    new CommonsChunkPlugin({
      filename: "commons.js",
      name: "commons"
    })
  ]
};
