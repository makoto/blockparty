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
      address:props.accounts[0],
      name:null
    };
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

  handleName(e) {
    this.setState({
      name: e.target.value,
    });
  }

  render() {
    return (
      <Paper zDepth={1}>
        <form>

          <SelectField
            value={this.state.address}
            onChange={this.handleSelect.bind(this)}
            floatingLabelText="Account address"
            floatingLabelFixed={true}
            style={{width:'25em'}}
            >
            {
              this.props.accounts.map(account => {
                return (<MenuItem value={account} primaryText={account} />)
              })
            }
          </SelectField>
          <TextField
            hintText="@twitter_handle"
            floatingLabelText="You twitter handle"
            floatingLabelFixed={true}
            value={this.state.name}
            onChange={this.handleName.bind(this)}
          />
          <RaisedButton secondary={true}
            label="Register" style={styles}
            onClick={this.handleAction.bind(this, 'register')}
          />
          <RaisedButton secondary={true}
            label="Attend" style={styles}
            onClick={this.handleAction.bind(this, 'attend')}
          />
          <RaisedButton secondary={true}
            label="Payback" style={styles}
            onClick={this.handleAction.bind(this, 'payback')}
          />
        <RaisedButton secondary={true}
            label="Reset" style={styles}
            onClick={this.handleAction.bind(this, 'reset')}
          />
        </form>
      </Paper>
    );
  }
}

export default FormInput;
