# Contracts

[![Build Status](https://api.travis-ci.org/noblocknoparty/blockparty-contracts.svg?branch=master)](https://travis-ci.org/noblocknoparty/blockparty-contracts)
[![Coverage Status](https://coveralls.io/repos/github/noblocknoparty/blockparty-contracts/badge.svg?branch=master)](https://coveralls.io/github/noblocknoparty/blockparty-contracts?branch=master)

This repo contains all the BlockParty contracts. The `master` branch is the
main branch, and contains the productions versions of the contracts.

# Using the contracts

To use the contracts in a Dapp please install our NPM org:

```
TBC
```

## Dev guide

Pre-requisites:

* [Node 8.11.4+](https://nodejs.org/)
* [Yarn](https://yarnpkg.com)

Install the deps:

```
yarn
```

Run a local dev chain:

```
npx ganache-cli --accounts 500
```

To run tests:

```
yarn test
```
