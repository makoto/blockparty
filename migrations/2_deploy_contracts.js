var Conference = artifacts.require("./Conference.sol");
var InvitationRepository = artifacts.require("./InvitationRepository.sol");
var coolingPeriod = 1 * 60 * 60 * 24 * 7;
var invitationAddress = 0;
// this is already required by truffle;
var yargs = require('yargs');

// eg:  truffle migrate --config '{"invitation":true}'
var config = JSON.parse(yargs.argv.config);

module.exports = async function(deployer) {
  if (config.invitation) {
    await deployer.deploy(InvitationRepository);
    invitationAddress = InvitationRepository.address;
  }
  return deployer.deploy(Conference, coolingPeriod, invitationAddress);
};
