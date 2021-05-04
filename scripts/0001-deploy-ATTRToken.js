// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { run, ethers, upgrades } = require("hardhat");
// const { BigNumber } = require('ethers');

async function main() {
  // await hre.run('compile');
  const ATTRToken = await ethers.getContractFactory("ATTRToken");
  const erc20 = await upgrades.deployProxy(ATTRToken, []);
  await erc20.deployed();
  console.log("erc20 deployed to:", erc20.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
