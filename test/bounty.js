// Test originally from https://github.com/PeterBorah/smart-contract-security-examples/blob/master/test/bounty.js
contract('Bounty', function(accounts) {

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
     var bounty = Bounty.deployed();
     sendTransaction(accounts[0], bounty.address, 1).
     then(function(){
       assert.equal(web3.eth.getBalance(bounty.address).toNumber(), 0)
       done();
     }).catch(done);
  })

  it("should not pay out the bounty if you don't find a bug", function(done) {
    var bounty = Bounty.deployed();
    var errorEvent = bounty.Error({});
    errorEvent.watch(function(err, result) {
      console.log('Error', result.args)
      errorEvent.stopWatching();
    })
    var event = bounty.TargetCreation({});
    event.watch(function(err, result) {
      event.stopWatching();
      if (err) { throw err }

      var target = Conference.at(result.args.createdAddress);
      // call some function of the target.
      target.register('username', {value: web3.toWei('1', 'ether')}).
        then(function() { return bounty.claim(target.address)}).
        then(function() { return bounty.claimed() }).
        then(function(result) {
          assert.equal(result, false);
        }).
        then(function() { return bounty.totalBounty() }).
        then(function(result) {
          assert.equal(result, 10000);
          done();
        }).catch(done);
    });

    bounty.contribute({value: 10000}).
      then(function() { return bounty.createTarget() }).
      catch(done);
  });

  it.skip("should pay out the bounty if you find the deposit bug", function(done) {
    var bounty = Bounty.deployed();
    var errorEvent = bounty.Error({});
    errorEvent.watch(function(err, result) {
      console.log('Error', result.args)
      errorEvent.stopWatching();
    })

    var event = bounty.TargetCreation({});
    event.watch(function(err, result) {
      event.stopWatching();
      if (err) { throw err }

      var target = Conference.at(result.args.createdAddress);
      // Do something to cause security bug
      target.register('username', {value: web3.toWei('1', 'ether')}).
        then(function() { return bounty.claim(target.address)}).
        then(function() { return bounty.claimed() }).
        then(function(result) {
          assert.equal(result, true);
        }).
        then(function() { return bounty.totalBounty() }).
        then(function(result) {
          assert.equal(result, 0);
          errorEvent.stopWatching();
          done();
        }).catch(done);
    });

    bounty.contribute({value: 10000}).
      then(function() { return bounty.createTarget() }).
      catch(done);

  });
});
