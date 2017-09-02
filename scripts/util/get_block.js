module.exports = function(web3, blockNumber){
  return new Promise(function(resolve,reject){
    web3.eth.getBlock(blockNumber, function(err, result){
      resolve(result);
    });
  });
};
