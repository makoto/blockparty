pragma solidity ^0.4.24;

import './lifecycle/Destructible.sol';
import './Event.sol';

/**
 * This is responsible for deploying a new Party.
 */
contract Deployer is Destructible {
    /**
     * Notify that a new party has been deployed.
     */
    event NewParty(address indexed deployedAddress, address indexed deployer);

    address userPot;

    constructor (address _userPot) public {
      userPot = _userPot;
    }

    /**
     * Deploy a new contract.
     * @param _name The name of the event
     * @param _deposit The amount each participant deposits. The default is set to 0.02 Ether. The amount cannot be changed once deployed.
     * @param _limitOfParticipants The number of participant. The default is set to 20. The number can be changed by the owner of the event.
     * @param _coolingPeriod The period participants should withdraw their deposit after the event ends. After the cooling period, the event owner can claim the remining deposits.
     */
    function deploy(
        string _name,
        uint256 _deposit,
        uint _limitOfParticipants,
        uint _coolingPeriod
    ) external {
        address owner = msg.sender;

        Event c = new Event(
          userPot,
          _name,
          _deposit,
          _limitOfParticipants,
          _coolingPeriod,
          owner
        );

        emit NewParty(address(c), owner);
    }

    function () external {
        revert('no fallback function');
    }
}
