const fs = require('fs-extra');
if(fs.existsSync(__dirname+'/.env')) {
  const result = require('dotenv').config();
  if (result.error) {
    throw result.error;
  }
}

require("@nomiclabs/hardhat-waffle");
require('@openzeppelin/hardhat-upgrades');
require("hardhat-gas-reporter");
require('hardhat-abi-exporter');
// require('hardhat-deploy-ethers');

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.0",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  gasReporter: {
    enabled: true,
    coinmarketcap: (process.env.ATTR_COINMARKETCAP || 'a-uuid-here'),
    // proxyResolver: null,
    // gasPrice: 130,
    // currency: 'EUR',
  },
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.ATTR_INFURA_KEY}`,
      accounts: { 
        mnemonic: (process.env.ATTR_MNEMONIC || 'you have to set the env file see readme for detailed information')
      },
    }
  }
};

