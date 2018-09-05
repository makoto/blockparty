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

## Release guide

Releases are done automatically via CI. To create a new release:

1. Increment the `version` in `package.json` as required, as part of a new or existing Pull Request.
3. Once the approved PR has been merged, run `git tag <version>` (where `<version>` is same as in `package.json`) on the merge commit.
5. Run `git push --tags`
6. The CI server will now do a build and deploy to NPM.
