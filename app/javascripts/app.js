import {} from "../stylesheets/app.css";
// Failing to load Pudding automatically
var Pudding = require("ether-pudding");

var web3 = new Web3();
Pudding.setWeb3(web3);
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
Conference.load(Pudding);

var math = require('mathjs');
console.log('hello', math.round(math.e, 3));
var accounts;
var account;
var balance;

function setStatus(message) {
  var status = document.getElementById("status");
  status.innerHTML = message;
};

function setAttribute(name) {
  var meta = Conference.deployed();
  meta[name].call().then(function(value) {
    var element = document.getElementById(name);
    element.innerHTML = value.valueOf();
  }).catch(function(e) {
    console.log(e);
    setStatus("Error getting balance; see log.");
  });
};

function action(name) {
  var meta = Conference.deployed();
  var amount = Math.pow(10,18)
  var participant = document.getElementById("participant").value;
  console.log('amount', amount)
  setStatus("Initiating transaction... (please wait)");

  meta[name](null, {from:participant, value:amount}).then(function() {
    setStatus("Transaction complete!");
    setAttribute('name');
    setAttribute('deposit');
    setAttribute('pot');
    setAttribute('balance');
    setAttribute('registered');
    setAttribute('attended');
  }).catch(function(e) {
    console.log(e);
    setStatus("Error sending coin; see log.");
  });
};
window.action = action;
window.setAttribute = setAttribute;
window.setStatus = setStatus;

window.onload = function() {
  web3.eth.getAccounts(function(err, accs) {
    if (err != null) {
      alert("There was an error fetching your accounts.");
      return;
    }

    if (accs.length == 0) {
      alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
      return;
    }
    accounts = accs;
    console.log(accounts);
    account = accounts[0];
    setAttribute('name');
    setAttribute('deposit');
    setAttribute('pot');
    setAttribute('balance');
    setAttribute('registered');
    setAttribute('attended');
  });
}
