const { toWei, toHex, toBN } = require('web3-utils')
const EthVal = require('ethval')
const Conference = artifacts.require("Conference.sol");

const { getBalance, mulBN } = require('./utils')

web3.currentProvider.sendAsync = web3.currentProvider.send
const { wait, waitUntilBlock } = require('@digix/tempo')(web3);

const twitterHandle = '@bighero6';
const gas = 1000000;
const gasPrice = 1;
const participantAttributes = ['index', 'addr', 'paid'];

const getParticipantDetail = function(participant, detail){
  return participant[participantAttributes.indexOf(detail)];
}

contract('Conference', function(accounts) {
  const owner = accounts[0];
  const non_owner = accounts[1];
  let conference, deposit;

  beforeEach(async function(){
    conference = await Conference.new('', 0, 0, 0, '0x0');
    deposit = await conference.deposit();
  })

  describe('can override owner', function() {
    it('unless given address is empty', async () => {
      conference = await Conference.new('', 0, 0, 0, '0x0');

      await conference.owner().should.eventually.eq(owner)
    })

    it('if given address is valid', async () => {
      conference = await Conference.new('', 0, 0, 0, non_owner);

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
      await conference.register({value:deposit});
      await conference.changeName('new name', {from:owner}).should.be.rejected;

      await conference.name().should.not.eventually.eq('new name')
    })
  })

  describe('on setLimitOfParticipants', function(){
    it('does not allow to register more than the limit', async function(){
      await conference.setLimitOfParticipants(1)
      await conference.register({value:deposit});

      await conference.registered().should.eventually.eq(1)

      await conference.register({from: non_owner, value:deposit}).should.be.rejected;

      await conference.registered().should.eventually.eq(1)
    })

    it('returns only your deposit for multiple invalidations', async function(){
      await conference.setLimitOfParticipants(2);
      await conference.register({value:deposit});
      await conference.register({from: accounts[1], value:deposit});

      await conference.registered().should.eventually.eq(2)

      const invalidTransaction = mulBN(deposit, 0.5)
      const beforeAccountBalance = await getBalance(accounts[2])

      // Over capacity as well as wrong deposit value.
      await conference.register({from: accounts[2], value:invalidTransaction}).should.be.rejected;

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
      await conference.totalBalance().should.eventually.eq(0)
    })

    it('can set config values', async function(){
      conference = await Conference.new('Test 1', parseInt(toWei('2', "ether")), 100, 2, '0x0');

      await conference.name().should.eventually.eq('Test 1')
      await conference.deposit().should.eventually.eq(toWei('2', "ether"))
      await conference.limitOfParticipants().should.eventually.eq(100)
    })
  })

  describe('on registration', function(){
    let beforeContractBalance, beforeAccountBalance;

    beforeEach(async function(){
      beforeContractBalance = await getBalance(conference.address);

      await conference.register({value:deposit});
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

      await conference.register({from:owner, value:wrongDeposit}).should.be.rejected;

      await getBalance(conference.address).should.eventually.eq(beforeContractBalance)
      await conference.isRegistered(owner).should.eventually.eq(false)
    })

    it('cannot register twice with same address', async function(){
      await conference.register({from:owner, value:deposit});
      await conference.register({from:owner, value:deposit}).should.be.rejected;

      await getBalance(conference.address).should.eventually.eq(deposit)

      await conference.registered().should.eventually.eq(1)
      await conference.isRegistered(owner).should.eventually.eq(true)
    })
  })

  describe('finalize using attendee bitmap', function(){
    let non_registered = accounts[4];
    let admin = accounts[5];

    beforeEach(async function(){
      await conference.register({value:deposit, from:non_owner});
      await conference.register({value:deposit, from:accounts[6]});
      await conference.register({value:deposit, from:accounts[7]});
      await conference.register({value:deposit, from:accounts[8]});
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
      await conference.payoutAmount().should.eventually.eq(mulBN(deposit, 4))
    })

    it('correctly calculates total attended even if more 1 bits are set than there are registrations', async function() {
      // all attended
      let n = toBN(0)
      for (let i = 0; i < 256; i++) {
        n = n.bincn(i)
      }
      await conference.finalize([n], {from:owner});

      await conference.totalAttended().should.eventually.eq(4)
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

    it('only allows those who have attended to withdraw', async function() {
      // all attended except accounts[6]
      // 1 0 1 1
      // reverse order since we go from right to left in bit parsing:
      // [ 13 (1101) ]

      await conference.finalize([13], {from:owner});

      await conference.withdraw({ from: non_owner });
      await conference.withdraw({ from: accounts[7] });
      await conference.withdraw({ from: accounts[8] });
      await conference.withdraw({ from: accounts[6] }).should.be.rejected;
    })

    it('cannot register once finalized', async function() {
      await conference.finalize([13], {from:owner});

      await conference.register({ from: accounts[9] }).should.be.rejected;
    })

    it('can withdraw winning payout once finalized', async function() {
      // all attended except accounts[6]
      // 1 0 1 1
      // reverse order since we go from right to left in bit parsing:
      // [ 13 (1101) ]

      await conference.finalize([13], {from:owner});

      const depositEthVal = new EthVal(deposit)

      const previousBalance = new EthVal(await getBalance(non_owner));
      const previousContractBalance = new EthVal(await getBalance(conference.address))

      previousContractBalance.toString().should.eq( depositEthVal.mul(4).toString() )

      await conference.withdraw({ from: non_owner });

      const diff = new EthVal(await getBalance(non_owner)).sub(previousBalance)
      assert.isOk(diff.toEth().toFixed(9) === depositEthVal.mul(4).div(3).toEth().toFixed(9) )

      const newContractBalance = new EthVal(await getBalance(conference.address))

      newContractBalance.toEth().toFixed(9).should.eq( previousContractBalance.sub(diff).toEth().toFixed(9) )

      const participant = await conference.participants(non_owner);

      assert.equal(getParticipantDetail(participant, 'paid'), true);

      await conference.isPaid(non_owner).should.eventually.eq(true)
    })
  })

  describe('empty events', function(){
    it('nothing to withdraw if no one registered', async function(){
      await conference.finalize([], { from: owner });
      await conference.ended().should.eventually.eq(true);
      await conference.payoutAmount().should.eventually.eq(0);
      await conference.withdraw({ from: owner }).should.be.rejected;
    })

    it('nothing to withdraw if no one showed up', async function(){
      await conference.register({ from: owner, value: deposit });
      await conference.finalize([0], { from: owner });
      await conference.ended().should.eventually.eq(true);
      await conference.payoutAmount().should.eventually.eq(0);
      await conference.withdraw({ from: owner }).should.be.rejected;
    })
  })

  describe('on cancel', function(){
    let previousBalance, currentRegistered, currentAttended, diff, participant;
    let attended = accounts[2];
    let notAttended = accounts[3];
    let notRegistered = accounts[4];

    beforeEach(async function(){
      await conference.register({from:attended, value:deposit});
      await conference.register({from:notAttended, value:deposit});
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

      await conference.register({from:notRegistered, value:deposit}).should.be.rejected;

      await conference.registered().should.eventually.eq(currentRegistered)
      await conference.ended().should.eventually.eq(true)
    })
    // - cannot attend any more
    // - cannot payback any more

    it('cannot be canceled if the event is already ended', async function(){
      await conference.finalize([1], { from: owner });
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
      await conference.register({from:owner, value:deposit});
      await conference.register({from:registered, value:deposit});

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

    it('cannot withdraw until finalized', async function(){
      await conference.withdraw({from:registered}).should.be.rejected;
      await conference.finalize([3], { from: owner });
      await conference.withdraw({from:registered});
    })
  })

  describe('on clear', function(){
    let one_week = 1 * 60 * 60 * 24 * 7;

    it('default cooling period is 1 week', async function(){
      await conference.coolingPeriod().should.eventually.eq(one_week)
    })

    it('cooling period can be set', async function(){
      conference = await Conference.new('', 0, 0, 10, '0x0');

      await conference.coolingPeriod().should.eventually.eq(10)
    })

    it('cannot be cleared by non owner', async function(){
      conference = await Conference.new('', 0, 0, 10, '0x0');

      deposit = await conference.deposit()

      await conference.register({value:deposit});

      await getBalance(conference.address).should.eventually.eq(deposit)

      await conference.clear({from:non_owner}).should.be.rejected;

      await getBalance(conference.address).should.eventually.eq(deposit)
    })

    it('cannot be cleared if event is not ended', async function(){
      await conference.register({value:deposit});

      await getBalance(conference.address).should.eventually.eq(deposit)

      await conference.clear({from:owner}).should.be.rejected;

      await getBalance(conference.address).should.eventually.eq(deposit)
    })

    it('cannot be cleared if cooling period is not passed', async function(){
      await conference.register({value:deposit});
      await conference.cancel({from:owner});

      await conference.ended().should.eventually.eq(true)
      await getBalance(conference.address).should.eventually.eq(deposit)

      await conference.clear({from:owner}).should.be.rejected;

      await getBalance(conference.address).should.eventually.eq(deposit)
    })

    it('owner receives the remaining if cooling period is passed', async function(){
      conference = await Conference.new('', 0, 0, 1, '0x0')
      deposit = await conference.deposit()

      await conference.register({value:deposit});
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
