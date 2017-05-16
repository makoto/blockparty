import "./stylesheets/app.css";
import 'react-notifications/lib/notifications.css';
import React from 'react';
import EventEmitter from 'event-emitter';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Web3 from 'web3';
import TruffleContract from 'truffle-contract'
import artifacts from '../build/contracts/Conference.json'
import ConferenceDetail from './components/ConferenceDetail';
import FormInput from './components/FormInput';
import Notification from './components/Notification';
import Instruction from './components/Instruction';
import Participants from './components/Participants';
import NetworkLabel from './components/NetworkLabel';
import Data from './components/Data';

import Avatar from 'material-ui/Avatar';
import AppBar from 'material-ui/AppBar';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import FlatButton from 'material-ui/FlatButton';
import $ from 'jquery';

function setup(){
  return new Promise(function(resolve,reject){
    let provider;
    let read_only = false;
    let url = "http://localhost:8545";
    // mist loading proposal https://gist.github.com/frozeman/fbc7465d0b0e6c1c4c23
    if(typeof web3 !== 'undefined'){   // eg: If accessed via mist
      provider = web3.currentProvider; // Keep provider info given from mist `web3` object
      web3 = new Web3();                 // Re-instantiate `web3` using `Web3` from Dapp
      web3.setProvider(provider);
      web3.version.getNetwork(function(err, network_id){
        resolve({web3, provider, read_only, network_id})
      })
    }else{
      provider = new Web3.providers.HttpProvider(url);
      let web3 = new Web3();             // Define and instantiate `web3` if accessed from web browser
      $.get(url, function(res){
        console.log('Success', res)
        // the endpoint is active
      }).fail(function(error){
        console.log('Fail', error)
        if(error.readyState == 4 && (error.status == 400 || error.status == 200)){
          // the endpoint is active
          console.log('Success')
        }else{
          console.log('The endspoint is not active. Falling back to read_only mode')
          url = 'https://eth3.augur.net'
          read_only = true
        }
      }).error(function(error){
        console.log('Error', error)
      }).always(function(){
        console.log('url', url)
        provider = new Web3.providers.HttpProvider(url);
        let web3 = new Web3;             // Define and instantiate `web3` if accessed from web browser
        console.log('Web3 is set', web3, provider)
        web3.setProvider(provider);
        web3.version.getNetwork(function(err, network_id){
          resolve({web3, provider, read_only, network_id})
        })
      })
    }
  });
}

