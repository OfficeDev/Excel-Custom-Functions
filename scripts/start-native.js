const path = require('path');
const execSync = require('./utils/exec-sync');
const fs = require('fs');

const packageRoot = process.cwd();

if (fs.existsSync(path.resolve(packageRoot, './haul.config.js'))) {
  let haulCmd = `node ${path.resolve(__dirname, '../node_modules/haul/bin/cli.js')} start`;
  console.log('Haul command is ' + haulCmd);
  execSync(haulCmd);
} else {
  const rnConfigFilePath = path.resolve(packageRoot, "rn-cli.config.js");
  let reactCmd = `node  node_modules/react-native/cli.js start`;
  execSync(reactCmd);
}