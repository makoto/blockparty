var Conference = artifacts.require("./Conference.sol");
var InvitationRepository = artifacts.require("./InvitationRepository.sol");
var ConfirmationRepository = artifacts.require("./ConfirmationRepository.sol");

var coolingPeriod = 1 * 60 * 60 * 24 * 7;
var invitationAddress = 0;
var confirmationAddress = 0;
// this is already required by truffle;
var yargs = require('yargs');

// eg:  truffle migrate --config '{"invitation":true, "confirmation":true}'
if (yargs.argv.config) {
  var config = JSON.parse(yargs.argv.config);
}

module.exports = function(deployer) {
  if (deployer.network == 'test') return 'no need to deploy contract';
  deployer
    .then(() => {
      if (config.invitation) {
        return deployer.deploy(InvitationRepository)
          .then(instance => invitationAddress = InvitationRepository.address);
      }
    })
    .then(() => {
      if (config.confirmation) {
        return deployer.deploy(ConfirmationRepository)
          .then(instance => confirmationAddress = ConfirmationRepository.address);
      }
    })
    .then(() => {
      return deployer.deploy(Conference, coolingPeriod, invitationAddress, confirmationAddress);
    })
};
