module.exports = {
  accounts: 350,
  testCommand: '../node_modules/.bin/babel-node ../node_modules/.bin/truffle test --network coverage test/conference.js test/group_admin.js test/deployer.js',
  skipFiles: ['zeppelin/lifecycle/Destructible.sol','zeppelin/ownership/Ownable.sol']
};
