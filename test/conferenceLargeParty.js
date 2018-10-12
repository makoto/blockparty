const { toWei, toHex, toBN } = require('web3-utils')
const Conference = artifacts.require("Conference.sol");

const { getBalance, mulBN, outputBNs } = require('./utils')

web3.currentProvider.sendAsync = web3.currentProvider.send
const { wait, waitUntilBlock } = require('@digix/tempo')(web3);

const twitterHandle = '@bighero6';
const gas = 1000000;
const gasPrice = 1;

contract('Conference - large party', function(accounts) {
  const owner = accounts[0];
  const non_owner = accounts[1];
  let conference, deposit;

  beforeEach(async function(){
    conference = await Conference.new('', 0, 0, 0, '0x0');
    deposit = await conference.deposit();
  })

  describe('finalize large party using attendee bitmaps', function(){
    const numRegistered = 300

    beforeEach(async () => {
      conference = await Conference.new('', 0, 500, 0, '0x0');

      for (let i = 0; i < numRegistered; ++i) {
        await conference.register({value:deposit, from:accounts[10 + i]});
      }
    })

    it('requires enough bitmaps to succeed', async () => {
      await conference.finalize([1], {from:owner}).should.be.rejected;
    })

    it('cannot have too many bitmaps', async () => {
      await conference.finalize([1, 1, 1], {from:owner}).should.be.rejected;
    })

    it('correctly updates attendee records - p1, p2, p256, p257, p298, p299', async function(){
      // none attended except p1, p2 and p256, p257, p298 and p299
      // 0 1 1 ... 1 1 ... 1 1
      // reverse order since we go from right to left in bit parsing:
      // [ 6 (110), ... ]

      const maps = [
        toBN(0).bincn(1).bincn(2),
        toBN(0).bincn(0).bincn(1).bincn(298 % 256).bincn(299 % 256),
      ]

      outputBNs(maps)

      await conference.finalize(maps, {from:owner});

      // thorough check to see who has been marked attended vs not attended
      const attended = [ 1, 2, 256, 257, 298, 299 ]
      for (let i = 0; i < numRegistered; ++i) {
        try {
          if (attended.includes(i)) {
            await conference.isAttended(accounts[10 + i]).should.eventually.eq(true)
          } else {
            await conference.isAttended(accounts[10 + i]).should.eventually.eq(false)
          }
        } catch (err) {
          console.error(`Failed for p${i} - ${accounts[10 + i]}`)
          throw err
        }
      }

      await conference.totalAttended().should.eventually.eq(6)

      const payout = await conference.payout()
      const expectedPayout = deposit.mul(toBN(numRegistered)).div(toBN(6))
      payout.should.eq(expectedPayout)
      await conference.payoutAmount().should.eventually.eq(payout)
    })

    it('correctly updates attendee records - p256', async function(){
      // only p256 attended

      const maps = [ toBN(0), toBN(0).bincn(0) ]

      outputBNs(maps)

      await conference.finalize(maps, {from:owner});

      // thorough check to see who has been marked attended vs not attended
      const attended = [ 256 ]
      for (let i = 0; i < numRegistered; ++i) {
        try {
          if (attended.includes(i)) {
            await conference.isAttended(accounts[10 + i]).should.eventually.eq(true)
          } else {
            await conference.isAttended(accounts[10 + i]).should.eventually.eq(false)
          }
        } catch (err) {
          console.error(`Failed for p${i} - ${accounts[10 + i]}`)
          throw err
        }
      }

      await conference.totalAttended().should.eventually.eq(1)

      const payout = await conference.payout()
      const expectedPayout = deposit.mul(toBN(numRegistered))
      payout.should.eq(expectedPayout)
      await conference.payoutAmount().should.eventually.eq(payout)
    })

    it('correctly updates attendee records - p255', async function(){
      // only p255 attended
      const maps = [ toBN(0).bincn(255), toBN(0) ]

      outputBNs(maps)

      await conference.finalize(maps, {from:owner});

      // thorough check to see who has been marked attended vs not attended
      const attended = [ 255 ]
      for (let i = 0; i < numRegistered; ++i) {
        try {
          if (attended.includes(i)) {
            await conference.isAttended(accounts[10 + i]).should.eventually.eq(true)
          } else {
            await conference.isAttended(accounts[10 + i]).should.eventually.eq(false)
          }
        } catch (err) {
          console.error(`Failed for p${i} - ${accounts[10 + i]}`)
          throw err
        }
      }

      await conference.totalAttended().should.eventually.eq(1)

      const payout = await conference.payout()
      const expectedPayout = deposit.mul(toBN(numRegistered))
      payout.should.eq(expectedPayout)
      await conference.payoutAmount().should.eventually.eq(payout)
    })

    it('correctly updates attendee records - p255, p257', async function(){
      // only p255, p257 attended
      const maps = [ toBN(0).bincn(255), toBN(0).bincn(1) ]

      outputBNs(maps)

      await conference.finalize(maps, {from:owner});

      // thorough check to see who has been marked attended vs not attended
      const attended = [ 255, 257 ]
      for (let i = 0; i < numRegistered; ++i) {
        try {
          if (attended.includes(i)) {
            await conference.isAttended(accounts[10 + i]).should.eventually.eq(true)
          } else {
            await conference.isAttended(accounts[10 + i]).should.eventually.eq(false)
          }
        } catch (err) {
          console.error(`Failed for p${i} - ${accounts[10 + i]}`)
          throw err
        }
      }

      await conference.totalAttended().should.eventually.eq(2)

      const payout = await conference.payout()
      const expectedPayout = deposit.mul(toBN(numRegistered)).div(toBN(2))
      payout.should.eq(expectedPayout)
      await conference.payoutAmount().should.eventually.eq(payout)
    })

    it('correctly updates attendee records - none attended', async function(){
      // none attended
      const maps = [ toBN(0), toBN(0) ]

      outputBNs(maps)

      await conference.finalize(maps, {from:owner});

      // thorough check to see who has been marked attended vs not attended
      for (let i = 0; i < numRegistered; ++i) {
        try {
          await conference.isAttended(accounts[10 + i]).should.eventually.eq(false)
        } catch (err) {
          console.error(`Failed for p${i} - ${accounts[10 + i]}`)
          throw err
        }
      }

      await conference.totalAttended().should.eventually.eq(0)

      const payout = await conference.payout()
      const expectedPayout = toBN(0)
      payout.should.eq(expectedPayout)
      await conference.payoutAmount().should.eventually.eq(payout)
    })

    it('correctly updates attendee records - all attended', async function(){
      // all attended
      let n = toBN(0)
      for (let i = 0; i < 256; i++) {
        n = n.bincn(i)
      }
      const maps = [ n, n ]

      outputBNs(maps)

      await conference.finalize(maps, {from:owner});

      // thorough check to see who has been marked attended vs not attended
      for (let i = 0; i < numRegistered; ++i) {
        try {
          await conference.isAttended(accounts[10 + i]).should.eventually.eq(true)
        } catch (err) {
          console.error(`Failed for p${i} - ${accounts[10 + i]}`)
          throw err
        }
      }

      await conference.totalAttended().should.eventually.eq(numRegistered)

      const payout = await conference.payout()
      const expectedPayout = deposit
      payout.should.eq(expectedPayout)
      await conference.payoutAmount().should.eventually.eq(payout)
    })
  })
})
