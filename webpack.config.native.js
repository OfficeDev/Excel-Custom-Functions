// This webpack config outputs only the **native JS bundle**.
// The results is placed in the "dist" folder, with each file carrying a "bundle.native.js" suffix. 
// It is separated into its own webpack file, so that the webpack-dev-server
//    doesn't try to inline additional code into it, which would only work
//    on the web but not under the native execution environment.

const CommonConfig = require("./webpack.common");

module.exports = {
  ...CommonConfig,
  output: {
    filename: "[name].bundle.native.js",
    path: __dirname + "/dist"
  }
};
