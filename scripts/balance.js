// Display current balance of the provider address.

module.exports = function(callback) {
  var address = '0x' + web3.currentProvider.wallet.getAddress().toString('hex');
  console.log('Address', address)
  web3.eth.getBalance(address, function(error,balance){
    if (error) {
      console.log('error', error);
    }
    console.log('Wallet address balance', web3.fromWei(balance,'ether').toNumber());
  });
}
