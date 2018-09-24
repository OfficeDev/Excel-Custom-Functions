// This shared webpack config outputs the regular JS bundles,
//    and performs additional functions like copying the assets to the "dist" folder.
// At development-time, this config is also used by the dev server (which will
//    serve these files from memory, but also use the "dist" folder for fallback
//    for the native JS bundles that are produced by the other webpack.config.native.js file)

const CommonConfig = require("./webpack.common");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  ...CommonConfig,
  output: {
    filename: "[name].bundle.js",
    path: __dirname + "/dist"
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: "./public", to: "" },
      {
        from: "./src/customfunctions/functions.json",
        to: "customfunctions/functions.json"
      }
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
