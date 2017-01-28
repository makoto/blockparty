import React from 'react';
import FlatButton from 'material-ui/FlatButton';

export default class Instruction extends React.Component {
  constructor(props) {
    super(props);
    if(props.read_only){
      this.state = {
        color: 'red',
        text: 'READONLY'
      };
    }else{
      this.state = {
        color: null,
        text: null
      };
    }

    if(!props.read_only){
      this.props.eventEmitter.on('network', obj => {
        if (obj.network_id == 1) {
          this.setState({
            color: 'green',
            text: 'MAINNET'
          });
        }else if (obj.network_id == 3) {
          this.setState({
            color: 'orange',
            text: 'TESTNET'
          });
        } else {
          this.setState({
            color: 'green',
            text: 'PRIVATE NET'
          });
        }
      })
    }
  }

  render(){
    return (
      <FlatButton
        style={{backgroundColor:this.state.color, disabled:true, color:'white'}}
        label={this.state.text}
      />
    );
  }
}
