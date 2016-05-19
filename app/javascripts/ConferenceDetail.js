import React from 'react';
import {List, ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';

class ConferenceDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount(){
    // Initialize
    this.props.getDetail(model =>{
      this.setState(model);
    });

    // Listen to watcher event.
    this.props.eventEmitter.on('change', model => {
      this.setState(model);
    });
  }

  toEther(value){
    return this.props.web3.fromWei(value, "ether").toString();
  }

  toNumber(value){
    if(value) return value.toNumber();
  }

  render() {
    return (
      <div>
        <Subheader>Party Info</Subheader>
        <List>
          <ListItem primaryText="Name" secondaryText={this.state.name} />
          <ListItem primaryText="Deposit" secondaryText={this.toEther(this.state.deposit)} />
        </List>
        <Divider />
        <Subheader>Current stake</Subheader>
        <List>
          <ListItem primaryText="Pot" secondaryText={this.toEther(this.state.pot)} />
          <ListItem primaryText="Balance" secondaryText={this.toEther(this.state.balance)} />
          <ListItem primaryText="Registered" secondaryText={this.toNumber(this.state.registered)} />
          <ListItem primaryText="Attended" secondaryText={this.toNumber(this.state.attended)} />
        </List>
      </div>
    );
  }
}

export default ConferenceDetail;
