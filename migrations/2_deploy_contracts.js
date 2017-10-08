const Conference = artifacts.require("./Conference.sol");
const ConfirmationRepository = artifacts.require("./ConfirmationRepository.sol");
const coolingPeriod = 1 * 60 * 60 * 24 * 7;
// this is already required by truffle;
const yargs = require('yargs');
const crypto = require('crypto');
const fs = require('fs');
let encryption;
let name = ''; // empty name falls back to the contract default
let deposit = 0; // 0 falls back to the contract default
let limitOfParticipants = 0; // 0 falls back to the contract default
let confirmationAddress = 0;
// eg: truffle migrate --config '{"name":"CodeUp No..", "encryption":"./tmp/test_public.key", "confirmation":true}'
if (yargs.argv.config) {
  var config = JSON.parse(yargs.argv.config);
}

module.exports = function(deployer) {
  const app_config = require('../app_config.js')[deployer.network];
  console.log('app_config', app_config)

  if (deployer.network == 'test') return 'no need to deploy contract';
  if (config.name){
    name = config.name;
  }

  if (config.encryption) {
    encryption = fs.readFileSync(config.encryption, {encoding: 'ascii'});
  }
  deployer
    .then(() => {
      if (config.confirmation) {
        if (app_config && app_config.contract_addresses['ConfirmationRepository']) {
            confirmationAddress = app_config.contract_addresses['ConfirmationRepository'];
        }else{
          return deployer.deploy(ConfirmationRepository)
            .then(instance => {
              confirmationAddress = ConfirmationRepository.address;
            })
        }
      }
    })
    .then(() => {
      console.log([name, deposit,limitOfParticipants, coolingPeriod, confirmationAddress, encryption].join(','));
      return deployer.deploy(Conference, name, deposit,limitOfParticipants, coolingPeriod, confirmationAddress, encryption);
    })
};
