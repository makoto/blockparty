import React from 'react';
import {List, ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Paper from 'material-ui/Paper';
import PeopleOutlineIcon from 'material-ui/svg-icons/social/people-outline';
import PeopleIcon from 'material-ui/svg-icons/social/people';
import EventIcon from 'material-ui/svg-icons/action/event';
import IconButton from 'material-ui/IconButton';
import Avatar from 'material-ui/Avatar';

const getEtherIcon = () =>(
  <Avatar src="https://15254b2dcaab7f5478ab-24461f391e20b7336331d5789078af53.ssl.cf1.rackcdn.com/ethereum.vanillaforums.com/favicon_85d47ba50743e3c3.ico" size={26} />
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
    this.state = {};
  }

  componentDidMount(){
    // Initialize
    this.props.getDetail(model =>{
      this.setState(model);
    })

    // If the app failed to get detail from contract (meaning either connecting
    // to wrong network or the contract id does not match to the one deployed),
    // it will show instruction page.
    setTimeout(function(){
      if(typeof(this.state.name) == 'undefined'){
        this.props.eventEmitter.emit('instruction');
      }
    }.bind(this), 1000)

    // Listen to watcher event.
    this.props.eventEmitter.on('change', model => {
      this.setState(model);
    });
    this.serverRequest = $.get('https://www.cryptocompare.com/api/data/price?fsym=ETH&tsyms=GBP', function (result) {
      this.setState({
        rate: result.Data[0].Price
      });
    }.bind(this));
  }

  toEther(value){
    if(value){
      return this.props.math.round(this.props.web3.fromWei(value, "ether").toNumber(), 3).toString();
    }
  }

  toNumber(value){
    if(value) return value.toNumber();
  }

  youGet(){
    if(this.state.payout && this.state.payout.toNumber() > 0){
      return (
        <span> (including {this.props.math.round(this.props.web3.fromWei(this.state.payout - this.state.deposit, "ether"), 3)} bonus)</span>
      )
    }
  }

  getContractBalance(){
    return this.props.web3.fromWei(this.props.web3.eth.getBalance(this.props.contract.address), "ether").toNumber();
  }

  render() {
    return (
      <Paper zDepth={1} style={styles.paperLeft}>
        <h4 style={{textAlign:'center'}}>Event Info</h4>
        <List>
          <ListItem innerDivStyle={styles.innerDiv} insetChildren={true} disabled={true}
            primaryText={
              <p>Name<span style={styles.list}>{this.state.name} (<a target='_blank' href={ `https://testnet.etherscan.io/address/${this.props.contract.address}` }>{this.props.contract.address.slice(0,5)}...</a>)</span></p>
            }
          />
          <ListItem innerDivStyle={styles.innerDiv} leftIcon={<EventIcon />} disabled={true}
            primaryText={
              <p>Date<span style={styles.list}>23/5/2016</span></p>
            }
          />
          <ListItem innerDivStyle={styles.innerDiv} leftIcon={getEtherIcon()} disabled={true}
            primaryText={
              <p>Deposit<span style={styles.list}>{this.toEther(this.state.deposit)} (&pound;{this.state.rate})</span></p>
            }
          />
        <Divider />
          <ListItem innerDivStyle={styles.innerDiv} leftIcon={getEtherIcon()} disabled={true}
          primaryText={
            <p>Pot<span style={styles.list}>{this.toEther(this.state.balance)}</span></p>
          }
          />
          <ListItem innerDivStyle={styles.innerDiv} leftIcon={getEtherIcon()} disabled={true}
            primaryText={
              <p>Payout<span style={styles.list}>{this.toEther(this.state.payout)}{this.youGet()}</span></p>
            }
          />
          <ListItem innerDivStyle={styles.innerDiv} leftIcon={<PeopleOutlineIcon />} disabled={true}
          primaryText={
            <p>Registered<span style={styles.list}>{this.toNumber(this.state.registered)}</span></p>
          }
          />
          <ListItem innerDivStyle={styles.innerDiv} leftIcon={<PeopleIcon />} disabled={true}
          primaryText={
            <p>Attended<span style={styles.list}>{this.toNumber(this.state.attended)}</span></p>
          }
          />
        </List>
      </Paper>
    );
  }
}

export default ConferenceDetail;
