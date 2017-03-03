require('babel-register')

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*"
    },
    testnet: {
      host: "localhost",
      port: 8545,
      network_id: 3
    },
    mainnet: {
      host: "localhost",
      port: 8545,
      network_id: 1,
      gas: 1990000,
      from: '0xFa6F2D7cC987d592556ac07392b9d6395bfcc379'
    }
  }
};
