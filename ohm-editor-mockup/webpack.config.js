module.exports = {
    entry: "./src/index.js",
    output: {
        path: __dirname,
        filename: "bundle.js"
    },
    devtool: 'source-map',
    module: {
        // loaders: [
        //     { test: /\.css$/, loader: "style!css" }
        // ]
    }
};
