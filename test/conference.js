require('babel-polyfill');
const Conference = artifacts.require("Conference.sol");
const InvitationRepository = artifacts.require("./InvitationRepository.sol");
const ConfirmationRepository = artifacts.require("./ConfirmationRepository.sol");
const invalid_jump_error = /Error: VM Exception while processing transaction: invalid JUMP/;
const deposit = Math.pow(10,17);
const twitterHandle = '@bighero6';
const gas = 1000000;

contract('Conference', function(accounts) {
  const owner = accounts[0];
  const non_owner = accounts[1];

  describe('on setLimitOfParticipants', function(){
    it('does not allow to register more than the limit', function(done){
      var meta;
      Conference.new().then(function(_meta) {
        meta = _meta;
        return meta.setLimitOfParticipants.sendTransaction(1)
      }).then(function() {
        return meta.register.sendTransaction(twitterHandle, {value:deposit});
      }).then(function() {
        return meta.registered.call();
      }).then(function(registered) {
        assert.equal(registered, 1)
        return meta.register.sendTransaction('anotherName', {from: accounts[1], value:deposit});
      }).then(function() {
        return meta.registered.call();
      }).then(function(registered) {
        assert.equal(registered.toString(), 1)
      }).then(done).catch(done);
    })

    it('returns only your deposit for multiple invalidations', function(done){
      var meta;
      var beforeAccountBalance;
      Conference.new().then(function(_meta) {
        meta = _meta;
        return meta.setLimitOfParticipants.sendTransaction(2)
      }).then(function() {
        return meta.register.sendTransaction(twitterHandle, {value:deposit});
      }).then(function() {
        return meta.register.sendTransaction('anotherName', {from: accounts[1], value:deposit});
      }).then(function() {
        return meta.registered.call();
      }).then(function(registered) {
        assert.equal(registered.toNumber(), 2)
        var invalidTransaction = (deposit / 2);
        beforeAccountBalance = web3.eth.getBalance(accounts[2]).toNumber();
        // Over capacity as well as wrong deposit value.
        return meta.register.sendTransaction('anotherName', {from: accounts[2], value:invalidTransaction});
      }).then(function() {
        return meta.registered.call();
      }).then(function(registered) {
        assert.strictEqual(web3.eth.getBalance(meta.address).toNumber(), 2 * deposit);
        // does not become exactly equal because it loses some gas.
        assert.equal(beforeAccountBalance > web3.eth.getBalance(accounts[2]).toNumber(), true);
      }).then(done).catch(done);
    })
  })

  describe('on creation', function(){
    it('has name', function(done){
      Conference.new().then(function(meta) {
        return meta.name.call()
      }).then(function(name) {
        assert.isNotNull(name);
      }).then(done).catch(done);
    })

    it('registered is zero', function(done){
      Conference.new().then(function(meta) {
        return meta.registered.call()
      }).then(function(value) {
        assert.equal(value.toNumber(), 0);
      }).then(done).catch(done);
    })

    it('attended is zero', function(done){
      Conference.new().then(function(meta) {
        return meta.attended.call()
      }).then(function(value) {
        assert.equal(value.toNumber(), 0);
      }).then(done).catch(done);
    })

    it('balance is zero', function(done){
      Conference.new().then(function(meta) {
        return meta.totalBalance.call()
      }).then(function(value) {
        assert.equal(value.toNumber(), 0);
      }).then(done).catch(done);
    })
  })

  describe('register with invitation', function(){
    it('allows registration only if invited', async function(){
      let invitation = await InvitationRepository.new();
      let invitation_code = web3.fromUtf8('1234567890');
      let encrypted_code = await invitation.encrypt.call(invitation_code);
      await invitation.add([encrypted_code], {from:owner});
      let conference = await Conference.new(600, invitation.address,0);
      await conference.registerWithInvitation(twitterHandle, invitation_code, {from:non_owner, value:deposit})
      let result = await conference.registered.call()
      assert.equal(result, 1);
      let report_result = await invitation.report.call(invitation_code);
      assert.equal(report_result, non_owner);
    })

    it('does not allow registration if not invited', async function(){
      let twitterHandle = '@bighero6';
      let owner = accounts[0];
      let non_owner = accounts[1];
      let invitation = await InvitationRepository.new();
      var deposit = Math.pow(10,17);
      let conference = await Conference.new(600, invitation.address, 0);
      await conference.registerWithInvitation(twitterHandle, 'invalid_code', {from:non_owner, value:deposit}).catch(function(){});
      let result = await conference.registered.call()
      assert.equal(result, 0);
    })
  })

  describe('on registration', function(){
    it('increments registered', function(done){
      var meta;
      Conference.new().then(function(_meta) {
        meta = _meta;
        return meta.register.sendTransaction(twitterHandle, {value:deposit});
      }).then(function() {
        return meta.registered.call();
      })
      .then(function(value){
        assert.equal(value.toNumber(), 1);
      })
      .then(done).catch(done);
    })

    it('increases balance', function(done){
      var meta;
      var beforeContractBalance;
      Conference.new().then(function(_meta) {
        meta = _meta;
        beforeContractBalance = web3.eth.getBalance(meta.address).toNumber();
        return meta.register.sendTransaction(twitterHandle, {value:deposit});
      }).then(function() {
        return meta.totalBalance.call();
      })
      .then(function(value){
        assert.equal(value.toNumber() - beforeContractBalance, deposit);
      })
      .then(done).catch(done);
    })

    it('isRegistered for the registered account is true', function(done){
      var meta;
      var account = accounts[0];
      Conference.new().then(function(_meta) {
        meta = _meta;
        return meta.register.sendTransaction(twitterHandle, {value:deposit});
      }).then(function() {
        return meta.isRegistered.call(account);
      })
      .then(function(value){
        assert.equal(value, true);
      })
      .then(done).catch(done);
    })

    it('isRegistered for the different account is not true', function(done){
      var meta;
      Conference.new().then(function(_meta) {
        meta = _meta;
        return meta.register.sendTransaction(twitterHandle, {from:accounts[0], value:deposit});
      }).then(function() {
        return meta.isRegistered.call(accounts[2]);
      })
      .then(function(value){
        assert.equal(value, false);
      })
      .then(done).catch(done);
    })

    it('cannot be registered if wrong amount of deposit is sent', function(done){
      var badTransaction = 5;
      var meta;
      var beforeAccountBalance = web3.eth.getBalance(accounts[0])
      var beforeContractBalance;
      Conference.new().then(function(_meta){
        meta = _meta;
        beforeContractBalance = web3.eth.getBalance(meta.address)
        return meta.register.sendTransaction(twitterHandle, {from:accounts[0], value:badTransaction})
      }).then(function(){
        var  contractBalance = web3.eth.getBalance(meta.address)
        var  accountBalance = web3.eth.getBalance(accounts[0]);
        // Contract did not get any ether
        assert.equal(contractBalance.toString(), beforeContractBalance.toString());
        // Lost for some gas
        assert.notEqual(accountBalance.toString(), beforeAccountBalance.toString());
      }).then(function() {
        return meta.isRegistered.call(accounts[0]);
      }).then(function(value){
        assert.equal(value, false);
      }).then(done).catch(done);
    })
  })

  describe('on attend', function(){
    it('isAttended is true if owner calls attend function', function(done){
      var meta;
      Conference.new().then(function(_meta) {
        meta = _meta;
        return meta.register.sendTransaction(twitterHandle, {from:accounts[1], value:deposit});
      }).then(function() {
        return meta.attend.sendTransaction([accounts[1]], {from:owner})
      }).
      then(function(){
        return meta.isAttended.call(accounts[1])
      })
      .then(function(value){
        assert.equal(value, true)
      }).then(function(){
        return meta.attended.call()
      }).then(function(value){
        assert.equal(value.toNumber(), 1)
      })
      .then(done).catch(done);
    })

    it('isAttended is false if non owner calls attend function', async function(){
      let conference = await Conference.new();
      await conference.register(twitterHandle, {value:deposit});
      await conference.attend([non_owner], {from:non_owner}).catch(function(){});
      assert.equal(await conference.isAttended.call(non_owner), false);
      assert.equal(await conference.attended.call(), 0);
      var participant = await conference.participants.call(non_owner);
      assert.equal(participant[2], false)
    })

    it('isAttended is false if attended function for the account is not called', function(done){
      var meta;
      Conference.new().then(function(_meta) {
        meta = _meta;
        return meta.register.sendTransaction(twitterHandle, {value:deposit});
      }).then(function() {
        return meta.isAttended.call(accounts[0])
      }).then(function(value){
        assert.equal(value, false)
      })
      .then(done).catch(done);
    })
  })

  describe('self attend with code', function(){
    it('allows participant to attend with code', async function(){
      let confirmation = await ConfirmationRepository.new();
      let confirmation_code = web3.fromUtf8('1234567890');
      let encrypted_code = await confirmation.encrypt.call(confirmation_code);
      await confirmation.add([encrypted_code], {from:owner});
      let verified = await confirmation.verify.call(confirmation_code);
      assert.equal(verified, true);
      let conference = await Conference.new(600, 0, confirmation.address);
      await conference.register(twitterHandle, {from:non_owner, value:deposit})
      await conference.attendWithConfirmation(confirmation_code, {from:non_owner})
      let attended = await conference.attended.call()
      assert.equal(attended, 1);
      let reported = await confirmation.report.call(confirmation_code);
      assert.equal(reported, non_owner);
    })

    it('does not allow participants to attend with same code', async function(){
      let non_owner_2 = accounts[2];
      let confirmation = await ConfirmationRepository.new();
      let confirmation_code = web3.fromUtf8('1234567890');
      let encrypted_code = await confirmation.encrypt.call(confirmation_code);
      await confirmation.add([encrypted_code], {from:owner});
      let verified = await confirmation.verify.call(confirmation_code);
      assert.equal(verified, true);
      let conference = await Conference.new(600, 0, confirmation.address);
      await conference.register(twitterHandle, {from:non_owner, value:deposit})
      await conference.register(twitterHandle, {from:non_owner_2, value:deposit})
      await conference.attendWithConfirmation(confirmation_code, {from:non_owner})
      await conference.attendWithConfirmation(confirmation_code, {from:non_owner_2}).catch(function(){});
      let attended = await conference.attended.call()
      assert.equal(attended, 1);
      let reported = await confirmation.report.call(confirmation_code);
      assert.equal(reported, non_owner);
    })
  })

  describe('on payback', function(){
    // This test is very flakey. Fails when run all together but passes when run alone.
    it('cannot withdraw if non owner calls', async function(){
      var previousBalances = [];
      var registered = accounts[2]
      let conference = await Conference.new()
      await conference.register(twitterHandle, {from:registered, value:deposit, gas:gas})
      // contract gets 1 ether
      assert.strictEqual(web3.eth.getBalance(conference.address).toNumber(), deposit)
      await conference.attend([registered], {gas:gas})
      await conference.payback({from:non_owner, gas:gas}).catch(function(){});
      await conference.withdraw({from:registered, gas:gas});
      // money is still left on contract
      assert.strictEqual(web3.eth.getBalance(conference.address).toNumber(), deposit)
    })

    it('cannot withdraw if you did not attend', function(done){
      var meta
      var previousBalances = [];
      var notAttended = accounts[2];
      var attended = accounts[1];

      Conference.new().then(function(_meta) {
        meta = _meta;
        return meta.register.sendTransaction(twitterHandle, {from:attended, value:deposit, gas:gas})
      }).then(function(){
        // contract gets 1 ether
        assert.strictEqual(web3.eth.getBalance(meta.address).toNumber(), deposit)
        return meta.attend.sendTransaction([attended], {gas:gas})
      }).then(function(){
        return meta.payback.sendTransaction({from:owner, gas:gas})
      }).then(function(){
        previousBalances[0] = web3.eth.getBalance(notAttended);
        return meta.withdraw.sendTransaction({from:notAttended, gas:gas})
      }).then(function(transaction){
        // money is still left on contract
        assert.strictEqual(web3.eth.getBalance(meta.address).toNumber(), deposit)
      })
      .then(done).catch(done);
    })

    it('can withdraw if you attend', function(done){
      var meta, previousBalance;

      Conference.new().then(function(_meta) {
        meta = _meta;
        return meta.register(twitterHandle, {from:accounts[0], value:deposit, gas:gas})
      }).then(function() {
        return meta.register('@Cpt_Reliable', {from:accounts[1], value:deposit, gas:gas})
      }).then(function(){
        return meta.register('@FLAKEY_99p', {from:accounts[2], value:deposit, gas:gas})
      }).then(function(){
        // contract gets 3 ethers
        assert.strictEqual( web3.eth.getBalance(meta.address).toNumber(), deposit * 3)
        // only account 0 and 1 attend
      }).then(function(){
        return meta.attend([accounts[0]], {gas:gas})
      }).then(function(){
        return meta.attend([accounts[1]], {gas:gas})
      }).then(function(){
        return meta.payback({from:accounts[0], gas:gas})
      }).then(function(){
        previousBalance = web3.eth.getBalance(accounts[0]);
        return meta.withdraw({from:accounts[0]})
      }).then(function(result){
        var diff = web3.eth.getBalance(accounts[0]).toNumber() - previousBalance.toNumber()
        assert( diff > (deposit * 1.4))
        previousBalance = web3.eth.getBalance(accounts[1]);
        return meta.withdraw({from:accounts[1]})
      }).then(function(result){
        var diff = web3.eth.getBalance(accounts[1]).toNumber() - previousBalance.toNumber()
        assert( diff > (deposit * 1.4))
        previousBalance = web3.eth.getBalance(accounts[2]);
        return meta.withdraw({from:accounts[2]})
      }).then(function(result){
        var diff = web3.eth.getBalance(accounts[0]).toNumber() - previousBalance.toNumber()
        assert( diff < 0)
        // no money is left on contract
        assert.strictEqual(web3.eth.getBalance(meta.address).toNumber(), 0)
        return meta.participants.call(accounts[0]);
      }).then(function(participant){
        // Got some money
        assert.strictEqual(participant[3].toNumber(), deposit * 1.5)
        assert.strictEqual(web3.eth.getBalance(meta.address).toNumber(), 0)
        assert.equal(participant[4], true)
        return meta.participants.call(accounts[1]);
      }).then(function(participant){
        // Got some money
        assert.strictEqual(participant[3].toNumber(), deposit * 1.5)
        assert.equal(participant[4], true)
        return meta.participants.call(accounts[2]);
      }).then(function(participant){
        // Got no money
        assert.strictEqual(web3.eth.getBalance(meta.address).toNumber(), 0)
        assert.equal(participant[4], false)
      }).then(done).catch(done);
    })

    it('cannot register any more', function(done){
      var meta;
      var currentRegistered;

      Conference.new().then(function(_meta) {
        meta = _meta;
        return meta.register.sendTransaction(twitterHandle, {from:accounts[0], value:deposit, gas:gas})
      }).then(function(){
        // contract gets 1 ether
        assert.strictEqual(web3.eth.getBalance(meta.address).toNumber(), deposit)
        return meta.attend.sendTransaction([accounts[0]], {gas:gas})
      }).then(function(){
        return meta.payback.sendTransaction({from:owner, gas:gas})
      }).then(function(){
        return meta.registered.call()
      }).then(function(registered){
        currentRegistered = registered
        return meta.register.sendTransaction('some handler', {from:accounts[1], value:deposit, gas:gas})
      }).then(function(){
        return meta.registered.call()
      }).then(function(registered){
        assert.strictEqual(currentRegistered.toNumber(), registered.toNumber())
      }).then(function(){
        return meta.ended.call()
      }).then(function(ended){
        assert.equal(ended, true)
      })
      .then(done).catch(done);
    })
  })

  describe('on cancel', function(){
    it('cannot be canceld if non owner calls', async function(){
      let previousBalances = [];
      let conference = await Conference.new();
      await conference.register(twitterHandle, {from:owner, value:deposit, gas:gas});
      // contract gets 1 ether
      assert.strictEqual(web3.eth.getBalance(conference.address).toNumber(), deposit);
      // only account 0 and 1 attend
      previousBalances[0] = web3.eth.getBalance(owner);
      await conference.cancel({from:non_owner, gas:gas}).catch(function(){});
      // money is still left on contract
      assert.strictEqual(web3.eth.getBalance(conference.address).toNumber(), deposit);
      // did not get deposit back
      assert.strictEqual(previousBalances[0].toNumber(), web3.eth.getBalance(accounts[0]).toNumber());
    })

    it('everybody receives refund', function(done){
      var meta
      var previousBalances = [];

      var balanceDiff = function(index){
        var realDiff = web3.fromWei(web3.eth.getBalance(accounts[index]).minus(previousBalances[index]), "ether");
        // Ignore small diff introduced by gas price;
        var roundedDiff = Math.round(realDiff * 10) / 10;
        return roundedDiff;
      }
      // 3 registrations
      Conference.new().then(function(_meta) {
        meta = _meta;
        return meta.register.sendTransaction(twitterHandle, {from:accounts[0], value:deposit, gas:gas})
      }).then(function() {
        return meta.register.sendTransaction('@Cpt_Reliable', {from:accounts[1], value:deposit, gas:gas})
      }).then(function(){
        return meta.register.sendTransaction('@FLAKEY_99p', {from:accounts[2], value:deposit, gas:gas})
      }).then(function(){
        // contract gets 3 ethers
        assert.strictEqual(web3.eth.getBalance(meta.address).toNumber(), deposit * 3)
        // only account 0 and 1 attend
      }).then(function(){
        return meta.attend.sendTransaction([accounts[0], accounts[1]], {gas:gas})
      }).then(function(){
        previousBalances[0] = web3.eth.getBalance(accounts[0]);
        previousBalances[1] = web3.eth.getBalance(accounts[1]);
        previousBalances[2] = web3.eth.getBalance(accounts[2]);
        return meta.cancel.sendTransaction({from:accounts[0], gas:gas})
      }).then(function(){
        return meta.withdraw.sendTransaction({from:accounts[0], gas:gas})
      }).then(function(){
        return meta.withdraw.sendTransaction({from:accounts[1], gas:gas})
      }).then(function(){
        return meta.withdraw.sendTransaction({from:accounts[2], gas:gas})
      }).then(function(){
        // no money is left on contract
        assert.strictEqual(web3.eth.getBalance(meta.address).toNumber(), 0)
        // got deposit back
        assert.strictEqual(balanceDiff(0), 0.1)
        assert.strictEqual(balanceDiff(1), 0.1)
        assert.strictEqual(balanceDiff(2), 0.1)
      })
      .then(done).catch(done);
    })

    it('cannot register any more', function(done){
      var meta;
      var currentRegistered;

      Conference.new().then(function(_meta) {
        meta = _meta;
      }).then(function(){
        return meta.cancel.sendTransaction({from:owner, gas:gas})
      }).then(function(){
        return meta.registered.call()
      }).then(function(registered){
        currentRegistered = registered
        return meta.register.sendTransaction('some handler', {from:accounts[1], value:deposit, gas:gas})
      }).then(function(){
        return meta.registered.call()
      }).then(function(registered){
        assert.equal(currentRegistered.toNumber(), registered.toNumber())
      }).then(function(){
        return meta.ended.call()
      }).then(function(ended){
        assert.equal(ended, true)
      })
      .then(done).catch(done);
    })

    it('cannot be canceled if the event is already ended', function(done){
      var meta;
      var currentRegistered;

      Conference.new().then(function(_meta) {
        meta = _meta;
        return meta.register.sendTransaction(twitterHandle, {from:accounts[0], value:deposit, gas:gas})
      }).then(function(){
        // contract gets 1 ether
        assert.strictEqual(web3.eth.getBalance(meta.address).toNumber(), deposit)
        return meta.attend.sendTransaction([accounts[0]], {gas:gas})
      }).then(function(){
        return meta.payback.sendTransaction({from:owner, gas:gas})
      }).then(function(){
        return meta.registered.call()
      }).then(function(registered){
        currentRegistered = registered
        return meta.cancel.sendTransaction()
      }).then(function(){
        return meta.registered.call()
      }).then(function(registered){
        assert.strictEqual(currentRegistered.toNumber(), registered.toNumber())
      }).then(function(){
        return meta.ended.call()
      }).then(function(ended){
        assert.equal(ended, true)
      })
      .then(done).catch(done);

    })
  })

  describe('on withdraw', function(){
    it('cannot withdraw if no payout', function(done){
      var meta
      var previousBalances = [];
      var registered = accounts[1];
      var notRegistered = accounts[2];
      Conference.new().then(function(_meta) {
        meta = _meta;
        return meta.register.sendTransaction(twitterHandle, {from:registered, value:deposit, gas:gas})
      }).then(function(){
        assert.strictEqual(web3.eth.getBalance(meta.address).toNumber(), deposit)
      }).then(function(){
        return meta.cancel({from:owner, gas:gas})
      }).then(function(cancel_result){
        previousBalances[0] = web3.eth.getBalance(notRegistered);
        return meta.withdraw({from:notRegistered, gas:gas})
      }).then(function(result){
        // money is still left on contract
        assert.strictEqual(web3.eth.getBalance(meta.address).toNumber(), deposit)
      })
      .then(done).catch(done);
    })

    it('cannot withdraw twice', function(done){
      var meta
      var registered = accounts[1];
      Conference.new().then(function(_meta) {
        meta = _meta;
        return meta.register.sendTransaction(twitterHandle, {from:owner, value:deposit, gas:gas})
      }).then(function(){
        return meta.register.sendTransaction(twitterHandle, {from:registered, value:deposit, gas:gas})
      }).then(function(){
        assert.strictEqual( web3.eth.getBalance(meta.address).toNumber(), deposit * 2)
      }).then(function(){
        return meta.cancel.sendTransaction({from:owner, gas:gas})
      }).then(function(){
        return meta.withdraw.sendTransaction({from:registered, gas:gas})
      }).then(function(transaction){
        return meta.withdraw.sendTransaction({from:registered, gas:gas})
      }).then(function(transaction){
        // only 1 ether is taken out
        assert.strictEqual(web3.eth.getBalance(meta.address).toNumber(), deposit)
      })
      .then(done).catch(done);
    })
  })

  describe('on clear', function(){
    it('default cooling period is 1 week', function(done){
      Conference.new().then(function(meta) {
        return meta.coolingPeriod.call();
      }).then(function(coolingPeriod){
        assert.equal(coolingPeriod.toNumber(), 1 * 60 * 60 * 24 * 7)
      })
      .then(done).catch(done);
    })

    it('cooling period can be set', function(done){
      Conference.new(10, 0, 0).then(function(meta) {
        return meta.coolingPeriod.call();
      }).then(function(coolingPeriod){
        assert.equal(coolingPeriod.toNumber(), 10)
      })
      .then(done).catch(done);
    })

    it('cannot be cleared by non owner', async function(){
      let conference = await Conference.new(10, 0);
      await conference.register('one', {value:deposit});
      assert.strictEqual(web3.eth.getBalance(conference.address).toNumber(), deposit);
      await conference.clear('one', {from:non_owner}).catch(function(){});
      assert.strictEqual(web3.eth.getBalance(conference.address).toNumber(), deposit);
    })

    it('cannot be cleared if event is not ended', function(done){
      let meta;
      Conference.new().then(function(_meta) {
        meta = _meta
        return meta.register.sendTransaction('one', {value:deposit});
      }).then(function(){
        assert.strictEqual(web3.eth.getBalance(meta.address).toNumber(), deposit)
        return meta.clear.sendTransaction('one', {from:owner});
      }).then(function(){
        assert.strictEqual(web3.eth.getBalance(meta.address).toNumber(), deposit)
      })
      .then(done).catch(done);
    })

    it('cannot be cleared if cooling period is not passed', function(done){
      let meta;
      Conference.new().then(function(_meta) {
        meta = _meta
        return meta.register.sendTransaction('one', {value:deposit});
      }).then(function(){
        return meta.cancel.sendTransaction({from:owner});
      }).then(function(){
        return meta.ended.call()
      }).then(function(ended){
        assert.equal(ended, true)
        assert.strictEqual( web3.eth.getBalance(meta.address).toNumber(), deposit)
        return meta.clear.sendTransaction('one', {from:owner});
      }).then(function(){
        assert.equal(web3.eth.getBalance(meta.address).toNumber(), deposit)
      })
      .then(done).catch(done);
    })

    it('owner receives the remaining if cooling period is passed', function(done){
      let meta;
      Conference.new(1, 0, 0).then(function(_meta) {
        meta = _meta
        return meta.register.sendTransaction('one', {value:deposit});
      }).then(function(){
        return meta.cancel.sendTransaction({from:owner});
      }).then(function(){
        return meta.ended.call()
      }).then(function(ended){
        assert.equal(ended, true)
        assert.strictEqual(web3.eth.getBalance(meta.address).toNumber(), deposit)
        var previousBalance = web3.eth.getBalance(owner);
        setTimeout(function(){
          meta.clear.sendTransaction('one', {from:owner}).then(function(transaction){
            var receipt = web3.eth.getTransactionReceipt(transaction)
            assert.equal(web3.eth.getBalance(meta.address).toString(), web3.toWei(0, "ether"))
            done()
          }).catch(done)
        }, 2000)
      }).catch(done);
    })
  })
})

// Just a generic test to check Ether transaction is working;
// contract('Transaction test', function(accounts) {
//   it('shold send ether from one account to another', function(done){
//     var before0 = web3.eth.getBalance(accounts[0]);
//     var before1 = web3.eth.getBalance(accounts[1]);
//     var gas = 21000; // gas price taken from the log of testrpc
//     web3.eth.sendTransaction({from:accounts[0], to:accounts[1], gas:gas, value: web3.toWei(100, "ether")}, function(){
//       var after0 = web3.eth.getBalance(accounts[0]);
//       var after1 = web3.eth.getBalance(accounts[1]);
//       assert.equal( after0.minus(before0).plus(gas).toNumber(), web3.toWei(-100, "ether"));
//       assert.equal( after1.minus(before1).toNumber() , web3.toWei(100, "ether"));
//       done();
//     })
//   })
// })

// Testing them from `truffle console`
// var meta = Conference.deployed();
// web3.eth.defaultAccount = web3.eth.accounts[0];
// meta.registered.call().then(function(value) {
//   console.log('value', value.toString());
// })
