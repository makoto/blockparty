import React from 'react';
import ReactDOM from 'react-dom';
import {List, ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';
import Paper from 'material-ui/Paper';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';

const styles = {
  paperRight:{
    flex: 3,
    textAlign: 'center',
  }
};

class Participants extends React.Component {
  constructor(props) {
    super(props);
    this.state = {participants:[]};
  }

  componentDidMount(){
    // Initialize
    this.props.getParticipants(participants =>{
      this.setState({participants});
    });

    this.props.eventEmitter.on('change', model => {
      this.props.getParticipants(participants =>{
        this.setState({participants});
      });
    });
  }

  toEther(value){
    return this.props.math.round(value, 3).toString();
  }

  toNumber(value){
    if(value) return value.toNumber();
  }

  yesNo(value){
    if(value) {
      return 'Yes';
    }else{
      return 'No';
    }
  }


  render() {
    return (
      <Paper zDepth={1} style={styles.paperRight}>
          <h4>Participants</h4>
          <Table>
            <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
              <TableRow>
                <TableHeaderColumn width={100} >Address</TableHeaderColumn>
                <TableHeaderColumn width={10} >Balance</TableHeaderColumn>
                <TableHeaderColumn width={10} >Attend?</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false}>
              {
                this.state.participants.map((participant) => {
                  return (
                    <TableRow>
                      <TableRowColumn width={100} >{participant.address}</TableRowColumn>
                      <TableRowColumn width={10} >{this.toEther(participant.balance)}</TableRowColumn>
                      <TableRowColumn width={10} >{this.yesNo(participant.attended)}</TableRowColumn>
                    </TableRow>
                  )
                })
              }
            </TableBody>
          </Table>
      </Paper>
    );
  }
}
export default Participants;
