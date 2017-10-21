<h2>What is this?</h2>

[![Demo Video](./blockparty.gif)](https://youtu.be/YkFGPokK0eQ)

<p>
  Have you ever encountered free party or meetup and realised that half the people registered did not actually turn up?
  BlockParty solves this problem by providing a simple incentive for people to register only if they mean it.
</p>
<h2>How does this work?</h2>
<p>
  Simple. You pay small deposit when you register. You lose your deposit if you do not turn up. You will get your deposit back + we split the deposit of whom did not turn up.
  You go to party and may end up getting more money.
</p>

<div style:"text-align:center;">
  <img width='80%' style:"display:inline-block;" src="http://blockparty.io.s3-website-eu-west-1.amazonaws.com/images/diagram.png"></img>
</div>

<h2> Demo </h2>

- [The demo site](http://blockparty.io.v02.s3-website-us-west-2.amazonaws.com/)
Real sites allows for participants to only `Register` and pay deposit to the site. Since this is a demo site, it allows you to `Register`, `Attend`, then press `Payback` button to simulate how it all works. Pressing `Reset` will reset the status so that you can play again.

- The last event on Mainnet is on http://bit.ly/blckprty.

<h2>How to setup</h2>

<h3>Option 1: access from Mist</h3>
<p>This is the standard way of accessing Dapp</p>
<ul>
  <li>Step 1: Install <a href='https://github.com/ethereum/mist/releases'>Mist browser (v 0.8 or higher)</a>, and make sure you choose <em style={{fontWeight:'bold'}}>mainnet</em>. Here is <a href='https://www.youtube.com/watch?v=Y3JfLgjqNU4'>a quick video tutorial</a> </li>
  <li>Step 2: Create an account on your wallet, and make sure you have some Ether.</li>
  <li>Step 3: Refresh the page </li>
</ul>

<h3>Option 2: access from browser and <a href='https://metamask.io/'>Metamask</a> Chrome extension</h3>
<p>For those of you who have problem installing the Mist browser, or no time to download big blockchain, why don't you try out via this browser based extension</p>
<ul>
  <li>Step 1: Install <a href='https://metamask.io/'>Metamask</a> Chrome extension </li>
  <li>Step 2: Create an account on your metamask, and make sure you have some Ether.</li>
  <li>Step 3: Refresh the page </li>
</ul>

<h3>Option 3: access from normal browser</h3>
<p>This has been the standard way to access Dapp prior to Ethereum Wallet (lower than v 0.7)</p>
<ul>
  <li>Step 1: Install <a href='https://github.com/ethereum/mist/releases'>Mist browser (v 0.8 or higher)</a>, and make sure you choose <em style={{fontWeight:'bold'}}>mainnet</em>. Here is <a href='https://www.youtube.com/watch?v=Y3JfLgjqNU4'>a quick video tutorial</a> </li>
  <li>Step 2: Create an account on your wallet, and make sure you have some Ether.</li>
  <li>Step 3: Stop Ethereum Wallet</li>
  <li>Step 4: Start geth(Go Etheruem, command line tool) with the following options. (See the <a href='https://github.com/ethereum/go-ethereum/wiki/Building-Ethereum'>installation instructions</a> for each platform)</li>
  <li>Step 5: Refresh this page </li>
</ul>
<blockquote style={{backgroundColor:'black', color:'white', padding:'1em'}}>
  geth --unlock 0 --rpc  --rpcapi "eth,net,web3" --rpccorsdomain URL
</blockquote>
<p>
  NOTE: <span style={{backgroundColor:'black', color:'white', padding:'0.3em'}} > --unlock 0</span> will unlock with one account. <span style={{backgroundColor:'black', color:'white', padding:'0.3em'}} > --unlock 0 1</span> will unlock with two accounts.
</p>

<h2>How to play?</h2>
<ul>
  <li>Type your twitter account, pick one of your address, then press 'Register'. It will take 10 to 30 seconds to get verified and you will receive notification.</li>
</ul>

<h2>FAQ</h2>
<h3>Can I cancel my registration?</h3>
<p>No</p>
<h3>What happens if I do not withdraw my payout?</h3>
<p>
  If you do not withdraw your payout within one week after the event is end, the host (contract owner) will clear the balance from the contract and the remaining blance goes back to the host, so do not keep them hanging
</p>
<h3>What happens if the event is canceled?</h3>
<p>
  In case the event is canceled, all registered people can withdraw their deposit.
  Make sure that you register with correct twitter account so that the host can notify you.
</p>
<h3>What if there is a bug in the contract!</h3>
<p>
  If the bug is found before the contract is compromised, the host can kill the contract and all the deposit goes back to the host so he/she can manually return the deposit.
  If the contract is compromised and the deposit is stolen, or his/her private key is lost/stolen, I am afraid that the host cannot compensate for you. Please assess the risk before you participate the event.
</p>
<h3>Can I host my own event using BlockParty?</h3>
<p>
  Please contact the <a href="http://twitter.com/makoto_inoue">author of this project</a> if you are interested.
</p>

<h2>Terms and conditions</h2>
<p>
  By downloading and deploying this software, you agree to our terms and conditions of use. We accept no responsibility whether in contract, tort or otherwise for any loss or damage arising out of or in connection with your use of our software and recommend that you ensure your devices are protected by using appropriate virus protection.
</p>

## Hacking guide

### Prerequisite

- [geth](https://github.com/ethereum/go-ethereum/wiki/geth)
- [nodejs](https://nodejs.org/en/)
- [npm](https://www.npmjs.com/)
- [webpack](https://webpack.github.io/)
- [truffle](http://truffle.readthedocs.org) = version 3.2.1
- [testrpc](https://github.com/ethereumjs/testrpc) = version 3.0.3

### Installation

- Run `npm`

NOTE: If it installs extra zeppilin contracts, do not commit, but remove them.

### Running test

- Run `testrpc` in one console
- Generate test public/secret key

```
cd tmp/
openssl genrsa 2048 > test_private.key
openssl rsa -pubout < test_private.key > test_public.key
```

- Run `truffle test --network test`

### Running locally

- Run `testrpc -a 30` in one console
- Run `truffle migrate`
- Run `npm run dev`
- Open `http://localhost:8080`

### Building asset files to deploy

- Run `npm run build`
- Upload the content of files under `build` directory


### Confirmation repository code (experimental)

By passing confirmation parameter of Conference during migration, it can allow user to claim attendance with confirmation code.

### Encryption (experimental)

By passing public key file location to parameter of Conference during migration, it can allow user to register with their user name encrypted.

### Configurable values (experimental)

Event name is configurable as `name`

## Example

First, deploy the contract.

```
truffle migrate --config '{"name":"CodeUp No..", "encryption":"./tmp/test_public.key", "confirmation":true}'
```

As an example, assume you have the following two codes at `input.txt`

```
$ cat tmp/input.txt
1234567890
0987654321
```

Running `repository.js` will add these confirmation code into the ConfirmationRepository.

```
$truffle exec scripts/repository.js -t confirmation -i tmp/input.txt
Adding 1234567890  as  0xf654274a8983066b9f810ed158b3fa883c9d26553429193e4aba65b44b76c835
Adding 0987654321  as  0x295153b1a40cec2698cd2fb0d75c8137a5c43d67ed5e4b7abbd463bc2b0dfac7
```

If you run the same program again, it will detect.

```
$truffle exec scripts/repository.js -t confirmation -i input.txt
Using network 'development'.

code 1234567890  is already registered. Claimed by  0x0000000000000000000000000000000000000000
code 0987654321  is already registered. Claimed by  0x0000000000000000000000000000000000000000
```

Pass the original confirmation ion codes to the participants. Once participants use the code to register, you can check who used the codes by running the script again.

```
$truffle exec scripts/repository.js -t confirmation -i input.txt
Using network 'development'.

code 1234567890  is already registered. Claimed by 0x12ff7cfb557a7d0404b694da8d6106e219306a93
code 0987654321  is already registered. Claimed by 0xc7ce74c8c7f2e7c5e6d039c5a48fae053ad5c952
```

## Deploying and running on real network

For `ropsten` and `mainnet` it now deploys via Infura. Pass the extra to set deployment specific

```
--network $NETWORK --mnemonic $SECRET
```

NOTE: `ropsten` and `mainnet` uses different gasPrice. Check `truffle.js` file and `scripts/util/set_gas.js` for the detail.

### Essentials

See [Issues](https://github.com/makoto/blockparty/issues)

### Milestones

#### Local meetups ready (~ 2017 September)

- ~~Register with participant's real name
- Add new event
- ~~Allow other people to become the owner of the event
- Dispute period (participants can demand to cancel the event to avoid event owners cheating)
- ~~Test that it scales up to 200 people

### Wishlists

- Show who event owner is
- Upload the deployed source code to `etherscan.io`
- Add redux
- Add testing for frontend
- Change payback ratio (eg: first registered, more reward)
- Let user to register by sending Ether (so that they could potentially register not via wallet but via exchange, etc)
- Automatic check in
- Waitlist
- Transfer my spot
- Refresh info when someone else register/attend
- Sponsor slots (sponsors can register with ether but they have no right to get payout. This is to guarantee extra payout for promotion purpose).
