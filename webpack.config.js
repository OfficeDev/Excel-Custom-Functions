const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    "customfunctions/index": "./src/customfunctions/index.ts"
  },
  output: {
    filename: '[name].bundle.js',
    path: __dirname + '/dist'
  },
  devtool: "source-map",
  resolve: {
    extensions: [".ts", ".tsx", ".html", ".js", "json"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: "ts-loader"
      },
      {
        test: /\.html$/,
        exclude: /node_modules/,
        use: "html-loader"
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        use: "file-loader"
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/customfunctions/index.html",
      chunks: ["customfunctions/index"],
      filename: "customfunctions/index.html"
    }),
    new CopyWebpackPlugin([
      { from: "./src/customfunctions/metadata", to: "customfunctions/metadata" },
      { from: "./src/index.html", to: "index.html" },
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
