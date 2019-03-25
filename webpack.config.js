const CleanWebpackPlugin = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const fs = require("fs");
const webpack = require("webpack");

module.exports = (env, options) => {
  const dev = options.mode === "development";
  const config = {
    devtool: "source-map",
    entry: {
      polyfill: 'babel-polyfill',
      taskpane: "./src/taskpane/taskpane.ts",
      commands: "./src/commands/commands.ts"
    },
    resolve: {
      extensions: [".ts", ".tsx", ".html", ".js"]
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: 'babel-loader'
        },
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
      new CleanWebpackPlugin(dev ? [] : ["dist"]),
      new HtmlWebpackPlugin({
        filename: "taskpane.html",
        template: "./src/taskpane/taskpane.html",
        chunks: ['polyfill', 'taskpane']
      }),
      new CopyWebpackPlugin([
        {
          to: "taskpane.css",
          from: "./src/taskpane/taskpane.css"
        }
      ]),
      new HtmlWebpackPlugin({
        filename: "commands.html",
        template: "./src/commands/commands.html",
        chunks: ["polyfill", "commands"]
      }),
    ],
    devServer: {
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      https: {
        key: fs.readFileSync("./certs/server.key"),
        cert: fs.readFileSync("./certs/server.crt"),
        ca: fs.readFileSync("./certs/ca.crt")
      },
      port: 3000
    }
  };

  return config;
};
