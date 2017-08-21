require('babel-polyfill');
const Conference = artifacts.require("Conference.sol");
const InvitationRepository = artifacts.require("./InvitationRepository.sol");
const ConfirmationRepository = artifacts.require("./ConfirmationRepository.sol");
const Tempo = require('@digix/tempo');
const { wait, waitUntilBlock } = require('@digix/tempo')(web3);
const twitterHandle = '@bighero6';
const gas = 1000000;
const gasPrice = 1;
const participantAttributes = ['participantName', 'addr', 'attended', 'paid'];

const getParticipantDetail = function(participant, detail){
  return participant[participantAttributes.indexOf(detail)];
}

contract('Conference', function(accounts) {
  const owner = accounts[0];
  const non_owner = accounts[1];
  let conference, deposit;

  beforeEach(async function(){
    conference = await Conference.new();
    deposit = (await conference.deposit.call()).toNumber();
  })

  describe('on setLimitOfParticipants', function(){
    it('does not allow to register more than the limit', async function(){
      await conference.setLimitOfParticipants(1)
      await conference.register(twitterHandle, {value:deposit});
      assert.strictEqual((await conference.registered.call()).toNumber(), 1);
      await conference.register('anotherName', {from: non_owner, value:deposit}).catch(function(){});
      assert.strictEqual((await conference.registered.call()).toNumber(), 1);
    })

    it('returns only your deposit for multiple invalidations', async function(){
      await conference.setLimitOfParticipants.sendTransaction(2);
      await conference.register.sendTransaction(twitterHandle, {value:deposit});
      await conference.register.sendTransaction('anotherName', {from: accounts[1], value:deposit});
      assert.strictEqual((await conference.registered.call()).toNumber(), 2);
      let invalidTransaction = (deposit / 2);
      let beforeAccountBalance = web3.eth.getBalance(accounts[2]).toNumber();
      // Over capacity as well as wrong deposit value.
      await conference.register('anotherName', {from: accounts[2], value:invalidTransaction}).catch(function(){});
      assert.strictEqual((await conference.registered.call()).toNumber(), 2);
      assert.strictEqual(web3.eth.getBalance(conference.address).toNumber(), 2 * deposit);
      // does not become exactly equal because it loses some gas.
      assert.strictEqual(beforeAccountBalance > web3.eth.getBalance(accounts[2]).toNumber(), true);
    })
  })

  describe('on creation', function(){
    it('has default values', async function(){
      assert.strictEqual(await conference.name.call(), 'Test');
      assert.strictEqual((await conference.registered.call()).toNumber(), 0);
      assert.strictEqual((await conference.attended.call()).toNumber(), 0);
      assert.strictEqual((await conference.totalBalance.call()).toNumber(), 0);
    })
  })

  describe('on registration', function(){
    let beforeContractBalance, beforeAccountBalance;

    beforeEach(async function(){
      beforeContractBalance = web3.eth.getBalance(conference.address).toNumber();
      await conference.register.sendTransaction(twitterHandle, {value:deposit});
    })

    it('increments registered', async function(){
      assert.equal((await conference.registered.call()).toNumber(), 1);
    })

    it('increases totalBalance', async function(){
      assert.equal((await conference.totalBalance.call()) - beforeContractBalance , deposit);
    })

    it('isRegistered for the registered account is true', async function(){
      assert.equal(await conference.isRegistered.call(owner), true);
    })

    it('isRegistered for the different account is not true', async function(){
      assert.equal(await conference.isRegistered.call(non_owner), false);
    })
  })

  describe('on failed registration', function(){
    it('cannot be registered if wrong amount of deposit is sent', async function(){
      let wrongDeposit = 5;
      let beforeContractBalance = web3.eth.getBalance(conference.address);
      await conference.register.sendTransaction(twitterHandle, {from:owner, value:wrongDeposit}).catch(function(){});
      assert.strictEqual(web3.eth.getBalance(conference.address).toNumber(), beforeContractBalance.toNumber());
      assert.equal(await conference.isRegistered.call(owner), false);
    })
  })

  describe('on attend', function(){
    beforeEach(async function(){
      await conference.register(twitterHandle, {value:deposit, from:non_owner});
    })

    it('isAttended is true if owner calls attend function', async function(){
      await conference.attend([non_owner], {from:owner});
      assert.equal(await conference.isAttended.call(non_owner), true);
      assert.equal((await conference.attended.call()).toNumber(), 1);
    })

    it('isAttended is false if non owner calls attend function', async function(){
      await conference.attend([non_owner], {from:non_owner}).catch(function(){});
      assert.equal(await conference.isAttended.call(non_owner), false);
      assert.equal(await conference.attended.call(), 0);
      let participant = await conference.participants.call(non_owner);
      assert.equal(getParticipantDetail(participant, 'attended'), false);
    })

    it('isAttended is false if attended function for the account is not called', async function(){
      assert.equal(await conference.isAttended.call(owner), false);
    })
  })

  describe('self attend with code', function(){
    let confirmation, confirmation_code, encrypted_code, verified;
    beforeEach(async function(){
      confirmation = await ConfirmationRepository.new();
      confirmation_code = web3.fromUtf8('1234567890');
      encrypted_code = await confirmation.encrypt.call(confirmation_code);
      await confirmation.add([encrypted_code], {from:owner});
      verified = await confirmation.verify.call(confirmation_code);
      assert.equal(verified, true);
      conference = await Conference.new(600, confirmation.address, '');
      deposit = (await conference.deposit.call()).toNumber();
    })

    it('allows participant to attend with code', async function(){
      await conference.register(twitterHandle, {from:non_owner, value:deposit})
      await conference.attendWithConfirmation(confirmation_code, {from:non_owner})
      assert.equal(await conference.attended.call(), 1);
      assert.equal(await confirmation.report.call(confirmation_code), non_owner);
    })

    it('does not allow participants to attend with non confirmation code', async function(){
      let non_confirmation_code = web3.fromUtf8('non_confirmation');
      await conference.register(twitterHandle, {from:non_owner, value:deposit});
      await conference.attendWithConfirmation(non_confirmation_code, {from:non_owner}).catch(function(){});
      assert.equal(await conference.attended.call(), 0);
      assert.equal(await confirmation.report.call(non_confirmation_code), 0);
    })

    it('does not allow participants to attend with same code', async function(){
      let non_owner_2 = accounts[2];
      await conference.register(twitterHandle, {from:non_owner, value:deposit});
      await conference.register(twitterHandle, {from:non_owner_2, value:deposit});
      await conference.attendWithConfirmation(confirmation_code, {from:non_owner});
      await conference.attendWithConfirmation(confirmation_code, {from:non_owner_2}).catch(function(){});
      assert.equal(await conference.attended.call(), 1);
      assert.equal(await confirmation.report.call(confirmation_code), non_owner);
    })
  })

  describe('on payback', function(){
    let previousBalance, currentRegistered, currentAttended;
    let attended = accounts[2];
    var notAttended = accounts[3];
    var notRegistered = accounts[4];

    beforeEach(async function(){
      await conference.register(twitterHandle, {from:attended, value:deposit});
      await conference.register(twitterHandle, {from:notAttended, value:deposit});
      await conference.attend([attended]);
    })

    it('cannot withdraw if non owner calls', async function(){
      await conference.payback({from:non_owner}).catch(function(){});
      await conference.withdraw({from:attended});
      // money is still left on contract
      assert.strictEqual(web3.eth.getBalance(conference.address).toNumber(), deposit * 2);
    })

    it('cannot withdraw if you did not attend', async function(){
      await conference.payback({from:owner});
      await conference.withdraw({from:notAttended});
      // money is still left on contract
      assert.strictEqual(web3.eth.getBalance(conference.address).toNumber(), deposit * 2);
    })

    it('can withdraw if you attend', async function(){
      await conference.payback({from:owner});
      previousBalance = web3.eth.getBalance(attended);
      assert.strictEqual(web3.eth.getBalance(conference.address).toNumber(), deposit * 2);
      await conference.withdraw({from:attended});
      assert.strictEqual(web3.eth.getBalance(conference.address).toNumber(), 0);
      let diff = web3.eth.getBalance(attended).toNumber() - previousBalance.toNumber();
      assert( diff > (deposit * 1.9));
      let participant = await conference.participants.call(attended);
      assert.equal(getParticipantDetail(participant, 'paid'), true);
    })

    it('cannot register any more', async function(){
      await conference.payback({from:owner});
      currentRegistered = await conference.registered.call();
      await conference.register('some handler', {from:notRegistered, value:deposit});
      assert.strictEqual((await conference.registered.call()).toNumber(), currentRegistered.toNumber());
      assert.equal(await conference.ended.call(), true);
    })

    // This is faiing. Potentially bug;
    it('cannot attend any more', async function(){
      await conference.payback({from:owner});
      currentAttended = await conference.attended.call();
      await conference.attend([notAttended], {from:owner});
      assert.strictEqual((await conference.attended.call()).toNumber(), currentAttended.toNumber());
      assert.equal(await conference.ended.call(), true);
    })
  })

  describe('on cancel', function(){
    let previousBalance, currentRegistered, currentAttended, diff, participant;
    let attended = accounts[2];
    var notAttended = accounts[3];
    var notRegistered = accounts[4];

    beforeEach(async function(){
      await conference.register(twitterHandle, {from:attended, value:deposit});
      await conference.register(twitterHandle, {from:notAttended, value:deposit});
      await conference.attend([attended]);
    })

    it('cannot cancel if non owner calls', async function(){
      await conference.cancel({from:non_owner}).catch(function(){});
      await conference.withdraw({from:attended});
      // money is still left on contract
      assert.strictEqual(web3.eth.getBalance(conference.address).toNumber(), deposit * 2);
    })

    it('everybody receives refund', async function(){
      await conference.cancel();
      // attended
      previousBalance = web3.eth.getBalance(attended);
      assert.strictEqual(web3.eth.getBalance(conference.address).toNumber(), deposit * 2);
      await conference.withdraw({from:attended});
      assert.strictEqual(web3.eth.getBalance(conference.address).toNumber(), deposit);
      diff = web3.eth.getBalance(attended).toNumber() - previousBalance.toNumber();
      assert( diff > (deposit * 0.9));
      participant = await conference.participants.call(attended);
      assert.equal(getParticipantDetail(participant, 'paid'), true);
      // notAttended
      previousBalance = web3.eth.getBalance(notAttended);
      await conference.withdraw({from:notAttended});
      assert.strictEqual(web3.eth.getBalance(conference.address).toNumber(), 0);
      diff = web3.eth.getBalance(notAttended).toNumber() - previousBalance.toNumber();
      assert( diff > (deposit * 0.9));
      participant = await conference.participants.call(notAttended);
      assert.equal(getParticipantDetail(participant, 'paid'), true);
    })

    it('cannot register any more', async function(){
      await conference.cancel();
      currentRegistered = await conference.registered.call();
      await conference.register('some handler', {from:notRegistered, value:deposit});
      assert.strictEqual((await conference.registered.call()).toNumber(), currentRegistered.toNumber());
      assert.equal(await conference.ended.call(), true);
    })
    // - cannot attend any more
    // - cannot payback any more

    it('cannot be canceled if the event is already ended', async function(){
      await conference.payback();
      await conference.cancel().catch(function(){});
      await conference.withdraw({from:notAttended});
      assert.strictEqual(web3.eth.getBalance(conference.address).toNumber(), deposit * 2);
      assert.equal(await conference.ended.call(), true)
    })
  })

  describe('on withdraw', function(){
    it('cannot withdraw twice', async function(){
      let registered = accounts[1];
      await conference.register(twitterHandle, {from:owner, value:deposit});
      await conference.register(twitterHandle, {from:registered, value:deposit});
      assert.strictEqual( web3.eth.getBalance(conference.address).toNumber(), deposit * 2);
      await conference.cancel({from:owner});
      await conference.withdraw({from:registered});
      await conference.withdraw({from:registered});
      // only 1 ether is taken out
      assert.strictEqual(web3.eth.getBalance(conference.address).toNumber(), deposit);
    })
  })

  describe('on clear', function(){
    let one_week = 1 * 60 * 60 * 24 * 7;

    it('default cooling period is 1 week', async function(){
      assert.equal((await conference.coolingPeriod.call()).toNumber(), one_week);
    })

    it('cooling period can be set', async function(){
      conference = await Conference.new(10, 0, '');
      assert.equal((await conference.coolingPeriod.call()).toNumber(), 10);
    })

    it('cannot be cleared by non owner', async function(){
      conference = await Conference.new(10, 0, '');
      deposit = (await conference.deposit.call()).toNumber();
      await conference.register('one', {value:deposit});
      assert.strictEqual(web3.eth.getBalance(conference.address).toNumber(), deposit);
      await conference.clear({from:non_owner}).catch(function(){});
      assert.strictEqual(web3.eth.getBalance(conference.address).toNumber(), deposit);
    })

    it('cannot be cleared if event is not ended', async function(){
      await conference.register('one', {value:deposit});
      assert.strictEqual(web3.eth.getBalance(conference.address).toNumber(), deposit);
      await conference.clear({from:owner}).catch(function(){});
      assert.strictEqual(web3.eth.getBalance(conference.address).toNumber(), deposit);
    })

    it('cannot be cleared if cooling period is not passed', async function(){
      await conference.register('one', {value:deposit});
      await conference.cancel({from:owner});
      assert.equal(await conference.ended.call(), true);
      assert.strictEqual( web3.eth.getBalance(conference.address).toNumber(), deposit);
      await conference.clear({from:owner}).catch(function(){});
      assert.equal(web3.eth.getBalance(conference.address).toNumber(), deposit);
    })

    it('owner receives the remaining if cooling period is passed', async function(){
      let tempo = await new Tempo(web3);
      conference = await Conference.new(1, 0, '')
      deposit = (await conference.deposit.call()).toNumber();

      await conference.register('one', {value:deposit});
      await conference.cancel({from:owner});
      assert.equal(await conference.ended.call(), true);
      assert.strictEqual(web3.eth.getBalance(conference.address).toNumber(), deposit);
      let previousBalance = web3.eth.getBalance(owner);
      await wait(2, 1);
      await conference.clear({from:owner});
      let diff = web3.eth.getBalance(owner) - previousBalance.toNumber();
      assert( diff > (deposit * 0.9));
      assert.strictEqual(web3.eth.getBalance(conference.address).toNumber(), 0);
    })
  })
})
