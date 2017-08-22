let fs = require('fs');
let ConfirmationRepository = artifacts.require("./ConfirmationRepository.sol");
let repository;
let arg = require('yargs').argv;

if (!(arg.i && arg.t)) {
  throw('usage: truffle exec scripts/repository.js -t confirmation -i codes.txt');
}
module.exports = async function(callback) {
  let file = arg.i;
  console.log('file', file)
  switch (arg.t) {
    case 'confirmation':
      repository = await ConfirmationRepository.deployed();
      console.log('repository', repository.address)
      break;
    default:
      throw('-t must be either confirmation');
  }
  let codes = fs.readFileSync(file, 'utf8').trim().split('\n');
  for (var i = 0; i < codes.length; i++) {
    var code = codes[i];
    var registered = await repository.verify.call(code);
    if (registered) {
      var claimed = await repository.report.call(code);
      console.log('code', code, ' is already registered. Claimed by ', claimed);
    }else{
      var encrypted_code = await repository.encrypt.call(code);
      var result = await repository.add(encrypted_code);
      console.log('Adding', code, ' as ', encrypted_code, ' with trx', result.tx);
    }
  }
}
