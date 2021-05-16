# Latest Versions

## ATTR token proxy:
https://rinkeby.etherscan.io/address/0x926362b451A012F72b34240F36C3bDc163d462e0

## Referral token store ABI:
Read: https://rinkeby.etherscan.io/address/0xc989277F271Ab5ed90704f4C0f6aDa7F69cb1870#readProxyContract
Write: https://rinkeby.etherscan.io/address/0xc989277F271Ab5ed90704f4C0f6aDa7F69cb1870#writeProxyContract

## Market addr ABI:

Read: https://rinkeby.etherscan.io/address/0x33B31824Db6A42635242C7d901f95E4152e7FCcE#readProxyContract
Write: https://rinkeby.etherscan.io/address/0x33B31824Db6A42635242C7d901f95E4152e7FCcE#writeProxyContract

## Rinkeby Ethereum Verifier Registry
https://rinkeby.etherscan.io/address/0xd1Ab749f62bA2344cC5269fC9908D9147a9a2bcc

# Executed migrations on Rinkeby

```
hh run scripts/0003-deploy-ReferralMarketUpgradeable.js --network rinkeby
market address:  0x33B31824Db6A42635242C7d901f95E4152e7FCcE
```

```
hh run scripts/0002-deploy-ReferralTokenUpgradeable.js --network rinkeby
rt deployed to: 0xc989277F271Ab5ed90704f4C0f6aDa7F69cb1870
```

```
hh run scripts/0001-deploy-ATTRToken.js --network rinkeby
erc20 deployed to: 0x926362b451A012F72b34240F36C3bDc163d462e0
```


# OLD OUTDATED versions for reference
replaced due to breaking change

## Market
Read: https://rinkeby.etherscan.io/address/0x91b2ae9877f76d5a6f3ecf2e43d545e968a7345c#readProxyContract
Write: https://rinkeby.etherscan.io/address/0x91b2ae9877f76d5a6f3ecf2e43d545e968a7345c#writeProxyContract