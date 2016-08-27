import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';

export default class BountyInstruction extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      demoBountyBalance: 0,
      demoBountyClaimed: false,
      bountyBalance: 0,
      bountyClaimed: true
    };
    let component = this;
    props.getBalance(props.demoBounty.address).then(balance =>{
      this.setState({demoBountyBalance: balance.toNumber()});
    }).call(this)
    props.demoBounty.claimed.call().then(claimed =>{
      this.setState({demoBountyClaimed: claimed});
    })
    props.getBalance(props.bounty.address).then(balance =>{
      this.setState({bountyBalance: balance.toNumber()});
    })
    props.bounty.claimed.call().then(claimed =>{
      this.setState({bountyClaimed: claimed});
    })
  }

  showEther(amount){
    return this.props.math.round(parseFloat(this.props.web3.fromWei(amount, "ether")),3)
  }

  yesNo(boolean){
    if(boolean){
      return 'yes';
    }else{
      return 'no';
    }
  }

  handleOpen(){
    this.setState({open: true});
  }

  handleClose(){
    this.setState({open: false});
  }

  render() {
    const actions = [
      <FlatButton
        label="Ok"
        primary={true}
        onTouchTap={this.handleClose.bind(this)}
      />
    ];

    return(
      <span>
        <FlatButton style={{color:'white'}} label="Bounty" onClick={ () => {this.handleOpen()}} />
        <Dialog
          title="Bounty program"
          actions={actions}
          open={this.state.open}
          onRequestClose={this.handleClose.bind(this)}
          modal={false}
          autoScrollBodyContent={true}
          contentStyle={{width:'90%', maxWidth:'none'}}
        >
          <div>
            <p>Please help us to make our smart contract secure by participating our automatic bug bounty program.</p>
            <Table>
              <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                <TableRow>
                  <TableHeaderColumn ></TableHeaderColumn>
                  <TableHeaderColumn >DemoBounty</TableHeaderColumn>
                  <TableHeaderColumn >Bounty</TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody displayRowCheckbox={false}>
              <TableRow>
                <TableRowColumn>
                  Address
                </TableRowColumn>
                <TableRowColumn>
                  <a
                    target='_blank'
                    href={ `https://testnet.etherscan.io/address/${this.props.demoBounty.address}` }>
                    {this.props.demoBounty.address}
                  </a>
                </TableRowColumn>
                <TableRowColumn>
                  <a
                    target='_blank'
                    href={ `https://testnet.etherscan.io/address/${this.props.bounty.address}` }>
                    {this.props.bounty.address}
                  </a>
                </TableRowColumn>
              </TableRow>
              <TableRow>
                <TableRowColumn>
                  Bounty Pot
                </TableRowColumn>
                <TableRowColumn>
                  {this.showEther(this.state.demoBountyBalance)}
                </TableRowColumn>
                <TableRowColumn>
                  {this.showEther(this.state.bountyBalance)}
                </TableRowColumn>
              </TableRow>
              <TableRow>
                <TableRowColumn>
                  Claimed
                </TableRowColumn>
                <TableRowColumn>
                  {this.yesNo(this.state.demoBountyClaimed)}
                </TableRowColumn>
                <TableRowColumn>
                  {this.yesNo(this.state.bountyClaimed)}
                </TableRowColumn>
              </TableRow>
              </TableBody>
            </Table>
            <p>
              Read "Fault tolerance and Automatic bug bounties" section of
               &nbsp;<a target="_blank" href="https://medium.com/bitcorps-blog/onward-with-ethereum-smart-contract-security-97a827e47702#.67zm0vrin"> Onward with Ethereum Smart Contract Security </a>&nbsp;
               blog post for more detail.for more detail.
            </p>
          </div>
        </Dialog>
      </span>
    )
  }
}

export default BountyInstruction;
