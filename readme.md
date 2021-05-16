<h1 align="center">
  <br>
  <a href="https://attrace.com"><img src="https://attrace.com/images/attrace-logo.svg" alt="Attrace logo" width="400"></a>
  <br>
  Attrace Ethereum Contracts
  <br>
</h1>

<p align="center">This repository contains contracts deployed to mainnet ethereum.</p>

<p align="center">More information: <a href="https://attrace.com">https://attrace.com</a></p>

## Development

### Intro

Make sure to learn https://docs.openzeppelin.com/upgrades-plugins/1.x/proxies

### Yarn users
Use npm instead in this project

### Once
```
npm i

# https://hardhat.org/guides/shorthand.html
npm i -g hardhat-shorthand 
```

### Dev workflow
```
# Running scripts
hh run --verbose scripts/filename.js...  [--network hardhat|localhost|rinkeby|...]

# Running tests
hh test
```

### Workflow evm node
```
# In separate thread
hh node

# Now run any command with network suffix
hh test --network localhost
```

### Create .env
`.env` is not tracked in git

Depending on environment, the scripts expect these files with the right settings when deploying to them.

Before deploying, make sure you have the right .env loaded.

```
cat .env.shared >> .env
cat .env.NETWORK >> .env
# Now edit and fill out all missing values
```

### Console logging example

> :warning: Uncomment these statements import+usage before deploys!

```
import "hardhat/console.sol";
console.log("Changing greeting from '%s' to '%s'", greeting, _greeting);
```

## Deployment

Scripts are ran in a migration style and state of addresses and migrations should be tracked in the repo (manually).

We maintain a markdown file per network. Where we paste all commands with output and reference addresses which successfully complete.

-  Rinkeby deployment state [./rinkeby.md](./rinkeby.md)
-  Mainnet deployment state [./mainnet.md](./mainnet.md)

## Attrace classic migration

The token starts as a fork of the Attrace classic network.

Due to change in address structure (ed25519 => ethereum secp256k1), transfering the tokens will happen through a bridge.
The bridge collects the relationship between classic network and ethereum addresses.

## Etherscan verification

https://github.com/hjubb/solt

```
./devutils/solt write --npm contracts/ATTRToken.sol
```