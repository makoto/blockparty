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
      'ConfirmationRepository': '0xe444b7bec7a2dbd571523a1e2e4580a1b4c1c9b1'
    },
    name: 'ROPSTEN NET',
    etherscan_url: 'https://ropsten.etherscan.io'
  },
  rinkeby: {
    contract_addresses:{
      'Conference': '0xDdDf97B54a515172AadD9590d5aBCE524683f390',
      'ConfirmationRepository': null
    },
    name: 'RINKEBY NET',
    etherscan_url: 'https://rinkeby.etherscan.io'
  },
  mainnet: {
    contract_addresses:{
      'Conference': null,
      'ConfirmationRepository': null
    },
    name: 'MAINNET',
    etherscan_url: 'https://etherscan.io'
  }
};
