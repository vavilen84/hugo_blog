const path = require('path');

module.exports = {
    mode: "none",
    entry: "/src/index.js",
    output: {
        path: path.resolve(__dirname, "static/js"),
        filename: "bundle.js",
        publicPath: path.resolve(__dirname, "static/"),
    }
};