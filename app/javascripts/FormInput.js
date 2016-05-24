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
      address:props.accounts[0]
    };
  }

  handleAction(actionName) {
    this.props.action(actionName, this.state.address.trim())
  }

  handleSelect(event,index,value){
    this.setState({
      address: value,
    });
  }

  handleInput(e) {
    // console.log('handleInput', e)
    // this.setState({
    //   address: e.target.value,
    // });
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
            fullWidth={true}
          >
            {
              this.props.accounts.map(account => {
                return (<MenuItem value={account} primaryText={account} />)
              })
            }
          </SelectField>
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
        </form>
      </Paper>
    );
  }
}

export default FormInput;
