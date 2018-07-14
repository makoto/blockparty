// blockparty specific configs
module.exports = {
  development: {
    contract_addresses:{
      'Conference': null
    },
    name: 'PRIVATE NET',
    etherscan_url: null
  },
  test: {
  },
  ropsten: {
    contract_addresses:{
      'Conference': null
    },
    name: 'ROPSTEN NET',
    etherscan_url: 'https://ropsten.etherscan.io'
  },
  rinkeby: {
    contract_addresses:{
      'Conference': null
    },
    name: 'RINKEBY NET',
    etherscan_url: 'https://rinkeby.etherscan.io'
  },
  mainnet: {
    contract_addresses:{
      'Conference': "0x742cd182c2e63b60ca2a13ed3095cccaac69e86c"
    },
    name: 'MAINNET',
    etherscan_url: 'https://etherscan.io'
  }
};
