module.exports = {
  testCommand: 'truffle test --network coverage test/conference.js test/group_admin.js test/encryption.js',
  skipFiles: ['zeppelin/lifecycle/Destructible.sol','zeppelin/ownership/Ownable.sol']
};
