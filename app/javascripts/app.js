// import {} from "../stylesheets/app.css";
import React from 'react';
import ReactDOM from 'react-dom';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import ConferenceDetail from './ConferenceDetail';
import FormInput from './FormInput';
import Participants from './Participants';
import Avatar from 'material-ui/Avatar';
import AppBar from 'material-ui/AppBar';
import {List, ListItem} from 'material-ui/List';
import EventEmitter from 'event-emitter';
import Paper from 'material-ui/Paper';
import math from 'mathjs';

const styles = {
  div:{
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row wrap',
    width: '100%'
  }
};

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
      'attended': values[5],
      'contractBalance': web3.fromWei(web3.eth.getBalance(contract.address), "ether").toNumber()
    });
  }).catch(errors => {
    console.log('errors', errors);
  });
}

function getParticipants(callback){
  contract.registered.call().then(value => {
    let participantsArray = []
    for (var i = 1; i <= value.toNumber(); i++) {
      participantsArray.push(i);
    }
    Promise.all(participantsArray.map(index => {
      return contract.participantsIndex.call(index).then(address => {
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
    }).then(participant => { if(participant) callback(participant); })
  })
}
var gas = 1000000;
window.gas = gas
function action(name, address, callback) {
  var options = {from:address, gas:window.gas}

  if (name == "register") {
    options.value = Math.pow(10,18)
  }

  console.log('name', name, 'address', address, 'callback', callback)
  contract[name](null, options).then(function() {
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
      console.log('watchEvent result', result);
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

const App = (props) => (
  <div>
    <MuiThemeProvider muiTheme={getMuiTheme()}>
      <div>
        <AppBar titleStyle={{textAlign:'center', fontSize:'xx-large', fontFamily:'Lobster'}} style={{backgroundColor:"#607D8B"}}
          title={
            <span>Block Party<span style={{fontSize:'small', fontFamily:'sans-serif'}}> - NO BLOCK NO PARTY -</span></span>
          }
          iconElementLeft={<Avatar src="/images/nightclub-white.png" size="50" backgroundColor="white" />}
        />
        <div style={styles.div}>
          <ConferenceDetail eventEmitter={eventEmitter} getDetail={getDetail} web3={web3} math={math} contract={contract} web3={web3} />
          <Participants eventEmitter={eventEmitter} getParticipants={getParticipants} web3={web3} math={math} />
        </div>
        <FormInput action={action} />
      </div>
    </MuiThemeProvider>
  </div>
);

window.onload = function() {
  ReactDOM.render(
    <App getDetail={getDetail} eventEmitter={eventEmitter} action={action} getParticipants={getParticipants} web3={web3} math={math} contract={contract} />,
    document.getElementById('app')
  );
}
