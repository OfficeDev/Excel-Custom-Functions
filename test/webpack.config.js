const devCerts = require("office-addin-dev-certs");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const CustomFunctionsMetadataPlugin = require("custom-functions-metadata-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

/* global require, module, process, __dirname */

module.exports = async (env, options) => {
  const dev = options.mode === "development";
  const debuggingTest = options.testType === "debugger";
  const config = {
    devtool: "source-map",
    entry: {
      commands: path.resolve(__dirname, "./../src/commands/commands.ts"),
      functions: path.resolve(__dirname, "./../src/functions/functions.ts"),
      polyfill: "@babel/polyfill",
      taskpane: path.resolve(__dirname, "./src/test-taskpane.ts"),
    },
    resolve: {
      extensions: [".ts", ".tsx", ".html", ".js"],
      fallback: {
        child_process: path.resolve(__dirname, "./../node_modules/child_process/package.json"),
      },
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: "babel-loader",
        },
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: "ts-loader",
        },
        {
          test: /\.html$/,
          exclude: /node_modules/,
          use: "html-loader",
        },
        {
          test: /\.(png|jpg|jpeg|gif)$/,
          use: "file-loader",
        },
      ],
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      publicPath: "/",
    },
    plugins: [
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: dev ? [] : ["**/*"],
        cleanAfterEveryBuildPatterns: dev ? ["!**/*"] : [],
      }),
      new CustomFunctionsMetadataPlugin({
        output: "functions.json",
        input: path.resolve(__dirname, "./../src/functions/functions.ts"),
      }),
      new HtmlWebpackPlugin({
        filename: "functions.html",
        template: path.resolve(__dirname, "./../src/functions/functions.html"),
        chunks: ["polyfill", "functions"],
      }),
      new HtmlWebpackPlugin({
        filename: "taskpane.html",
        template: path.resolve(__dirname, "./src/test-taskpane.html"),
        chunks: ["polyfill", "taskpane"],
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, "./../src/taskpane/taskpane.css"),
            to: "taskpane.css",
          },
        ],
      }),
      new HtmlWebpackPlugin({
        filename: "commands.html",
        template: path.resolve(__dirname, "./src/test-commands.html"),
        chunks: ["polyfill", "commands"],
      }),
    ],
    devServer: {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      https: options.https !== undefined ? options.https : await devCerts.getHttpsServerOptions(),
      port: debuggingTest ? 3001 : process.env.npm_package_config_dev_server_port || 3000,
    },
  };

  return config;
};
