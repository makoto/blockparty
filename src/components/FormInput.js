import React from 'react';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Paper from 'material-ui/Paper';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import participantStatus from '../util/participantStatus';
import cryptoBrowserify from 'crypto-browserify';

const styles = {margin:12}

class FormInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      address:null,
      name:null,
      accounts:[],
      attendees:[],
      participants:[],
      detail:{}
    };
  }

  componentDidMount(){
    this.props.eventEmitter.on('accounts_received', accounts => {
      this.setState({
        address:accounts[0],
        accounts:accounts
      })
    });

    this.props.eventEmitter.on('participants_updated', participants => {
      this.setState({
        participants:participants
      })
    });

    this.props.eventEmitter.on('detail', detail => {
      this.setState({detail:detail});
    })

    this.props.eventEmitter.on('attendees', attendees => {
      this.setState({
        attendees:attendees
      })
    });
  }

  handleAction(actionName) {
    var args = [];
    switch (actionName) {
      case 'attend':
        args.push(this.state.attendees);
        break;
      case 'register':
        args.push(this.state.name);
        break;
      case 'registerWithEncryption':
        args.push(this.state.name);
        let encryptedData = cryptoBrowserify.publicEncrypt(this.state.detail.encryption, new Buffer(this.state.full_name, 'utf-8'));
        args.push(encryptedData.toString('hex'));
        break;
    }
    if(actionName == 'register' || actionName == 'registerWithEncryption'){
      let obj = {
        action:'register',
        user:this.state.address,
        contract:this.state.detail.contractAddress,
        agent: navigator.userAgent,
        provider:web3.currentProvider.constructor.name,
        hostname: window.location.hostname,
        created_at: new Date()
      }
      this.props.eventEmitter.emit('logger', obj);
    }

    this.props.action(actionName, this.state.address.trim(), args)
    this.setState({
      name: null,
      attendees:[]
    });
    this.props.eventEmitter.emit('attendees', []);
  }

  handleSelect(event,index,value){
    this.setState({
      address: value,
    });
  }

  participantStatus(){
    var p = this.selectParticipant(this.state.participants, this.state.address);
    if (p) {
      return participantStatus(p, this.state.detail)
    }else{
      return 'Not registered';
    }
  }

  selectParticipant(participants, address){
    return participants.filter(function(p){
       return p.address == address
    })[0]
  }

  isOwner(){
    return this.state.address == this.state.detail.owner;
  }

  isAdmin(){
    return this.state.detail.admins && this.state.detail.admins.includes(this.state.address) || (this.state.detail.owner == this.state.address);
  }

  showRegister(){
    return this.state.detail.canRegister && this.participantStatus() == 'Not registered';
  }

  showAttend(){
    return this.state.detail.canAttend
  }

  showWithdraw(){
    return this.state.detail.canWithdraw && this.participantStatus() == 'Won';
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

  handleEncryptedField(e) {
    this.setState({
      full_name: e.target.value
    });
  }

  render() {
    let adminButtons, registerButton, attendButton, warningText;

    if(this.isAdmin()){
      attendButton = <RaisedButton secondary={this.showAttend()} disabled={!this.showAttend()}
        label="Batch Attend" style={styles}
        onClick={this.handleAction.bind(this, 'attend')}
      />
    }

    if(this.isOwner()){
      adminButtons = <div>
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
      </div>
    }

    var availableSpots = this.state.detail.limitOfParticipants - this.state.detail.registered;
    if(this.props.read_only){
      registerButton = <span>Connect via Mist/Metamask to be able to register.</span>
    }else if(this.state.accounts.length > 0){
      if(this.state.detail.ended){
        registerButton = <span>This event is over </span>
      }else if (availableSpots <= 0){
        registerButton = <span>No more spots left</span>
      }else{
        if (this.state.detail.encryption && this.showRegister()) {
          var encryptionField =  <TextField
                      floatingLabelText="Full name (to be encrypted)"
                      floatingLabelFixed={true}
                      value={this.state.full_name}
                      onChange={this.handleEncryptedField.bind(this)}
                      style={{margin:'0 5px'}}
          />
          var action = 'registerWithEncryption';
        }else{
          var action = 'register';
        }
        registerButton = <RaisedButton secondary={this.showRegister()} disabled={!this.showRegister()}
          label="RSVP" style={styles}
          onClick={this.handleAction.bind(this, action)}
        />
        warningText = <div></div>
      }
    }else{
      registerButton = <span>No account is set</span>
    }

    var withdrawButton = <RaisedButton secondary={this.showWithdraw()} disabled={!this.showWithdraw()}
      label="Withdraw" style={styles}
      onClick={this.handleAction.bind(this, 'withdraw')}
    />

    if (this.showRegister()) {
      var nameField = <TextField
        hintText="@twitter_handle"
        floatingLabelText="Twitter handle"
        floatingLabelFixed={true}
        value={this.state.name}
        onChange={this.handleName.bind(this)}
        style={{margin:'0 5px'}}
      />
    }

    return (
      <Paper zDepth={1}>
        <form>
          {encryptionField}
          {nameField}
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
          {withdrawButton}
          {attendButton}
          {adminButtons}
        </form>
        {warningText}
      </Paper>
    );
  }
}

export default FormInput;
