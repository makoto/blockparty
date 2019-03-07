# Contracts

[![Build Status](https://api.travis-ci.org/wearekickback/contracts.svg?branch=master)](https://travis-ci.org/wearekickback/contracts)
[![Coverage Status](https://coveralls.io/repos/github/wearekickback/contracts/badge.svg?branch=master)](https://coveralls.io/github/wearekickback/contracts?branch=master)

This repo contains all the Kickback contracts. The `master` branch is the
main branch, and contains the productions versions of the contracts.

# Using the contracts

To use these contracts in a Dapp first install our NPM org:

```
npm i @wearekickback/contracts
```

Then, using [truffle-contract](https://github.com/trufflesuite/truffle/tree/develop/packages/truffle-contract) you can import and use the
`Deployer` contract definition and use it as such:

```js
const promisify = require('es6-promisify')
const TruffleContract = require('truffle-contract')
const Web3 = require('web3')
const { Deployer } = require('@wearekickback/contracts')

async init = () => {
  const web3 = new Web3(/* Ropsten or Mainnet HTTP RPC endpoint */)

  const contract = TruffleContract(Deployer)
  contract.setProvider(web3.currentProvider)

  const deployer = await contract.deployed()

  // deploy a new party (see Deployer.sol for parameter documentation)
  await deployer.deploy('My event', 0, 0, 0)

  const events = await promisify(deployer.contract.getPastEvents, deployer.contract)('NewParty')

  const { returnValues: { deployedAddress } } = events.pop()

  console.log(`New party contract deployed at: ${deployedAddress}`)
}
```

## Dev guide

Pre-requisites:

- [Node 8.12+](https://nodejs.org/)
- [Yarn](https://yarnpkg.com)

**Setup Truffle config**

Copy `.deployment-sample.js` to `.deployment.js` and edit the values
accordingly.

**Install dependencies and do basic setup**

```
yarn
yarn setup
```

Setup parameters for Truffle config:

```
cp .deployment-sample.js .deployment.js
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
yarn seed:party -i test
```

This command has a number of options which allow you additionally simulate the
full lifecycle of a party:

```shell
$ yarn seed:party --help

Usage: deployNewParty [options]

Options:

  -i, --id <id>            Id of party (obtain from UI /create page)
  --ropsten                Use Ropsten instead of local development network
  --rinkeby                Use Rinkeby instead of local development network
  --mainnet                Use Mainnet instead of local development network
  --admins <n>             Number of additional party admins to have
  -c, --cancelled          Whether to mark the party as cancelled
  -t, --coolingPeriod [n]  How long the cooling period is in seconds (default: 604800)
  -d, --deposit [n]        Amount of ETH attendees must deposit (default: 0.02)
  -f, --finalize <n>       Finalize the party with the given no. of attendees
  -p, --participants <n>   Maximum number of participants
  -r, --register <n>       Number of participants to register
  -w, --withdraw <n>       Number of attendees to withdraw payouts for
  -h, --help               output usage information
```

So, for example, to create party with max. 100 participants, upto 50 actually
registered, with 25 having actually attended, and 12 having withdrawn their
payouts after the party has ended. With an added cooling period of 1 millisecond to allow your to test the clear functionality immediately.

```shell
yarn seed:party -i test -p 100  -r 50 -a 25 -w 12 -e -t 1
```

The script actually uses `truffle-config.js` to work out how to connect to the
development network. If you want to seed a party on e.g. Ropsten then you can do by
supplying the `--ropsten` flag:

```shell
yarn seed:party --ropsten -i test -p 100  -r 50 -a 25 -w 12 -e -t 1
```

_Note: For public network seeding to work you will need to have
configured valid values in `.deployment.js` (see "Deployment to public networks" below)._

## Tests

```
yarn coverage
```

## Deployment to public networks

Edit `.deployment.js` and fill in the company mnemonic and Infura key (obtain from 1Password).

Now run:

- `yarn deploy:local` - for deploying to local, private chain, e.g. Ganache. This will also call
  a script to update the `app` and `server` repo clones if you've checked them out as sibling folders.

## NPM publishing

Releases are done automatically via CI. Prior to doing a release, ensure the
latest compiled contracts have been deployed to both test nets and the `mainnet`:

```
$ yarn deploy:ropsten
$ yarn deploy:rinkeby
$ yarn deploy:mainnet
```

_Note: ensure `.deployment.js` is accurately setup for the above to work_.

Then create a new release:

1. Increment the `version` in `package.json` as required, as part of a new or existing Pull Request.
2. Once the approved PR has been merged, run `git tag <version>` (where `<version>` is same as in `package.json`) on the merge commit.
3. Run `git push --tags`
4. The CI server will now do a build and deploy to NPM.
