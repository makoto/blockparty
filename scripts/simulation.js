// truffle migrate --config '{"invitation":false, "confirmation":false}' --reset
// for i in {1..100}; do echo $i; done > simulation.txt
let fs = require('fs');
let Conference = artifacts.require("./Conference.sol");
let ConfirmationRepository = artifacts.require("./ConfirmationRepository.sol");
let arg = require('yargs').argv;

if (!(arg.i)) {
  throw('usage: truffle exec scripts/simulation.js -i simulation.txt');
}
module.exports = async function(callback) {
  let file = arg.i;
  console.log('file', file)
  repository = await ConfirmationRepository.deployed();
  conference = await Conference.deployed();
  let codes = fs.readFileSync(file, 'utf8').trim().split('\n');
  await conference.setLimitOfParticipants(codes.length + 10, {from:web3.eth.accounts[0]});

  for (var i = 0; i < codes.length; i++) {
    var code = codes[i];
    var registered = await repository.verify(code);
    var encrypted_code = await repository.encrypt.call(code);
    var deposit = web3.toWei(0.1, "ether");
    await repository.add([encrypted_code]).catch(function(){});
    console.log('registering ', codes[i] , ' as ', web3.eth.accounts[i])
    await conference.register('user' + codes[i], {from:web3.eth.accounts[i], value:deposit})
    var registered = await conference.registered.call();
    console.log('registered', registered.toString());
  }
}
