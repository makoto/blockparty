pragma solidity ^0.4.8;

import './zeppelin/Ownable.sol';

contract InvitationRepository is Ownable{
  bytes32 encryptedCode;

  struct Code{
    bool exist;
    bool claimed;
    address participant;
  }

  mapping(bytes32 => Code) codes;

  event LogEvent(string event_type, bytes32 code);

  function add(bytes32[] _encryptedInvitationCodes) onlyOwner{
    for(uint i=0;i<_encryptedInvitationCodes.length;i++){
      var _encryptedInvitationCode = _encryptedInvitationCodes[i];
      codes[_encryptedInvitationCode] = Code(true, false, 0);
    }
  }

  function claim(bytes32 _invitationCode, address _sender) returns(bool){
    LogEvent('claim', _invitationCode);
    var code = codes[encrypt(_invitationCode)];
    if(code.exist && !code.claimed){
      code.claimed = true;
      code.participant = _sender;
    }else{
      throw;
    }
    return true;
  }

  function encrypt(bytes32 _invitationCode) constant returns(bytes32){
    return sha3(_invitationCode);
  }

  function verify(bytes32 _invitationCode) constant returns(bool){
    return codes[encrypt(_invitationCode)].exist;
  }

  function report(bytes32 _invitationCode) constant returns(address){
    return codes[encrypt(_invitationCode)].participant;
  }
}
