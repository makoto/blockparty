#!/usr/bin/env node

/* This script deploys a new party using the Deployer */

const fs = require('fs')
const path = require('path')
const Web3 = require('web3')
const argv = require('yargs').argv
const { toHex, toWei } = require('web3-utils')
const faker = require('faker')

const { Deployer, Conference  } = require('../../')

async function init () {
  const name = argv.name || 'test'
  const numAttendees = parseInt(argv.attendees || '0') || 2
  const autoRegister = parseInt(argv.register || '0')
  const deposit = '0.02'

  console.log(
`
Config
------
Party name:         ${name}
Total attendees:    ${numAttendees}
Num to register:    ${autoRegister}
`
  )

  if (autoRegister > numAttendees) {
    throw new Error(`Cannot register more attendees than the limit!`)
  }

  const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))

  const networkId = await web3.eth.net.getId()

  const { address: deployerAddress } = Deployer.networks[networkId] || {}

  console.log(`Deployer: ${deployerAddress}`)

  const accounts = await web3.eth.getAccounts()

  if (accounts.length < autoRegister) {
    throw new Error(`Not enough accounts to register ${autoRegister} attendees. Please start testnet with more accounts!`)
  }

  const [ account ] = accounts

  console.log(`Account: ${account}`)

  const deployer = new web3.eth.Contract(Deployer.abi, deployerAddress)

  const tx = await deployer.methods.deploy(
    name,
    toHex(toWei(deposit)),
    toHex(numAttendees),
    toHex(60 * 60 * 24 * 7),
    'encKey'
  ).send({ from: account, gas: 4000000 })

  const { deployedAddress: partyAddress } = tx.events.NewParty.returnValues

  console.log(`New party: ${partyAddress}`)

  if (autoRegister) {
    console.log(
`

Registering attendees
---------------------`
    )

    const party = new web3.eth.Contract(Conference.abi, partyAddress)

    const promises = []
    for (let i = 0; autoRegister > i; i += 1) {
      const twitterId = `@${faker.lorem.word(1).toLowerCase()}`

      console.log(`${accounts[i]} - ${twitterId}`)

      promises.push(
        party.methods.register(twitterId).send({ value: toHex(toWei(deposit)), from: accounts[i], gas: 200000 })
      )
    }

    await Promise.all(promises)
  }
}

init().catch(err => {
  console.error(err)
  process.exit(-1)
})
