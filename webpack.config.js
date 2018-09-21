const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    "customfunctions/functions": "./src/customfunctions/functions.ts"
  },
  output: {
    filename: '[name].bundle.js',
    path: __dirname + '/dist'
  },
  devtool: "source-map",
  resolve: {
    extensions: [".ts", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: "ts-loader"
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: "./src/customfunctions/metadata", to: "customfunctions/metadata" },
      { from: "./src/customfunctions/functions.html", to: "customfunctions/functions.html" },
      { from: "./src/about.html", to: "about.html" },
    ])
  ],
  devServer: {
    port: 8081,
    hot: true,
    inline: true,
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  }
};
