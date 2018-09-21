const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    "customfunctions": "./src/customfunctions/functions.js"
  },
  output: {
    filename: '[name].bundle.js',
    path: __dirname + '/dist'
  },
  devtool: "source-map",
  resolve: {
    extensions: [".js"]
  },
  devServer: {
    port: 8081,
    hot: true,
    inline: true,
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  }
};
