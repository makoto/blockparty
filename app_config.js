// blockparty specific configs
module.exports = {
  development: {
    confirmation_contract_address: null,
    conference_contract_address: null,
    name: 'PRIVATE NET',
    etherscan_url: null
  },
  test: {
  },
  ropsten: {
    name: 'ROPSTEN NET',
    etherscan_url: 'https://ropsten.etherscan.io'
  },
  mainnet: {
    confirmation_contract_address: '0xe0e0229484b1088e0a751ddffd05b2e6b833e3a2',
    conference_contract_address: null,
    name: 'MAINNET',
    etherscan_url: 'https://etherscan.io'
  }
};
