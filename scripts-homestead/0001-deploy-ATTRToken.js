require('dotenv').config();

// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { run, ethers, upgrades } = require("hardhat");
// const { BigNumber } = require('ethers');

async function main() {
  const accounts = await ethers.getSigners();

  // Pick right controller addr
  let wlControllerAddr = process.env.ADDR_WHITELIST_CONTROLLER;
  if(process.env.ADDR_WHITELIST_CONTROLLER === 'HARDHAT1') {
    wlControllerAddr = accounts[0].address;
  }
  if(wlControllerAddr.substr(0, 2) !== '0x') {
    throw new Error('invalid wlcontroller addr');
  }

  // await hre.run('compile');
  const ATTRToken = await ethers.getContractFactory("ATTRToken");
  console.log({ ATTRToken });
  const erc20 = await upgrades.deployProxy(ATTRToken, [wlControllerAddr]);
  console.log(erc20);
  const tx = await erc20.deployed();
  console.log(tx);
  console.log("erc20 deployed to:", erc20.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

