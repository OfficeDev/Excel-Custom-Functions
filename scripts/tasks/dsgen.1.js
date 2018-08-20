const fs = require('fs');
const path = require('path');

module.exports = function(options) {
  var configPath = path.resolve(process.cwd(), '.tsnmconfig');
  if (fs.existsSync(configPath)) {
    var processFolder = require('@office-iss/tsnm-compiler').processFolder;
    processFolder(process.cwd());
  }
};
