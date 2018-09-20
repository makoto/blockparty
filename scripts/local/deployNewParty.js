#!/usr/bin/env node

/* This script deploys a new party using the Deployer */

const fs = require('fs')
const path = require('path')
const Web3 = require('web3')
const { toHex, toWei } = require('web3-utils')

const { Deployer  } = require('../../')

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))

const handler = cb => (err, result) => {
  if (err) {
    console.error(err)
    process.exit(-1)
  }

  cb(result)
}

web3.version.getNetwork(handler(networkId => {
  const { address } = Deployer.networks[networkId] || {}

  console.log(`Deployer: ${address}`)

  web3.eth.getAccounts(handler(accounts => {
    const [ account ] = accounts

    console.log(`Account: ${account}`)

    const contract = web3.eth.contract(Deployer.abi)
    const instance = contract.at(address)

    instance.NewParty(handler(result => {
      console.log(`New party: ${result.args.deployedAddress}`)
      process.exit(0)
    }))

    instance.deploy(
      'test',
      toHex(toWei('0.02')),
      toHex(2),
      toHex(60 * 60 * 24 * 7),
      'encKey',
      { from: account, gas: 4000000 }
    )
  }))
}))
