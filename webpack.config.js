const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    "customfunctions": "./src/customfunctions/functions.ts"
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
      { from: "./public", to: "" },
      { from: "./src/customfunctions/functions.json", to: "customfunctions/functions.json" },
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
