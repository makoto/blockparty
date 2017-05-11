require('babel-register')

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
      network_id: "*"
    },
    ropsten: {
      host: "localhost",
      port: 8545,
      network_id: 3
    },
    kovan: {
      host: 'localhost',
      port: 8545,
      // gas: 4700000,
      network_id: 42
    },
    mainnet: {
      host: "localhost",
      port: 8545,
      network_id: 1,
      gas: 1990000,
      gasPrice: 2000000000, // 2 gwei
      from: '0xFa6F2D7cC987d592556ac07392b9d6395bfcc379'
    }
  }
};
