const Conference = artifacts.require("Conference.sol");

let twitterOne = '@twitter1';
const crypto = require('crypto');
const fs = require('fs');

const { getEvents } = require('./utils')

let deposit, conference;

const getTransaction = async (type, transactionHash) => {
  const { gasUsed } = await web3.eth.getTransactionReceipt(transactionHash)
  return [type, gasUsed].join('\t');
}

contract('Encryption', function(accounts) {
  describe('on registration', function(){
    it('increments registered', async function(){
      const publicKey = fs.readFileSync('./test/fixtures/fixture_public.key', {encoding: 'ascii'});
      const privateKey = fs.readFileSync('./test/fixtures/fixture_private.key', {encoding: 'ascii'});
      const message = "マコト";

      conference = await Conference.new('', 0, 0, 10, publicKey, '0x0');

      const publicKeyFromContract = await conference.encryption();
      const encrypted = crypto.publicEncrypt(publicKeyFromContract, new Buffer(message, 'utf-8'));

      console.log(await getTransaction('create   ', conference.transactionHash));

      deposit = await conference.deposit()

      const registered = await conference.registerWithEncryption(twitterOne, encrypted.toString('hex'), {value:deposit});

      console.log(await getTransaction('register   ', registered.tx));

      let decrypted;

      let [ event ] = await getEvents(registered, 'RegisterEvent')

      decrypted = crypto.privateDecrypt(privateKey, new Buffer(event.args._encryption, 'hex'));
      console.log('decrypted', decrypted.toString('utf8'));
    })
  })
})
