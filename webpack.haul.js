import { createWebpackConfig } from "haul";
let path = require("path");

export default {
  webpack: env => {
    const config = createWebpackConfig({
      entry: './src/customfunctions.ts',
      output: {
        path: path.resolve(__dirname, 'dist/win32/ship'),
        filename: 'index.win32.bundle'
    },
    })(env);

    config.plugins.push(new CaseSensitivePathsPlugin());

    return config;
  }
};
