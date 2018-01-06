module.exports = {
  testCommand: 'truffle test --network coverage test/conference.js test/invitation_repository.js test/encryption.js',
  skipFiles: ['zeppelin/lifecycle/Destructible.sol','zeppelin/ownership/Ownable.sol']
};
