import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

export default class BountyInstruction extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
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
            <ul>
              <li>
                DemoBounty Address:
                <a
                  target='_blank'
                  href={ `https://testnet.etherscan.io/address/${this.props.demoBounty.address}` }>
                  {this.props.demoBounty.address}
                </a>
              </li>
              <li>
                Bounty Address:
                <a
                  target='_blank'
                  href={ `https://testnet.etherscan.io/address/${this.props.bounty.address}` }>
                  {this.props.bounty.address}
                </a>
              </li>
            </ul>
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
