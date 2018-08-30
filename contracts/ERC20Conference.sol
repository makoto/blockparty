pragma solidity ^0.4.18;

import "./AbstractConference.sol";
import "./ERC20.sol";

contract ERC20Conference is AbstractConference {

    ERC20 public token; // @todo use a safe transfer proxy

    constructor(
        string _name,
        uint256 _deposit,
        uint _limitOfParticipants,
        uint _coolingPeriod,
        string _encryption,
        ERC20 _token
    )
        AbstractConference(_name, _deposit, _limitOfParticipants, _coolingPeriod, _encryption)
        public
    {
        token = _token;
    }

    function doWithdraw(address participant, uint amount) internal {
        token.transfer(participant, amount);
    }

    function doDeposit(address participant, uint amount) internal {
        token.transferFrom(participant, amount);
    }

}
