module.exports = {
  build: "npm start",
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
      network_id: 1
    }
  }
};
