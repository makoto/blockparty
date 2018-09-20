# Contracts

[![Build Status](https://api.travis-ci.org/noblocknoparty/contracts.svg?branch=master)](https://travis-ci.org/noblocknoparty/contracts)
[![Coverage Status](https://coveralls.io/repos/github/noblocknoparty/contracts/badge.svg?branch=master)](https://coveralls.io/github/noblocknoparty/contracts?branch=master)

This repo contains all the BlockParty contracts. The `master` branch is the
main branch, and contains the productions versions of the contracts.

# Using the contracts

To use these contracts in a Dapp first install our NPM org:

```
npm i @noblocknoparty/contracts
```

Then, using [truffle-contract](https://github.com/trufflesuite/truffle/tree/develop/packages/truffle-contract) you can import and use the
`Deployer` contract definition and use it as such:

```js
const promisify = require('es6-promisify')
const TruffleContract = require('truffle-contract')
const Web3 = require('web3')
const { Deployer } = require('@noblocknoparty/contracts')

async init = () => {
  const web3 = new Web3(/* Ropsten or Mainnet HTTP RPC endpoint */)

  const contract = TruffleContract(Deployer)
  contract.setProvider(web3.currentProvider)

  const deployer = await contract.deployed()

  // deploy a new party (see Deployer.sol for parameter documentation)
  await deployer.deploy('My event', 0, 0, 0, 'Encryption key')

  const events = await promisify(deployer.contract.getPastEvents, deployer.contract)('NewParty')

  const { returnValues: { deployedAddress } } = events.pop()

  console.log(`New party contract deployed at: ${deployedAddress}`)
}
```

## Dev guide

Pre-requisites:

* [Node 8.11.4+](https://nodejs.org/)
* [Yarn](https://yarnpkg.com)

**Setup Truffle config**

Copy `.deployment-sample.js` to `.deployment.js` and edit the values
accordingly.

**Install dependencies**

```
yarn
```

**Run local chain**

```
npx ganache-cli --accounts 500
```

**Run tests**

```
yarn test
```

**Run coverage tests**

```
yarn coverage
```

## Contract deployment

Edit `.deployment.js` and fill in the company mnemonic and Infura key (obtain from 1Password).

Now run:

* `yarn deploy:local` - for deploying to local, private chain, e.g. Ganache. This will also call
a script to update the `app` and `server` repo clones if you've checked them out as sibling folders.
* `yarn deploy:ropsten` - for deploying to Ropsten (`.deployment.js` must be accurately setup)
* _TODO: mainnet_


## NPM publishing

Releases are done automatically via CI. Prior to doing a release, ensure the
latest compiled contracts have been deployed to both `ropsten` and `mainnet`.

To create a new release:

1. Increment the `version` in `package.json` as required, as part of a new or existing Pull Request.
3. Once the approved PR has been merged, run `git tag <version>` (where `<version>` is same as in `package.json`) on the merge commit.
5. Run `git push --tags`
6. The CI server will now do a build and deploy to NPM.
