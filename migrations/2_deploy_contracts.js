const Deployer = artifacts.require("./Deployer.sol");
const Conference = artifacts.require("./Conference.sol");
const coolingPeriod = 1 * 60 * 60 * 24 * 7;
// this is already required by truffle;
const yargs = require('yargs');
const crypto = require('crypto');
const fs = require('fs');
const { sha3 }  = require('web3-utils')

let config = {};
let name = ''; // empty name falls back to the contract default
let deposit = 0; // 0 falls back to the contract default
let tld = 'eth';
let limitOfParticipants = 0; // 0 falls back to the contract default
// eg: truffle migrate --config '{"name":"CodeUp No..", "limitOfParticipants":15}'
if (yargs.argv.config) {
  config = JSON.parse(yargs.argv.config);
}

module.exports = function(deployer) {
  if (deployer.network == 'test' || deployer.network == 'coverage') return 'no need to deploy contract';
  if (config.name){
    name = config.name;
  }

  if (config.limitOfParticipants){
    limitOfParticipants = config.limitOfParticipants;
  }

  return deployer.deploy(Deployer)
    .then(() => {
      console.log([name, deposit,limitOfParticipants, coolingPeriod].join(','));
      return deployer.deploy(Conference, name, deposit,limitOfParticipants, coolingPeriod, '0x0');
    })
  };
