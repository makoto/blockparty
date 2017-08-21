var Conference = artifacts.require("./Conference.sol");
var ConfirmationRepository = artifacts.require("./ConfirmationRepository.sol");

var coolingPeriod = 1 * 60 * 60 * 24 * 7;
var invitationAddress = 0;
var confirmationAddress = 0;
// this is already required by truffle;
var yargs = require('yargs');
var crypto = require('crypto');
var fs = require('fs');
let encryption;
// eg:  truffle migrate --config '{"encryption":'/tmp/test_pulic.key', "confirmation":true}'
if (yargs.argv.config) {
  var config = JSON.parse(yargs.argv.config);
}

module.exports = function(deployer) {
  if (deployer.network == 'test') return 'no need to deploy contract';
  if (config.encryption) {
    encryption = fs.readFileSync(config.encryption, {encoding: 'ascii'});
    console.log('publicKey', encryption)
  }
  deployer
    .then(() => {
      if (config.confirmation) {
        return deployer.deploy(ConfirmationRepository)
          .then(instance => confirmationAddress = ConfirmationRepository.address);
      }
    })
    .then(() => {
      return deployer.deploy(Conference, coolingPeriod, confirmationAddress, encryption);
    })
};
