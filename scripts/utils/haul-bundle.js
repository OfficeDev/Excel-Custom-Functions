const path = require('path');
const fs = require('fs');
const { logStartTask, logStatus, logEndTask, logEndBuild } = require('./logging');
const chalk = require('chalk');
const execSync = require('child_process').execSync;

const haulPkg = 'haul'; // Easy way to switch back to using our package override if we need to fork again ('./haul')

/*
 * options:
 *   rootPath : string - path to project root directory   [Required]
 *   platform: string  - platform to bundle [Defaults to win32]
 *   dev: boolean - Should the bundle be a developer bundle? [Defaults to true]
 *   assetsDest: string - location to place outputs [Defaults to lib]
 *   packageName: string - used for logging
 * */
function haulBundle(options) {
  const taskStartTime = new Date().getTime();

  if (!options.rootPath) throw new Error('You must provide the projects rootPath');

  if (!options.platform) options.platform = 'win32';

  if (options.dev === undefined) options.dev = true;

  if (!options.assetsDest) options.assetsDest = `lib/${options.platform}`;

  let taskName = `native-bundle ${options.platform} ${options.dev ? 'dev' : 'ship'}`;

  const configCliArgs = fs.existsSync(path.resolve(process.cwd(), 'haul.config.js'))
    ? ''
    : ` --config ${path.resolve(__dirname, './haul.config.js')} `;

  if (options.packageName) logStartTask(options.packageName, taskName);

  // We add no-deprecation for now, since haul uses a deprecated webpack API, and we dont want to clog up
  // the build logs with warnings, as it breaks incremental builds
  const haulCliPath = path.join(require.resolve(haulPkg), '../../bin/cli.js');
  const haulCmd =
    `node --no-deprecation ${haulCliPath} bundle ` +
    `bundle ` +
    configCliArgs +
    `--platform ${options.platform} ` +
    `--minify ${!options.dev} ` +
    `--dev ${options.dev} ` +
    `--assets-dest ${options.assetsDest} `;

  try {
    logStatus(chalk.gray('Executing: ') + chalk.cyan(haulCmd));
    execSync(haulCmd, {
      env: {
        NODE_ENV: options.dev ? 'development' : 'production'
      },
      stdio: 'inherit'
    });
    if (options.packageName) logEndTask(options.packageName, taskName, taskStartTime);
  } catch (e) {
    if (options.packageName) logEndTask(options.packageName, taskName, taskStartTime, e);
    throw e;
  }
}

module.exports = haulBundle;
