import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

export default class Instruction extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }

  componentDidMount(){
    this.props.eventEmitter.on('instruction', obj => {
      this.handleOpen()
    });
  }

  handleOpen(){
    this.setState({open: true});
  };

  handleClose(a,b){
    this.setState({open: false});
  };

  render(){
    const actions = [
      <FlatButton
        label="Ok"
        primary={true}
        onTouchTap={this.handleClose.bind(this)}
      />
    ];

    return (
      <Dialog
        title="Welcome to BlockParty"
        actions={actions}
        modal={false}
        open={this.state.open}
        onRequestClose={this.handleClose.bind(this)}
        autoScrollBodyContent={true}
        contentStyle={{width:'90%', maxWidth:'none'}}
      >
        <div>
          <h2>What is this?</h2>
          <p>
            Have you ever encountered free party or meetup and realised that half the people registered did not actually turn up?
            BlockParty solves this problem by providing a simple incentive for people to register only if they mean it.
            <br/>
            This is a PoC(Proof of concept) site on <em style={{fontWeight:'bold'}}>testnet</em> where you can simulate how it all works.
          </p>
          <h2>How does this work?</h2>
          <p>
            Simple. You pay small deposit when you register. You lose your deposit if you do not turn up. You will get your deposit back + we split the deposit of whom did not turn up.
            You go to party and may end up getting more money.
          </p>
          <div style={{textAlign:'center'}}>
            <img style={{width:'50%', margin:'25px'}} src="images/diagram.png"></img>
          </div>

          <h2>Demo</h2>

          <div style={{textAlign:'center'}} class="video-container"><iframe width="560" height="315" src="https://www.youtube.com/embed/YkFGPokK0eQ" frameborder="0" allowfullscreen></iframe></div>

          <h2>How to setup</h2>

          <h3>Option 1: access from Mist</h3>
          <p>This is the standard way of accessing Dapp</p>
          <ul>
            <li>Step 1: Install <a href='https://github.com/ethereum/mist/releases'>Mist browser (v 0.8 or higher)</a>, and make sure you choose <em style={{fontWeight:'bold'}}>testnet</em>. Here is <a href='https://www.youtube.com/watch?v=Y3JfLgjqNU4'>a quick video tutorial</a> </li>
            <li>Step 2: Create an account on your wallet, and make sure you have at least 1.1 Ether.</li>
            <li>Step 3: Refresh the page </li>
          </ul>

          <h3>Option 2: access from browser and <a href='https://metamask.io/'>Metamask</a> Chrome extension</h3>
          <p>For those of you who have problem installing the Mist browser, or no time to download the big blockchain, why don't you try out via this browser based extension</p>
          <ul>
            <li>Step 1: Install <a href='https://metamask.io/'>Metamask</a> Chrome extension </li>
            <li>Step 2: Create an account on your metamask, and make sure you have at least 1.1 Ether.</li>
            <li>Step 3: Refresh the page </li>
          </ul>

          <h3>Option 3: access from normal browser</h3>
          <p>This has been the standard way to access Dapp prior to Ethereum Wallet (lower than v 0.7)</p>
          <ul>
            <li>Step 1: Install <a href='https://github.com/ethereum/mist/releases'>Mist browser (v 0.8 or higher)</a>, and make sure you choose <em style={{fontWeight:'bold'}}>testnet</em>. Here is <a href='https://www.youtube.com/watch?v=Y3JfLgjqNU4'>a quick video tutorial</a> </li>
            <li>Step 2: Create an account on your wallet, and make sure you have at least 1.1 Ether.</li>
            <li>Step 3: Stop Ethereum Wallet</li>
            <li>Step 4: Start geth(Go Etheruem, command line tool) with the following options. (See the <a href='https://github.com/ethereum/go-ethereum/wiki/Building-Ethereum'>installation instructions</a> for each platform)</li>
            <li>Step 5: Refresh this page </li>
          </ul>
          <blockquote style={{backgroundColor:'black', color:'white', padding:'1em'}}>
            geth --testnet --unlock 0,1 --rpc  --rpcapi "eth,net,web3" --rpccorsdomain $THIS_URL
          </blockquote>
          <p>
            NOTE: <span style={{backgroundColor:'black', color:'white', padding:'0.3em'}} > --unlock 0</span> will unlock with one account. <span style={{backgroundColor:'black', color:'white', padding:'0.3em'}} > --unlock 0 1</span> will unlock with two accounts.
          </p>

          <h2>How to play?</h2>
          <ul>
            <li>Type your twitter account, pick one of your address, then press 'Register'. It will take 10 to 30 seconds to get verified and you will receive notification.</li>
          </ul>
        </div>
      </Dialog>
    );
  }
}
