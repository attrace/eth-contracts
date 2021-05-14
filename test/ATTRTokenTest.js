const { expect } = require("chai");
const hre = require("hardhat");
const { run, ethers, upgrades } = hre;
const { BigNumber } = require('ethers');
const dayjs = require("dayjs");

const deployer = 0;
const seller = 1;
const maxSupply = BigNumber.from('1000000000000000000000000000');

describe("ATTR Token", function() {
  let ATTRToken, erc20, accounts;

  before(done => {
    (async _ => {
      accounts = await ethers.getSigners();
      ATTRToken = await ethers.getContractFactory("ATTRToken");
      erc20 = await upgrades.deployProxy(ATTRToken, [accounts[deployer].address]);
      await erc20.deployed();
      done();
    })();
  });

  it("Should be initialized correctly", async function() {
    const total = await erc20.totalSupply();
    expect(total.toString()).to.equal(maxSupply.toString());
  });

  it("Should not allow transfer before listing unless white listed", async function() {
    try {
      await erc20.transfer(accounts[seller].address, BigNumber.from('100'));
      throw new Error('Should throw error');
    } catch (err) {
      if(err.message.indexOf('not yet tradeable') < 0) {
        throw new Error('Should throw error');
      }
    }

    // Add deployer to whitelist and test transfer out
    await erc20.setPreReleaseAddressStatus(accounts[deployer].address, true);
    await erc20.transfer(accounts[seller].address, BigNumber.from('100'));
    let balance = await erc20.balanceOf(accounts[seller].address);
    expect(balance.toString()).to.equal('100');

    // Ensure seller cannot transfer out
    try {
      await erc20.connect(accounts[seller]).transfer(accounts[deployer].address, BigNumber.from('100'));
      throw new Error('Should throw error');
    } catch (err) {
      if(err.message.indexOf('not yet tradeable') < 0) {
        throw new Error('Should throw error');
      }
    }

    // Grant seller to transfer back and transfer back
    await erc20.setPreReleaseAddressStatus(accounts[seller].address, true);
    await erc20.connect(accounts[seller]).transfer(accounts[deployer].address, BigNumber.from('100'));
    balance = await erc20.balanceOf(accounts[seller].address);
    expect(balance.toString()).to.equal('0');
    
    // Toggle seller and deployer back to false
    await erc20.setPreReleaseAddressStatus(accounts[deployer].address, false);
    await erc20.setPreReleaseAddressStatus(accounts[seller].address, false);

    // --Verify that we can move the unlock time forward when the listing is not yet reached

    // Time travel to far in future
    block = await ethers.provider.getBlock();
    await hre.network.provider.send("evm_setNextBlockTimestamp", [dayjs('2021-06-08T04:00:00Z').unix()]);

    // Verify cannot set earlier than existing block
    try {
      await erc20.setNoRulesTime(dayjs('2021-06-08T04:00:00Z').unix() - 1);
      throw new Error('Should throw error');
    } catch (err) {
      if(err.message.indexOf('reverted without a reason') < 0) {
        throw new Error('Should throw error');
      }
    }

    // Update time to lift rules
    await erc20.setNoRulesTime(dayjs('2021-06-21T12:00:00Z').unix());

    // Reset time to original 
    await erc20.setNoRulesTime(1623146400);

    // --/Verify

    // Time travel to just before end of listing period
    block = await ethers.provider.getBlock();
    await hre.network.provider.send("evm_setNextBlockTimestamp", [dayjs('2021-06-08T09:59:30Z').unix()]);
    
    // Verify toggle
    try {
      await erc20.transfer(accounts[seller].address, BigNumber.from('100'));
      throw new Error('Should throw error');
    } catch (err) {
      if(err.message.indexOf('not yet tradeable') < 0) {
        throw new Error('Should throw error');
      }
    }
    
    // Time travel to after planned listing time
    block = await ethers.provider.getBlock();
    await hre.network.provider.send("evm_setNextBlockTimestamp", [dayjs('2021-06-08T10:00:00Z').unix() + 1]);

    // Verify transfers unlocked and reset state for next tests
    await erc20.transfer(accounts[seller].address, BigNumber.from('100'));
    await erc20.connect(accounts[seller]).transfer(accounts[deployer].address, BigNumber.from('100'));
    balance = await erc20.balanceOf(accounts[deployer].address);
    expect(balance.toString()).to.equal(maxSupply.toString());
    balance = await erc20.balanceOf(accounts[seller].address);
    expect(balance.toString()).to.equal('0');

    // Verify that the unlock time cannot be moved anymore
    try {
      await erc20.setNoRulesTime(dayjs('2021-06-21T10:00:00Z').unix() + 20);
      throw new Error('Should throw error');
    } catch (err) {
      if(err.message.indexOf('reverted without a reason') < 0) {
        throw new Error('Should throw error');
      }
    }
  });

  // FYI: everything below depends on above task time travel

  it("Should transfer correctly", async function() {
    const amount = BigNumber.from('1000000000000000000');
    await erc20.transfer(accounts[seller].address, amount);
    let balance = await erc20.balanceOf(accounts[seller].address);
    expect(balance.toString()).to.equal(amount.toString());
    balance = await erc20.balanceOf(accounts[deployer].address);
    expect(balance.toString()).to.equal('999999999000000000000000000');
  });

  it("Should not transfer more than supply", async function() {
    try {
      await erc20.transfer(accounts[seller].address, maxSupply.add(1));
      throw new Error('Should throw error');
    } catch (err) {
      if(err.message.indexOf('exceeds balance') < 0) {
        throw new Error('Should throw error');
      }
    }
  });

  it("Should not transfer negatives", async function() {
    try {
      await erc20.transfer(accounts[seller].address, BigNumber.from('-1'));
      throw new Error('Should throw error');
    } catch (err) {
      if(err.message.indexOf('out-of-bounds') < 0) {
        throw new Error('Should throw error');
      }
    }
  });

  it("Should not transfer token you don't have", async function() {
    try {
      await erc20.connect(accounts[seller]).transfer(accounts[deployer].address, BigNumber.from('10000000000000000000'));
      throw new Error('Should throw error');
    } catch (err) {
      if(err.message.indexOf('exceeds balance') < 0) {
        throw new Error('Should throw error');
      }
    }
  });

});
