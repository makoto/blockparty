const Conference = artifacts.require("Conference.sol");
const moment = require('moment');
let arg = require('yargs').argv;
let fs = require('fs');
let crypto = require('crypto');
let decrypted;
let fromBlock = 0;
let getBlock = require('./util/get_block');

if (!(arg.i)) {
  throw('usage: truffle exec scripts/decrypt.js -i ./tmp/test_private.key -b 0');
}

if (arg.b) {
  fromBlock = arg.b;
}

module.exports = async function(callback) {
  let privateKey = fs.readFileSync(arg.i, 'utf8');
  let conference = await Conference.deployed();
  let event = conference.RegisterEvent({}, {fromBlock:fromBlock});
  console.log(['regisered at            ', '@twitter', 'full name'].join('\t'));
  console.log(['------------------------', '--------', '---------'].join('\t'));
  let watcher = async function(err, result) {
    event.stopWatching(function(){});
    if (err) { throw err; }
    let currentBlock = await getBlock(web3, result.blockNumber);
    let registeredAt = moment(currentBlock.timestamp * 1000).format();
    decrypted = crypto.privateDecrypt(privateKey, new Buffer(result.args.encryption, 'hex'));
    console.log([registeredAt, result.args.participantName, decrypted.toString('utf8')].join('\t'));
  };
  await awaitEvent(event, watcher);
}

function awaitEvent(event, handler) {
  return new Promise((resolve, reject) => {
    function wrappedHandler(...args) {
      Promise.resolve(handler(...args)).then(resolve).catch(reject);
    }
    event.watch(wrappedHandler);
  });
}
