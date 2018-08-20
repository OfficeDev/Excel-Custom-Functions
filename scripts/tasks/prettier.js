module.exports = function(options) {
  const childProcess = require('child_process');
  const execSync = require('../utils/exec-sync');
  const path = require('path');
  const fs = require('fs');
  const prettier = require('prettier');

  const projectPath = path.resolve(process.cwd());
  const sourcePath = path.join(process.cwd(), 'src', '**', '*.{ts,tsx}');
  const prettierPath = 'node ' + path.resolve(__dirname, '../node_modules/prettier/bin-prettier.js');

  const prettierConfigPath = path.join(__dirname, '../../prettier.config.js');
  const prettierIgnorePath = path.join(__dirname, '../../.prettierignore');

  try {
    fs.accessSync(prettierConfigPath, fs.constants.R_OK);
  } catch (err) {
    console.error('Can not find prettier.config.js');

    process.exit(1);
  }

  console.log(`${prettierPath} --config ${prettierConfigPath} --write "${sourcePath}"`);

  childProcess.execSync(
    `${prettierPath} --config ${prettierConfigPath} --ignore-path "${prettierIgnorePath}" --write "${sourcePath}"`
  );
};
