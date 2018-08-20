const execSync = require('./utils/exec-sync');

function makeAppxPackage(appxName, appxParams) {
  if (appxParams === undefined) {
    throw new Error(`Appx parameters for ${appxName} is undefined.`);
  }

  let cmd = 'node ../office-build-tools/lib/OfficeBuildTools.js ' + appxParams['operation'];

  for (let param in appxParams) {
    cmd += oneParam(param, appxParams[param]);
  }

  execSync(cmd);
}

function oneParam(param, value) {
  let result;

  switch (param) {
    case 'assetid':
      result = ' -a "' + value + '"';
      break;
    case 'bundle':
      result = ' -o ' + value;
      break;
    case 'icon':
      result = ' -k "' + value + '"';
      break;
    case 'include':
      result = ' -i';
      value.forEach(i => result += ' "' + i + '"');
      break;
    case 'locale':
      result = ' -l "' + value + '"';
      break;
    case 'manifest':
      result = ' -m "' + value + '"';
      break;
    case 'package':
      result = ' -p "' + value + '"';
      break;
    case 'packagedir':
      result = ' -r "' + value + '"';
      break;
    case 'urlmap':
      result = ' -u "' + value + '"';
      break;
    case 'verbose':
      result = value ? ' -z' : '';
      break;
    case 'version':
      result = ' -v "' + value + '"';
      break;
    case 'workdir':
      result = ' -w "' + value + '"';
      break;
    default:
      result = '';
      break;
  }

  return result;
}

module.exports = makeAppxPackage;