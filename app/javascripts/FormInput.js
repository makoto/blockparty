import React from 'react';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

class FormInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      address:''
    };
  }

  handleAction(actionName) {
    return function (e) {
      this.props.action(actionName, this.state.address.trim())
    }.bind(this)
  }

  handleInput(e) {
    this.setState({
      address: e.target.value,
    });
  }

  render() {
    return (
      <form>
        <TextField
          hintText="Your Account Address"
          value={this.state.message}
          onChange={this.handleInput.bind(this)}
        />
        <RaisedButton
          label="Register"
          onClick={this.handleAction('register')}
        />
        <RaisedButton
          label="Attend"
          onClick={this.handleAction('attend')}
        />
        <RaisedButton
          label="Payback"
          onClick={this.handleAction('payback')}
        />
      </form>
    );
  }
}

export default FormInput;
