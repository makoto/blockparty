var Conference = artifacts.require("./Conference.sol");
var InvitationRepository = artifacts.require("./InvitationRepository.sol");
var coolingPeriod = 1 * 60 * 60 * 24 * 7;
module.exports = function(deployer) {
  deployer.deploy(InvitationRepository).then(function() {
    return deployer.deploy(Conference, coolingPeriod, InvitationRepository.address);
  });
};
