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
        var color ='orange';
        if (obj.name == 'MAINNET') color = 'green';
        this.setState({
          color: color,
          text: obj.name
        });
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
