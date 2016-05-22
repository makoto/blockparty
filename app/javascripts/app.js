// import {} from "../stylesheets/app.css";
import React from 'react';
import ReactDOM from 'react-dom';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
// import ConferenceDetail from './ConferenceDetail';
// import FormInput from './FormInput';
import Avatar from 'material-ui/Avatar';
import Divider from 'material-ui/Divider';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import IconButton from 'material-ui/IconButton';
import AccountBalanceIcon from 'material-ui/svg-icons/action/account-balance'
import AppBar from 'material-ui/AppBar';
import {List, ListItem} from 'material-ui/List';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import PeopleOutlineIcon from 'material-ui/svg-icons/social/people-outline';
import PeopleIcon from 'material-ui/svg-icons/social/people';
import EventIcon from 'material-ui/svg-icons/action/event';

import Subheader from 'material-ui/Subheader';
// import EventEmitter from 'event-emitter';
import Paper from 'material-ui/Paper';

const styles = {
div:{
  display: 'flex',
  justifyContent: 'space-between',
  flexDirection: 'row wrap',
  width: '100%'
},
paperLeft:{
  flex: 2,
  height: '100%',
  textAlign: 'left',
  padding: 10
},
paperRight:{
  flex: 3,
  textAlign: 'center',
}
};

const getEtherIcon = () =>(
  <Avatar src="https://15254b2dcaab7f5478ab-24461f391e20b7336331d5789078af53.ssl.cf1.rackcdn.com/ethereum.vanillaforums.com/favicon_85d47ba50743e3c3.ico" size={26} />
)


const listStyles = {float:'right', color: 'grey', merginHight:1}
const buttonStyles = {margin:12}
const innerDivStyles = {paddingTop:1, paddingBottom:1, paddingRight:1}
const Layout = React.createClass({
 render(){
  return(
    <div>
      <AppBar titleStyle={{ textAlign:'center'}} style={{backgroundColor:"#607D8B"}}
        title="BLOCK PARTY - NO BLOCK NO PARTY"
        iconElementLeft={<Avatar src="https://cdn3.iconfinder.com/data/icons/hotel-facility/1024/ic_nightclub-512.png" size="50" backgroundColor="white" />}
      />
      <div style={styles.div}>
        <Paper zDepth={1} style={styles.paperLeft}>
          <h4 style={{textAlign:'center'}}>Event Info</h4>
          <List>
            <ListItem innerDivStyle={innerDivStyles} insetChildren={true}
              primaryText={
                <p>Name<span style={listStyles}>CodeUp</span></p>
              }
            />
            <ListItem innerDivStyle={innerDivStyles} leftIcon={<EventIcon />}
              primaryText={
                <p>Date<span style={listStyles}>23/5/2016</span></p>
              }
            />
            <ListItem innerDivStyle={innerDivStyles} leftIcon={getEtherIcon()}
              primaryText={
                <p>Deposit<span style={listStyles}>1(£7)</span></p>
              }
            />
          <Divider />
            <ListItem innerDivStyle={innerDivStyles} leftIcon={getEtherIcon()}
              primaryText={
                <p>Pot<span style={listStyles}>1</span></p>
              }
            />
            <ListItem innerDivStyle={innerDivStyles} leftIcon={getEtherIcon()}
            primaryText={
              <p>Balance<span style={listStyles}>1</span></p>
            }
            />
            <ListItem innerDivStyle={innerDivStyles} leftIcon={<PeopleOutlineIcon />}
            primaryText={
              <p>Registered<span style={listStyles}>1</span></p>
            }
            />
            <ListItem innerDivStyle={innerDivStyles} leftIcon={<PeopleIcon />}
            primaryText={
              <p>Attended<span style={listStyles}>1</span></p>
            }
            />

          </List>
        </Paper>
        <Paper zDepth={1} style={styles.paperRight}>
            <h4>Participants</h4>
            <Table>
              <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                <TableRow>
                  <TableHeaderColumn width={100} >Address</TableHeaderColumn>
                  <TableHeaderColumn width={10} >Balance</TableHeaderColumn>
                  <TableHeaderColumn width={10} >Attend?</TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody displayRowCheckbox={false}>
                <TableRow>
                  <TableRowColumn width={100} >9ccbabcae82457811c0d9c40f785beb690d27a21</TableRowColumn>
                  <TableRowColumn width={10} >124</TableRowColumn>
                  <TableRowColumn width={10} >Yes</TableRowColumn>
                </TableRow>
                <TableRow>
                  <TableRowColumn width={100} >25c84abcc57a558bba6a2586baa25ea6434f9a9fc</TableRowColumn>
                  <TableRowColumn width={10} >20</TableRowColumn>
                  <TableRowColumn width={10} >No</TableRowColumn>
                </TableRow>
              </TableBody>
            </Table>

        </Paper>
      </div>
      <Paper zDepth={1}>
        <form>
          <TextField  style={buttonStyles} fullWidth={true}
            hintText="Your Account Address"
          />
          <RaisedButton secondary={true}
            label="Register" style={buttonStyles}
          />
          <RaisedButton secondary={true}
            label="Attend" style={buttonStyles}
          />
          <RaisedButton secondary={true}
            label="Payback" style={buttonStyles}
          />
        </form>
      </Paper>
    </div>
  );
}
});

