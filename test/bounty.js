// Test originally from https://github.com/PeterBorah/smart-contract-security-examples/blob/master/test/bounty.js
contract('Bounty', function(accounts) {
  it("should not pay out the bounty if you don't find a bug", function(done) {
    var bounty = Bounty.deployed();
    var errorEvent = bounty.Error({});
    errorEvent.watch(function(err, result) {
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

  it("should pay out the bounty if you find the deposit bug", function(done) {
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
    var errorEvent = bounty.Error({});
    errorEvent.watch(function(err, result) {
      errorEvent.stopWatching();
    })
    var event = bounty.TargetCreation({});
    event.watch(function(err, result) {
      event.stopWatching();
      if (err) { throw err }

      var target = Conference.at(result.args.createdAddress);
      // Security bug!! It should not allow users to throw randowm Ether at you.
      sendTransaction(accounts[0], target.address, 10).then(function(){
        return target.register('username', {value: web3.toWei('1', 'ether')})
      }).
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
