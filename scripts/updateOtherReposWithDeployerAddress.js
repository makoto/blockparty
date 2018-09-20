#!/usr/bin/env node

const { Deployer } = require('../')
const fs = require('fs')
const path = require('path')
const Web3 = require('web3')

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))

web3.version.getNetwork((err, networkId) => {
  if (err) {
    console.error(err)
    process.exit(-1)
  }

  const { address } = Deployer.networks[networkId] || {}

  console.log(`Deployer address: ${address}`)

  const serverDir = path.join(__dirname, '..', '..', 'server')
  if (fs.existsSync(serverDir)) {
    console.log('Writing to server config ...')

    const serverEnvPath = path.join(serverDir, '.env')

    fs.writeFileSync(serverEnvPath, `DEPLOYER_CONTRACT_ADDRESS=${address}`)
  } else {
    console.warn('Server folder not found, skipping ...')
  }

  const appDir = path.join(__dirname, '..', '..', 'app')
  if (fs.existsSync(appDir)) {
    console.log('Writing to app config ...')

    const appConfigPath = path.join(appDir, 'src', 'config', 'env.json')
    let appConfig = {}
    try {
      appConfig = require(appConfigPath)
    } catch (err) {
      /* do nothing */
    }
    appConfig.DEPLOYER_CONTRACT_ADDRESS = address
    fs.writeFileSync(appConfigPath, JSON.stringify(appConfig, null, 2))
  } else {
    console.warn('App folder not found, skipping ...')
  }
})
