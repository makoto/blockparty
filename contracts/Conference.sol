pragma solidity 0.4.24;

import './GroupAdmin.sol';
import './zeppelin/lifecycle/Destructible.sol';

contract Conference is Destructible, GroupAdmin {    
    string public name;
    uint256 public deposit;
    uint public limitOfParticipants;
    uint public registered;
    uint public attended;
    bool public ended;
    bool public cancelled;
    uint public endedAt;
    uint public coolingPeriod;
    uint256 public payoutAmount;
    string public encryption;

    mapping (address => Participant) public participants;
    mapping (uint => address) public participantsIndex;

    struct Participant {
        string participantName;
        address addr;
        bool attended;
        bool paid;
    }

    event RegisterEvent(address addr, string participantName, string _encryption);
    event AttendEvent(address addr);
    event PaybackEvent(uint256 _payout);
    event WithdrawEvent(address addr, uint256 _payout);
    event CancelEvent();
    event ClearEvent(address addr, uint256 leftOver);

    /* Modifiers */
    modifier onlyActive {
        require(!ended);
        _;
    }

    modifier noOneRegistered {
        require(registered == 0);
        _;
    }

    modifier onlyEnded {
        require(ended);
        _;
    }

    /* Public functions */
    /**
     * @dev Construcotr.
     * @param _name The name of the event
     * @param _deposit The amount each participant deposits. The default is set to 0.02 Ether. The amount cannot be changed once deployed.
     * @param _limitOfParticipants The number of participant. The default is set to 20. The number can be changed by the owner of the event.
     * @param _coolingPeriod The period participants should withdraw their deposit after the event ends. After the cooling period, the event owner can claim the remining deposits.
     * @param _encryption A pubic key. The admin can use this public key to encrypt pariticipant username which is stored in event. The admin can later decrypt the name using his/her private key.
     */
    constructor (
        string _name,
        uint256 _deposit,
        uint _limitOfParticipants,
        uint _coolingPeriod,
        string _encryption
    ) public {
        if (bytes(_name).length != 0){
            name = _name;
        } else {
            name = 'Test';
        }

        if(_deposit != 0){
            deposit = _deposit;
        }else{
            deposit = 0.02 ether;
        }

        if (_limitOfParticipants != 0){
            limitOfParticipants = _limitOfParticipants;
        }else{
            limitOfParticipants = 20;
        }

        if (_coolingPeriod != 0) {
            coolingPeriod = _coolingPeriod;
        } else {
            coolingPeriod = 1 weeks;
        }

        if (bytes(_encryption).length != 0) {
            encryption = _encryption;
        }
    }

    /**
     * @dev Registers with twitter name and full user name (the user name is encrypted).
     * @param _participant The twitter address of the participant
     * @param _encrypted The encrypted participant name
     */
    function registerWithEncryption(string _participant, string _encrypted) external payable onlyActive{
        registerInternal(_participant);
        emit RegisterEvent(msg.sender, _participant, _encrypted);
    }

    /**
     * @dev Registers with twitter name.
     * @param _participant The twitter address of the participant
     */
    function register(string _participant) external payable onlyActive{
        registerInternal(_participant);
        emit RegisterEvent(msg.sender, _participant, '');
    }

    /**
     * @dev The internal function to register participant
     * @param _participant The twitter address of the participant
     */
    function registerInternal(string _participant) internal {
        require(msg.value == deposit);
        require(registered < limitOfParticipants);
        require(!isRegistered(msg.sender));

        registered++;
        participantsIndex[registered] = msg.sender;
        participants[msg.sender] = Participant(_participant, msg.sender, false, false);
    }

    /**
     * @dev Withdraws deposit after the event is over.
     */
    function withdraw() external onlyEnded{
        require(payoutAmount > 0);
        Participant participant = participants[msg.sender];
        require(participant.addr == msg.sender);
        require(cancelled || participant.attended);
        require(participant.paid == false);

        participant.paid = true;
        participant.addr.transfer(payoutAmount);
        emit WithdrawEvent(msg.sender, payoutAmount);
    }

    /* Constants */
    /**
     * @dev Returns total balance of the contract. This function can be deprecated when refactroing front end code.
     * @return The total balance of the contract.
     */
    function totalBalance() view public returns (uint256){
        return address(this).balance;
    }

    /**
     * @dev Returns true if the given user is registered.
     * @param _addr The address of a participant.
     * @return True if the address exists in the pariticipant list.
     */
    function isRegistered(address _addr) view public returns (bool){
        return participants[_addr].addr != address(0);
    }

    /**
     * @dev Returns true if the given user is attended.
     * @param _addr The address of a participant.
     * @return True if the user is marked as attended by admin.
     */
    function isAttended(address _addr) view public returns (bool){
        return isRegistered(_addr) && participants[_addr].attended;
    }

    /**
     * @dev Returns true if the given user has withdrawn his/her deposit.
     * @param _addr The address of a participant.
     * @return True if the attendee has withdrawn his/her deposit.
     */
    function isPaid(address _addr) view public returns (bool){
        return isRegistered(_addr) && participants[_addr].paid;
    }

    /**
     * @dev Show the payout amount each participant can withdraw.
     * @return The amount each participant can withdraw.
     */
    function payout() view public returns(uint256){
        if (attended == 0) return 0;
        return uint(totalBalance()) / uint(attended);
    }

    /* Admin only functions */

    /**
     * @dev Ends the event by owner
     */
    function payback() external onlyOwner onlyActive{
        payoutAmount = payout();
        ended = true;
        endedAt = now;
        emit PaybackEvent(payoutAmount);
    }

    /**
     * @dev Cancels the event by owner. When the event is canceled each participant can withdraw their deposit back.
     */
    function cancel() external onlyOwner onlyActive{
        payoutAmount = deposit;
        cancelled = true;
        ended = true;
        endedAt = now;
        emit CancelEvent();
    }

    /**
    * @dev The event owner transfer the outstanding deposits  if there are any unclaimed deposits after cooling period
    */
    function clear() external onlyOwner onlyEnded{
        require(now > endedAt + coolingPeriod);
        uint leftOver = totalBalance();
        owner.transfer(leftOver);
        emit ClearEvent(owner, leftOver);
    }

    /**
     * @dev Change the capacity of the event. The owner can change it until event is over.
     * @param _limitOfParticipants the number of the capacity of the event.
     */
    function setLimitOfParticipants(uint _limitOfParticipants) external onlyOwner onlyActive{
        limitOfParticipants = _limitOfParticipants;
    }

    /**
     * @dev Change the name of the event. The owner can change it as long as no one has registered yet.
     * @param _name the name of the event.
     */
    function changeName(string _name) external onlyOwner noOneRegistered{
        name = _name;
    }

    /**
     * @dev Mark participants as attended. The attendance cannot be undone.
     * @param _addresses The list of participant's address.
     */
    function attend(address[] _addresses) external onlyAdmin onlyActive{
        for( uint i = 0; i < _addresses.length; i++){
            address _addr = _addresses[i];
            require(isRegistered(_addr));
            require(!isAttended(_addr));
            emit AttendEvent(_addr);
            participants[_addr].attended = true;
            attended++;
        }
    }
}
