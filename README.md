<h2>What is this?</h2>

[![Demo Video](./blockparty.gif)](https://www.youtube.com/embed/gM2qkv1sySY)

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

<div style:"text-align:center;">
  <img width='80%' style:"display:inline-block;" src="http://blockparty.io.s3-website-eu-west-1.amazonaws.com/images/diagram.png"></img>
</div>

<h2>How to setup</h2>

The link to [Proof Of Concept](http://blockparty.io.v02.s3-website-us-west-2.amazonaws.com/)

<h3>Option 1: access from Mist</h3>
<ul>
  <li>Step 1: Install <a href='https://github.com/ethereum/mist/releases'>Mist browser (v 0.8 or higher)</a>, and make sure you choose <em style={{fontWeight:'bold'}}>testnet</em>. Here is <a href='https://www.youtube.com/watch?v=Y3JfLgjqNU4'>a quick video tutorial</a> </li>
  <li>Step 2: Create at least 2 accounts on your wallet (so that you can simulate multiple users), and make sure you have some Ethers in both accounts. Here is the quick link on <a href='https://medium.com/@makoto_inoue/ether1-how-to-even-get-to-start-deploying-ethereum-d297cc68b5c7#.4no7evv94'> how to mine on testnet.</a> </li>
  <li>Step 3: Refresh the page </li>
</ul>

<h3>Option 2: access from normal browser</h3>
<ul>
  <li>Step 1: Install <a href='https://github.com/ethereum/mist/releases'>Mist browser (v 0.8 or higher)</a>, and make sure you choose <em style={{fontWeight:'bold'}}>testnet</em>. Here is <a href='https://www.youtube.com/watch?v=Y3JfLgjqNU4'>a quick video tutorial</a> </li>
  <li>Step 2: Create at least 2 accounts on your wallet (so that you can simulate multiple users), and make sure you have some Ethers in both accounts. Here is the quick link on <a href='https://medium.com/@makoto_inoue/ether1-how-to-even-get-to-start-deploying-ethereum-d297cc68b5c7#.4no7evv94'> how to mine on testnet.</a> </li>
  <li>Step 3: Stop Ethereum Wallet</li>
  <li>Step 4: Start geth(Go Etheruem, command line tool) with the following options. (See the <a href='https://github.com/ethereum/go-ethereum/wiki/Building-Ethereum'>installation instructions</a> for each platform)</li>
  <li>Step 5: Refresh this page </li>
</ul>
<blockquote style={{backgroundColor:'black', color:'white', padding:'1em'}}>
  geth --testnet --unlock 0,1 --rpc  --rpcapi "eth,net,web3" --rpccorsdomain http://blockparty.io.v02.s3-website-us-west-2.amazonaws.com/
</blockquote>
<p>
  NOTE: <span style={{backgroundColor:'black', color:'white', padding:'0.3em'}} > --unlock 0</span> will unlock with one account. <span style={{backgroundColor:'black', color:'white', padding:'0.3em'}} > --unlock 0 1</span> will unlock with two accounts.
</p>

<h2>How to play?</h2>
<ul>
  <li>Step 1: Type your twitter account, pick one of your address, then press 'Register'. It will take 10 to 30 seconds to get verified and you will receive notification.</li>
  <li>Step 2: Try registering with another account. Each time you register, you deposit 1 ETHER to the contract</li>
  <li>Step 3: Select one of the registered account and then press 'Attend'. 'Payout' seciont tells you how much you may potentially get.</li>
  <li>Step 4: Press 'Payback' button and see one of your accounts get the payout ammount.</li>
  <li>If you want to play again, press 'Reset', which reset the meetup.</li>
</ul>

## Hacking guide

### Prerequisite

- [geth](https://github.com/ethereum/go-ethereum/wiki/geth)
- [nodejs](https://nodejs.org/en/)
- [npm](https://www.npmjs.com/)
- [webpack](https://webpack.github.io/)
- [truffle](http://truffle.readthedocs.org) = version 2.0.4
- [testrpc](https://github.com/ethereumjs/testrpc)

### Installation

- Run `npm`

### Running test

- Run `testrpc` in one console
- Run `truffle test`

### Running locally

- Run `testrpc` in one console
- Run `truffle deploy`
- Run `truffle serve`
- Open `http://localhost:8080`

## TODO

### Testnet release candidate features

- Delete `reset` function (to be replaced by `cancel` event)
- Only event owners can execute `attend`, `payback`
- `suicide` once payout is complete

### Mainnet release candidate features

#### Essential

- Add `cancel` event functionality (automatically refund)
- Add event date
- Cannot register on the day of event.
- Cannot register once the event is over.
- Add disclaimar doc

#### Nice to have

- Replace `throw` with returning ether (better practice for handling exceptions)
- Add readonly views (so that people can see people who attended via mobile phone)
- Upload the deployed source code to `etherscan.io`

### Backlog

#### Refactoring

- Add redux
- Add testing for frontend

#### New features

- Let participant to claim the payback rather than event owners to send payback
- Change payback ratio (eg: first registered, more reward)
- Let user to register by sending Ether (so that they could potentially register not via wallet but via exchange, etc)
- Automatic check in
- Waitlist
- Transfer my spot
- Refresh info when someone else register/attend
