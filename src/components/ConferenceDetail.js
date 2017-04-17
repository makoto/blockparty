import React from 'react';
import {List, ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Paper from 'material-ui/Paper';
import PeopleOutlineIcon from 'material-ui/svg-icons/social/people-outline';
import PeopleIcon from 'material-ui/svg-icons/social/people';
import EventIcon from 'material-ui/svg-icons/action/event';
import PlaceIcon from 'material-ui/svg-icons/maps/place';
import DirectionIcon from 'material-ui/svg-icons/maps/directions';
import IconButton from 'material-ui/IconButton';
import Avatar from 'material-ui/Avatar';
import math from 'mathjs';
import $ from 'jquery';

const getEtherIcon = () =>(
  <Avatar src={require('../images/ethereum.ico')} size={26} backgroundColor="white" />
)

const styles = {
  paperLeft:{
    flex: 2,
    height: '100%',
    textAlign: 'left',
    padding: 10
  },
  list:{
    float:'right', color: 'grey', merginHight:1
  },
  innerDiv:{
    paddingTop:1, paddingBottom:1, paddingRight:1
  }
};


class ConferenceDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      etherscan_url:null
    };
  }

  componentDidMount(){
    // Initialize
    this.props.eventEmitter.on('detail', detail => {
      this.setState(detail);
    })

    this.props.eventEmitter.on('network', network => {
      this.setState({
        etherscan_url: network.etherscan_url
      });
    })

    // If the app failed to get detail from contract (meaning either connecting
    // to wrong network or the contract id does not match to the one deployed),
    // it will show instruction page.
    setTimeout(function(){
      if(typeof(this.state.name) == 'undefined'){
        this.props.eventEmitter.emit('instruction');
      }
    }.bind(this), 5000)

    // Listen to watcher event.
    this.serverRequest = $.get('https://www.cryptocompare.com/api/data/price?fsym=ETH&tsyms=GBP', function (result) {
      this.setState({
        rate: result.Data[0].Price
      });
    }.bind(this));
  }

  toEther(value){
    if(value){
      return math.round(this.props.web3.fromWei(value, "ether").toNumber(), 3).toString();
    }
  }

  toNumber(value){
    if(value) return value.toNumber();
  }

  getNameContent(name, contractAddress){
    if(name){
      if (this.state.etherscan_url) {
        return (
          <span style={styles.list}>
            {name} (<a target='_blank' href={ `${this.state.etherscan_url}/address/${contractAddress}` }>{contractAddress.slice(0,5)}...</a>)
          </span>
        )
      }else{
        return (
          <span style={styles.list}>
            {name} ({contractAddress.slice(0,5)}...)
          </span>
        )
      }
    }else{
      return (
        <span style={styles.list}>
          The contract {contractAddress.slice(0,10)}... not available
        </span>
      )
    }
  }

  getDateContent(name){
    if(name){
      var d = new Date();
      var curr_date = d.getDate();
      var curr_month = d.getMonth() + 1; //Months are zero based
      var curr_year = d.getFullYear();
      var date = `${curr_date}-${curr_month}-${curr_year}`

      return (
        <span style={styles.list}>{name}</span>
      )
    }else{
      return (
        <span style={styles.list}>No info available</span>
      )
    }
  }

  getDepositContent(deposit, rate){
    if(deposit){
      return (
        <span style={styles.list}>{this.toEther(deposit)} (&pound;{rate})</span>
      )
    }else{
      return (
        <span style={styles.list}>No info available</span>
      )
    }
  }

  render() {
    let attendancyStatus;
    if (this.state.ended) {
      attendancyStatus = <p>Attended<span style={styles.list}>{this.toNumber(this.state.attended)}</span></p>
    }else{
      attendancyStatus = <p>Going (spots left)<span style={styles.list}>{this.toNumber(this.state.registered)}({this.toNumber(this.state.limitOfParticipants) - this.toNumber(this.state.registered)})</span></p>
    }

    return (
      <Paper zDepth={1} style={styles.paperLeft}>
        <h4 style={{textAlign:'center'}}>Event Info</h4>
        <List>
          <ListItem innerDivStyle={styles.innerDiv} insetChildren={true} disabled={true}
            primaryText={
              <p>Name{this.getNameContent(this.state.name, this.props.contract.address)}</p>
            }
          />
          <ListItem innerDivStyle={styles.innerDiv} leftIcon={<EventIcon />} disabled={true}
            primaryText={
              <p>Date{this.getDateContent(this.state.date)}</p>
            }
          />
          <ListItem innerDivStyle={styles.innerDiv} leftIcon={<PlaceIcon />} disabled={true}
            primaryText={
              <p>Location
                <span style={styles.list}>
                  <a target='_blank' href={this.state.map_url}>{this.state.location_text}</a>
                </span>
              </p>
            }
          />
          <ListItem innerDivStyle={styles.innerDiv} leftIcon={<DirectionIcon />} disabled={true}
            primaryText={
              <p>Description
                <span style={styles.list}
                  dangerouslySetInnerHTML={ {__html:this.state.description_text} }
                />
              </p>
            }
          />
          <ListItem innerDivStyle={styles.innerDiv} leftIcon={getEtherIcon()} disabled={true}
            primaryText={
              <p>Deposit{this.getDepositContent(this.state.deposit, this.state.rate)}</p>
            }
          />
        <Divider />
          <ListItem innerDivStyle={styles.innerDiv} leftIcon={getEtherIcon()} disabled={true}
          primaryText={
            <p>Pot<span style={styles.list}>{this.toEther(this.state.totalBalance)}</span></p>
          }
          />
          <ListItem innerDivStyle={styles.innerDiv} leftIcon={<PeopleIcon />} disabled={true}
          primaryText={attendancyStatus}
          />
        </List>
      </Paper>
    );
  }
}

export default ConferenceDetail;
