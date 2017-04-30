let fs = require('fs');
let InvitationRepository = artifacts.require("./InvitationRepository.sol");
let ConfirmationRepository = artifacts.require("./ConfirmationRepository.sol");
let repository;
let arg = require('yargs').argv;

console.log('args', arg);
if (!(arg.i && arg.t)) {
  throw('usage: truffle exec scripts/repository.js -t invitation|confirmation -i codes.txt');
}
module.exports = async function(callback) {
  let file = arg.i;
  console.log('file', file)
  switch (arg.t) {
    case 'invitation':
      repository = await InvitationRepository.deployed();
      break;
    case 'confirmation':
      repository = await ConfirmationRepository.deployed();
      break;
    default:
      throw('-t must be either invitation or confirmation');
  }
  console.log(2)
  let codes = fs.readFileSync(file, 'utf8').trim().split('\n');

  for (var i = 0; i < codes.length; i++) {
    console.log('code', codes[i])
    var code = codes[i];
    var registered = await repository.verify(code);
    if (registered) {
      var claimed = await repository.report(code);
      console.log('code', code, ' is already registered. Claimed by ', claimed);
    }else{
      var encrypted_code = await repository.encrypt.call(code);
      console.log('Adding', code, ' as ', encrypted_code);
      await repository.add([encrypted_code]).catch(function(){});
    }
  }
}
