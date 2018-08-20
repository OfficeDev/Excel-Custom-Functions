const runTasks = require('./utils/run-tasks');

const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const { getTimePrefix } = require('./utils/logging');
const package = getPackage();
const userBuildConfigPath = path.resolve(__dirname, './min-build-config.json');
const userBuildConfig = fs.existsSync(userBuildConfigPath)
  ? JSON.parse(fs.readFileSync(userBuildConfigPath))
  : undefined;

if (!package) {
  return;
}

const packageName = package.name;
const isProduction = process.argv.indexOf('--production') > -1;
const minBuild = process.argv.indexOf('--min-build') > -1;
const doClean = process.argv.indexOf('--clean') > -1;
const doPrettier = process.argv.indexOf('--prettier') > -1;
const ignoreBuildConfig = process.argv.indexOf('--ignore-build-config') > -1;
const fastBuild = process.argv.indexOf('--fast-build') > -1;

let taskConfig = [
  { name: 'clean', enabled: doClean },
  { name: 'copy', enabled: true },
  { name: 'sass', enabled: true },
  { name: 'dsgen', enabled: true },
  { name: 'prettier', enabled: doPrettier },
  { name: 'tslint', enabled: !minBuild || doPrettier },
  { name: 'ts', enabled: true },
  { name: 'jest', enabled: !minBuild },
  { name: 'native-bundle', enabled: !minBuild && !fastBuild },
  { name: 'webpack', enabled: !minBuild && !fastBuild },
  { name: 'appx-package', enabled: !minBuild && !fastBuild },
  { name: 'post-copy', enabled: !minBuild && !fastBuild }
];

let tasks = taskConfig.filter(_ => _.enabled).map(_ => _.name);

if (process.argv.length >= 3 && process.argv[2].indexOf('--') === -1) {
  let argsTmp = [...process.argv];
  argsTmp.splice(0, 2);
  tasks = argsTmp.filter(_ => taskConfig.some(t => t.name === _));
} else {
  // Filter disabled tasks if specified in the package.json.
  if (package.disabledTasks) {
    tasks = tasks.filter(task => package.disabledTasks.indexOf(task) < 0);
  }

  if (!minBuild && !ignoreBuildConfig && userBuildConfig) {
    tasks = tasks.filter(task => {
      let enabled = !userBuildConfig[task] || userBuildConfig[task].indexOf(package.name) > -1;
      if (!enabled) {
        console.log(
          getTimePrefix(package.name) +
            chalk.yellow(' Skipping: ' + chalk.cyan(task) + ' [Skipped based on user config]')
        );
      }
      return enabled;
    });
  }
}

runTasks(path.join(__dirname, 'tasks'), tasks);

function getPackage() {
  let packagePath = path.resolve(process.cwd(), 'package.json');

  if (fs.existsSync(packagePath)) {
    return JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  }

  return undefined;
}
