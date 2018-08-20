module.exports = function (options) {
  if (process.platform !== 'win32') {
    // Currently 'makeappx.exe' is only available for Windows.
    return;
  }

  const path = require('path');
  const fs = require('fs');
  const makeAppxPackage = require('../make-appx-package.js');
  const buildNumRegEx = /^\d{1,2}\.\d{1,2}\.(\d{1,5}\.\d{1,5})$/

  packagePath = path.resolve(process.cwd(), 'package.json');

  if (!fs.existsSync(packagePath)) {
    return;
  }

  const config = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  if (config.appx !== undefined) {
    let packages = options.argv.slice(3);

    if (packages.length === 0) {
      Object.keys(config.appx).forEach(p => packages.push(p));
    }

    packages = packages.filter(_ => config.appx[_]);

    // Pass version if set by CI build process and not set in appx cfg
    if (process.env.BUILD_BUILDNUMBER && buildNumRegEx.test(process.env.BUILD_BUILDNUMBER)) {
      const version = process.env.BUILD_BUILDNUMBER.match(buildNumRegEx)[1];
      packages.forEach(p => {
        if (!config.appx[p].version) {
          config.appx[p].version = version;
        }
      })
    }

    packages.forEach(p => makeAppxPackage(p, config.appx[p]));
  }
}