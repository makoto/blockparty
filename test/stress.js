import { toWei, fromWei, toBN } from 'web3-utils'

const moment = require('moment');
const fs = require('fs');
const Conference = artifacts.require("Conference.sol");

const Tempo = require('@digix/tempo');
const { wait, waitUntilBlock } = require('@digix/tempo')(web3);


const { getBalance, mulBN } = require('./utils')


const gasPrice = toWei('1', 'gwei');
const usd = 468;
let deposit, conference;
let trx,trx2, gasUsed, gasUsed2, result, trxReceipt;

const pad = function(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};

const getTransaction = async function(type, transactionHash){
  trx = await web3.eth.getTransaction(transactionHash)
  trxReceipt = await web3.eth.getTransactionReceipt(transactionHash)

  const gasPrice = toBN(trx.gasPrice)
  const gasUsed = toBN(trxReceipt.gasUsed)
  const gasTotal = gasUsed.mul(gasPrice)

  result = {
    'type             ': type,
    'gasUsed       ': gasUsed,
    'gasPrice': fromWei(gasPrice,'gwei'),
    '1ETH*USD': usd,
    'gasUsed*gasPrice(Ether)': fromWei(gasTotal,'ether'),
    'gasUsed*gasPrice(USD)': fromWei(gasTotal,'ether') * usd,
  }
  return result;
}

const formatArray = function(array){
  return array.join("\t\t")
}

const reportTest = async function (participants, accounts){
  const addresses = [];
  const transactions = [];
  const encrypted_codes = [];
  const owner = accounts[0];
  conference = await Conference.new('Test', '0', participants, '0', '', '0x0', {gasPrice:gasPrice});
  transactions.push(await getTransaction('create   ', conference.transactionHash))
  deposit = await conference.deposit()

  for (var i = 0; i < participants; i++) {
    var registerTrx = await conference.register('test', {from:accounts[i], value:deposit, gasPrice:gasPrice});
    if ((i % 100) == 0 && i != 0) {
      console.log('register', i)
    }
    if (i == 0) {
      transactions.push(await getTransaction('register', registerTrx.tx))
    }
    addresses.push(accounts[i]);
  }
  var attendTrx = await conference.attend(addresses, {from:owner, gasPrice:gasPrice});
  transactions.push(await getTransaction('batchAttend  ', attendTrx.tx))

  await conference.registered().should.eventually.eq(participants)
  await getBalance(conference.address).should.eventually.eq( mulBN(deposit, participants) )

  trx = await conference.payback({from:owner, gasPrice:gasPrice});
  transactions.push(getTransaction('payback ', trx.tx))
  for (var i = 0; i < participants; i++) {
    trx = await conference.withdraw({from:accounts[i], gasPrice:gasPrice});
    if (i == 0) {
      transactions.push(await getTransaction('withdraw', trx.tx))
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

    it('can handle 300 participants', async function(){
      await reportTest(300, accounts)
    })
  })
})
