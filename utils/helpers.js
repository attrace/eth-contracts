const fs = require('fs-extra');

module.exports.loadDotEnv = function _loadDotEnv() {
  if(fs.existsSync(__dirname+'/../.env')) {
    const result = require('dotenv').config();
    if (result.error) {
      throw result.error;
    }
  }  
}