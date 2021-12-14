/* eslint-disable no-undef */

const devCerts = require("office-addin-dev-certs");
const CustomFunctionsMetadataPlugin = require("custom-functions-metadata-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");

/* global require, module, process, __dirname */

async function getHttpsOptions() {
  const httpsOptions = await devCerts.getHttpsServerOptions();
  return { cacert: httpsOptions.ca, key: httpsOptions.key, cert: httpsOptions.cert };
}

module.exports = async (env, options) => {
  const debuggingTest = env.testType === "debugger";
  const config = {
    devtool: "source-map",
    entry: {
      polyfill: ["core-js/stable", "regenerator-runtime/runtime"],
      commands: "./src/commands/commands.ts",
      functions: "./src/functions/functions.ts",
      taskpane: "./test/end-to-end/src/test-taskpane.ts",
    },
    output: {
      path: path.resolve(__dirname, "testBuild"),
      devtoolModuleFilenameTemplate: "webpack:///[resource-path]?[loaders]",
      clean: true,
    },
    resolve: {
      extensions: [".ts", ".tsx", ".html", ".js"],
      fallback: {
        child_process: path.resolve(__dirname, "./../../node_modules/child_process/package.json"),
        fs: false,
        os: require.resolve("os-browserify/browser"),
      },
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-typescript"],
            },
          },
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
          test: /\.(png|jpg|jpeg|gif|ico)$/,
          type: "asset/resource",
          generator: {
            filename: "assets/[name][ext][query]",
          },
        },
      ],
    },
    plugins: [
      new CustomFunctionsMetadataPlugin({
        output: "functions.json",
        input: "./src/functions/functions.ts",
      }),
      new HtmlWebpackPlugin({
        filename: "functions.html",
        template: "./src/functions/functions.html",
        chunks: ["polyfill", "functions"],
      }),
      new HtmlWebpackPlugin({
        filename: "taskpane.html",
        template: "./test/end-to-end/src/test-taskpane.html",
        chunks: ["polyfill", "taskpane"],
      }),
      new HtmlWebpackPlugin({
        filename: "commands.html",
        template: "./test/end-to-end/src/test-commands.html",
        chunks: ["polyfill", "commands"],
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "assets/*",
            to: "assets/[name][ext][query]",
          },
        ],
      }),
    ],
    devServer: {
      static: ["./"],
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      https: env.WEBPACK_BUILD || options.https !== undefined ? options.https : await getHttpsOptions(),
      port: debuggingTest ? 3001 : process.env.npm_package_config_dev_server_port || 3000,
    },
  };

  return config;
};
