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

let provider;

// mist loading proposal https://gist.github.com/frozeman/fbc7465d0b0e6c1c4c23
if(typeof web3 !== 'undefined'){   // eg: If accessed via mist
  provider = web3.currentProvider; // Keep provider info given from mist `web3` object
  web3 = new Web3;                 // Re-instantiate `web3` using `Web3` from Dapp
}else{
  provider = new Web3.providers.HttpProvider("http://localhost:8545");
  let web3 = new Web3;             // Define and instantiate `web3` if accessed from web browser
  window.web3 = web3;
}
web3.setProvider(provider);
Conference.setProvider(provider);

const contract = Conference.deployed();
const eventEmitter = EventEmitter()

// Functions to interact with contract
function getDetail(callback){
  Promise.all(['name', 'deposit', 'payout', 'balance', 'registered', 'attended', 'owner', 'ended'].map(attributeName => {
    return contract[attributeName].call();
  })).then(values => {
    var detail = {
      'name': values[0],
      'deposit': values[1],
      'payout': values[2],
      'balance': values[3],
      'registered': values[4],
      'attended': values[5],
      'owner': values[6],
      'ended': values[7],
      'contractBalance': web3.fromWei(web3.eth.getBalance(contract.address), "ether").toNumber()
    }

    if(detail.ended){
      detail.canRegister = false
      detail.canAttend = false
      detail.canPayback = false
      detail.canCancel = false
    }else{
      if(detail.registered.toNumber() > 0 ){
        detail.canAttend = true
      }

      if(detail.registered.toNumber() > 0 && detail.attended.toNumber() > 0 && detail.payout.toNumber() > 0){
        detail.canPayback = true
      }
      detail.canRegister = true
      detail.canCancel = true
    }

    callback(detail);
  })
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
          iconElementLeft={<Avatar src="/images/nightclub-white.png" size={50} backgroundColor="rgb(96, 125, 139)" />}
          iconElementRight={<FlatButton label="About" onClick={ () => {eventEmitter.emit('instruction')}} />}
        />
        <Instruction eventEmitter={eventEmitter} />
        <Notification eventEmitter={eventEmitter} />
        <div style={styles.div}>
          <ConferenceDetail eventEmitter={eventEmitter} getDetail={getDetail} web3={web3} math={math} contract={contract} web3={web3} />
          <Participants eventEmitter={eventEmitter} getDetail={getDetail} getParticipants={getParticipants} web3={web3} math={math} />
        </div>
        <FormInput eventEmitter={eventEmitter} getAccounts = {getAccounts} getDetail = {getDetail} action = {action} />
      </div>
    </MuiThemeProvider>
  </div>
);

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
