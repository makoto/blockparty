#!/usr/bin/env node

/* This script deploys a new party using the Deployer */

const fs = require('fs')
const path = require('path')
const Web3 = require('web3')
const EthVal = require('ethval')
const program = require('commander')
const { toBN, fromWei, toHex, toWei } = require('web3-utils')
const faker = require('faker')

const { Deployer, Conference } = require('../../')
const { networks } = require('../../truffle-config.js')

async function init() {
  program
    .usage('[options]')
    .option('--ropsten', 'Use Ropsten instead of local development network')
    .option(
      '--admins <n>',
      'Number of additional party admins to have',
      parseInt
    )
    .option('-c, --cancelled', 'Whether to mark the party as cancelled')
    .option('-t, --coolingPeriod [n]', 'How long the cooling period is in seconds', 60 * 60 * 24 * 7)
    .option('-d, --deposit [n]', 'Amount of ETH attendees must deposit', 0.02)
    .option('-f, --finalize <n>', 'Finalize the party with the given no. of attendees', parseInt)
    .option('-n, --name [n]', 'Name of party', 'test')
    .option(
      '-p, --participants <n>',
      'Maximum number of participants',
      parseInt
    )
    .option(
      '-r, --register <n>',
      'Number of participants to register',
      parseInt
    )
    .option(
      '-w, --withdraw <n>',
      'Number of attendees to withdraw payouts for',
      parseInt
    )
    .parse(process.argv)

  const name = program.name
  const cancelled = !!program.cancelled
  const numAdmins = program.admins || 0
  const maxParticipants = program.participants || 2
  const numRegistrations = program.register || 0
  const numFinalized = program.finalize || 0
  const numWithdrawals = program.withdraw || 0
  const deposit = new EthVal(program.deposit, 'eth')
  const coolingPeriod = program.coolingPeriod
  const ropsten = program.ropsten

  console.log(
    `
Config
------
Network:                ${ropsten ? 'ropsten' : 'development'}
Party name:             ${name}
Deposit level:          ${deposit.toFixed(3)} ETH
Cooling Period:         ${coolingPeriod} seconds
Extra admins:           ${numAdmins}
Max. participants:      ${maxParticipants}
Num to register:        ${numRegistrations}
Party finalized:        ${numFinalized ? `yes - ${numFinalized} attendees` : 'no'}
Party cancelled:        ${cancelled ? 'yes' : 'no'}
Payout withdrawals:     ${numWithdrawals}
`
  )

  const maxAccountsNeeded = parseInt(Math.max(numRegistrations, numAdmins + 1), 10)

  let provider = new Web3.providers.HttpProvider(
    `http://${networks.development.host}:${networks.development.port}`
  )

  if (ropsten) {
    provider = networks.ropsten.provider(maxAccountsNeeded)
  }

  const web3 = new Web3(provider)

  const networkId = await web3.eth.net.getId()

  const { address: deployerAddress } = Deployer.networks[networkId] || {}

  console.log(`Deployer: ${deployerAddress}`)

  const accounts = await web3.eth.getAccounts()

  if (numAdmins + 1 > accounts.length) {
    throw new Error(
      `Not enough web3 accounts to register ${numAdmins} additional party admins!`
    )
  }

  if (numRegistrations > accounts.length) {
    throw new Error(
      `Not enough web3 accounts to register ${numRegistrations} attendees!`
    )
  }

  if (numRegistrations > maxParticipants) {
    throw new Error(`Cannot register more attendees than the limit!`)
  }

  if (numFinalized > numRegistrations) {
    throw new Error(`Cannot have more attendees than there are registrations!`)
  }

  if (numWithdrawals > numFinalized) {
    throw new Error(
      `Cannot have more deposits withdrawn than there are people who showed up!`
    )
  }

  if (numWithdrawals && !(numFinalized || cancelled)) {
    throw new Error(
      `Cannot withdraw deposits unless party is finalized or cancelled!`
    )
  }

  const [account] = accounts

  console.log(`Owner: ${account}`)

  const deployer = new web3.eth.Contract(Deployer.abi, deployerAddress)

  const tx = await deployer.methods
    .deploy(
      name,
      deposit.toWei().toString(16),
      toHex(maxParticipants),
      toHex(coolingPeriod),
      'encKey'
    )
    .send({ from: account, gas: 4000000 })

  const { deployedAddress: partyAddress } = tx.events.NewParty.returnValues

  console.log(`New party: ${partyAddress}`)

  const party = new web3.eth.Contract(Conference.abi, partyAddress)

  console.log(`

Ensuring accounts have enough ETH in them
------------------------------------------`
)

  const minEthNeededPerAccount = deposit.toWei().add(new EthVal(0.1, 'eth') /* assume 0.1 ETH for total gas cost */)
  // check main account
  const ownerBalance = new EthVal(await web3.eth.getBalance(accounts[0]))
  if (ownerBalance.lt(minEthNeededPerAccount)) {
    throw new Error(`Main account ${owner} only has ${ownerBalance.toEth().toFixed(4)} ETH but ${minEthNeededPerAccount.toFixed(4)} is needed.` )
  }
  for (let i = 1; maxAccountsNeeded > i; ++i) {
    const balance = new EthVal(await web3.eth.getBalance(accounts[i]))

    if (balance.lt(minEthNeededPerAccount)) {
      const rem = minEthNeededPerAccount.sub(balance)
      if (ownerBalance.sub(rem).lt(minEthNeededPerAccount)) {
        throw new Error(`Main account ${owner} does not enough ETH to share with ${accounts[i]}.` )
      }

      console.log(`${accounts[0]} -> ${accounts[1]}: ${rem.toEth().toFixed(4)} ETH`)

      await web3.eth.sendTransaction({
        from: accounts[0],
        to: accounts[i],
        value: rem.toWei().toString(16)
      })
    }
  }
  console.log('Done.')


  if (numAdmins) {
    console.log(
      `

Register extra admins
---------------------`
    )

    const promises = []
    for (
      let i = 1 /* start at 1 since account 0 is already owner */;
      numAdmins >= i;
      i += 1
    ) {
      console.log(accounts[i])

      promises.push(
        party.methods
          .grant([accounts[i]])
          .send({ from: accounts[0], gas: 200000 })
      )
    }

    await Promise.all(promises)
    console.log('Done.')
  }

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
        party.methods.register(twitterId).send({
          value: deposit.toWei().toString(16),
          from: accounts[i],
          gas: 200000
        })
      )
    }

    const tx = await Promise.all(promises)
    console.log('Done.')
  }

  if (numFinalized) {
    console.log(
      `

Mark as finalized (${numFinalized} attendees)
------------------------------`
    )

    const maps = []
    let currentMap = toBN(0)
    for (let i = 0; numFinalized > i; i += 1) {
      console.log(accounts[i])

      if (i % 256 === 0) {
        maps.push(toBN(0))
      }

      maps[maps.length - 1] = maps[maps.length - 1].bincn(i)
    }

    await party.methods.finalize(maps).send({ from: accounts[0], gas: 200000 })
    console.log('Done.')
  }

  if (cancelled) {
    console.log(
      `

Mark party as cancelled
------------------------------`
    )

    await party.methods.cancel().send({ from: accounts[0], gas: 200000 })
    console.log('Done.')
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
    console.log('Done.')
  }
}

init().catch(err => {
  console.error(err)
  process.exit(-1)
})
