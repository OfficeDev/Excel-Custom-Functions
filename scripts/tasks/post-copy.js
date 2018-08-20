module.exports = function (options) {
  const doCopy = require('../utils/do-copy.js');
  return doCopy('config/post-copy.json');
}