module.exports = function(web3){
  return new Promise(function(resolve,reject){
    web3.version.getNetwork(function(err, network_id){
      var gas;
      console.log('network_id', network_id);
      if (network_id == 1) { // mainnet
        gas = 2000000000 // 2 gwei
      }else if (network_id == 3) {
        gas = 20000000000 // 20 gwei
      }else{
        gas = 1;
      }
      console.log('gas price', gas, web3.fromWei(gas, 'gwei'))
      resolve(gas);
    })
  });
};
