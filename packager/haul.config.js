const { createWebpackConfig } = require('haul');
import { join, relative, resolve } from 'path';
const webpack = require('webpack');

function createHaulConfig() {
  return {
    platforms: {
      ios: 'iOS',
      android: 'Android',
      win32: 'win32',
      macos: 'MacOS',
      uwp: 'UWP'
    },
    webpack: options => {
      const { platform, dev, bundle } = options;
      const providesModuleNodeModules = [];

      if (bundle) {
        throw new Error('This config is only used to serve up a bundle file, not as a complete build solution');
      }

      //
      //  output bundle
      //

      //  configure webpack to produce bundle files with the same name as each entry file.
      //  choose the appropriate bundle file extension, based on the platform.
      const outputFilename = `index.${platform}.bundle`;

      //  when using platform bundles the InitializeCore entry will be removed.  using a
      //  dummy string here instead of looking up react-native module, so that when using
      //  platform bundles, you don't need a direct dependency on react-native.
      //
      //  when not using a platform bundle, lookup the location of react-native from the
      //  building package, so that we pickup the version that they are using.
      //
      const initializeCoreLocation = relative(
        process.cwd(),
        require.resolve('./platform-bundle-initcore-placeholder.js')
      );

      //
      //  webpack configuration
      //

      const factory = createWebpackConfig({
        ...options,
        entry: { index: ['./src/functions/functions.ts'] }
      });
      let config = factory({
        ...options,
        initializeCoreLocation,
        providesModuleNodeModules
      });

      // Haul config adds a bunch of polyfills we dont need, since they are provided by the platform bundles.
      config.entry.index.splice(0, config.entry.index.length - 1);

      // Add bootstrapper into entry
      const pbBootstrapperPath = join(__dirname, 'platform-bundle-bootstrapper.js');
      config.entry.index.unshift(pbBootstrapperPath);

      //
      //  webpack: module rules
      //

      const babelLoaderRule = config.module.rules[1];
      if (!babelLoaderRule.use[0].loader.includes('babel-loader')) {
        throw new Error('Failed to find babel-loader rule in the webpack configuration');
      }
      config.module.rules.splice(1, 1); // Remove babel-loader, since it should already be pure js

      const assetLoaderRule = config.module.rules[1];
      if (!assetLoaderRule.use.loader.includes('assetLoader.js')) {
        throw new Error('Failed to find the haul asset-loader rule in the webpack configuration');
      }
      config.module.rules.splice(1, 1); // Remove asset-loader, since it should have been done already

      config.module.rules.push({
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: "ts-loader"
      });

      config.module.rules.push({
        test: /\.html$/,
        exclude: /node_modules/,
        use: "html-loader"
      });

      config.module.rules.push({
        test: /\.(png|jpg|jpeg|gif)$/,
        use: "file-loader"
      });

      // Setup platform file resolution
      config.resolve.extensions = ['bundle', 'jsbundle', 'js', 'ts'];

      config.output.filename = outputFilename;

      // Remove the case sensitive checks for now -- haul adds this as the first plugin
      config.plugins.shift();
      // const jsonWithRegEx = (_key, value) => {
      //   if (value instanceof RegExp) return value.toString();
      //   return value;
      // };
      // console.log(JSON.stringify(config, jsonWithRegEx, 2));
      // console.log(JSON.stringify(options, jsonWithRegEx, 2));

      return config;
    }
  };
}

module.exports = createHaulConfig();
