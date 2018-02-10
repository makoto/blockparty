pragma solidity ^0.4.19;

import './zeppelin/ownership/Ownable.sol';

contract InvitationRepository is Ownable{
  bytes32 encryptedCode;

  struct Code{
    bool exist;
    bool claimed;
    address participant;
  }

  mapping(bytes32 => Code) codes;

  event LogEvent(string event_type, bytes32 code);

  function add(bytes32 _encryptedInvitationCode) onlyOwner public{
    codes[_encryptedInvitationCode] = Code(true, false, 0);
  }

  function addMultiple(bytes32[] _encryptedInvitationCodes) onlyOwner public{
    for(uint i=0;i<_encryptedInvitationCodes.length;i++){
      add(_encryptedInvitationCodes[i]);
    }
  }

  function claim(bytes32 _code, address _sender) public returns(bool){
    LogEvent('claim', _code);
    var code = codes[encrypt(_code)];
    if(code.exist && !code.claimed){
      code.claimed = true;
      code.participant = _sender;
    }else{
      revert();
    }
    return true;
  }

  function encrypt(bytes32 _code) pure public returns(bytes32){
    return keccak256(_code);
  }

  function verify(bytes32 _code) constant public returns(bool){
    return codes[encrypt(_code)].exist;
  }

  function report(bytes32 _code) constant public returns(address){
    return codes[encrypt(_code)].participant;
  }
}
