import React from 'react';
import ReactDOM from 'react-dom';
import {List, ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';
import Paper from 'material-ui/Paper';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import Avatar from 'material-ui/Avatar';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import math from 'mathjs';
import participantStatus from '../util/participantStatus';
import NameSearch from './NameSearch';

const getTwitterIcon = (name) =>(
  <Avatar style={{verticalAlign:'middle'}} src={`https://avatars.io/twitter/${name}`} size={26} />
)

const styles = {
  paperRight:{
    flex: 3,
    textAlign: 'center',
  }
};

class Participants extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      accounts:[],
      keyword: null,
      address: null,
      participants:[],
      attendees:[],
      detail:{},
      etherscan_url:null
    };
  }

  componentDidMount(){
    // Initialize
    this.props.getParticipants(participants =>{
      this.setState({participants});
    });

    this.props.eventEmitter.on('search', keyword => {
      this.setState({ keyword: keyword });
    });

    this.props.eventEmitter.on('change', _ => {
      console.log('CHANGE', _);
      this.props.getParticipants(participants =>{
        this.setState({participants});
      });
    });
    this.props.eventEmitter.on('accounts_received', accounts => {
      this.setState({
        address:accounts[0],
        accounts:accounts
      })
    });
    this.props.eventEmitter.on('detail', detail => {
      this.setState({detail:detail});
    })

    this.props.eventEmitter.on('network', network => {
      this.setState({
        etherscan_url: network.etherscan_url
      });
    })
    this.props.eventEmitter.on('attendees', attendees => {
      // Resets after clicking 'attend' button.
      if(attendees.length != this.state.attendees.length){
        this.setState({
          attendees:[]
        })
      }
    });
  }

  isAdmin(){
    return this.state.detail.admins.includes(this.state.address) || (this.state.detail.owner == this.state.address);
  }

  isUser(participant){
    return this.state.accounts.includes(participant.address);
  }

  toNumber(value){
    if(value) return value.toNumber();
  }

  handleSearchField(event){
    this.setState({
      keyword: event.target.value
    });  
  }

  handleAttendees(participantAddress, event, isInputChecked){
    if (isInputChecked) {
      this.state.attendees.push(participantAddress)
    }else{
      this.state.attendees = this.state.attendees.filter(function(a){
        return a != participantAddress;
      })
    }
    this.props.eventEmitter.emit('attendees', this.state.attendees);
    return true;
  }

  yesNo(participant){
    if(participant.attended) {
      return 'Yes';
    }else{
      if(this.isAdmin() && !this.state.detail.ended){
        return (
          <Checkbox
            onCheck={this.handleAttendees.bind(this, participant.address)}
          />
        )
      }else{
        return '';
      }
    }
  }

  displayBalance(participant){
    var message = participantStatus(participant, this.state.detail);
    console.log('status', message);
    let color, amount;
    switch(message) {
    case 'Won':
    case 'Earned':
      color = 'green';
      amount = web3.fromWei(this.state.detail.payoutAmount.toNumber());
      break;
    case 'Lost':
      color = 'red';
      amount = 0;
      break;
    default :
      color = 'black';
      amount = 0;
    }
    if (amount != 0) {
      var amountToDisplay = math.round(amount, 3).toString()
    }

    return(
      <span style={{color:color}}>
        { amountToDisplay } {message}
      </span>
    )
  }

  displayParticipants(){
    if(!this.state.detail.name) return(
      <TableRowColumn width={100} >
        <p>
          <h5>No info available.</h5>
          The reason are more likely to be one of the followings.
          <ul>
            <li>
              You are not connected to the correct Ethereum network with correct options.
            </li>
            <li>
              Your local node is out of sync (may take a few hours if this is your first time using Ethereum).
            </li>
          </ul>
          Please follow the instructions at 'About' page to solve.
        </p>
      </TableRowColumn>
    )
    if(this.state.participants.length > 0){
      var state = this.state;
      return this.state.participants.filter((participant) => {
        if(state.keyword && state.keyword.length >=3){
          return !!(participant.name.match(state.keyword)) || !!(participant.address.match(state.keyword))
        }else{
          return true
        }
      }).map((participant) => {
        var participantAddress;
        if (this.state.etherscan_url) {
          participantAddress = (
            (<a target='_blank' href={ `${this.state.etherscan_url}/address/${participant.address}` }>{participant.address.slice(0,5)}...</a>)
          )
        }else{
          participantAddress = (
            `${participant.address.slice(0,5)}...`
          )
        }
        return (
          <TableRow>
            <TableRowColumn width={50}>
              {getTwitterIcon(participant.name)}
              <span style={{paddingLeft:'1em'}}><a target='_blank' href={ `https://twitter.com/${participant.name}` }>{participant.name}</a> </span>
                ({participantAddress})
              </TableRowColumn>
            <TableRowColumn width={10} >{this.yesNo(participant)}</TableRowColumn>
            <TableRowColumn width={20} >
              <span>
                { this.displayBalance(participant) }
              </span>
            </TableRowColumn>
          </TableRow>
        )
      })
    }else{
      return(<TableRowColumn style={{textAlign:'center'}} width={100} >No one has registered yet. Be the first to register by typing your twitter handle and press 'Register'</TableRowColumn>)
    }
  }

  render() {
    return (
      <Paper zDepth={1} style={styles.paperRight}>
          <h4>Participants</h4>

          <NameSearch
            eventEmitter={this.props.eventEmitter}
            handleSearchField={this.handleSearchField.bind(this)}
          />

          <Table>
            <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
              <TableRow>
                <TableHeaderColumn width={50} >Name</TableHeaderColumn>
                <TableHeaderColumn width={10} >Attended</TableHeaderColumn>
                <TableHeaderColumn width={20} >Payout</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false}>
              {this.displayParticipants()}
            </TableBody>
          </Table>
      </Paper>
    );
  }
}
export default Participants;
