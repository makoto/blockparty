let fs = require('fs');
let setGas = require('./util/set_gas');
let setContract = require('./util/set_contract');
let ConfirmationRepository = artifacts.require("./ConfirmationRepository.sol");

let repository;
let arg = require('yargs').argv;

if (!(arg.i)) {
  throw('usage: truffle exec scripts/repository.js -i codes.txt');
}

module.exports = async function(callback) {
  const gas = await setGas(web3);
  const conference = await setContract(artifacts, 'Conference');
  const repositoryAddress = await conference.confirmationRepository.call();
  if (!repositoryAddress) {
    throw("repository address does not exist")
  }
  const repository = await ConfirmationRepository.at(repositoryAddress);
  let file = arg.i;

  let codes = fs.readFileSync(file, 'utf8').trim().split('\n');
  let encrypted_codes = [];
  for (var i = 0; i < codes.length; i++) {
    var code = codes[i];
    var registered = await repository.verify.call(code);
    if (registered) {
      var claimed = await repository.report.call(code);
      console.log('code', code, ' is already registered. Claimed by ', claimed);
    }else{
      var encrypted_code = await repository.encrypt.call(code);
      console.log('Adding', code, ' as ', encrypted_code);
      encrypted_codes.push(encrypted_code);
    }
  }
  if (encrypted_codes.length > 0) {
    var result = await repository.addMultiple(encrypted_codes, {gasPrice:gas});
    console.log('addMultiple trx', result.tx);
  }
}
