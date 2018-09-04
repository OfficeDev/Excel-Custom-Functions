const fs = require('fs');
const xml2js = require('xml2js');
const path = require('path');
const devSettings = require('./dev-settings');

var parser = new xml2js.Parser();
var xmlPath = path.resolve(process.cwd(), 'manifest.xml');

fs.readFile(xmlPath, function(err, xmlData) {
  parser.parseString(xmlData, function(err, jsData) {
    const guid = jsData['OfficeApp']['Id'][0];

    devSettings.clearDevSettings(guid);
  });
});
