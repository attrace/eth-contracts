# Attrace contracts

## Development

### Intro

Make sure to learn https://docs.openzeppelin.com/upgrades-plugins/1.x/proxies

### Console logging

Uncomment import+usage before deploys.

Example:
```
import "hardhat/console.sol";
console.log("Changing greeting from '%s' to '%s'", greeting, _greeting);
```

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
hh run scripts/filename.js...  [--network hardhat|localhost|rinkeby|...]

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

```
cp env.example .env
# edit .env now with the right config
```

## Deployment

Scripts are ran in a migration style and state of addresses and migrations should be tracked in the repo (manually).

We maintain a markdown file per network. Where we paste all commands with output and reference addresses which successfully complete.

-  Rinkeby deployment state [./rinkeby.md](./rinkeby.md)

## Attrace classic migration

The token starts as a fork of the Attrace classic network.

Due to change in address structure (ed25519 => ethereum secp256k1), transfering the tokens will happen through a bridge.
The bridge collects the relationship between classic network and ethereum addresses.
The transfers are done by the deployers until snapshot state of migration point is reached.

## Etherscan verification

https://github.com/hjubb/solt

```
./devutils/solt write --npm contracts/ATTRToken.sol
```