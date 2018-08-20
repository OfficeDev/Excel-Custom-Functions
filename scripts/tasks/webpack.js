module.exports = function (options) {
  const path = require('path');
  const fs = require('fs');

  const webpackConfigPath = path.join(process.cwd(), 'webpack.config.js');

  if (fs.existsSync(webpackConfigPath)) {
    const webpack = require('webpack');

    const configLoader = require(webpackConfigPath);
    let config;

    // If the loaded webpack config is a function
    // call it with the original process.argv arguments from build.js.
    if (typeof configLoader == 'function') {
      config = configLoader(options.argv);
    } else {
      config = configLoader;
    }
    config = flatten(config);

    return new Promise((resolve, reject) => {
      webpack(config, (err, stats) => {
        if (err || stats.hasErrors()) {
          const chalk = require('chalk');
          let errorStats = stats.toJson('errors-only');
          errorStats.errors.forEach(error => {
            console.log(chalk.red(error));
          })
          reject(`Webpack failed with ${errorStats.errors.length} error(s).`);
        } else {
          _printStats(stats);
          resolve();
        }
      });
    });
  }
};

function _printStats(stats) {
  const { logStatus } = require('./utils/logging');
  const chalk = require('chalk');
  const path = require('path');

  for (const stat of stats.stats) {
    if (stat.compilation && stat.compilation.assets) {
      for (const asset in stat.compilation.assets) {
        const assetInfo = stat.compilation.assets[asset];
        const assetPath = path.relative(process.cwd(), assetInfo.existsAt);

        if (asset.endsWith('.min.js')) {
          const gzipSize = require('gzip-size');
          const fs = require('fs');
          const content = fs.readFileSync(assetInfo.existsAt, 'utf8');
          const size = gzipSize.sync(content);

          logStatus(`Created bundle "${chalk.cyan(assetPath)}" (gzipped: ${getFileSize(size)})`);
        } else if (asset.endsWith('.js')) {
          logStatus(`Created bundle "${chalk.cyan(assetPath)}"`);
        }
      }
    }
  }
}

function flatten(arr) {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  }, []);
}

function getFileSize(size) {
  const chalk = require('chalk');
  let sizeString = '';

  if (size < 1024) {
    sizeString = size + ' bytes';
  } else {
    sizeString = (Math.round(1000 * size / 1024) / 1000) + ' KB'
  }
  return chalk.cyan(sizeString);
}