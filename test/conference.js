contract('Conference', function(accounts) {
  describe('on creation', function(){
    it('shold have name', function(done){
      var meta = Conference.deployed();
      meta.name.call().then(function(name) {
        assert.equal(name, 'CodeUp');
      }).then(done).catch(done);
    })

    it('shold have registered', function(done){
      var meta = Conference.deployed();
      meta.registered.call().then(function(value) {
        assert.equal(value, 0);
      }).then(done).catch(done);
    })

    it('shold have attended', function(done){
      var meta = Conference.deployed();
      meta.attended.call().then(function(value) {
        assert.equal(value, 0);
      }).then(done).catch(done);
    })

    it('shold have balance', function(done){
      var meta = Conference.deployed();
      meta.balance.call().then(function(value) {
        assert.equal(value, 0);
      }).then(done).catch(done);
    })
  })

  describe('on registration', function(){
    it('shold increment registered', function(done){
      var meta = Conference.deployed();
      var account = accounts[0]
      var transaction = Math.pow(10,18);
      meta.register.sendTransaction({value:transaction}).then(function() {
        return meta.registered.call();
      })
      .then(function(value){
        assert.equal(value, 1);
      })
      .then(done).catch(done);
    })

    it('shold increase balance', function(done){
      var meta = Conference.deployed();
      var account = accounts[0]
      var beforeContractBalance = web3.eth.getBalance(meta.address);
      var transaction = Math.pow(10,18);
      meta.register.sendTransaction({value:transaction}).then(function() {
        return meta.balance.call();
      })
      .then(function(value){
        assert.equal(value.toString() - beforeContractBalance, transaction);
      })
      .then(done).catch(done);
    })

    it('shold be registered for same account', function(done){
      var meta = Conference.deployed();
      var account = accounts[0]
      var transaction = Math.pow(10,18);
      meta.register.sendTransaction({value:transaction}).then(function() {
        return meta.isRegistered.call();
      })
      .then(function(value){
        assert.equal(value, true);
      })
      .then(done).catch(done);
    })

    it('shold not be registered for different accounts', function(done){
      var meta = Conference.deployed();
      var transaction = Math.pow(10,18);
      meta.register.sendTransaction({from:accounts[1], value:transaction}).then(function() {
        return meta.isRegistered.call({from:accounts[2]});
      })
      .then(function(value){
        assert.equal(value, false);
      })
      .then(done).catch(done);
    })


    // Need to find out how to test when error is thrown.
    // it('shold throw error if 1 Ether is not sent', function(done){
    //   var meta = Conference.deployed();
    //   var account = accounts[0]
    //   var beforeAccountBalance = web3.eth.getBalance(account)
    //   var badTransaction = 5;
    //   meta.register.sendTransaction({from:account, value:badTransaction}).then(function() {
    //     var  accountBalance = web3.eth.getBalance(account)
    //      sender balance
    //     assert.equal(accountBalance.toString(), beforeAccountBalance.toString());
    //     contract balance
    //     var  contractBalance = web3.eth.getBalance(meta.address)
    //     assert.equal(contractBalance.toString(), 0);
    //   }).then(done).catch(done);
    // })
  })

  describe('on attend', function(){
    it('shold be attended', function(done){
      var meta = Conference.deployed();
      var transaction = Math.pow(10,18);
      meta.register.sendTransaction({value:transaction}).then(function() {
        return meta.attend.sendTransaction()
      }).then(function(){
        return meta.isAttended.call()
      }).then(function(value){
        assert.equal(value, true)
      })
      .then(done).catch(done);
    })

  })
});

// Testing them from `truffle console`
// var meta = Conference.deployed();
// web3.eth.defaultAccount = web3.eth.accounts[0];
// meta.registered.call().then(function(value) {
//   console.log('value', value.toString());
// })
