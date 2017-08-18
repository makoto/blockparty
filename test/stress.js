require('babel-polyfill');
const moment = require('moment');
const fs = require('fs');
const Conference = artifacts.require("Conference.sol");
const Tempo = require('@digix/tempo');
const { wait, waitUntilBlock } = require('@digix/tempo')(web3);
const gasPrice = web3.toWei(2, 'gwei');
const usd = 303;
let addresses = [];
let deposit, conference;
let trx,trx2, gasUsed, gasUsed2, result, trxReceipt;

const pad = function(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};

const getTransaction = function(type, transactionHash){
  trx = web3.eth.getTransaction(transactionHash)
  trxReceipt = web3.eth.getTransactionReceipt(transactionHash)
  gasUsed = trxReceipt.gasUsed * trx.gasPrice;
  result = {
    'type             ': type,
    'gasUsed       ': trxReceipt.gasUsed,
    'gasPrice': web3.fromWei(trx.gasPrice.toNumber(),'gwei'),
    '1ETH*USD': usd,
    'gasUsed*gasPrice(Ether)': web3.fromWei(gasUsed,'ether'),
    'gasUsed*gasPrice(USD)': web3.fromWei(gasUsed,'ether') * usd,
  }
  return result;
}

const formatArray = function(array){
  return array.join("\t\t")
}

const reportTest = async function (participants, accounts){
  const transactions = [];
  const owner = accounts[0];
  conference = await Conference.new({gasPrice:gasPrice});
  transactions.push(getTransaction('create   ', conference.transactionHash))
  deposit = (await conference.deposit.call()).toNumber();
  await conference.setLimitOfParticipants(participants);

  for (var i = 0; i < participants; i++) {
    var registerTrx = await conference.register('test', {from:accounts[i], value:deposit, gasPrice:gasPrice});
    if ((i % 100) == 0 && i != 0) {
      console.log('register', i)
    }
    var attendTrx = await conference.attend([accounts[i]], {from:owner, gasPrice:gasPrice});
    if (i == 0) {
      transactions.push(getTransaction('register', registerTrx.tx))
      transactions.push(getTransaction('attend  ', attendTrx.tx))
    }
    addresses.push(accounts[i]);
  }
  assert.strictEqual((await conference.registered.call()).toNumber(), participants);
  assert.strictEqual(web3.eth.getBalance(conference.address).toNumber(), deposit * participants)
  // console.log('attend')
  // var attendTrx = await conference.attend(addresses, {from:owner, gasPrice:gasPrice});
  // transactions.push(getTransaction('attend  ', attendTrx))

  // console.log('payback')
  trx = await conference.payback({from:owner, gasPrice:gasPrice});
  transactions.push(getTransaction('payback ', trx.tx))
  // console.log('withdraw')
  for (var i = 0; i < participants; i++) {
    trx = await conference.withdraw({from:accounts[i], gasPrice:gasPrice});
    if (i == 0) {
      transactions.push(getTransaction('withdraw', trx.tx))
    }
  }
  var header = Object.keys(transactions[0]).join("\t");
  var bodies = [header]
  console.log(header)
  for (var i = 0; i < transactions.length; i++) {
    var row = formatArray(Object.values(transactions[i]));
    console.log(row);
    bodies.push(row);
  }
  var date = moment().format("YYYYMMDD");
  fs.writeFileSync(`./log/stress_${pad(participants, 4)}.log`, bodies.join('\n') + '\n');
  fs.writeFileSync(`./log/stress_${pad(participants, 4)}_${date}.log`, bodies.join('\n') + '\n');
}

contract('Stress test', function(accounts) {
  describe('stress test', function(){
    it('can handle 2 participants', async function(){
      await reportTest(2, accounts)
    })

    it('can handle 20 participants', async function(){
      await reportTest(20, accounts)
    })

    it('can handle 100 participants', async function(){
      await reportTest(100, accounts)
    })

    it('can handle 200 participants', async function(){
      await reportTest(200, accounts)
    })
  })
})
