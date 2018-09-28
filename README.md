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

- [Node 8.11.4+](https://nodejs.org/)
- [Yarn](https://yarnpkg.com)

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

## Simulation

To deploy a new party onto the local test network:

```shell
yarn seed:party
```

This command has a number of options which allow you additionally simulate the
full lifecycle of a party:

```shell
$ yarn seed:party --help

Usage: deployNewParty [options]

Options:

  -a, --attendees         Number of registrants to mark as having attended
  -c, --cancelled         Whether to mark the party as cancelled
  -d, --deposit [n]       Amount of ETH attendees must deposit (default: 0.02)
  -e, --ended             Whether to mark the party as having already ended
  -n, --name [n]          Name of party (default: test)
  -p, --participants <n>  Maximum number of participants
  -r, --register <n>      Number of participants to register
  -w, --withdraw <n>      Number of attendees to withdraw deposits for
  -h, --help              output usage information
```

So, for example, to create party with max. 100 participants, upto 50 actually
registered, with 25 having actually attended, and 12 having withdrawn their
payouts after the party has ended. With an added cooling period of 1 millisecond to allow your to test the clear functionality immediately.

```shell
yarn seed:party -p 100  -r 50 -a 25 -w 12 -e -t 1
```

## Tests

```
yarn coverage
```

## Deployment to public networks

Edit `.deployment.js` and fill in the company mnemonic and Infura key (obtain from 1Password).

Now run:

- `yarn deploy:local` - for deploying to local, private chain, e.g. Ganache. This will also call
  a script to update the `app` and `server` repo clones if you've checked them out as sibling folders.
- `yarn deploy:ropsten` - for deploying to Ropsten (`.deployment.js` must be accurately setup)
- _TODO: mainnet_

## NPM publishing

Releases are done automatically via CI. Prior to doing a release, ensure the
latest compiled contracts have been deployed to both `ropsten` and `mainnet`.

To create a new release:

1. Increment the `version` in `package.json` as required, as part of a new or existing Pull Request.
2. Once the approved PR has been merged, run `git tag <version>` (where `<version>` is same as in `package.json`) on the merge commit.
3. Run `git push --tags`
4. The CI server will now do a build and deploy to NPM.
