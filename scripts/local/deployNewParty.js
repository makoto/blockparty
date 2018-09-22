#!/usr/bin/env node

/* This script deploys a new party using the Deployer */

const fs = require('fs')
const path = require('path')
const Web3 = require('web3')
const program = require('commander')
const { fromWei, toHex, toWei } = require('web3-utils')
const faker = require('faker')

const { Deployer, Conference  } = require('../../')

async function init () {
  program
    .usage('[options]')
    .option('-a, --attendees <n>', 'Number of registrants to mark as having attended', parseInt)
    .option('-c, --cancelled', 'Whether to mark the party as cancelled')
    .option('-d, --deposit [n]', 'Amount of ETH attendees must deposit', 0.02)
    .option('-e, --ended', 'Whether to mark the party as having already ended')
    .option('-n, --name [n]', 'Name of party', 'test')
    .option('-p, --participants <n>', 'Maximum number of participants', parseInt)
    .option('-r, --register <n>', 'Number of participants to register', parseInt)
    .option('-w, --withdraw <n>', 'Number of attendees to withdraw payouts for', parseInt)
    .parse(process.argv)

  const name = program.name
  const ended = !!program.ended
  const cancelled = !!program.cancelled
  const maxParticipants = program.participants || 2
  const numRegistrations = program.register || 0
  const numAttendees = program.attendees || 0
  const numWithdrawals = program.withdraw || 0
  const deposit = `${program.deposit}`

  console.log(
`
Config
------
Party name:             ${name}
Deposit level:          ${deposit}
Max. participants:      ${maxParticipants}
Num to register:        ${numRegistrations}
Num who attended:       ${numAttendees}
Party ended:            ${ended ? 'yes' : 'no'}
Party cancelled:        ${cancelled ? 'yes' : 'no'}
Payout withdrawals:     ${numWithdrawals}
`
  )

  const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))

  const networkId = await web3.eth.net.getId()

  const { address: deployerAddress } = Deployer.networks[networkId] || {}

  console.log(`Deployer: ${deployerAddress}`)

  const accounts = await web3.eth.getAccounts()

  if (numRegistrations > accounts.length) {
    throw new Error(`Not enough web3 accounts to register ${numRegistrations} attendees!`)
  }

  if (numRegistrations > maxParticipants) {
    throw new Error(`Cannot register more attendees than the limit!`)
  }

  if (numAttendees > numRegistrations) {
    throw new Error(`Cannot have more attendees than there are registrations!`)
  }

  if (numWithdrawals > numAttendees) {
    throw new Error(`Cannot have more deposits withdrawn than there are attendees!`)
  }

  if (numWithdrawals && !(ended || cancelled)) {
    throw new Error(`Cannot withdraw deposits unless party is ended or cancelled!`)
  }

  const [ account ] = accounts

  console.log(`Account: ${account}`)

  const deployer = new web3.eth.Contract(Deployer.abi, deployerAddress)

  const tx = await deployer.methods.deploy(
    name,
    toHex(toWei(deposit)),
    toHex(maxParticipants),
    toHex(60 * 60 * 24 * 7),
    'encKey'
  ).send({ from: account, gas: 4000000 })

  const { deployedAddress: partyAddress } = tx.events.NewParty.returnValues

  console.log(`New party: ${partyAddress}`)

  const party = new web3.eth.Contract(Conference.abi, partyAddress)

  if (numRegistrations) {
    console.log(
`

Register participants
-----------------------`
    )

    const promises = []
    for (let i = 0; numRegistrations > i; i += 1) {
      const twitterId = `@${faker.lorem.word(1).toLowerCase()}`

      console.log(`${accounts[i]} - ${twitterId}`)

      promises.push(
        party.methods.register(twitterId).send({ value: toHex(toWei(deposit)), from: accounts[i], gas: 200000 })
      )
    }

    await Promise.all(promises)
  }

  if (numAttendees) {
    console.log(
`

Mark as attended
----------------`
    )

    const promises = []
    for (let i = 0; numAttendees > i; i += 1) {
      console.log(accounts[i])

      promises.push(
        party.methods.attend([ accounts[i] ]).send({ from: accounts[0], gas: 200000 })
      )
    }

    await Promise.all(promises)
  }

  if (ended) {
    console.log(`\nMarking party as having already ended`)

    await party.methods.payback().send({ from: accounts[0], gas: 200000 })
  } else if (cancelled) {
    console.log(`\nMarking party as cancelled`)

    await party.methods.cancel().send({ from: accounts[0], gas: 200000 })
  }

  if (numWithdrawals) {
    const payout = await party.methods.payout().call()

    console.log(
`

Withdraw payout - ${fromWei(payout, 'ether')} ETH
-----------------------------`
    )

    const promises = []
    for (let i = 0; numWithdrawals > i; i += 1) {
      console.log(accounts[i])

      promises.push(
        party.methods.withdraw().send({ from: accounts[i], gas: 200000 })
      )
    }

    await Promise.all(promises)
  }
}

init().catch(err => {
  console.error(err)
  process.exit(-1)
})
