#!/usr/bin/env node

/* This script extracts deployed addresses from build folder and puts them into deployedAddresses.json */

const fs = require('fs')
const path = require('path')

const projectDir = path.join(__dirname, '..', '..')
const deployerJsonPath = path.join(projectDir, 'build', 'contracts', 'Deployer.json')
const deployedAddressesJsonPath = path.join(projectDir, 'deployedAddresses.json')

const { networks } = require(deployerJsonPath)

const deployedAddresses = networks

Object.keys(deployedAddresses).forEach(key => {
  switch (key) {
    case '1': // mainnet
    case '3': // ropsten
      break
    default:
      delete deployedAddresses[key]
  }
})

fs.writeFileSync(deployedAddressesJsonPath, JSON.stringify(deployedAddresses, null, 2))
