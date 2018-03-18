const Conference = artifacts.require("Conference.sol");

let deposit, conference;
let twitterOne = '@twitter1';
var crypto = require('crypto');
var cryptoBrowserify = require('crypto-browserify');
var fs = require('fs');

const getTransaction = function(type, transactionHash){
  let trxReceipt = web3.eth.getTransactionReceipt(transactionHash)
  return [type, trxReceipt.gasUsed].join('\t');
}

function awaitEvent(event, handler) {
  return new Promise((resolve, reject) => {
    function wrappedHandler(...args) {
      Promise.resolve(handler(...args)).then(resolve).catch(reject);
    }
    event.watch(wrappedHandler);
  });
}

contract('Encryption', function(accounts) {
  describe('on registration', function(){
    it('increments registered', async function(){
      var publicKey = fs.readFileSync('./tmp/test_public.key', {encoding: 'ascii'});
      var privateKey = fs.readFileSync('./tmp/test_private.key', {encoding: 'ascii'});
      var message = "マコト";
      conference = await Conference.new('', 0, 0, 10, publicKey);
      var publicKeyFromContract = await conference.encryption.call();
      var encrypted = cryptoBrowserify.publicEncrypt(publicKeyFromContract, new Buffer(message, 'utf-8'));

      console.log(getTransaction('create   ', conference.transactionHash));
      deposit = (await conference.deposit.call()).toNumber();

      let registered = await conference.registerWithEncryption.sendTransaction(twitterOne, encrypted.toString('hex'), {value:deposit});
      console.log(getTransaction('register   ', registered));
      let decrypted;
      let event = conference.RegisterEvent({});
      let watcher = async function(err, result) {
        event.stopWatching();
        if (err) { throw err; }
        decrypted = crypto.privateDecrypt(privateKey, new Buffer(result.args._encryption, 'hex'));
        console.log('decrypted', decrypted.toString('utf8'));
      };
      await awaitEvent(event, watcher);
    })
  })
})
