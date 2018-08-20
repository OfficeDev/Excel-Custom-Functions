const path = require('path');
const fs = require('fs');
const execSync = require('../utils/exec-sync');
const findConfig = require('../find-config');
const { logStartTask, logEndTask, logEndBuild } = require('../utils/logging');

const packagePath = path.resolve(process.cwd(), 'package.json');

if (!fs.existsSync(packagePath)) {
  return;
}
const pkgJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

function runJestForConfigFile(options, config) {
  const jestConfigPath = findConfig(config.configFile);

  if (fs.existsSync(jestConfigPath)) {
    const taskStartTime = new Date().getTime();
    const jestPath = path.resolve(__dirname, '../node_modules/jest/bin/jest');
    const customArgs = options && options.argv ? options.argv.slice(3).join(' ') : '';

    const args = [
      // Specify the config file.
      `--config ${jestConfigPath}`,

      // Run tests in serial (parallel builds seem to hang rush.)
      `--runInBand`,

      // These are a helpful tool when debugging Jest behavior
      //'--verbose',
      //'--debug',
      //'--no-cache',

      // In production builds, produce coverage information.
      options.isProduction && '--coverage',

      // If the -u flag is passed, pass it through.
      (options.argv && options.argv.indexOf('-u') >= 0) ? '-u' : '',

      // Pass in custom arguments.
      options.args
    ].filter(arg => !!arg).join(' ');

    const command = `node ${jestPath} ${args}`;
    const taskName = `jest ${config.name}`;

    logStartTask(pkgJson.name, taskName);

    try {
      execSync(command, undefined, path.dirname(jestConfigPath));
      logEndTask(pkgJson.name, taskName, taskStartTime);
    } catch (e) {
      logEndTask(pkgJson.name, taskName, taskStartTime, e);
      throw e;
    }
  }
}

module.exports = function (options) {

  const jestConfigs = [
    { name: 'default', configFile: 'jest.config.js' },
    { name: 'ios', configFile: 'jest.config.ios.js' },
    { name: 'android', configFile: 'jest.config.android.js' },
    { name: 'macos', configFile: 'jest.config.macos.js' },
    { name: 'win32', configFile: 'jest.config.win32.js' },
    { name: 'uwp', configFile: 'jest.config.uwp.js' },
    { name: 'web', configFile: 'jest.config.web.js' },
  ];

  const filteredConfigs = jestConfigs.filter(_ => options.argv.some(arg => _.name === arg));
  let error;

  // If a specific config is specified, just run that one
  if (filteredConfigs.length) {
    filteredConfigs.forEach(config => {
      try {
        runJestForConfigFile(options, config);
      } catch (e) {
        error = e;
      }
    })
  } else {
    jestConfigs.forEach(config => {
      try {
        runJestForConfigFile(options, config);
      } catch (e) {
        error = e;
      }
    })
  }

  if (error)
    throw error;
};