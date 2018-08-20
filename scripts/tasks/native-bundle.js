module.exports = function(options) {
  const path = require('path');
  const fs = require('fs');
  const merge = require('../utils/merge');

  const packagePath = path.resolve(process.cwd(), 'package.json');

  if (!fs.existsSync(packagePath)) {
    return;
  }

  const config = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  if (config.nativeBundles) {
    const haulBundle = require('../utils/haul-bundle');
    const writeThirdPartyNotices = require('../utils/write-third-party-notices');

    // If a specific bundle was specified, just build that one.
    const matchBundle = fuzzyMatchBundleConfig(process.argv);
    if (matchBundle) return createBundle(matchBundle, options.isProduction);
    else {
      const promises = [];
      config.nativeBundles.forEach((bundle, index) => {
        promises.push(createBundle(bundle, options.isProduction && index == 0));
      });
      return Promise.all(promises);
    }

    function createBundle(bundle, resetCache) {
      let bundleOptions = merge(
        { rootPath: process.cwd(), packageName: config.name, dev: !options.isProduction, resetCache: resetCache },
        bundle
      );

      if (fs.existsSync(path.resolve(process.cwd(), __dirname + '/haul.config.js'))) {
        haulBundle(bundleOptions);
      } else {
        throw new Error('Missing haul.config.js');
      }

      if (bundleOptions.thirdPartyNotices) {
        if (!bundleOptions.assetsDest) {
          bundleOptions.assetsDest = 'lib';
        }

        return writeThirdPartyNotices(
          process.cwd(),
          path.resolve(bundleOptions.assetsDest, `${bundleOptions.output}.map`),
          path.resolve(bundleOptions.assetsDest, `${bundleOptions.output}.tpn.txt`),
          bundleOptions.thirdPartyNotices.ignoreScopes,
          bundleOptions.thirdPartyNotices.ignoreModules,
          bundleOptions.thirdPartyNotices.additionalText
        );
      }

      return Promise.resolve();
    }
  }

  // attempts to match additional command args against bundle configs, and returns the best match
  function fuzzyMatchBundleConfig(args) {
    let bestfit = null;
    let bestScore = 0;

    config.nativeBundles.forEach(bundle => {
      let score = 0;
      if (args.indexOf(bundle.platform) !== -1) {
        score += 1;
      }
      if (args.indexOf('dev') !== -1 && (bundle.dev || bundle.dev === undefined)) {
        score += 1;
      }
      if (args.indexOf('ship') !== -1 && bundle.dev === false) {
        score += 1;
      }
      if (score > bestScore) {
        bestScore = score;
        bestfit = bundle;
      }
    });
    return bestfit;
  }
};
