const { createWebpackConfig } = require('haul');
const path = require('path');
const webpack = require('webpack');
const fs = require('fs');

const packagePath = path.resolve(process.cwd(), 'package.json');
const pkgJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const merge = require('./utils/merge');

/**
 * Resolver to push before the HastePlugin,
 * so that we can force resolution of modules that show up in the hastemap
 */
class ResolveOverrides {

  constructor(overrides) {
    this.ro = overrides;
  }

  apply(resolver) {
    resolver.hooks.resolve.tapAsync(
      'described-resolve',
      (request, context, callback) => {
        const innerRequest = request.request;

        if (!innerRequest || !this.ro[innerRequest]) {
          return callback();
        }

        const obj = Object.assign({}, request, {
          request: this.ro[innerRequest]
        });

        return resolver.doResolve(
          resolver.hooks.resolve,
          obj,
          `Aliased ${innerRequest} with: ${this.ro[innerRequest]}`,
          context,
          callback
        );
      }
    );
  };
}

class DllBootstrapPlugin {
  constructor(entries) {
    this.entries = entries || []
  }

  apply(compiler) {
    compiler.plugin('compilation', (compilation) => {
      compilation.mainTemplate.plugin('startup', (source, chunk) => {
        const oldSource = source;
        const entryModulesMap = {};
        for (const dep of chunk.entryModule.dependencies) {
          if (this.entries.includes(dep.module.rawRequest)) {
            entryModulesMap[dep.module.rawRequest] = dep.module;
          }
        }

        source = '// Bootstrap modules\n';
        for (const entry of this.entries) {
          if (entryModulesMap[entry] != undefined) {
            source += `__webpack_require__(${JSON.stringify(entryModulesMap[entry].id)});\n`;
          }
        }
        source += '\n';

        source += oldSource;
        return source;
      })
    })
  }
}