window.onload = function() {
  setup().then(({provider, web3, read_only, network_id}) => {
    var Conference  = TruffleContract(artifacts);
    Conference.setProvider(provider);
    Conference.setNetwork(network_id);
    Data[0].address = Conference.address;
    let metadata;
    let contractAddress = document.baseURI.split('#')[1]
    if (contractAddress && contractAddress.length == 42) {
      metadata = Data.filter(function(d){
        return d.address == contractAddress
      })[0];
    }else{
      contractAddress = Conference.address;

      metadata = Data[0];
    }
    var contract = Conference.at(contractAddress);
    window.contract = contract
    window.web3 = web3
    const eventEmitter = EventEmitter()

    var network_obj;
    switch (network_id) {
      case '1':
        network_obj = {
          name: 'MAINNET',
          etherscan_url: 'https://etherscan.io'
        }
        break;
      case '3':
        network_obj = {
          name: 'TESTNET',
          etherscan_url: 'https://testnet.etherscan.io'
        }
        break;
      default:
        network_obj = {
          name: 'PRIVATE NET',
          etherscan_url: null
        }

    }

    function getBalance(address){
      return new Promise(function(resolve,reject){
        web3.eth.getBalance(address, function(err, result){
          resolve(result)
        })
      });
    }

    // Functions to interact with contract
    function getDetail(){
      var values;
      contract.then(function(instance){
        Promise.all(['name', 'deposit', 'payout', 'totalBalance', 'registered', 'attended', 'owner', 'ended', 'limitOfParticipants', 'invitation', 'invitationRepository', 'confirmation', 'confirmationRepository'].map(attributeName => {
          return instance[attributeName].call();
        })).then(_values => {
          values = _values;
          return getBalance(instance.address)
        }).then(contractBalance => {
          var detail = {
            'name': values[0],
            'deposit': values[1],
            'payout': values[2],
            'totalBalance': values[3],
            'registered': values[4],
            'attended': values[5],
            'owner': values[6],
            'ended': values[7],
            'limitOfParticipants': values[8],
            'invitation': values[9],
            'invitationRepository': values[10],
            'confirmation': values[11],
            'confirmationRepository': values[12],
            'contractBalance': web3.fromWei(contractBalance, "ether").toNumber(),
            'date': metadata.date,
            'map_url': metadata.map_url,
            'location_text': metadata.location_text,
            'description_text': metadata.description_text
          }
          if(detail.ended){
            detail.canRegister = false
            detail.canAttend = false
            detail.canPayback = false
            detail.canCancel = false
            detail.canWithdraw = true
          }else{
            if(detail.registered.toNumber() > 0 ){
              detail.canAttend = true
            }

            if(detail.registered.toNumber() > 0 && detail.attended.toNumber() > 0 && detail.payout.toNumber() > 0){
              detail.canPayback = true
            }
            detail.canRegister = true
            detail.canCancel = true
            detail.canWithdraw = false
          }
          console.log('detail', detail)
          eventEmitter.emit('detail', detail);
        })
      })
    }

    function getParticipants(callback){
      var instance;
      contract
        .then(function(_instance){
          instance = _instance;
          return instance.registered.call();
        })
        .then(value => {
          let participantsArray = []
          for (var i = 1; i <= value.toNumber(); i++) {
            participantsArray.push(i);
          }
          Promise.all(participantsArray.map(index => {
            return instance.participantsIndex.call(index).then(address => {
              return instance.participants.call(address);
            })
          })).then(function(participants){
            return participants.map(participant => {
              var object =  {
                name: participant[0],
                address: participant[1],
                attended: participant[2],
                payout: participant[3],
                paid: participant[4]
              }
              return object
            })
          }).then(participant => {
            if(participant) {
              eventEmitter.emit('participants_updated', participant);
              callback(participant);
            }
          })
        })
    }
    var gas = 1000000;
    window.gas = gas
    window.eventEmitter = eventEmitter;
    function action(name, address, args) {
      var options = {from:address, gas:window.gas}
      eventEmitter.emit('notification', {status:'info', message:'Requested'});
      if (!args) {
        args = [];
      }
      if (name == "register" || name == "registerWithInvitation") {
        options.value = Math.pow(10,17);
      }
      args.push(options);
      contract.then(function(instance){
        return instance[name].apply(this, args);
      })
      .then(function(trx) {
        eventEmitter.emit('notification', {status:'success', message:'Successfully Updated'});
        eventEmitter.emit('change');
        getDetail();
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

    function getAccounts(){
      if(read_only){
        eventEmitter.emit('accounts_received', []);
        eventEmitter.emit('instruction');
        return false;
      }
      console.log('this is not read only!')
      web3.eth.getAccounts(function(err, accs) {
        if (err != null) {
          eventEmitter.emit('instruction');
          return;
        }
        if (accs.length == 0) {
          var message = "Couldn't get any accounts! Make sure your Ethereum client is configured correctly.";
          eventEmitter.emit('notification', {status:'error', message:message});
          return;
        }
        eventEmitter.emit('accounts_received', accs)
      })
    }
    let networkLabel = <NetworkLabel eventEmitter={eventEmitter} read_only={read_only} />;

    const App = (props) => (
      <div>
        <MuiThemeProvider muiTheme={getMuiTheme()}>
          <div>
            <AppBar titleStyle={{textAlign:'center', fontSize:'xx-large', fontFamily:'Lobster'}} style={{backgroundColor:"#607D8B"}}
              title={
                <span>Block Party<span style={{fontSize:'small', fontFamily:'sans-serif'}}> - NO BLOCK NO PARTY -</span></span>
              }
              iconElementLeft={<Avatar src={require('./images/nightclub-white.png')} size={50} backgroundColor="rgb(96, 125, 139)" />}
              iconElementRight={
                <span>
                  {networkLabel}
                  <FlatButton style={{color:'white'}} label="About" onClick={ () => {eventEmitter.emit('instruction')}} />
                </span>
              }
            />

            <Instruction eventEmitter={eventEmitter} />
            <Notification eventEmitter={eventEmitter} />
            <div className='container' class='foo'>
              <ConferenceDetail eventEmitter={eventEmitter} getDetail={getDetail} web3={web3} contract={contract} web3={web3} />
              <Participants eventEmitter={eventEmitter} getDetail={getDetail} getParticipants={getParticipants} getAccounts={getAccounts} action={action} web3={web3}  />
            </div>
            <FormInput read_only={read_only} eventEmitter={eventEmitter} getAccounts={getAccounts} getDetail={getDetail} action={action} />
          </div>
        </MuiThemeProvider>
      </div>
    );

    injectTapEventPlugin();
    ReactDOM.render(
      <App
        getAccounts={getAccounts}
        getDetail={getDetail}
        eventEmitter={eventEmitter}
        action={action}
        getParticipants={getParticipants}
        web3={web3}
        contract={contract}
      />,
      document.getElementById('app')
    );
    window.getAccounts = window.getAccounts;

    // Looks like calling the function immediately returns
    // bignumber.js:1177 Uncaught BigNumber Error: new BigNumber() not a base 16 number:
    setTimeout(getAccounts, 100)
    setTimeout(getDetail, 100)
    eventEmitter.emit('network', network_obj);
  })
}
