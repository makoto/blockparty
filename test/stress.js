require('babel-polyfill');
const Conference = artifacts.require("Conference.sol");
const Tempo = require('@digix/tempo');
const { wait, waitUntilBlock } = require('@digix/tempo')(web3);
const gasPrice = web3.toWei(100, 'gwei');
const participants = 20;
let addresses = [];
let transactions = [];
let deposit, conference;
let trx,trx2, gasUsed, gasUsed2, result, trxReceipt;

const getTransaction = function(type, transactionHash){
  trx = web3.eth.getTransaction(transactionHash)
  trxReceipt = web3.eth.getTransactionReceipt(transactionHash)
  gasUsed = trxReceipt.gasUsed * trx.gasPrice;
  result = {
    'type             ': type,
    'gasUsed       ': trxReceipt.gasUsed,
    'gasPrice': web3.fromWei(trx.gasPrice.toNumber(),'gwei'),
    'gasUsed*gasPrice(Ether)': web3.fromWei(gasUsed,'ether'),
    'gasUsed*gasPrice(USD)': web3.fromWei(gasUsed,'ether') * 383,
  }
  return result;
}

contract('Stress test', function(accounts) {
  const owner = accounts[0];
  beforeEach(async function(){
    conference = await Conference.new({gasPrice:gasPrice});
    transactions.push(getTransaction('create   ', conference.transactionHash))
    deposit = (await conference.deposit.call()).toNumber();
    await conference.setLimitOfParticipants(participants);
  })

  it.only('can handle ' + participants + ' participants', async function(){
    const formatArray = function(array){
      return array.join("\t\t")
    }

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
    // assert.strictEqual(web3.eth.getBalance(conference.address).toNumber(), 0)
    console.log(Object.keys(transactions[0]).join("\t"))
    for (var i = 0; i < transactions.length; i++) {
      console.log(formatArray(Object.values(transactions[i])))
    }
  })
})
