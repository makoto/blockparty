// blockparty specific configs
module.exports = {
  development: {
    contract_addresses:{
      'Conference': null,
      'ConfirmationRepository': null
    },
    name: 'PRIVATE NET',
    etherscan_url: null
  },
  test: {
  },
  ropsten: {
    contract_addresses:{
      'Conference': null,
      'ConfirmationRepository': null
    },
    name: 'ROPSTEN NET',
    etherscan_url: 'https://ropsten.etherscan.io'
  },
  mainnet: {
    contract_addresses:{
      'Conference': null,
      'ConfirmationRepository': '0xe0e0229484b1088e0a751ddffd05b2e6b833e3a2'
    },
    name: 'MAINNET',
    etherscan_url: 'https://etherscan.io'
  }
};
