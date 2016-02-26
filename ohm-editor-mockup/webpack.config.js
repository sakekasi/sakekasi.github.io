var path = require("path");
var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin")

module.exports = {
  entry: {
      arithmetic: "./src/arithmetic/index.js",
      oo: "./src/oo/index.js"
  },
  output: {
      path: path.join(__dirname, "dist"),
      filename: "[name].bundle.js",
      chunkFilename: "[id].chunk.js"
  },
  devtool: 'source-map',
  module: {
  },
  plugins: [
    new CommonsChunkPlugin({
      filename: "commons.js",
      name: "commons"
    })
  ]
};
