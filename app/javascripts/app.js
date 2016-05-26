// import {} from "../stylesheets/app.css";
import 'react-notifications/lib/notifications.css';
import React from 'react';
import ReactDOM from 'react-dom';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import FlatButton from 'material-ui/FlatButton';
import ConferenceDetail from './ConferenceDetail';
import FormInput from './FormInput';
import Notification from './Notification';
import Instruction from './Instruction';
import Participants from './Participants';
import Avatar from 'material-ui/Avatar';
import AppBar from 'material-ui/AppBar';
import {List, ListItem} from 'material-ui/List';
import EventEmitter from 'event-emitter';
import Paper from 'material-ui/Paper';
import math from 'mathjs';
import injectTapEventPlugin from 'react-tap-event-plugin';

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
  Promise.all(['name', 'deposit', 'payout', 'balance', 'registered', 'attended'].map(name => {
    return contract[name].call();
  })).then(values => {

    var detail = {
      'name': values[0],
      'deposit': values[1],
      'payout': values[2],
      'balance': values[3],
      'registered': values[4],
      'attended': values[5],
      'contractBalance': web3.fromWei(web3.eth.getBalance(contract.address), "ether").toNumber()
    }

    if(detail.registered.toNumber() > 0 && detail.attended.toNumber() > 0 && detail.payout.toNumber() > 0){
      detail.canPayback = true
    }
    if(detail.registered.toNumber() > 0 && detail.attended.toNumber() > 0 && detail.payout.toNumber() == 0){
      detail.canReset = true
    }
    if(!detail.canReset){
      detail.canRegister = true
    }

    callback(detail);
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
        var balance =  web3.fromWei(web3.eth.getBalance(participant[1]), "ether").toNumber();
        var object =  {
          name: participant[0],
          address: participant[1],
          attended: participant[2],
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
window.eventEmitter = eventEmitter;
function action(name, address, argument) {
  var options = {from:address, gas:window.gas}
  eventEmitter.emit('notification', {status:'info', message:'Requested'});
  if (name == "register") {
    options.value = Math.pow(10,18)
  }

  console.log('name', name, 'address', address, 'argument', argument)
  contract[name](argument, options).then(function() {
    getDetail(function(model){
      eventEmitter.emit('change', model);
      eventEmitter.emit('notification', {status:'success', message:'Successfully Updated'});
    });
  }).catch(function(e) {
    eventEmitter.emit('notification', {status:'error', message:'Error has occored'});
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

function getAccounts(callback){
  web3.eth.getAccounts(function(err, accs) {
    if (err != null) {
      eventEmitter.emit('instruction')
      return;
    }
    if (accs.length == 0) {
      var message = "Couldn't get any accounts! Make sure your Ethereum client is configured correctly.";
      eventEmitter.emit('notification', {status:'error', message:message});
      return;
    }
    callback(accs);
  })
}

const App = (props) => (
  <div>
    <MuiThemeProvider muiTheme={getMuiTheme()}>
      <div>
        <AppBar titleStyle={{textAlign:'center', fontSize:'xx-large', fontFamily:'Lobster'}} style={{backgroundColor:"#607D8B"}}
          title={
            <span>Block Party<span style={{fontSize:'small', fontFamily:'sans-serif'}}> - NO BLOCK NO PARTY -</span></span>
          }
          iconElementLeft={<Avatar src="/images/nightclub-white.png" size="50" backgroundColor="white" />}
          iconElementRight={<FlatButton label="About" onClick={ () => {eventEmitter.emit('instruction')}} />}
        />
        <Instruction eventEmitter={eventEmitter} />
        <Notification eventEmitter={eventEmitter} />
        <div style={styles.div}>
          <ConferenceDetail eventEmitter={eventEmitter} getDetail={getDetail} web3={web3} math={math} contract={contract} web3={web3} />
          <Participants eventEmitter={eventEmitter} getParticipants={getParticipants} web3={web3} math={math} />
        </div>
        <FormInput eventEmitter={eventEmitter} getAccounts = {getAccounts} getDetail = {getDetail} action = {action} />
      </div>
    </MuiThemeProvider>
  </div>
);

window.web3 = web3;
window.onload = function() {
  console.log("LOAD")
  injectTapEventPlugin();
  ReactDOM.render(
    <App
      getAccounts = {getAccounts}
      getDetail = {getDetail}
      eventEmitter = {eventEmitter}
      action = {action}
      getParticipants = {getParticipants}
      web3 = {web3}
      math = {math}
      contract={contract}
    />,
    document.getElementById('app')
  );
}
