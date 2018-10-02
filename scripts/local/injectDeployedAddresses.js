#!/usr/bin/env node

/* This script injects deployed addresses into build folder JSO from deployedAddresses.json */

const fs = require('fs')
const path = require('path')

const projectDir = path.join(__dirname, '..', '..')
const deployerJsonPath = path.join(projectDir, 'build', 'contracts', 'Deployer.json')
const deployedAddressesJsonPath = path.join(projectDir, 'deployedAddresses.json')

const deployerJson = require(deployerJsonPath)
const deployedAddresses = require(deployedAddressesJsonPath)

deployerJson.networks = {
  ...deployerJson.networks,
  ...deployedAddresses
}

fs.writeFileSync(deployerJsonPath, JSON.stringify(deployerJson, null, 2))
