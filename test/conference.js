contract('Conference', function(accounts) {
  describe('on creation', function(){
    it('shold have name', function(done){
      Conference.new().then(function(meta) {
        return meta.name.call()
      }).then(function(name) {
        assert.equal(name, 'CodeUp');
      }).then(done).catch(done);
    })

    it('shold have registered', function(done){
      Conference.new().then(function(meta) {
        return meta.registered.call()
      }).then(function(value) {
        assert.equal(value, 0);
      }).then(done).catch(done);
    })

    it('shold have attended', function(done){
      Conference.new().then(function(meta) {
        return meta.attended.call()
      }).then(function(value) {
        assert.equal(value, 0);
      }).then(done).catch(done);
    })

    it('shold have balance', function(done){
      Conference.new().then(function(meta) {
        return meta.balance.call()
      }).then(function(value) {
        assert.equal(value, 0);
      }).then(done).catch(done);
    })
  })

  describe('on registration', function(){
    it('shold increment registered', function(done){
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

    it('shold increase balance', function(done){
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
        return meta.balance.call();
      })
      .then(function(value){
        assert.equal(value.toString() - beforeContractBalance, transaction);
      })
      .then(done).catch(done);
    })

    it('shold be registered for same account', function(done){
      var account = accounts[0]
      var transaction = Math.pow(10,18);
      var twitterHandle = '@bighero6';
      var meta;
      Conference.new().then(function(_meta) {
        meta = _meta;
        return meta.register.sendTransaction(twitterHandle, {value:transaction});
      }).then(function() {
        return meta.isRegistered.call();
      })
      .then(function(value){
        assert.equal(value, true);
      })
      .then(done).catch(done);
    })

    it('shold not be registered for different accounts', function(done){
      var transaction = Math.pow(10,18);
      var twitterHandle = '@bighero6';
      var meta;
      Conference.new().then(function(_meta) {
        meta = _meta;
        return meta.register.sendTransaction(twitterHandle, {from:accounts[0], value:transaction});
      }).then(function() {
        return meta.isRegistered.call({from:accounts[2]});
      })
      .then(function(value){
        assert.equal(value, false);
      })
      .then(done).catch(done);
    })

    it('shold not register if wrong amount of deposit is sent', function(done){
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
        return meta.isRegistered.call({from:accounts[0]});
      }).then(function(value){
        assert.equal(value, false);
      }).then(done).catch(done);
    })
  })

  describe('on attend', function(){
    it('shold be attended', function(done){
      var transaction = Math.pow(10,18);
      var twitterHandle = '@bighero6';
      var meta;
      Conference.new().then(function(_meta) {
        meta = _meta;
        return meta.register.sendTransaction(twitterHandle, {value:transaction});
      }).then(function() {
        return meta.attend.sendTransaction()
      }).then(function(){
        return meta.isAttended.call()
      }).then(function(value){
        assert.equal(value, true)
      }).then(function(){
        return meta.attended.call()
      }).then(function(value){
        assert.equal(value, 1)
      })
      .then(done).catch(done);
    })

    it('shold not be attended if have not called attended function', function(done){
      var transaction = Math.pow(10,18);
      var twitterHandle = '@bighero6';
      var meta;
      Conference.new().then(function(_meta) {
        meta = _meta;
        return meta.register.sendTransaction(twitterHandle, {value:transaction});
      }).then(function() {
        return meta.isAttended.call()
      }).then(function(value){
        assert.equal(value, false)
      })
      .then(done).catch(done);
    })
  })

  describe('on payback', function(){
    it('shold get money back only if you attend', function(done){
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
        return meta.attend.sendTransaction({from:accounts[0], gas:gas})
      }).then(function(){
        return meta.attend.sendTransaction({from:accounts[1], gas:gas})
      }).then(function(){
        previousBalances[0] = web3.eth.getBalance(accounts[0]);
        previousBalances[1] = web3.eth.getBalance(accounts[1]);
        previousBalances[2] = web3.eth.getBalance(accounts[2]);
        // payback gets 3 ehter / 2 = 1.5 each
        return meta.payback.sendTransaction({from:accounts[0], gas:gas})
      }).then(function(){
        // no money is left on contract
        assert.equal(web3.eth.getBalance(meta.address), web3.toWei(0, "ether"))
        // got some money
        assert.equal(balanceDiff(0), 1.5)
        assert.equal(balanceDiff(1), 1.5)
        // lost some money
        assert.equal(balanceDiff(2), 0)
        return meta.participants.call(accounts[0]);
      }).then(function(participant){
        // Got some money
        assert.equal(participant[3], web3.toWei(0.5, "ether"))
        return meta.participants.call(accounts[1]);
      }).then(function(participant){
        // Got some money
        assert.equal(participant[3], web3.toWei(0.5, "ether"))
        return meta.participants.call(accounts[2]);
      }).then(function(participant){
        // Lost some money
        assert.equal(participant[3], web3.toWei(-1, "ether"))
      })
      .then(done).catch(done);
    })
  })

  describe('on cancel', function(){
    it('shold get money back', function(done){
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
        return meta.attend.sendTransaction({from:accounts[0], gas:gas})
      }).then(function(){
        return meta.attend.sendTransaction({from:accounts[1], gas:gas})
      }).then(function(){
        previousBalances[0] = web3.eth.getBalance(accounts[0]);
        previousBalances[1] = web3.eth.getBalance(accounts[1]);
        previousBalances[2] = web3.eth.getBalance(accounts[2]);
        return meta.cancel.sendTransaction({from:accounts[0], gas:gas})
      }).then(function(){
        // no money is left on contract
        assert.equal(web3.eth.getBalance(meta.address), web3.toWei(0, "ether"))
        // got deposit back
        assert.equal(balanceDiff(0), 1)
        assert.equal(balanceDiff(1), 1)
        assert.equal(balanceDiff(2), 1)
      })
      .then(done).catch(done);
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
