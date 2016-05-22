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

const Participants = (props) => (
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
          <TableRow>
            <TableRowColumn width={100} >9ccbabcae82457811c0d9c40f785beb690d27a21</TableRowColumn>
            <TableRowColumn width={10} >124</TableRowColumn>
            <TableRowColumn width={10} >Yes</TableRowColumn>
          </TableRow>
          <TableRow>
            <TableRowColumn width={100} >25c84abcc57a558bba6a2586baa25ea6434f9a9fc</TableRowColumn>
            <TableRowColumn width={10} >20</TableRowColumn>
            <TableRowColumn width={10} >No</TableRowColumn>
          </TableRow>
        </TableBody>
      </Table>
  </Paper>
);
export default Participants;
