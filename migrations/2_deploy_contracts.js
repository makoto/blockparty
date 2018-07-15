const ENS = artifacts.require('@ensdomains/ens/ENSRegistry.sol');
const FIFSRegistrar = artifacts.require('@ensdomains/ens/FIFSRegistrar.sol');
const namehash = require('eth-ens-namehash');
const Conference = artifacts.require("./Conference.sol");
const coolingPeriod = 1 * 60 * 60 * 24 * 7;
// this is already required by truffle;
const yargs = require('yargs');
const crypto = require('crypto');
const fs = require('fs');
let encryption = '';
let config = {};
let name = ''; // empty name falls back to the contract default
let deposit = 0; // 0 falls back to the contract default
let tld = 'eth';
let limitOfParticipants = 0; // 0 falls back to the contract default
// eg: truffle migrate --config '{"name":"CodeUp No..", "limitOfParticipants":15, "encryption":"./tmp/test_public.key"}'
if (yargs.argv.config) {
  config = JSON.parse(yargs.argv.config);
}

module.exports = function(deployer) {
  const app_config = require('../app_config.js')[deployer.network];
  console.log('app_config', app_config)
  if (deployer.network == 'test' || deployer.network == 'coverage') return 'no need to deploy contract';
  if (config.name){
    name = config.name;
  }

  if (config.limitOfParticipants){
    limitOfParticipants = config.limitOfParticipants;
  }

  if (config.encryption) {
    encryption = fs.readFileSync(config.encryption, {encoding: 'ascii'});
  }

  deployer
    .then(() => {
      console.log([name, deposit,limitOfParticipants, coolingPeriod, encryption].join(','));
      return deployer.deploy(Conference, name, deposit,limitOfParticipants, coolingPeriod, encryption);
    })
    .then(() => {
      if (deployer.network == 'development'){
        return deployer.deploy(ENS)
              .then(() => {
                return deployer.deploy(FIFSRegistrar, ENS.address, namehash.hash(tld));
              })
              .then(function() {
                return ENS.at(ENS.address).setSubnodeOwner('0x0', web3.sha3(tld), FIFSRegistrar.address);
              });
      }
    })
  };
