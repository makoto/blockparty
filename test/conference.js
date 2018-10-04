const { toWei, toHex, toBN } = require('web3-utils')
const Conference = artifacts.require("Conference.sol");

const { getBalance, mulBN } = require('./utils')

web3.currentProvider.sendAsync = web3.currentProvider.send
const { wait, waitUntilBlock } = require('@digix/tempo')(web3);

const twitterHandle = '@bighero6';
const gas = 1000000;
const gasPrice = 1;
const participantAttributes = ['participantIndex', 'participantName', 'addr', 'attended', 'paid'];

const getParticipantDetail = function(participant, detail){
  return participant[participantAttributes.indexOf(detail)];
}

contract('Conference', function(accounts) {
  const owner = accounts[0];
  const non_owner = accounts[1];
  let conference, deposit;

  beforeEach(async function(){
    conference = await Conference.new('', 0, 0, 0, '', '0x0');
    deposit = await conference.deposit();
  })

  describe('can override owner', function() {
    it('unless given address is empty', async () => {
      conference = await Conference.new('', 0, 0, 0, '', '0x0');

      await conference.owner().should.eventually.eq(owner)
    })

    it('if given address is valid', async () => {
      conference = await Conference.new('', 0, 0, 0, '', non_owner);

      await conference.owner().should.eventually.eq(non_owner)

      await conference.changeName('new name', { from:owner }).should.be.rejected;

      await conference.name().should.not.eventually.eq('new name')
    })
  })

  describe('on changeName', function(){
    it('owner can rename the event', async function(){
      await conference.changeName('new name', {from:owner});

      await conference.name().should.eventually.eq('new name')
    })

    it('non owner cannot rename the event', async function(){
      await conference.changeName('new name', {from:non_owner}).should.be.rejected;

      await conference.name().should.not.eventually.eq('new name')
    })

    it('cannot rename the event once someone registered', async function(){
      await conference.register(twitterHandle, {value:deposit});
      await conference.changeName('new name', {from:owner}).should.be.rejected;

      await conference.name().should.not.eventually.eq('new name')
    })
  })

  describe('on setLimitOfParticipants', function(){
    it('does not allow to register more than the limit', async function(){
      await conference.setLimitOfParticipants(1)
      await conference.register(twitterHandle, {value:deposit});

      await conference.registered().should.eventually.eq(1)

      await conference.register('anotherName', {from: non_owner, value:deposit}).should.be.rejected;

      await conference.registered().should.eventually.eq(1)
    })

    it('returns only your deposit for multiple invalidations', async function(){
      await conference.setLimitOfParticipants(2);
      await conference.register(twitterHandle, {value:deposit});
      await conference.register('anotherName', {from: accounts[1], value:deposit});

      await conference.registered().should.eventually.eq(2)

      const invalidTransaction = mulBN(deposit, 0.5)
      const beforeAccountBalance = await getBalance(accounts[2])

      // Over capacity as well as wrong deposit value.
      await conference.register('anotherName', {from: accounts[2], value:invalidTransaction}).should.be.rejected;

      await conference.registered().should.eventually.eq(2)

      await getBalance(conference.address).should.eventually.eq( mulBN(deposit, 2) )

      // does not become exactly equal because it loses some gas.
      const afterAccountBalance = await getBalance(accounts[2])
      assert.isOk(beforeAccountBalance.gt(afterAccountBalance))
    })
  })

  describe('on creation', function(){
    it('has default values', async function(){
      await conference.name().should.eventually.eq('Test')
      await conference.deposit().should.eventually.eq(toWei('0.02', "ether"))
      await conference.limitOfParticipants().should.eventually.eq(20)
      await conference.registered().should.eventually.eq(0)
      await conference.attended().should.eventually.eq(0)
      await conference.totalBalance().should.eventually.eq(0)
    })

    it('can set config values', async function(){
      conference = await Conference.new('Test 1', parseInt(toWei('2', "ether")), 100, 2, 'public key', '0x0');

      await conference.name().should.eventually.eq('Test 1')
      await conference.deposit().should.eventually.eq(toWei('2', "ether"))
      await conference.limitOfParticipants().should.eventually.eq(100)
    })
  })

  describe('on registration', function(){
    let beforeContractBalance, beforeAccountBalance;

    beforeEach(async function(){
      beforeContractBalance = await getBalance(conference.address);

      await conference.register(twitterHandle, {value:deposit});
    })

    it('increments registered', async function(){
      await conference.registered().should.eventually.eq(1)
    })

    it('increases totalBalance', async function(){
      const totalBalance = await conference.totalBalance()

      assert.equal(totalBalance.sub(beforeContractBalance).toString(10), deposit.toString(10))
    })

    it('isRegistered for the registered account is true', async function(){
      await conference.registered().should.eventually.eq(1)

      await conference.isRegistered(owner).should.eventually.eq(true)
    })

    it('isRegistered for the different account is not true', async function(){
      await conference.isRegistered(non_owner).should.eventually.eq(false)
    })
  })

  describe('on failed registration', function(){
    it('cannot be registered if wrong amount of deposit is sent', async function(){
      let wrongDeposit = 5;
      let beforeContractBalance = await getBalance(conference.address);

      await conference.register(twitterHandle, {from:owner, value:wrongDeposit}).should.be.rejected;

      await getBalance(conference.address).should.eventually.eq(beforeContractBalance)
      await conference.isRegistered(owner).should.eventually.eq(false)
    })

    it('cannot register twice with same address', async function(){
      await conference.register(twitterHandle, {from:owner, value:deposit});
      await conference.register(twitterHandle, {from:owner, value:deposit}).should.be.rejected;

      await getBalance(conference.address).should.eventually.eq(deposit)

      await conference.registered().should.eventually.eq(1)
      await conference.isRegistered(owner).should.eventually.eq(true)
    })
  })

  describe('on attend', function(){
    let non_registered = accounts[4];
    let admin = accounts[5];

    beforeEach(async function(){
      await conference.register(twitterHandle, {value:deposit, from:non_owner});
    })

    it('can be called by owner', async function(){
      await conference.attend([non_owner], {from:owner});

      await conference.isAttended(non_owner).should.eventually.eq(true)
      await conference.attended().should.eventually.eq(1)
      await conference.totalAttended().should.eventually.eq(1)
    })

    it('can be called by admin', async function(){
      await conference.grant([admin], {from:owner});
      await conference.attend([non_owner], {from:admin});

      await conference.isAttended(non_owner).should.eventually.eq(true)
      await conference.attended().should.eventually.eq(1)
    })

    it('cannot be called by non owner', async function(){
      await conference.attend([non_owner], {from:non_owner}).should.be.rejected;

      await conference.isAttended(non_owner).should.eventually.eq(false)
      await conference.attended().should.eventually.eq(0)
      await conference.totalAttended().should.eventually.eq(0)

      const participant = await conference.participants(non_owner);

      assert.equal(getParticipantDetail(participant, 'attended'), false);
    })

    it('isAttended is false if attended function for the account is not called', async function(){
      await conference.isAttended(owner).should.eventually.eq(false)
    })

    it('cannot be attended if the list includes non registered address', async function(){
      await conference.attend([non_owner, non_registered], {from:owner}).should.be.rejected;

      await conference.isAttended(non_owner).should.eventually.eq(false)
      await conference.isAttended(non_registered).should.eventually.eq(false)
      await conference.attended().should.eventually.eq(0)
      await conference.totalAttended().should.eventually.eq(0)
    })

    it('cannot be attended twice', async function(){
      await conference.attend([non_owner], {from:owner});
      await conference.attend([non_owner], {from:owner}).should.be.rejected;

      await conference.isAttended(non_owner).should.eventually.eq(true)
      await conference.attended().should.eventually.eq(1)
      await conference.totalAttended().should.eventually.eq(1)
    })
  })

  describe('finalize using attendee bitmap', function(){
    let non_registered = accounts[4];
    let admin = accounts[5];

    beforeEach(async function(){
      await conference.register(twitterHandle, {value:deposit, from:non_owner});
      await conference.register(twitterHandle, {value:deposit, from:accounts[6]});
      await conference.register(twitterHandle, {value:deposit, from:accounts[7]});
      await conference.register(twitterHandle, {value:deposit, from:accounts[8]});
    })

    it('can be called by owner', async function(){
      // first registrant attended:
      // 1 0 0 0 0
      // reverse order since we go from right to left in bit parsing:
      // [ ...0001 (1) ]
      await conference.finalize([1], {from:owner});

      await conference.isAttended(non_owner).should.eventually.eq(true)
      await conference.totalAttended().should.eventually.eq(1)
    })

    it('can be called by admin', async function(){
      await conference.grant([admin], {from:owner});
      await conference.finalize([1], {from:admin});

      await conference.isAttended(non_owner).should.eventually.eq(true)
      await conference.totalAttended().should.eventually.eq(1)
    })

    it('cannot be called by non owner', async function(){
      await conference.finalize([1], {from:non_owner}).should.be.rejected;

      await conference.isAttended(non_owner).should.eventually.eq(false)
      await conference.totalAttended().should.eventually.eq(0)
    })

    it('isAttended is false if attended function for the account is not called', async function(){
      await conference.isAttended(owner).should.eventually.eq(false)
    })

    it('cannot be called twice', async function(){
      await conference.finalize([1], {from:owner});
      await conference.finalize([1], {from:owner}).should.be.rejected;

      await conference.isAttended(non_owner).should.eventually.eq(true)
      await conference.totalAttended().should.eventually.eq(1)
    })

    it('marks party as ended and enables payout', async function() {
      await conference.finalize([1], {from:owner});

      await conference.ended().should.eventually.eq(true)
      await conference.payoutAmount().should.eventually.eq(await conference.payout())
    })

    it('correctly updates attendee records', async function() {
      // all attended except accounts[6]
      // 1 0 1 1
      // reverse order since we go from right to left in bit parsing:
      // [ 13 (1101) ]

      await conference.finalize([13], {from:owner});

      await conference.isAttended(non_owner).should.eventually.eq(true)
      await conference.isAttended(accounts[6]).should.eventually.eq(false)
      await conference.isAttended(accounts[7]).should.eventually.eq(true)
      await conference.isAttended(accounts[8]).should.eventually.eq(true)
      await conference.totalAttended().should.eventually.eq(3)
    })
  })

  describe('on empty event', function(){
    let notAttended = accounts[3];

    it('nothing to withdraw if no one attend', async function(){
      await conference.payback({from:owner});

      await conference.payoutAmount().should.eventually.eq(0)
    })
  })

  describe('on payback', function(){
    let previousBalance, currentRegistered, currentAttended;
    let attended = accounts[2];
    let notAttended = accounts[3];
    let notRegistered = accounts[4];
    let admin = accounts[5];

    beforeEach(async function(){
      await conference.register(twitterHandle, {from:attended, value:deposit});
      await conference.register(twitterHandle, {from:notAttended, value:deposit});
      await conference.attend([attended]);
    })

    it('can call if owner', async function(){
      await conference.payback({from:owner});
      await conference.ended().should.eventually.eq(true)

    })

    it('can call if admin', async function(){
      await conference.grant([admin], {from:owner});
      await conference.payback({from:admin});
      await conference.ended().should.eventually.eq(true)
    })

    it('cannot withdraw if non owner calls', async function(){
      await conference.payback({from:non_owner}).should.be.rejected;
      await conference.withdraw({from:attended}).should.be.rejected;
      // money is still left on contract
      await getBalance(conference.address).should.eventually.eq( mulBN(deposit, 2) )
      await conference.isPaid(attended).should.eventually.eq(false)
    })

    it('cannot withdraw if you did not attend', async function(){
      await conference.payback({from:owner});
      await conference.withdraw({from:notAttended}).should.be.rejected;
      // money is still left on contract
      await getBalance(conference.address).should.eventually.eq( mulBN(deposit, 2) )
      await conference.isPaid(notAttended).should.eventually.eq(false)
    })

    it('can withdraw if you attend', async function(){
      await conference.payback({from:owner});
      previousBalance = await getBalance(attended);

      await getBalance(conference.address).should.eventually.eq( mulBN(deposit, 2) )

      await conference.withdraw({from:attended});

      await getBalance(conference.address).should.eventually.eq( 0 )

      const diff = (await getBalance(attended)).sub(previousBalance)
      assert.isOk(diff.gt( mulBN(deposit, 1.9) ))

      const participant = await conference.participants(attended);

      assert.equal(getParticipantDetail(participant, 'paid'), true);

      await conference.isPaid(attended).should.eventually.eq(true)
    })

    it('cannot register any more', async function(){
      await conference.payback({from:owner});

      currentRegistered = await conference.registered();

      await conference.register('some handler', {from:notRegistered, value:deposit}).should.be.rejected;

      await conference.registered().should.eventually.eq(currentRegistered)
      await conference.ended().should.eventually.eq(true)
    })

    // This is faiing. Potentially bug;
    it('cannot attend any more', async function(){
      await conference.payback({from:owner});
      currentAttended = await conference.attended();
      await conference.attend([notAttended], {from:owner}).should.be.rejected;

      await conference.attended().should.eventually.eq(currentAttended)
      await conference.ended().should.eventually.eq(true)
    })
  })

  describe('on cancel', function(){
    let previousBalance, currentRegistered, currentAttended, diff, participant;
    let attended = accounts[2];
    let notAttended = accounts[3];
    let notRegistered = accounts[4];

    beforeEach(async function(){
      await conference.register(twitterHandle, {from:attended, value:deposit});
      await conference.register(twitterHandle, {from:notAttended, value:deposit});
      await conference.attend([attended]);
    })

    it('cannot cancel if non owner calls', async function(){
      await conference.cancel({from:non_owner}).should.be.rejected;
      await conference.withdraw({from:attended}).should.be.rejected;
      // money is still left on contract
      await getBalance(conference.address).should.eventually.eq( mulBN(deposit, 2) )
    })

    it('everybody receives refund', async function(){
      await conference.cancel();
      // attended
      previousBalance = await getBalance(attended);

      await getBalance(conference.address).should.eventually.eq( mulBN(deposit, 2) )

      await conference.withdraw({from:attended});

      await getBalance(conference.address).should.eventually.eq( deposit )

      diff = (await getBalance(attended)).sub(previousBalance)
      assert.isOk(diff.gt( mulBN(deposit, 0.9) ))

      participant = await conference.participants(attended);
      assert.equal(getParticipantDetail(participant, 'paid'), true);

      // notAttended
      previousBalance = await getBalance(notAttended);
      await conference.withdraw({from:notAttended});

      await getBalance(conference.address).should.eventually.eq( 0 )

      diff = (await getBalance(notAttended)).sub(previousBalance)
      assert.isOk(diff.gt( mulBN(deposit, 0.9) ))

      participant = await conference.participants(notAttended);
      assert.equal(getParticipantDetail(participant, 'paid'), true);
    })

    it('cannot register any more', async function(){
      await conference.cancel();
      currentRegistered = await conference.registered();

      await conference.register('some handler', {from:notRegistered, value:deposit}).should.be.rejected;

      await conference.registered().should.eventually.eq(currentRegistered)
      await conference.ended().should.eventually.eq(true)
    })
    // - cannot attend any more
    // - cannot payback any more

    it('cannot be canceled if the event is already ended', async function(){
      await conference.payback();
      await conference.cancel().should.be.rejected;

      await getBalance(conference.address).should.eventually.eq( mulBN(deposit, 2) )

      await conference.withdraw({from:notAttended}).should.be.rejected;

      await getBalance(conference.address).should.eventually.eq( mulBN(deposit, 2) )

      await conference.withdraw({from:attended});

      await getBalance(conference.address).should.eventually.eq( 0 )

      await conference.ended().should.eventually.eq(true)
    })
  })

  describe('on withdraw', function(){
    let registered = accounts[1];
    let notRegistered = accounts[2];

    beforeEach(async function(){
      await conference.register(twitterHandle, {from:owner, value:deposit});
      await conference.register(twitterHandle, {from:registered, value:deposit});

      await getBalance(conference.address).should.eventually.eq( mulBN(deposit, 2) )
    })

    it('cannot withdraw twice', async function(){
      await conference.cancel({from:owner});
      await conference.withdraw({from:registered});
      await conference.withdraw({from:registered}).should.be.rejected;
      // only 1 ether is taken out
      await getBalance(conference.address).should.eventually.eq( deposit )
    })

    it('cannot withdraw if you did not register', async function(){
      await conference.cancel({from:owner});
      await conference.withdraw({from:notRegistered}).should.be.rejected;

      await getBalance(conference.address).should.eventually.eq( mulBN(deposit, 2) )
    })
  })

  describe('on clear', function(){
    let one_week = 1 * 60 * 60 * 24 * 7;

    it('default cooling period is 1 week', async function(){
      await conference.coolingPeriod().should.eventually.eq(one_week)
    })

    it('cooling period can be set', async function(){
      conference = await Conference.new('', 0, 0, 10, '', '0x0');

      await conference.coolingPeriod().should.eventually.eq(10)
    })

    it('cannot be cleared by non owner', async function(){
      conference = await Conference.new('', 0, 0, 10, '', '0x0');

      deposit = await conference.deposit()

      await conference.register('one', {value:deposit});

      await getBalance(conference.address).should.eventually.eq(deposit)

      await conference.clear({from:non_owner}).should.be.rejected;

      await getBalance(conference.address).should.eventually.eq(deposit)
    })

    it('cannot be cleared if event is not ended', async function(){
      await conference.register('one', {value:deposit});

      await getBalance(conference.address).should.eventually.eq(deposit)

      await conference.clear({from:owner}).should.be.rejected;

      await getBalance(conference.address).should.eventually.eq(deposit)
    })

    it('cannot be cleared if cooling period is not passed', async function(){
      await conference.register('one', {value:deposit});
      await conference.cancel({from:owner});

      await conference.ended().should.eventually.eq(true)
      await getBalance(conference.address).should.eventually.eq(deposit)

      await conference.clear({from:owner}).should.be.rejected;

      await getBalance(conference.address).should.eventually.eq(deposit)
    })

    it('owner receives the remaining if cooling period is passed', async function(){
      conference = await Conference.new('', 0, 0, 1, '', '0x0')
      deposit = await conference.deposit()

      await conference.register('one', {value:deposit});
      await conference.cancel({from:owner});

      await conference.ended().should.eventually.eq(true)
      await getBalance(conference.address).should.eventually.eq(deposit)

      let previousBalance = await getBalance(owner);
      await wait(2, 1);
      await conference.clear({from:owner});

      let diff = (await getBalance(owner)).sub(previousBalance)
      assert.isOk(diff.gt( mulBN(deposit, 0.9) ))

      await getBalance(conference.address).should.eventually.eq(0)
    })
  })
})
