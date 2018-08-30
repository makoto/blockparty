pragma solidity 0.4.24;

interface Conference {

    event RegisterEvent(address addr, string participantName, string _encryption);
    event AttendEvent(address addr);
    event PaybackEvent(uint256 _payout);
    event WithdrawEvent(address addr, uint256 _payout);
    event CancelEvent();
    event ClearEvent(address addr, uint256 leftOver);

}
