import React from 'react';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Paper from 'material-ui/Paper';

const styles = {margin:12}

class FormInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      address:''
    };
  }

  handleAction(actionName) {
    this.props.action(actionName, this.state.address.trim())
  }

  handleInput(e) {
    this.setState({
      address: e.target.value,
    });
  }

  render() {
    return (
      <Paper zDepth={1}>
        <form>
          <TextField  style={styles} fullWidth={true}
            hintText="Your Account Address"
            value={this.state.address}
            onChange={this.handleInput.bind(this)}
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
        </form>
      </Paper>
    );
  }
}

export default FormInput;
