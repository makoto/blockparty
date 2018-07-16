const ENS = artifacts.require('@ensdomains/ens/ENSRegistry.sol');
const PublicResolver = artifacts.require('@ensdomains/ens/PublicResolver.sol');
const ReverseRegistrar = artifacts.require('@ensdomains/ens/ReverseRegistrar.sol');
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
  let owner = web3.eth.accounts[0];
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
            return deployer.deploy(PublicResolver, ENS.address);
          })
          .then(() => {
            return deployer.deploy(ReverseRegistrar, ENS.address, PublicResolver.address);
          })
          .then(() => {
            return ENS.at(ENS.address)
               // eth
              .setSubnodeOwner(0, web3.sha3(tld), owner, {from: owner});
          })
          .then(() => {
            return ENS.at(ENS.address)
              // reverse
              .setSubnodeOwner(0, web3.sha3('reverse'), owner, {from: owner});
          })
          .then(() => {
            return ENS.at(ENS.address)
              // addr.reverse
              .setSubnodeOwner(namehash.hash('reverse'), web3.sha3('addr'), ReverseRegistrar.address, {from: owner});
          })
      }
    })
  };
