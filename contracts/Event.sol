pragma solidity ^0.4.25;

import "./rbac/RBACWithAdmin.sol";
import "./UserPot.sol";

interface EventInterface {
  function hasEnded() external view returns (bool);
  function getPayout(address _addr) external view returns (uint256);
  function getDeposit(address _addr) external view returns (uint256);
}

contract Event is RBACWithAdmin, EventInterface {
  UserPotInterface userPot;

  constructor (
    address _userPot,
    string _name,
    uint256 _deposit,
    uint256 _limitOfParticipants,
    address _owner
  ) public {
    require (_userPot != address(0), 'empty userPot address');

    userPot = UserPotInterface(_userPot);

    if (_owner != address(0)) {
        addRole (owner, ROLE_ADMIN);
    }

    // ... reset of code same as existing Conference constructor
  }

  function register() external payable onlyActive{
    require(registered < limitOfParticipants, 'participant limit reached');
    require(!isRegistered(msg.sender), 'already registered');

    // send to user pot
    userPot.deposit.value(msg.value)(msg.sender);

    registered++;
    participantsIndex[registered] = msg.sender;
    participants[msg.sender] = Participant(registered, msg.sender);

    emit RegisterEvent(msg.sender, registered);
  }


  function getPayout(address _user) external view returns (uint256) {
    if (!ended || !isAttended(_user)) {
        return 0;
    }
    return payoutAmount;
  }

  function getDeposit(address _user) external view returns (uint256) {
    return deposit;
  }

  function hasEnded() external view returns (bool) {
    return ended;
  }

  // .... rest of the code almost same as the existing Conference contract

  function () external {
      revert('no fallback function');
  }
}
