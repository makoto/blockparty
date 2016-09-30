import React from 'react';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Paper from 'material-ui/Paper';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

const styles = {margin:12}

class FormInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      address:null,
      name:null,
      accounts:[],
      detail:{}
    };

    this.props.getAccounts(accounts => {
      this.setState({
        address:accounts[0],
        accounts:accounts
      })
    })
    this.props.getDetail(detail => {
      this.setState({
        detail:detail
      })
    })
    this.props.eventEmitter.on('change', detail => {
      console.log('DETAIL', detail)
      this.setState({detail:detail});
    });
  }

  handleAction(actionName) {
    this.setState({
      name: null,
    });
    this.props.action(actionName, this.state.address.trim(), this.state.name)
  }

  handleSelect(event,index,value){
    this.setState({
      address: value,
    });
  }

  isOwner(){
    return this.state.accounts.includes(this.state.detail.owner);
  }

  showRegister(){
    return this.state.detail.canRegister
  }

  showPayback(){
    return this.state.detail.canPayback
  }

  showCancel(){
    return this.state.detail.canCancel
  }

  showClear(){
    return this.state.detail.ended
  }

  handleName(e) {
    this.setState({
      name: e.target.value,
    });
  }

  render() {
    let adminButtons, registerButton, warningText;
    if(this.isOwner()){
      adminButtons = <span>
        <RaisedButton secondary={this.showPayback()} disabled={!this.showPayback()}
          label="Payback" style={styles}
          onClick={this.handleAction.bind(this, 'payback')}
        />
        <RaisedButton secondary={this.showCancel()} disabled={!this.showCancel()}
          label="Cancel" style={styles}
          onClick={this.handleAction.bind(this, 'cancel')}
        />
        <RaisedButton secondary={this.showClear()} disabled={!this.showClear()}
          label="Clear" style={styles}
          onClick={this.handleAction.bind(this, 'clear')}
        />
      </span>
    }

    var availableSpots = this.state.detail.limitOfParticipants - this.state.detail.registered;
    if(this.props.read_only){
      registerButton = <span>Connect via Mist/Metamask to be able to register.</span>
    }else if(this.state.accounts.length > 0){
      if(this.state.detail.ended){
        registerButton = <span>This even is over </span>
      }else if (availableSpots <= 0){
        registerButton = <span>No more spots left</span>
      }else{
        registerButton = <RaisedButton secondary={this.showRegister()} disabled={!this.showRegister()}
          label="Register" style={styles}
          onClick={this.handleAction.bind(this, 'register')}
        />
        warningText = <div style={{textAlign:'center', color:'red'}}>Please be aware that you <strong>cannot</strong> cancel once regiesterd. Please read FAQ section at ABOUT page on top right corner for more detail about this service.</div>
      }
    }else{
      registerButton = <span>No account is set</span>
    }

    return (
      <Paper zDepth={1}>
        <form>
          <TextField
            hintText="@twitter_handle"
            floatingLabelText="Twitter handle"
            floatingLabelFixed={true}
            value={this.state.name}
            onChange={this.handleName.bind(this)}
            style={{margin:'0 5px'}}
          />
          <SelectField
            value={this.state.address}
            onChange={this.handleSelect.bind(this)}
            floatingLabelText="Account address"
            floatingLabelFixed={true}
            style={{width:'25em', verticalAlign:'top', margin:'0 5px'}}
            >
            {
              this.state.accounts.map(account => {
                return (<MenuItem value={account} primaryText={account} />)
              })
            }
          </SelectField>
          {registerButton}
          {adminButtons}
        </form>
        {warningText}
      </Paper>
    );
  }
}

export default FormInput;
