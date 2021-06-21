const dayjs = require('dayjs');
// const crypto = require('crypto');
const fs = require('fs-extra');

const loadDotEnv = module.exports.loadDotEnv = function() {
  if(fs.existsSync(__dirname+'/../.env')) {
    const result = require('dotenv').config();
    if (result.error) {
      throw result.error;
    }
  }  
}
