
let Conference = artifacts.require("./Conference.sol");
var providerURL = 'http://localhost:8545';
// var providerURL = 'https://rinkeby.infura.io';
var HDWalletProvider = require('truffle-hdwallet-provider');
var mnemonic = 'one two three four five six seven eight nine ten foo bar baz foobar';
let participants = 200;
provider = new HDWalletProvider(mnemonic, providerURL,  address_index=0, num_addresses=participants);
var object = provider.wallets;
let accounts = []
for (const key in provider.wallets) {
    if (object.hasOwnProperty(key)) {
        const element = object[key];
        let address = "0x" + element.getAddress().toString("hex");
        accounts.push(key);
        console.log(key, address);
    }
}

// Give eth to new accounts
let value =  web3.toWei(0.1, 'ether');
let gasPrice = web3.toWei(10, 'gwei');
let sender = web3.eth.accounts[0];

for (let i = 157; i < accounts.length; i++) {
    const receiver = accounts[i];
    const balance = parseFloat(web3.fromWei(web3.eth.getBalance(receiver).toNumber(), 'ether'))
    console.log(i, 'balance', balance, 'value', value)
    if (web3.eth.getBalance(receiver).toNumber() < value){
        console.log(i, 'Sending ', value, ' ether from ', sender, ' to ', receiver);
        web3.eth.sendTransaction({from:sender, to:receiver, value:value, gasPrice:gasPrice});
    }else{
        console.log(i, 'receiver', receiver, ' already has', balance);
    }
}

module.exports = async function(callback) {
    conference = await Conference.deployed();
    let limit = accounts.length + 40;
    console.log('setting limit to', limit)
    try{
        await conference.setLimitOfParticipants(limit, {from:web3.eth.accounts[0], gasPrice:gasPrice});
    }catch(err){
        console.log('err', err);
    }
    console.log('the current limit is', await conference.limitOfParticipants.call())
    Conference.setProvider(provider);
    conference = await Conference.deployed();

    for (var i = 0; i < accounts.length; i++) {
      var deposit = await conference.deposit.call();
      var registered = await conference.participants.call(accounts[i])
      if(registered[1] == accounts[i] ){
        console.log(accounts[i], 'already registered as ', registered[0])
      }else{
        console.log(accounts[i], 'not registered')

        receiver = accounts[i];
        balance = parseFloat(web3.fromWei(web3.eth.getBalance(receiver).toNumber(), 'ether'))
        console.log(i, 'balance', balance, 'value', value)
        if (web3.eth.getBalance(receiver).toNumber() < value){
            console.log(i, 'Sending ', value, ' ether from ', sender, ' to ', receiver);
            web3.eth.sendTransaction({from:sender, to:receiver, value:value, gasPrice:gasPrice});
        }else{
            console.log(i, 'receiver', receiver, ' already has', balance);
        }


        let user = 'user' + i;
        console.log('registering', user, accounts[i]);
        try{
            await conference.register({from:accounts[i], value:deposit, gasPrice:gasPrice})
        }catch(err){
            console.log('err', err);
        }
        registered = await conference.registered.call();
        console.log('registered', registered.toString())
      }
    }
}
