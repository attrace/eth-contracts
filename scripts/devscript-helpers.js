// This is a dev flow which allows to attach a debugger.
// It is a "full-flow-happy-path" and cycles through all stages in our process.
// Execute it through vscode with debugger to debug.
//
// It re-compiles modified contracts on re-runs.
// It re-deploys all contracts into an in-memory network every run.

const hre = require("hardhat");
const { run, ethers, upgrades } = hre;
const { BigNumber } = require("ethers");
const dayjs = require('dayjs');

const timeTravel = exports.timeTravel = async function(addition) {
  block = await ethers.provider.getBlock();
  await hre.network.provider.send("evm_setNextBlockTimestamp", [block.timestamp + addition]);
  await ethers.provider.send('evm_mine');
}

const timeTravelHard = exports.timeTravelHard = async function(ts) {
  block = await ethers.provider.getBlock();
  await hre.network.provider.send("evm_setNextBlockTimestamp", [ts]);
  await ethers.provider.send('evm_mine');
}