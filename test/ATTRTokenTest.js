const { expect } = require("chai");
const { BigNumber } = require('ethers');
const hre = require("hardhat");
const { run, ethers, upgrades } = hre;

const deployer = 0;
const seller = 1;
const maxSupply = BigNumber.from('1000000000000000000000000000');

describe("ATTR Token", function() {
  let ATTRToken, erc20, accounts;

  before(done => {
    (async _ => {
      accounts = await ethers.getSigners();
      ATTRToken = await ethers.getContractFactory("ATTRToken");
      erc20 = await upgrades.deployProxy(ATTRToken, []);
      await erc20.deployed();
      done();
    })();
  });

  it("Should be initialized correctly", async function() {
    const total = await erc20.totalSupply();
    expect(total.toString()).to.equal(maxSupply.toString());
  });

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
