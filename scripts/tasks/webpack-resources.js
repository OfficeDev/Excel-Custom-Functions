const webpack = require('webpack');
const path = require('path');
const merge = require('./utils/merge');

const webpackVersion = require('webpack/package.json').version;
console.log(`Webpack version: ${webpackVersion}`);

module.exports = {
  webpack,

  createConfig(bundleName, isProduction, customConfig, onlyProduction) {

    const resolveLoader = {
      modules: [
        path.resolve(__dirname, '../node_modules'),
        path.resolve(process.cwd(), 'node_modules')
      ]
    };

    const module = {
      noParse: [/autoit.js/],
      rules: [
        {
          test: /\.js$/,
          use: 'source-map-loader',
          enforce: 'pre'
        }
      ]
    };

    const devtool = 'source-map';
    const configs = [];

    if (!onlyProduction) {
      configs.push(merge(
        {
          output: {
            filename: `[name].js`,
            path: path.resolve(process.cwd(), 'dist'),
            pathinfo: false
          },
          resolveLoader,
          module,
          devtool,
          plugins: getPlugins(bundleName, false)
        },
        customConfig
      ));
    }

    if (isProduction) {
      configs.push(merge({
        output: {
          filename: `[name].min.js`,
          path: path.resolve(process.cwd(), 'dist')
        },
        resolveLoader,
        module,
        devtool,
        plugins: getPlugins(bundleName, true)
      }, customConfig));
    }

    return configs;
  },

  createAppConfig(bundleName, isProduction, customConfig) {
    const resolveLoader = {
      modules: [
        path.resolve(__dirname, '../node_modules'),
        path.resolve(process.cwd(), 'node_modules')
      ]
    };

    const resolve = {
      extensions: ['.ts', '.tsx', '.js', 'json']
    };

    const appRules = [
      {
        test: /\.js$/,
        loader: 'source-map-loader',
        enforce: 'pre'
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: [
          /node_modules/,
          /\.scss.ts$/
        ]
      }
    ];

    const module = {
      rules: appRules
    };

    const devtool = 'source-map';
    const plugins = getPlugins(bundleName, isProduction);
    const configs = [];

    configs.push(merge(
      {
        output: {
          filename: `[name].js`,
          path: path.resolve(process.cwd(), 'dist')
        },
        resolveLoader,
        resolve,
        module,
        devtool,
        plugins
      },
      customConfig
    ));

    return configs;
  },

  createServeConfig(customConfig) {
    const WebpackNotifierPlugin = require('webpack-notifier');

    return merge(
      {
        devServer: {
          inline: true,
          port: 4322,
        },

        resolveLoader: {
          modules: [
            path.resolve(__dirname, '../node_modules'),
            path.resolve(process.cwd(), 'node_modules')
          ]
        },

        resolve: {
          extensions: ['.ts', '.tsx', '.js']
        },

        devtool: 'eval',

        module: {
          rules: [
            {
              test: [/\.tsx?$/],
              use: {
                loader: 'ts-loader',
                options: {
                  experimentalWatchApi: true,
                  transpileOnly: true
                }
              },
              exclude: [
                /node_modules/,
                /\.scss.ts$/,
                /\.test.tsx?$/
              ],
            },
            {
              test: /\.scss$/,
              enforce: 'pre',
              exclude: [
                /node_modules/
              ],
              use: [
                {
                  loader: '@microsoft/loader-load-themed-styles', // creates style nodes from JS strings
                },
                {
                  loader: 'css-loader', // translates CSS into CommonJS
                  options: {
                    modules: true,
                    importLoaders: 2,
                    localIdentName: '[name]_[local]_[hash:base64:5]',
                    minimize: false
                  }
                },
                {
                  loader: 'postcss-loader',
                  options: {
                    plugins: function () {
                      return [
                        require('autoprefixer')
                      ];
                    }
                  }
                },
                {
                  loader: 'sass-loader'
                }
              ]
            }
          ]
        },

        plugins: [
          new WebpackNotifierPlugin(),
          new webpack.WatchIgnorePlugin([
            /\.js$/,
            /\.d\.ts$/
          ]),
          // Unlike fabric, we do NOT use ForkTsCheckerWebpackPlugin, as that is in compatible with RN platform forking
        ]
      },
      customConfig
    );
  }

};

function getPlugins(
  bundleName,
  isProduction
) {
  const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
  const plugins = [];

  if (isProduction) {
    plugins.push(
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      new UglifyJsPlugin({
        uglifyOptions: {
          compress: true,
          warnings: false
        }
      }),
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: bundleName + '.stats.html',
        openAnalyzer: false,
        generateStatsFile: true,
        statsFilename: bundleName + '.stats.json',
        logLevel: 'warn'
      })
    );
  }

  return plugins;
}