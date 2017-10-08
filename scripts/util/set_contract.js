let arg = require('yargs').argv;
var prompt = require('prompt');
if (!arg.network) {
  throw("Need arg.network")
}

function getPrompt(){
  return new Promise(function(resolve,reject){
    prompt.get(['confirm'], function (err, result) {
      if (result.confirm == 'yes') {
        resolve(result);
      }else{
        reject("Need confirmation")
      }
    });
  });
}

module.exports = async function(artifacts, contractName){
  const app_config = require('../../app_config.js')[arg.network];
  const fileName = `${contractName}.sol`;
  const Artifact = artifacts.require(fileName);
  if (app_config.contract_addresses[contractName]) {
    console.log(`Overriding ${contractName} with ${app_config.contract_addresses[contractName]}`)
    contract = await Artifact.at(app_config.contract_addresses[contractName]);
  }else{
    contract = await Artifact.deployed();
    console.log(`Using default address speciied at artifact ${contract.address}`)
  }
  if (contractName == 'Conference') {
    prompt.start();
    var name = await contract.name.call()
    console.log(`Are you sure you are intereacting with ${name}? (type "yes" to confirm)`)
    await getPrompt();
  }
  return contract;
};