// const App = (props) => (
//   <div>
//     <MuiThemeProvider muiTheme={getMuiTheme()}>
//       <div>
//         <AppBar
//           title="Block Party - NO BLOCK NO PARTY"
//           iconElementLeft={<IconButton><AccountBalanceIcon /></IconButton>}
//         />
//         <Drawer open={true}>
//          <MenuItem>Menu Item</MenuItem>
//          <MenuItem>Menu Item 2</MenuItem>
//        </Drawer>
//         <ConferenceDetail eventEmitter={eventEmitter} getDetail={getDetail} web3={web3} />
//         <Subheader>Registration</Subheader>
//         <FormInput action={action} />
//       </div>
//     </MuiThemeProvider>
//   </div>
// );

const App = (props) => (
  <div>
    <MuiThemeProvider muiTheme={getMuiTheme()}>
      <Layout/>
    </MuiThemeProvider>
  </div>
);

// // Some settings to connect to Ethereum.
// const Pudding = require("ether-pudding");
// const web3 = new Web3();
// Pudding.setWeb3(web3);
// web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
// Conference.load(Pudding);
// const contract = Conference.deployed();
// const eventEmitter = EventEmitter()
//
// // Functions to interact with contract
// function getDetail(callback){
//   Promise.all(['name', 'deposit', 'pot', 'balance', 'registered', 'attended'].map(name => {
//     return contract[name].call();
//   })).then(values => {
//     callback({
//       'name': values[0],
//       'deposit': values[1],
//       'pot': values[2],
//       'balance': values[3],
//       'registered': values[4],
//       'attended': values[5]
//     });
//   }).catch(errors => {
//     console.log('errors', errors);
//   });
// }
//
// function getContractBalance(){
//   return web3.fromWei(web3.eth.getBalance(contract.address), "ether").toNumber();
// }
//
// function getParticipants(callback){
//   contract.registered.call().then(value => {
//     let participantsArray = []
//     for (var i = 1; i <= value.toNumber(); i++) {
//       participantsArray.push(i);
//     }
//     Promise.all(participantsArray.map(index => {
//       return contract.participantsIndex.call(index).then(address => {
//         return contract.participants.call(address);
//       })
//     })).then(function(participants){
//       return participants.map(participant => {
//         var balance =  web3.fromWei(web3.eth.getBalance(participant[0]), "ether").toNumber();
//         var object =  {
//           address: participant[0],
//           attended: participant[1],
//           balance: balance
//         }
//         console.log('participant', object);
//         return object
//       })
//     }).then(participant => { if(participant) callback(participant); })
//   })
// }
//
// function action(name, address, callback) {
//   var amount = Math.pow(10,18)
//   console.log('name', name, 'address', address, 'callback', callback)
//   var gas = 2000000;
//   contract[name](null, {from:address, value:amount, gas:gas}).then(function() {
//     getDetail(function(model){
//       eventEmitter.emit('change', model);
//     });
//     if(callback) callback();
//   }).catch(function(e) {
//     console.log(e);
//   });
// }
//
// function watchEvent(){
//   var event = contract.allEvents({fromBlock: 0, toBlock: 'latest'}).watch(function(error, result){
//     if (error) {
//       console.log("Error: " + error);
//     } else {
//
//     }
//   });
// }
//
// // Log all available accounts
// web3.eth.getAccounts(function(err, accs) {
//   window.accounts = accs;
//   window.web3 = web3;
//   window.getParticipants = getParticipants;
//   window.contract = contract;
//   if (err != null) {
//     alert("There was an error fetching your accounts.");
//     return;
//   }
//   if (accs.length == 0) {
//     alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
//     return;
//   }
//   console.log(accs);
// });


window.onload = function() {
  ReactDOM.render(
    // <App getDetail={getDetail} eventEmitter={eventEmitter} action={action} web3={web3} />,
    <App />,
    document.getElementById('app')
  );
}
