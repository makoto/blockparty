// truffle migrate --config '{"name":"Test"}' --network development
// for i in {1..100}; do echo $i; done > simulation.txt
let fs = require('fs');
let Conference = artifacts.require("./Conference.sol");
let arg = require('yargs').argv;

if (!(arg.n)) {
  throw('usage: truffle exec scripts/simulation.js -n number');
}
module.exports = async function(callback) {
  let num = arg.n;
  conference = await Conference.deployed();
  await conference.setLimitOfParticipants(num + 10, {from:web3.eth.accounts[0]});

  for (var i = 0; i < num; i++) {
    var deposit = await conference.deposit.call();
    console.log('registering ', i , ' as ', web3.eth.accounts[i])
    await conference.register('user' + i, {from:web3.eth.accounts[i], value:deposit})
    var registered = await conference.registered.call();
    console.log('registered', registered.toString());
  }
}
