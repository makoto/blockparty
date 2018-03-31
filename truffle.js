const yargs = require('yargs');
var provider, address;

// Not using remote node until secure way to store seed/private key is established.
//
// if (yargs.argv.network  == 'ropsten' || yargs.argv.network  == 'mainnet') {
//   var providerURL = 'http://localhost:8545';
//   // var providerURL = `https://${yargs.argv.network}.infura.io`
//   var HDWalletProvider = require("truffle-privatekey-provider");
//   // todo: Think about more secure way
//   var mnemonic = yargs.argv.mnemonic;
//   provider = new HDWalletProvider(mnemonic, providerURL, 0);
//   // address = "0x" + provider.wallet.getAddress().toString("hex");
//   // console.log('Provider address', provider.getAddress());
//   console.log('Deploying to ', providerURL);
// }
module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 7545,
      network_id: "*" // Match any network id
    },
    test: {
      host: "localhost",
      port: 7545,
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
      // provider: provider,
      network_id: 3,
      // from: address
    },
    mainnet: {
      // gas: 5000000,
      host: "localhost",
      gasPrice: 1000000000, // 1 gwei
      port: 8545,
      // provider:provider,
      // from: "0x4b3A4F3F42BA61141A4F7101F77dC141AE15c59A",
      from: "0x4b3a4f3f42ba61141a4f7101f77dc141ae15c59a",
      network_id: 1
    }
  }
};


