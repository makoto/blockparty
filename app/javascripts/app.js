// import {} from "../stylesheets/app.css";
import React from 'react';
import ReactDOM from 'react-dom';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import ConferenceDetail from './ConferenceDetail';
import FormInput from './FormInput';
import IconButton from 'material-ui/IconButton';
import AccountBalanceIcon from 'material-ui/svg-icons/action/account-balance'
import AppBar from 'material-ui/AppBar';
import Subheader from 'material-ui/Subheader';
import EventEmitter from 'event-emitter';

const App = (props) => (
  <div>
    <MuiThemeProvider muiTheme={getMuiTheme()}>
      <div>
        <AppBar
          title="Block Party - NO BLOCK NO PARTY"
          iconElementLeft={<IconButton><AccountBalanceIcon /></IconButton>}
        />
        <ConferenceDetail eventEmitter={eventEmitter} getDetail={getDetail} web3={web3} />
        <Subheader>Registration</Subheader>
        <FormInput action={action} />
      </div>
    </MuiThemeProvider>
  </div>
);

// Some settings to connect to Ethereum.
const Pudding = require("ether-pudding");
const web3 = new Web3();
Pudding.setWeb3(web3);
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
Conference.load(Pudding);
const contract = Conference.deployed();
const eventEmitter = EventEmitter()

// Functions to interact with contract
function getDetail(callback){
  Promise.all(['name', 'deposit', 'pot', 'balance', 'registered', 'attended'].map(name => {
    return contract[name].call();
  })).then(values => {
    callback({
      'name': values[0],
      'deposit': values[1],
      'pot': values[2],
      'balance': values[3],
      'registered': values[4],
      'attended': values[5]
    });
  }).catch(errors => {
    console.log('errors', errors);
  });
}

function getContractBalance(){
  return web3.fromWei(web3.eth.getBalance(contract.address), "ether").toNumber();
}

function getParticipants(callback){
  contract.registered.call().then(function(value){
    let participantsArray = []
    for (var i = 1; i <= value.toNumber(); i++) {
      participantsArray.push(i);
    }
    Promise.all(participantsArray.map(index => {
      return contract.participantsIndex.call(index).then(function(address){
        return contract.participants.call(address);
      })
    })).then(function(participants){
      return participants.map(participant => {
        var balance =  web3.fromWei(web3.eth.getBalance(participant[0]), "ether").toNumber();
        var object =  {
          address: participant[0],
          attended: participant[1],
          balance: balance
        }
        console.log('participant', object);
        return object
      })
    }).then(function(participant){ if(participant) callback(participant); })
  })
}

function action(name, address, callback) {
  var amount = Math.pow(10,18)
  console.log('name', name, 'address', address, 'callback', callback)
  var gas = 2000000;
  contract[name](null, {from:address, value:amount, gas:gas}).then(function() {
    getDetail(function(model){
      eventEmitter.emit('change', model);
    });
    if(callback) callback();
  }).catch(function(e) {
    console.log(e);
  });
}

function watchEvent(){
  var event = contract.allEvents({fromBlock: 0, toBlock: 'latest'}).watch(function(error, result){
    if (error) {
      console.log("Error: " + error);
    } else {

    }
  });
}

// Log all available accounts
web3.eth.getAccounts(function(err, accs) {
  window.accounts = accs;
  window.web3 = web3;
  window.getParticipants = getParticipants;
  window.contract = contract;
  if (err != null) {
    alert("There was an error fetching your accounts.");
    return;
  }
  if (accs.length == 0) {
    alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
    return;
  }
  console.log(accs);
});


window.onload = function() {
  ReactDOM.render(
    <App getDetail={getDetail} eventEmitter={eventEmitter} action={action} web3={web3} />,
    document.getElementById('app')
  );
}
