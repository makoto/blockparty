module.exports = {
  build: "./node_modules/.bin/webpack",
  // networks: {
  //   "live": {
  //     network_id: 1 // Ethereum public network
  //   },
  //   "morden": {
  //     network_id: 2   // Official Ethereum test network
  //   },
  //   "development": {
  //     network_id: "default"
  //   }
  // },
  rpc: {
    host: "localhost",
    port: 8545
  }
};
