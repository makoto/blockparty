import React from 'react';
import ReactDOM from 'react-dom';
import {List, ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';
import Paper from 'material-ui/Paper';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import Avatar from 'material-ui/Avatar';

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
      participants:[],
      detail:{}
    };
  }

  componentDidMount(){
    // Initialize
    this.props.getParticipants(participants =>{
      this.setState({participants});
    });

    this.props.eventEmitter.on('change', model => {
      this.props.getParticipants(participants =>{
        this.setState({participants});
      });
    });
    this.props.getDetail(detail => {
      this.setState({
        detail:detail
      })
    })
    this.props.eventEmitter.on('change', detail => {
      this.setState({detail:detail});
    });
  }

  toNumber(value){
    if(value) return value.toNumber();
  }

  yesNo(value){
    if(value) {
      return 'Yes';
    }else{
      return 'No';
    }
  }

  displayBalance(amount){
    let color = 'black';
    let message = '';
    if (amount > 0){
      color = 'green';
      message = 'Earned';
    }
    if (amount < 0){
      color = 'red' ;
      message = 'Lost';
    }
    return(
      <span style={{color:color}}>
        {message} { this.props.math.round(amount, 3).toString() }
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
              You are not connected to the correct Ethereum network (testnet) with correct options.
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
      return this.state.participants.map((participant) => {
        return (
          <TableRow>
            <TableRowColumn width={50}>
              {getTwitterIcon(participant.name)}
              <span style={{paddingLeft:'1em'}}><a target='_blank' href={ `https://twitter.com/${participant.name}` }>{participant.name}</a> </span>
              (<a target='_blank' href={ `https://testnet.etherscan.io/address/${participant.address}` }>{participant.address.slice(0,5)}...</a>)
              </TableRowColumn>
            <TableRowColumn width={10} >{this.yesNo(participant.attended)}</TableRowColumn>
            <TableRowColumn width={10} >
              { this.displayBalance(web3.fromWei(this.toNumber(participant.payout))) }
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
          <Table>
            <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
              <TableRow>
                <TableHeaderColumn width={50} >Name</TableHeaderColumn>
                <TableHeaderColumn width={10} >Attend?</TableHeaderColumn>
                <TableHeaderColumn width={10} >Payout</TableHeaderColumn>
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
