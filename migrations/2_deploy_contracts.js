var Conference = artifacts.require("./Conference.sol");
var InvitationRepository = artifacts.require("./InvitationRepository.sol");

module.exports = function(deployer) {
  deployer.deploy(Conference);
  deployer.deploy(InvitationRepository);
};
