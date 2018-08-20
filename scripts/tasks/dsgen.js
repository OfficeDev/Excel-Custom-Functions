const fs = require('fs');
const path = require('path');

module.exports = function(options) {
  const rekaConfigPath = path.resolve(process.cwd(), 'rekaconfig.json');
  const legacyRekaConfigPath = path.resolve(process.cwd(), '.tsnmconfig');
  if (fs.existsSync(rekaConfigPath) || fs.existsSync(legacyRekaConfigPath)) {
    const processFolder = require('@office-iss/tsnm-compiler').processFolder;
    processFolder(process.cwd());
  }
};
