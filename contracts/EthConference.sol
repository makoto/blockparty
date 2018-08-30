pragma solidity ^0.4.18;

import "./AbstractConference.sol";

contract EthConference is AbstractConference {

    function doWithdraw(address participant, uint amount) internal {
        participant.transfer(amount);
    }

    function doDeposit(address, uint amount) internal {
        require(msg.value == amount);
    }
}
