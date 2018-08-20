module.exports = function(options) {
  const execSync = require('../utils/exec-sync');
  const path = require('path');
  const fs = require('fs');
  const msCustomRulesMain = require.resolve('tslint-microsoft-contrib');
  const rulesPath = path.dirname(msCustomRulesMain);
  const projectPath = path.resolve(process.cwd(), 'tsconfig.json');
  const sourcePath = path.resolve(process.cwd(), 'src/*.ts*');
  const tslintPath = 'node ' + path.resolve(__dirname, '../node_modules/tslint/lib/tslintCli');

  execSync(`${tslintPath} --project ${projectPath} -t stylish -r ${rulesPath}`);
};
