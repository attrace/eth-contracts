const { EthHdWallet } = require('eth-hd-wallet');

const fs = require('fs-extra');
if(fs.existsSync(__dirname+'/.env')) {
  const result = require('dotenv').config();
  if (result.error) {
    throw result.error;
  }
}
 
const wallet = EthHdWallet.fromMnemonic(process.env.ATTR_MNEMONIC_RINKEBY);

console.log(wallet.generateAddresses(10) );