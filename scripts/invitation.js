let fs = require('fs');
let InvitationRepository = artifacts.require("./InvitationRepository.sol");

if (process.argv.length < 5) {
  throw('usage: truffle exec scripts/invitation.js invitation_codes.txt');
}

let file = process.argv[4];
let invitation_codes = fs.readFileSync(file, 'utf8').trim().split('\n')

module.exports = async function(callback) {
  let invitation = await InvitationRepository.deployed();
  for (var i = 0; i < invitation_codes.length; i++) {
    var invitation_code = invitation_codes[i];
    var registered = await invitation.verify(invitation_code);
    if (registered) {
      var claimed = await invitation.report(invitation_code);
      console.log('invitation_code', invitation_code, ' is already registered. Claimed by ', claimed);
    }else{
      var encrypted_code = await invitation.encrypt.call(invitation_code);
      console.log('Adding', invitation_code, ' as ', encrypted_code);
      await invitation.add([encrypted_code]).catch(function(){});
    }
  }
}
