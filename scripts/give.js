let arg = require('yargs').argv;
let fs = require('fs');

if (!(arg.i && arg.v)) {
  throw('usage: truffle exec scripts/give.js -i address_to_give_ether.txt -v amount_in_ether');
}
module.exports = function(callback) {
  let sender = web3.eth.accounts[0];
  let receiver = fs.readFileSync(arg.i, 'utf8').trim().split('\n')[0];
  let value =  web3.toWei(arg.v, 'ether');
  let balance = web3.eth.getBalance(sender);
  console.log('balance', balance.toNumber());
  console.log('receiver', receiver);
  console.log('Sending ', arg.v, ' ether from ', sender, ' to ', receiver);
  web3.eth.sendTransaction({from:sender, to:receiver, value:value, gas:100000});
  console.log('balance', balance.toNumber());
}
