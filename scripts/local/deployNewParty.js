#!/usr/bin/env node

/* This script deploys a new party using the Deployer */

const fs = require('fs')
const path = require('path')
const Web3 = require('web3')
const { toHex, toWei } = require('web3-utils')

const { Deployer  } = require('../../')

async function init () {
  const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))

  const networkId = await web3.eth.net.getId()

  const { address } = Deployer.networks[networkId] || {}

  console.log(`Deployer: ${address}`)

  const accounts = await web3.eth.getAccounts()

  const [ account ] = accounts

  console.log(`Account: ${account}`)

  const instance = new web3.eth.Contract(Deployer.abi, address)

  const tx = await instance.methods.deploy(
    'test',
    toHex(toWei('0.02')),
    toHex(2),
    toHex(60 * 60 * 24 * 7),
    'encKey'
  ).send({ from: account, gas: 4000000 })

  console.log(`New party: ${tx.events.NewParty.returnValues.deployedAddress}`)
}

init().catch(err => {
  console.error(err)
  process.exit(-1)
})
