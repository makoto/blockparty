contract('Event', function(accounts) {
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
      meta.register.sendTransaction().then(function() {
        meta.registered.call().then(function(value){
          assert.equal(value, 1);
        })
      }).then(done).catch(done);
    })

    it('shold increase balance', function(done){
      var meta = Conference.deployed();
      meta.register.sendTransaction().then(function() {
        meta.balance.call().then(function(value){
          assert.equal(value.toString(), 1);
        })
      }).then(done).catch(done);
    })
  })
});

// Testing them from `truffle console`
// var meta = Conference.deployed();
// web3.eth.defaultAccount = web3.eth.accounts[0];
// meta.registered.call().then(function(value) {
//   console.log('value', value.toString());
// })
