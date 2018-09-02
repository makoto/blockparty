# Contracts

[![Build Status](https://api.travis-ci.org/noblocknoparty/contracts.svg?branch=master)](https://travis-ci.org/noblocknoparty/contracts)
[![Coverage Status](https://coveralls.io/repos/github/noblocknoparty/contracts/badge.svg?branch=master)](https://coveralls.io/github/noblocknoparty/contracts?branch=master)

This repo contains all the BlockParty contracts. The `master` branch is the
main branch, and contains the productions versions of the contracts.

# Using the contracts

To use these contracts in a Dapp first install our NPM org:

```
TBC
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
