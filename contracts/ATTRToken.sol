// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

// The ATTRToken is the Attrace utility token.
// More info: https://attrace.com
//
// We keep the contract upgradeable during development to make sure we can evolve and implement gas optimizations later on.
//
// Upgrade strategy towards DAO:
// -  Pre-DAO: the token is managed and improved by the Attrace project.
// -  When DAO is achieved: the token will become owned by the DAO contracts, or if the DAO decides to lock the token, then it can do so by transferring ownership to a contract which can't be upgraded.
contract ATTRToken is ERC20Upgradeable {
  function initialize() public initializer {
    __ERC20_init("Attrace", "ATTR");
    _mint(msg.sender, 10 ** 27); // 1000000000000000000000000000 aces, 1,000,000,000 ATTR
  }
}
