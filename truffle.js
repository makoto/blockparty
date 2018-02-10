const yargs = require('yargs');
var provider, address;

if (yargs.argv.network  == 'ropsten' || yargs.argv.network  == 'mainnet') {
  var providerURL = `https://${yargs.argv.network}.infura.io`
  var HDWalletProvider = require('truffle-hdwallet-provider');
  // todo: Think about more secure way
  var mnemonic = yargs.argv.mnemonic;
  provider = new HDWalletProvider(mnemonic, providerURL, 0);
  address = "0x" + provider.wallet.getAddress().toString("hex");
  console.log('Provider address', provider.getAddress());
  console.log('Deploying to ', providerURL);
}

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*"
    },
    test: {
      host: "localhost",
      port: 8545,
      network_id: "*",
      gasPrice: 0x01
    },
    coverage: {
      host: "localhost",
      network_id: "*",
      port: 8555,         // <-- If you change this, also set the port option in .solcover.js.
      gas: 0xfffffffffff, // <-- Use this high gas value
      gasPrice: 0x01      // <-- Use this low gas price
    },
    rinkeby: {
      host: "localhost",
      network_id: 4,
      port: 8545,
      gasPrice: 50000000000 // 50 gwei,
    },
    ropsten: {
      gasPrice: 50000000000, // 50 gwei,
      provider: provider,
      network_id: 3,
      from: address
    },
    mainnet: {
      gas: 2550000,
      gasPrice: 1000000000, // 1 gwei
      provider: provider,
      network_id: 1,
      from: address
    }
  }
};