function createHaulConfig(haulConfigOptions) {
  return {
    platforms: { ios: 'iOS', android: 'Android', win32: 'win32', macos: 'MacOS', uwp: 'UWP' },
    webpack:
      function createWebpackConfigFactory(options) {
        const { platform } = options;

        let extensions = [platform];

        // Use .win as a valid platform fallback for win32 and uwp
        if (platform === 'win32' || platform === 'uwp') {
          extensions.push('win');
        }

        // Use .native as a valid platform fallback for all native platforms
        if (platform !== 'web')
          extensions.push('native');

        let providesModuleNodeModules = ['react-native'];
        // Plugin additional win32 react native platform modules
        if (platform === 'win32') {
          providesModuleNodeModules.push('react-native-windows');
        }

        let entryFile = options.entryFile || `./src/index.${platform}.tsx`;
        let pkgJsonConfig = {};
        if (pkgJson.nativeBundles) {
          let pkgJsonBundleOpts = pkgJson.nativeBundles.filter(_ => _.platform === platform);
          if (pkgJsonBundleOpts.length === 1) {
            pkgJsonConfig = pkgJsonBundleOpts[0];
          } else {
            pkgJsonBundleOpts = pkgJsonBundleOpts.filter(_ => (_.dev === options.dev) || (!('dev' in _) && !options.dev));
            if (pkgJsonBundleOpts.length === 1) {
              pkgJsonConfig = pkgJsonBundleOpts[0];
            }
          }
        }

        if (pkgJsonConfig.entryFile) {
          entryFile = pkgJsonConfig.entryFile;
        }

        let factory = createWebpackConfig({ ...options, entry: entryFile });
        let config = factory({
          ...options,
          initializeCoreLocation: 'scripts/utils/InitializeCore.js',
          providesModuleNodeModules: providesModuleNodeModules,
          hasteOptions: { platforms: extensions }
        });

        if (pkgJsonConfig.platformBundleEnabled) {
          // Remove InitializeCore.js from entry
          const initCoreIndex = config.entry.findIndex(entry => entry.includes('InitializeCore'));
          if (initCoreIndex != -1) {
            config.entry.splice(initCoreIndex, 1);
          }

          // Add bootstrapper into entry
          const pbBootstrapperPath = path.join(options.root, './utils/platform-bundle-bootstrapper.js');
          if (fs.existsSync(pbBootstrapperPath)) {
            config.entry.unshift(pbBootstrapperPath);
          }
        }

        // Remove polyfillEnvironment.js entry (provided by Haul), as:
        // 1. It drags in entire react-native
        // 2. It's to support hot bundle update which we don't care for now
        const polyfillEnvIndex = config.entry.findIndex(entry => entry.includes('polyfillEnvironment'));
        if (polyfillEnvIndex != -1) {
          config.entry.splice(polyfillEnvIndex, 1);
        }

        // redirect react-native includes to our fork of react-native
        config.resolve.alias['react-native'];

        let babelLoaderRule = config.module.rules[1];

        // override babel rule from haul, to allow custom babel per platform
        babelLoaderRule.use[0].options.babelrc = false;
        // babelLoaderRule.use[0].options.presets = [
        //   [
        //     require.resolve("@office-iss/babel-preset-haul-sdx"),
        //     {
        //       "platform": platform,
        //     },
        //   ]
        // ];

        // Haul excludes most of node_modules, but includes react-native from babel, we need to replace the to also include @office-iss/react
        babelLoaderRule.exclude = /node_modules\/(?!react|@expo|pretty-format|haul|metro|@office-iss[\\/]react)/

        // Add ts-loader as the initial loader
        config.module.rules.unshift({
          test: /\.tsx?$/,
          loader: 'ts-loader',
          options: {
            onlyCompileBundledFiles: true
          }
        });

        // Setup platform file resolution
        config.resolve.extensions = [];
        for (const p in extensions) {
          config.resolve.extensions.push(`.${extensions[p]}.ts`);
          config.resolve.extensions.push(`.${extensions[p]}.tsx`);
          config.resolve.extensions.push(`.${extensions[p]}.js`);
        };
        config.resolve.extensions.push(`.ts`);
        config.resolve.extensions.push(`.tsx`);
        config.resolve.extensions.push(`.js`);

        // Remove the case sensitve checks for now -- haul adds this as the first plugin
        config.plugins.shift();

        /*
        const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
        config.plugins.push(new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: `index.${platform}.stats.html`,
          openAnalyzer: false,
          generateStatsFile: true,
          statsFilename: `index.${platform}.stats.json`,
          logLevel: 'warn'
        }));
          */

        // When running the packaging server, we have to keep the output filename the same as the requested filename
        if (!options.bundle) {
          let outBase = entryFile.match(/(\.[\\\/])?(src[\\\/])?(.*).(tsx?|.jsx?)$/)[3];
          if (!outBase.endsWith(platform)) {
            outBase += `.${platform}`;
          }

          config.output.filename = outBase + '.bundle';
        } else {
          if (pkgJsonConfig.output) {
            config.output.filename = pkgJsonConfig.output;
          } else {
            config.output.filename = `index.${platform}.bundle`;
          }
        }

        // Run uglify to shrink the bundle
        if (options.minify) {
          const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
          config.plugins.push(new UglifyJsPlugin({
            test: new RegExp(config.output.filename),
            sourceMap: true
          }));
        }

        // Allow webpack to find ts-loader from the scripts folder so not every package needs to include it
        config.resolveLoader = {
          modules: [
            path.resolve(process.cwd(), 'node_modules'),
            path.resolve(__dirname, 'node_modules')
          ]
        };

        // Platform bundle configs
        // TODO: It seems '--assets-dest' is not accessible here.
        //       Assuming it's `lib`.
        if (pkgJsonConfig.dllName) {
          const fullDllName = `${pkgJsonConfig.dllName.replace('-', '')}`;
          config.output.library = fullDllName;
          config.plugins.push(new webpack.DllPlugin(
            {
              path: path.join(process.cwd(), "lib", `${pkgJsonConfig.dllName}-manifest.json`),
              name: fullDllName
            }
          ));
          config.plugins.push(new DllBootstrapPlugin(config.entry));
        }

        if (pkgJsonConfig.dllDeps) {
          for (const dllDep of pkgJsonConfig.dllDeps) {
            const dllManifestPath = path.join(process.cwd(), `../${dllDep}/lib/${dllDep}-manifest.json`);
            config.plugins.push(new webpack.DllReferencePlugin(
              {
                manifest: require(dllManifestPath)
              }
            ));
          }
        }

        // Webpack doesn't produce js stats unless the output filename ends in .js  -- so the RN default file names wont produce stats
        // config.output.filename = `index.${platform}.bundle.js`;

        // Slight bundle size improvement
        config.optimization.namedModules = false;

        // Generate bundle stats
        config.stats = {
          ...config.stats,
          excludeAssets: () => false,
        }

        if (haulConfigOptions && haulConfigOptions.hasteAliases) {
          config.resolve.plugins.unshift(new ResolveOverrides(haulConfigOptions.hasteAliases));
        }

        if (haulConfigOptions && haulConfigOptions.webpackConfig) {
          config = merge(config, haulConfigOptions.webpackConfig);
        }

        // console.log(JSON.stringify(config, (key, value) => { if (value instanceof RegExp) return value.toString(); return value; }, 2));
        //console.log(JSON.stringify(options, (key, value) => { if (value instanceof RegExp) return value.toString(); return value; }, 2));

        return config;
      }
  };
}

module.exports = {
  createHaulConfig,
};