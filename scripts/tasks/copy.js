module.exports = function (options) {
  const doCopy = require('./utils/do-copy.js');
  return doCopy('config/pre-copy.json');
};