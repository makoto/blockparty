contract('Conference', function(accounts) {

  it("should not send money directly", function(done){
    function sendTransaction(fromAddress, toAddress, ether){
      return new Promise(function(resolve,reject){
         web3.eth.sendTransaction({
           from:fromAddress,
           to:toAddress,
           value: web3.toWei(ether, "ether")
         },function(err, result){
           resolve(result)
         })
       });
     }
     var conference = Conference.deployed();
     sendTransaction(accounts[0], conference.address, 1).
     then(function(){
       assert.equal(web3.eth.getBalance(conference.address).toNumber(), 0)
       done();
     }).catch(done);
  })

  describe('on setLimitOfParticipants', function(){
    it('does not allow to register more than the limit', function(done){
      var transaction = Math.pow(10,18);
      var twitterHandle = '@bighero6';
      var meta;
      Conference.new().then(function(_meta) {
        meta = _meta;
        return meta.setLimitOfParticipants.sendTransaction(1)
      }).then(function() {
        return meta.register.sendTransaction(twitterHandle, {value:transaction});
      }).then(function() {
        return meta.registered.call();
      }).then(function(registered) {
        assert.equal(registered, 1)
        return meta.register.sendTransaction('anotherName', {from: accounts[1], value:transaction});
      }).then(function() {
        return meta.registered.call();
      }).then(function(registered) {
        assert.equal(registered.toString(), 1)
      }).then(done).catch(done);
    })

    it('returns only your deposit for multiple invalidations', function(done){
      var transaction = Math.pow(10,18);
      var twitterHandle = '@bighero6';
      var meta;
      var beforeAccountBalance;
      Conference.new().then(function(_meta) {
        meta = _meta;
        return meta.setLimitOfParticipants.sendTransaction(2)
      }).then(function() {
        return meta.register.sendTransaction(twitterHandle, {value:transaction});
      }).then(function() {
        return meta.register.sendTransaction('anotherName', {from: accounts[1], value:transaction});
      }).then(function() {
        return meta.registered.call();
      }).then(function(registered) {
        assert.equal(registered, 2)
        var invalidTransaction = (transaction / 2);
        beforeAccountBalance = web3.eth.getBalance(accounts[2]);
        // Over capacity as well as wrong deposit value.
        return meta.register.sendTransaction('anotherName', {from: accounts[2], value:invalidTransaction});
      }).then(function() {
        return meta.registered.call();
      }).then(function(registered) {
        assert.equal(web3.eth.getBalance(meta.address), 2 * transaction);
        // does not become exactly equal because it loses some gas.
        assert.equal(beforeAccountBalance > web3.eth.getBalance(accounts[2]), true);
      }).then(done).catch(done);
    })
  })

  describe('on creation', function(){
    it('has name', function(done){
      Conference.new().then(function(meta) {
        return meta.name.call()
      }).then(function(name) {
        assert.equal(name, 'CodeUp');
      }).then(done).catch(done);
    })

    it('registered is zero', function(done){
      Conference.new().then(function(meta) {
        return meta.registered.call()
      }).then(function(value) {
        assert.equal(value, 0);
      }).then(done).catch(done);
    })

    it('attended is zero', function(done){
      Conference.new().then(function(meta) {
        return meta.attended.call()
      }).then(function(value) {
        assert.equal(value, 0);
      }).then(done).catch(done);
    })

    it('balance is zero', function(done){
      Conference.new().then(function(meta) {
        return meta.totalBalance.call()
      }).then(function(value) {
        assert.equal(value, 0);
      }).then(done).catch(done);
    })
  })

  describe('on registration', function(){
    it('increments registered', function(done){
      var account = accounts[0]
      var transaction = Math.pow(10,18);
      var twitterHandle = '@bighero6';
      var meta;
      Conference.new().then(function(_meta) {
        meta = _meta;
        return meta.register.sendTransaction(twitterHandle, {value:transaction});
      }).then(function() {
        return meta.registered.call();
      })
      .then(function(value){
        assert.equal(value, 1);
      })
      .then(done).catch(done);
    })

    it('increases balance', function(done){
      var account = accounts[0]
      var beforeContractBalance;
      var transaction = Math.pow(10,18);
      var twitterHandle = '@bighero6';
      var meta;
      Conference.new().then(function(_meta) {
        meta = _meta;
        beforeContractBalance = web3.eth.getBalance(meta.address);
        return meta.register.sendTransaction(twitterHandle, {value:transaction});
      }).then(function() {
        return meta.totalBalance.call();
      })
      .then(function(value){
        assert.equal(value.toString() - beforeContractBalance, transaction);
      })
      .then(done).catch(done);
    })

    it('isRegistered for the registered account is true', function(done){
      var account = accounts[0]
      var transaction = Math.pow(10,18);
      var twitterHandle = '@bighero6';
      var meta;
      Conference.new().then(function(_meta) {
        meta = _meta;
        return meta.register.sendTransaction(twitterHandle, {value:transaction});
      }).then(function() {
        return meta.isRegistered.call(account);
      })
      .then(function(value){
        assert.equal(value, true);
      })
      .then(done).catch(done);
    })

    it('isRegistered for the different account is not true', function(done){
      var transaction = Math.pow(10,18);
      var twitterHandle = '@bighero6';
      var meta;
      Conference.new().then(function(_meta) {
        meta = _meta;
        return meta.register.sendTransaction(twitterHandle, {from:accounts[0], value:transaction});
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
      var twitterHandle = '@bighero6';
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
      var transaction = Math.pow(10,18);
      var twitterHandle = '@bighero6';
      var owner = accounts[0]
      var meta;
      Conference.new().then(function(_meta) {
        meta = _meta;
        return meta.register.sendTransaction(twitterHandle, {from:accounts[1], value:transaction});
      }).then(function() {
        return meta.attend.sendTransaction(accounts[1], {from:owner})
      }).
      then(function(){
        return meta.isAttended.call(accounts[1])
      })
      .then(function(value){
        assert.equal(value, true)
      }).then(function(){
        return meta.attended.call()
      }).then(function(value){
        assert.equal(value, 1)
      })
      .then(done).catch(done);
    })

    it('isAttended is false if non owner calls attend function', function(done){
      var transaction = Math.pow(10,18);
      var twitterHandle = '@bighero6';
      var meta;
      var owner = accounts[0]
      Conference.new().then(function(_meta) {
        meta = _meta;
        return meta.register.sendTransaction(twitterHandle, {value:transaction});
      }).then(function() {
        return meta.attend.sendTransaction(accounts[1], {from:accounts[1]})
      }).then(function(){
        return meta.isAttended.call(accounts[1])
      }).then(function(value){
        assert.equal(value, false)
      }).then(function(){
        return meta.attended.call()
      }).then(function(value){
        assert.equal(value, 0)
        return meta.participants.call(accounts[1]);
      }).then(function(participant){
        assert.equal(participant[2], false)
      })
      .then(done).catch(done);
    })

    it('isAttended is false if attended function for the account is not called', function(done){
      var transaction = Math.pow(10,18);
      var twitterHandle = '@bighero6';
      var meta;
      Conference.new().then(function(_meta) {
        meta = _meta;
        return meta.register.sendTransaction(twitterHandle, {value:transaction});
      }).then(function() {
        return meta.isAttended.call(accounts[0])
      }).then(function(value){
        assert.equal(value, false)
      })
      .then(done).catch(done);
    })
  })

  describe('on payback', function(){
    // This test is very flakey. Fails when run all together but passes when run alone.
    it('cannot withdraw if non owner calls', function(done){
      var meta
      var deposit = web3.toWei(1, "ether");
      var gas = 1000000;
      var previousBalances = [];
      var twitterHandle = '@bighero6';
      var owner = accounts[0];
      var nonOwner = accounts[1];
      var registered = accounts[2]
      Conference.new().then(function(_meta) {
        meta = _meta;
        return meta.register.sendTransaction(twitterHandle, {from:registered, value:deposit, gas:gas})
      }).then(function(){
        // contract gets 1 ether
        assert.equal( web3.eth.getBalance(meta.address), web3.toWei(1, "ether"))
        return meta.attend.sendTransaction(registered, {gas:gas})
      }).then(function(){
        return meta.payback.sendTransaction({from:nonOwner, gas:gas})
      }).then(function(){
        previousBalances[0] = web3.eth.getBalance(registered);
        return meta.withdraw.sendTransaction({from:registered, gas:gas})
      }).then(function(transaction){
        var receipt = web3.eth.getTransactionReceipt(transaction)
        // money is still left on contract
        assert.equal(web3.eth.getBalance(meta.address).toNumber(), web3.toWei(1, "ether"))
        // did not get deposit back
        assert.equal(previousBalances[0] - receipt.gasUsed, web3.eth.getBalance(registered))
      })
      .then(done).catch(done);
    })

    it('cannot withdraw if you did not attend', function(done){
      var meta
      var transaction = web3.toWei(1, "ether");
      var gas = 1000000;
      var previousBalances = [];
      var twitterHandle = '@bighero6';
      var notAttended = accounts[2];
      var attended = accounts[1];
      var owner = accounts[0];

      Conference.new().then(function(_meta) {
        meta = _meta;
        return meta.register.sendTransaction(twitterHandle, {from:attended, value:transaction, gas:gas})
      }).then(function(){
        // contract gets 1 ether
        assert.equal( web3.eth.getBalance(meta.address), web3.toWei(1, "ether"))
        return meta.attend.sendTransaction(attended, {gas:gas})
      }).then(function(){
        return meta.payback.sendTransaction({from:owner, gas:gas})
      }).then(function(){
        previousBalances[0] = web3.eth.getBalance(notAttended);
        return meta.withdraw.sendTransaction({from:notAttended, gas:gas})
      }).then(function(transaction){
        var receipt = web3.eth.getTransactionReceipt(transaction)
        // money is still left on contract
        assert.equal(web3.eth.getBalance(meta.address).toNumber(), web3.toWei(1, "ether"))
        // did not get deposit back
        assert.equal(previousBalances[0] - receipt.gasUsed, web3.eth.getBalance(notAttended))
      })
      .then(done).catch(done);
    })

    it('can withdraw if you attend', function(done){
      var meta = Conference.deployed();
      var transaction = web3.toWei(1, "ether");
      var gas = 1000000;
      var previousBalances = [];
      var twitterHandle = '@bighero6';

      var balanceDiff = function(index){
        var realDiff = web3.fromWei(web3.eth.getBalance(accounts[index]).minus(previousBalances[index]), "ether");
        // Ignore small diff introduced by gas price;
        var roundedDiff = Math.round(realDiff * 1000) / 1000;
        return roundedDiff;
      }
      Conference.new().then(function(_meta) {
        meta = _meta;
        return meta.register.sendTransaction(twitterHandle, {from:accounts[0], value:transaction, gas:gas})
      }).then(function() {
        return meta.register.sendTransaction('@Cpt_Reliable', {from:accounts[1], value:transaction, gas:gas})
      }).then(function(){
        return meta.register.sendTransaction('@FLAKEY_99p', {from:accounts[2], value:transaction, gas:gas})
      }).then(function(){
        // contract gets 3 ethers
        assert.equal( web3.eth.getBalance(meta.address), web3.toWei(3, "ether"))
        // only account 0 and 1 attend
      }).then(function(){
        return meta.attend.sendTransaction(accounts[0], {gas:gas})
      }).then(function(){
        return meta.attend.sendTransaction(accounts[1], {gas:gas})
      }).then(function(){
        return meta.payback.sendTransaction({from:accounts[0], gas:gas})
      }).then(function(){
        previousBalances[0] = web3.eth.getBalance(accounts[0]);
        previousBalances[1] = web3.eth.getBalance(accounts[1]);
        previousBalances[2] = web3.eth.getBalance(accounts[2]);
        return meta.withdraw.sendTransaction({from:accounts[0]})
      }).then(function(transaction){
        assert.equal(balanceDiff(0), 1.5)
        return meta.withdraw.sendTransaction({from:accounts[1]})
      }).then(function(transaction){
        assert.equal(balanceDiff(1), 1.5)
        return meta.withdraw.sendTransaction({from:accounts[2]})
      }).then(function(transaction){
        assert.equal(balanceDiff(2), 0)
        // no money is left on contract
        assert.equal(web3.eth.getBalance(meta.address).toNumber(), web3.toWei(0, "ether"))
        return meta.participants.call(accounts[0]);
      }).then(function(participant){
        // Got some money
        assert.equal(participant[3], web3.toWei(1.5, "ether"))
        assert.equal(participant[4], true)
        return meta.participants.call(accounts[1]);
      }).then(function(participant){
        // Got some money
        assert.equal(participant[3], web3.toWei(1.5, "ether"))
        assert.equal(participant[4], true)
        return meta.participants.call(accounts[2]);
      }).then(function(participant){
        // Got no money
        assert.equal(participant[3], 0)
        assert.equal(participant[4], false)
      }).then(done).catch(done);
    })

    it('cannot register any more', function(done){
      var meta;
      var transaction = web3.toWei(1, "ether");
      var gas = 1000000;
      var twitterHandle = '@bighero6';
      var owner = accounts[0];
      var currentRegistered;

      Conference.new().then(function(_meta) {
        meta = _meta;
        return meta.register.sendTransaction(twitterHandle, {from:accounts[0], value:transaction, gas:gas})
      }).then(function(){
        // contract gets 1 ether
        assert.equal( web3.eth.getBalance(meta.address), web3.toWei(1, "ether"))
        return meta.attend.sendTransaction(accounts[0], {gas:gas})
      }).then(function(){
        return meta.payback.sendTransaction({from:owner, gas:gas})
      }).then(function(){
        return meta.registered.call()
      }).then(function(registered){
        currentRegistered = registered
        return meta.register.sendTransaction('some handler', {from:accounts[1], value:transaction, gas:gas})
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
  })

  describe('on cancel', function(){
    it('cannot be canceld if non owner calls', function(done){
      var meta
      var transaction = web3.toWei(1, "ether");
      var gas = 1000000;
      var previousBalances = [];
      var twitterHandle = '@bighero6';
      var nonOwner = accounts[1];

      Conference.new().then(function(_meta) {
        meta = _meta;
        return meta.register.sendTransaction(twitterHandle, {from:accounts[0], value:transaction, gas:gas})
      }).then(function(){
        // contract gets 1 ether
        assert.equal( web3.eth.getBalance(meta.address), web3.toWei(1, "ether"))
        // only account 0 and 1 attend
      }).then(function(){
        previousBalances[0] = web3.eth.getBalance(accounts[0]);
        return meta.cancel.sendTransaction({from:nonOwner, gas:gas})
      }).then(function(){
        // money is still left on contract
        assert.equal(web3.eth.getBalance(meta.address).toNumber(), web3.toWei(1, "ether"))
        // did not get deposit back
        assert.equal(previousBalances[0].toNumber(), web3.eth.getBalance(accounts[0]).toNumber())
      })
      .then(done).catch(done);
    })

    it('everybody receives refund', function(done){
      var meta
      var transaction = web3.toWei(1, "ether");
      var gas = 1000000;
      var previousBalances = [];
      var twitterHandle = '@bighero6';

      var balanceDiff = function(index){
        var realDiff = web3.fromWei(web3.eth.getBalance(accounts[index]).minus(previousBalances[index]), "ether");
        // Ignore small diff introduced by gas price;
        var roundedDiff = Math.round(realDiff * 1000) / 1000;
        return roundedDiff;
      }
      // 3 registrations
      Conference.new().then(function(_meta) {
        meta = _meta;
        return meta.register.sendTransaction(twitterHandle, {from:accounts[0], value:transaction, gas:gas})
      }).then(function() {
        return meta.register.sendTransaction('@Cpt_Reliable', {from:accounts[1], value:transaction, gas:gas})
      }).then(function(){
        return meta.register.sendTransaction('@FLAKEY_99p', {from:accounts[2], value:transaction, gas:gas})
      }).then(function(){
        // contract gets 3 ethers
        assert.equal( web3.eth.getBalance(meta.address), web3.toWei(3, "ether"))
        // only account 0 and 1 attend
      }).then(function(){
        return meta.attend.sendTransaction(accounts[0], {gas:gas})
      }).then(function(){
        return meta.attend.sendTransaction(accounts[1], {gas:gas})
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
        assert.equal(web3.eth.getBalance(meta.address).toNumber(), web3.toWei(0, "ether"))
        // got deposit back
        assert.equal(balanceDiff(0), 1)
        assert.equal(balanceDiff(1), 1)
        assert.equal(balanceDiff(2), 1)
      })
      .then(done).catch(done);
    })

    it('cannot register any more', function(done){
      var meta;
      var transaction = web3.toWei(1, "ether");
      var gas = 1000000;
      var twitterHandle = '@bighero6';
      var owner = accounts[0];
      var currentRegistered;

      Conference.new().then(function(_meta) {
        meta = _meta;
      }).then(function(){
        return meta.cancel.sendTransaction({from:owner, gas:gas})
      }).then(function(){
        return meta.registered.call()
      }).then(function(registered){
        currentRegistered = registered
        return meta.register.sendTransaction('some handler', {from:accounts[1], value:transaction, gas:gas})
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
      var transaction = web3.toWei(1, "ether");
      var gas = 1000000;
      var twitterHandle = '@bighero6';
      var owner = accounts[0];
      var currentRegistered;

      Conference.new().then(function(_meta) {
        meta = _meta;
        return meta.register.sendTransaction(twitterHandle, {from:accounts[0], value:transaction, gas:gas})
      }).then(function(){
        // contract gets 1 ether
        assert.equal( web3.eth.getBalance(meta.address), web3.toWei(1, "ether"))
        return meta.attend.sendTransaction(accounts[0], {gas:gas})
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
        assert.equal(currentRegistered.toNumber(), registered.toNumber())
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
      var transaction = web3.toWei(1, "ether");
      var gas = 1000000;
      var previousBalances = [];
      var twitterHandle = '@bighero6';
      var owner = accounts[0];
      var registered = accounts[1];
      var notRegistered = accounts[2];
      Conference.new().then(function(_meta) {
        meta = _meta;
        return meta.register.sendTransaction(twitterHandle, {from:registered, value:transaction, gas:gas})
      }).then(function(){
        assert.equal( web3.eth.getBalance(meta.address), web3.toWei(1, "ether"))
      }).then(function(){
        previousBalances[0] = web3.eth.getBalance(notRegistered);
        return meta.cancel.sendTransaction({from:owner, gas:gas})
      }).then(function(){
        return meta.withdraw.sendTransaction({from:notRegistered, gas:gas})
      }).then(function(transaction){
        var receipt = web3.eth.getTransactionReceipt(transaction)
        // money is still left on contract
        assert.equal(web3.eth.getBalance(meta.address).toNumber(), web3.toWei(1, "ether"))
        // did not get deposit back
        assert.equal(previousBalances[0].toNumber() - receipt.gasUsed, web3.eth.getBalance(notRegistered).toNumber())
      })
      .then(done).catch(done);
    })

    it('cannot withdraw twice', function(done){
      var meta
      var transaction = web3.toWei(1, "ether");
      var gas = 1000000;
      var twitterHandle = '@bighero6';
      var owner = accounts[0];
      var registered = accounts[1];
      Conference.new().then(function(_meta) {
        meta = _meta;
        return meta.register.sendTransaction(twitterHandle, {from:owner, value:transaction, gas:gas})
      }).then(function(){
        return meta.register.sendTransaction(twitterHandle, {from:registered, value:transaction, gas:gas})
      }).then(function(){
        assert.equal( web3.eth.getBalance(meta.address), web3.toWei(2, "ether"))
      }).then(function(){
        return meta.cancel.sendTransaction({from:owner, gas:gas})
      }).then(function(){
        return meta.withdraw.sendTransaction({from:registered, gas:gas})
      }).then(function(transaction){
        return meta.withdraw.sendTransaction({from:registered, gas:gas})
      }).then(function(transaction){
        // only 1 ether is taken out
        assert.equal(web3.eth.getBalance(meta.address).toNumber(), web3.toWei(1, "ether"))
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
      Conference.new(10).then(function(meta) {
        return meta.coolingPeriod.call();
      }).then(function(coolingPeriod){
        assert.equal(coolingPeriod.toNumber(), 10)
      })
      .then(done).catch(done);
    })

    it('cannot be cleared by non owner', function(done){
      let meta;
      var transaction = Math.pow(10,18);
      let owner = accounts[0]
      let nonOwner = accounts[1]
      Conference.new().then(function(_meta) {
        meta = _meta
        return meta.register.sendTransaction('one', {value:transaction});
      }).then(function(){
        assert.equal( web3.eth.getBalance(meta.address), web3.toWei(1, "ether"))
        return meta.clear.sendTransaction('one', {from:nonOwner});
      }).then(function(){
        assert.equal(web3.eth.getBalance(meta.address).toNumber(), web3.toWei(1, "ether"))
      })
      .then(done).catch(done);
    })

    it('cannot be cleared if event is not ended', function(done){
      let meta;
      var transaction = Math.pow(10,18);
      let owner = accounts[0]
      Conference.new().then(function(_meta) {
        meta = _meta
        return meta.register.sendTransaction('one', {value:transaction});
      }).then(function(){
        assert.equal( web3.eth.getBalance(meta.address), web3.toWei(1, "ether"))
        return meta.clear.sendTransaction('one', {from:owner});
      }).then(function(){
        assert.equal(web3.eth.getBalance(meta.address).toNumber(), web3.toWei(1, "ether"))
      })
      .then(done).catch(done);
    })

    it('cannot be cleared if cooling period is not passed', function(done){
      let meta;
      var transaction = Math.pow(10,18);
      let owner = accounts[0]
      Conference.new().then(function(_meta) {
        meta = _meta
        return meta.register.sendTransaction('one', {value:transaction});
      }).then(function(){
        return meta.cancel.sendTransaction({from:owner});
      }).then(function(){
        return meta.ended.call()
      }).then(function(ended){
        assert.equal(ended, true)
        assert.equal( web3.eth.getBalance(meta.address), web3.toWei(1, "ether"))
        return meta.clear.sendTransaction('one', {from:owner});
      }).then(function(){
        assert.equal(web3.eth.getBalance(meta.address).toNumber(), web3.toWei(1, "ether"))
      })
      .then(done).catch(done);
    })

    it('owner receives the remaining if cooling period is passed', function(done){
      let meta;
      var transaction = Math.pow(10,18);
      let owner = accounts[0]
      Conference.new(1).then(function(_meta) {
        meta = _meta
        return meta.register.sendTransaction('one', {value:transaction});
      }).then(function(){
        return meta.cancel.sendTransaction({from:owner});
      }).then(function(){
        return meta.ended.call()
      }).then(function(ended){
        assert.equal(ended, true)
        assert.equal(web3.eth.getBalance(meta.address), web3.toWei(1, "ether"))
        var previousBalance = web3.eth.getBalance(owner);
        setTimeout(function(){
          meta.clear.sendTransaction('one', {from:owner}).then(function(transaction){
            var receipt = web3.eth.getTransactionReceipt(transaction)
            assert.equal(web3.eth.getBalance(meta.address).toNumber(), web3.toWei(0, "ether"))
            var diff = web3.eth.getBalance(owner) - previousBalance + receipt.gasUsed
            // hard to find the exact gas usage of when sending money back to owner.
            var roundedDiff = Math.round(diff / 100000) * 100000;
            assert.equal(roundedDiff , web3.toWei(1, "ether"))
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
