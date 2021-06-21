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
const { timeTravel } = require("../devscript-helpers");

const getMainnetATTR = exports.getMainnetATTR = async function() {
  const accounts = await ethers.getSigners();
  const ATTRToken = await ethers.getContractFactory("ATTRToken");
  const attr = await upgrades.deployProxy(ATTRToken, [accounts[0].address]);
  await attr.deployed();

  return attr;
}

// // Unlock the contract for testing
// const block = await ethers.provider.getBlock();
// await attr.connect(accounts[0]).setNoRulesTime(block.timestamp+10);
// await hre.network.provider.send("evm_setNextBlockTimestamp", [block.timestamp+20]);

async function shouldFail(promise) {
  try {
    await promise;
    throw new Error('shouldthrow');
  } catch(err) {
    if(err.message.indexOf('not yet tradeable') < 0 && err.message.indexOf('transfer rule violation') < 0) {
      throw err;
    }
  }
}

async function main() {
  await run("compile");
  
  // Session accounts
  const accounts = await ethers.getSigners();
  const deployer = accounts[0];
  const vt2l3v12_outbound = accounts[1];
  const vt3l6v12 = accounts[2];
  const vt4l0v12 = accounts[3];
  const vt6l0v6 = accounts[5];
  const vt7l0v12 = accounts[6]; // Test for releasing remainders
  const dNoLockNoVest = accounts[7];
  const dLockVest = accounts[8];
  const dNull = accounts[9];

  // Get deployed ATTR token
  const attr = await getMainnetATTR();

  const a2400 = BigNumber.from('2400000000000000000000');
  const a1 = BigNumber.from('1000000000000000000');
  const a200 = BigNumber.from('200000000000000000000');
  const a100 = BigNumber.from('100000000000000000000');
  const a400 = BigNumber.from('400000000000000000000');

  // Verify transfers are locked until release time
  await attr.setNoRulesTime(dayjs('2021-06-23T00:00:00+02:00').unix()); //mainnet time
  // Transfer 100 ATTR to 1
  await shouldFail(
    attr.transfer(accounts[1].address, BigNumber.from('100000000000000000000'))
  );

  // Add transfer rules
  await attr.setTransferRule(vt2l3v12_outbound.address, {
    timeLockMonths: 0,
    vestingMonths: 0,
    tokens: a2400,
    activationTime: 0,
    outboundTimeLockMonths: 3,
    outboundVestingMonths: 12,
  });
  await attr.setTransferRule(vt3l6v12.address, {
    timeLockMonths: 6,
    vestingMonths: 12,
    tokens: a2400,
    activationTime: 0,
    outboundTimeLockMonths: 0,
    outboundVestingMonths: 0,
  });
  await attr.setTransferRule(vt4l0v12.address, {
    timeLockMonths: 0,
    vestingMonths: 12,
    tokens: a2400,
    activationTime: 0,
    outboundTimeLockMonths: 0,
    outboundVestingMonths: 0,
  });
  await attr.setTransferRule(vt6l0v6.address, {
    timeLockMonths: 0,
    vestingMonths: 6,
    tokens: a2400,
    activationTime: 0,
    outboundTimeLockMonths: 0,
    outboundVestingMonths: 0,
  });
  await attr.setTransferRule(vt7l0v12.address, { // Validate rounding
    timeLockMonths: 0,
    vestingMonths: 12,
    tokens: BigNumber.from('2416239138579618274940'),
    activationTime: 0,
    outboundTimeLockMonths: 0,
    outboundVestingMonths: 0,
  });

  // Transfer 2400 to all accounts
  await attr.setPreReleaseAddressStatus(deployer.address, true);
  await attr.transfer(vt2l3v12_outbound.address, a2400);
  await attr.transfer(vt3l6v12.address, a2400);
  await attr.transfer(vt4l0v12.address, a2400);
  await attr.transfer(vt6l0v6.address, a2400);
  await attr.transfer(vt7l0v12.address, BigNumber.from('2416239138579618274940'));

  // Unlock the token
  let block = await ethers.provider.getBlock();
  await attr.setNoRulesTime(block.timestamp + 2);
  await timeTravel(3);

  // Verify locks are enforced
  await shouldFail(
    attr.connect(vt3l6v12).transfer(dNull.address, a1));

  // Verify unlocked can transfer a vested amount from beginning
  await shouldFail(
    attr.connect(vt4l0v12).transfer(dNoLockNoVest.address, a200.add(1)));
  const lockedTokens = await attr.getLockedTokens(vt4l0v12.address);
  const getterTest = lockedTokens.toString() === a200.mul(11).toString();
  await attr.connect(vt4l0v12).transfer(dNoLockNoVest.address, a200);

  await shouldFail(
    attr.connect(vt6l0v6).transfer(dNoLockNoVest.address, a400.add(1)));
  await attr.connect(vt6l0v6).transfer(dNoLockNoVest.address, a400);

  await attr.connect(vt7l0v12).transfer(dNoLockNoVest.address, a200);

  // Verify transfers out work from the beginning for type 2
  await attr.connect(vt2l3v12_outbound).transfer(dLockVest.address, BigNumber.from('1000000000000000000')); // Should be unlocked in 3 months

  // Time travel 6 months ahead -- should release some locks and kick off vesting
  await timeTravel(86400*180 + 1);

  // Verify if unlocked and enforces vesting correctly
  await shouldFail(
    attr.connect(vt3l6v12).transfer(dNoLockNoVest.address, a200.add(1)));
  await attr.connect(vt3l6v12).transfer(dNoLockNoVest.address, a200);

  // Should release 6 more slices of the others
  await shouldFail(
    attr.connect(vt4l0v12).transfer(dNoLockNoVest.address, a200.mul(6).add(1)));
  await attr.connect(vt4l0v12).transfer(dNoLockNoVest.address, a200.mul(6));

  await shouldFail(
    attr.connect(vt6l0v6).transfer(dNoLockNoVest.address, a400.mul(5).add(1))); // 5 because already transferred one slice
  await attr.connect(vt6l0v6).transfer(dNoLockNoVest.address, a400.mul(5)); // 6 should should be drained
  const test6drained = (await attr.balanceOf(vt6l0v6.address)).toString() === '0';

  await attr.connect(vt7l0v12).transfer(dNoLockNoVest.address, a200.mul(6));

  // Time travel 6 more months ahead and verify full drain
  await timeTravel(86400*180 + 1);

  await attr.connect(vt4l0v12).transfer(dNoLockNoVest.address, a200.mul(5));
  const test4drained = (await attr.balanceOf(vt4l0v12.address)).toString() === '0';

  await attr.connect(vt3l6v12).transfer(dNoLockNoVest.address, a200.mul(6));

  // Time travel 6 more months ahead and verify full drain
  await timeTravel(86400*180 + 1);

  await attr.connect(vt3l6v12).transfer(dNoLockNoVest.address, a200.mul(5));
  const test3drained = (await attr.balanceOf(vt3l6v12.address)).toString() === '0';

  // Verify remainders are released
  await attr.connect(vt7l0v12).transfer(dNoLockNoVest.address, BigNumber.from('2416239138579618274940').sub(a200.mul(7)));
  const test7drained = (await attr.balanceOf(vt7l0v12.address)).toString() === '0';

  // Verify that transfers after draining are possible
  await attr.connect(dNoLockNoVest).transfer(vt3l6v12.address, a200);
  await attr.connect(vt3l6v12).transfer(dNoLockNoVest.address, a200);

  // -- Verify type 2 - the special one
  // Transfers should work, but rules should be enforced on receivers, not on the sender.
  await attr.connect(vt2l3v12_outbound).transfer(dNull.address, a100.mul(12));

  // Time travel ahead right before lock end
  await timeTravel(86400*90 - 5);

  await shouldFail(
    attr.connect(dNull).transfer(deployer.address, a1));

  // Time travel ahead after lock
  await timeTravel(6);
  
  await shouldFail(
    attr.connect(dNull).transfer(deployer.address, a100.add(1)));
  await attr.connect(dNull).transfer(deployer.address, a100);

  // Time travel ahead 11 months and mine a block so the time actually moves...
  await timeTravel(86400*30*11 + 1);

  // Verify drain
  await attr.connect(dNull).transfer(deployer.address, a100.mul(11));
  const test2drained = (await attr.balanceOf(dNull.address)).toString() === '0';

  debugger;
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });