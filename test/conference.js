contract('Event', function(accounts) {
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

  it("should put 10000 Conference in the first account", function(done) {
    var meta = Conference.deployed();


    meta.getBalance.call(accounts[0]).then(function(balance) {
      assert.equal(balance.valueOf(), 10000, "10000 wasn't in the first account");
    }).then(done).catch(done);
  });
  it("should call a function that depends on a linked library  ", function(done){
    var meta = Conference.deployed();
    var ConferenceBalance;
    var ConferenceEthBalance;

    meta.getBalance.call(accounts[0]).then(function(outCoinBalance){
      ConferenceBalance = outCoinBalance.toNumber();
      return meta.getBalanceInEth.call(accounts[0]);
    }).then(function(outCoinBalanceEth){
      ConferenceEthBalance = outCoinBalanceEth.toNumber();

    }).then(function(){
      assert.equal(ConferenceEthBalance,2*ConferenceBalance,"Library function returned unexpeced function, linkage may be broken");

    }).then(done).catch(done);
  });
  it("should send coin correctly", function(done) {
    var meta = Conference.deployed();

    // Get initial balances of first and second account.
    var account_one = accounts[0];
    var account_two = accounts[1];

    var account_one_starting_balance;
    var account_two_starting_balance;
    var account_one_ending_balance;
    var account_two_ending_balance;

    var amount = 10;

    meta.getBalance.call(account_one).then(function(balance) {
      account_one_starting_balance = balance.toNumber();
      return meta.getBalance.call(account_two);
    }).then(function(balance) {
      account_two_starting_balance = balance.toNumber();
      return meta.sendCoin(account_two, amount, {from: account_one});
    }).then(function() {
      return meta.getBalance.call(account_one);
    }).then(function(balance) {
      account_one_ending_balance = balance.toNumber();
      return meta.getBalance.call(account_two);
    }).then(function(balance) {
      account_two_ending_balance = balance.toNumber();

      assert.equal(account_one_ending_balance, account_one_starting_balance - amount, "Amount wasn't correctly taken from the sender");
      assert.equal(account_two_ending_balance, account_two_starting_balance + amount, "Amount wasn't correctly sent to the receiver");
    }).then(done).catch(done);
  });
});
