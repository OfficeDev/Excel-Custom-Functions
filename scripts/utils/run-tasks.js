const fs = require('fs');
const path = require('path');
const { logStartTask, logEndTask, logEndBuild } = require('./logging');

module.exports = function runTasks(taskdDir, tasks) {

  const package = getPackage();

  if (!package) {
    return;
  }

  const packageName = package.name;
  const isProduction = process.argv.indexOf('--production') > -1;

  let promise = Promise.resolve();
  let hasFailures = false;
  let buildStartTime = new Date().getTime();

  tasks.forEach(task => {
    promise = promise.then(() => runTask(task));
  });

  promise.then(() => {
    if (hasFailures) {
      process.exitCode = 1;
    }
    logEndBuild(packageName, !hasFailures, buildStartTime);
  });

  function runTask(task) {
    let taskStartTime = new Date().getTime();

    return Promise.resolve()
      .then(() => !hasFailures && Promise.resolve()
        .then(() => logStartTask(packageName, task))
        .then(() => require(path.join(taskdDir, task))({ isProduction, argv: process.argv }))
        .then(() => logEndTask(packageName, task, taskStartTime))
        .catch((e) => {
          hasFailures = true;
          logEndTask(packageName, task, taskStartTime, e);
        }));
  }

  function getPackage() {
    let packagePath = path.resolve(process.cwd(), 'package.json');

    if (fs.existsSync(packagePath)) {
      return JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    }

    return undefined;
  }
}