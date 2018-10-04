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

const reportTest = async function (participants, accounts, finalize){
  const addresses = [];
  const transactions = [];
  const encrypted_codes = [];
  const owner = accounts[0];
  conference = await Conference.new('Test', '0', participants, '0', '', '0x0', {from: accounts[0], gasPrice:gasPrice});
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

  await conference.registered().should.eventually.eq(participants)
  await getBalance(conference.address).should.eventually.eq( mulBN(deposit, participants) )

  await finalize({
    deposit, conference, owner, addresses, transactions
  })

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

const reportBatchAttend = async (participants, accounts) => (
  await reportTest(participants, accounts, async ({ deposit, conference, owner, addresses, transactions }) => {
    const attendTrx = await conference.attend(addresses, {from:owner, gasPrice});
    transactions.push(await getTransaction('batchAttend  ', attendTrx.tx))

    trx = await conference.payback({from:owner, gasPrice});
    transactions.push(await getTransaction('payback  ', trx.tx))
  })
)

const reportFinalize = async (participants, accounts) => (
  reportTest(participants, accounts, async ({ deposit, conference, owner, addresses, transactions }) => {
    // build bitmaps
    const numRegistered = addresses.length;
    let num = toBN(0);
    for (let i = 0; i < 256; i++) {
      num = num.bincn(i)
    }
    const maps = [];
    for (let i = 0; i < Math.ceil(numRegistered / 256); i++) {
      maps.push(num.toString(16))
    }
    const finalizeTx = await conference.finalize(maps, { from:owner, gasPrice })
    transactions.push(await getTransaction('finalize  ', finalizeTx.tx))
  })
)

contract('Stress test', function(accounts) {
  describe('2 participants', function() {
    const num = 2

    it('batch attend', async function(){
      await reportBatchAttend(num, accounts)
    })

    it('finalize', async function(){
      await reportFinalize(num, accounts)
    })
  })

  describe('20 participants', function() {
    const num = 20

    it('batch attend', async function(){
      await reportBatchAttend(num, accounts)
    })

    it('finalize', async function(){
      await reportFinalize(num, accounts)
    })
  })

  describe('100 participants', function() {
    const num = 100

    it('batch attend', async function(){
      await reportBatchAttend(num, accounts)
    })

    it('finalize', async function(){
      await reportFinalize(num, accounts)
    })
  })

  describe('200 participants', function() {
    const num = 200

    it('batch attend', async function(){
      await reportBatchAttend(num, accounts)
    })

    it('finalize', async function(){
      await reportFinalize(num, accounts)
    })
  })

  describe('300 participants', function() {
    const num = 300

    it('batch attend', async function(){
      await reportBatchAttend(num, accounts)
    })

    it('finalize', async function(){
      await reportFinalize(num, accounts)
    })
  })
})
