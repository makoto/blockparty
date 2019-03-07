pragma solidity ^0.5.4;

import './GroupAdmin.sol';

contract Conference is GroupAdmin {
    string public name;
    uint256 public deposit;
    uint256 public limitOfParticipants;
    uint256 public registered;
    bool public ended;
    bool public cancelled;
    uint256 public endedAt;
    uint256 public totalAttended;
    uint256 public coolingPeriod;
    uint256 public payoutAmount;
    uint256[] public attendanceMaps;

    mapping (address => Participant) public participants;
    mapping (uint256 => address) public participantsIndex;

    struct Participant {
        uint256 index;
        address payable addr;
        bool paid;
    }

    event RegisterEvent(address addr, uint256 index);
    event FinalizeEvent(uint256[] maps, uint256 payout, uint256 endedAt);
    event WithdrawEvent(address addr, uint256 payout);
    event CancelEvent(uint256 endedAt);
    event ClearEvent(address addr, uint256 leftOver);
    event UpdateParticipantLimit(uint256 limit);

    /* Modifiers */
    modifier onlyActive {
        require(!ended, 'already ended');
        _;
    }

    modifier noOneRegistered {
        require(registered == 0, 'people have already registered');
        _;
    }

    modifier onlyEnded {
        require(ended, 'not yet ended');
        _;
    }

    /* Public functions */
    /**
     * @dev Construcotr.
     * @param _name The name of the event
     * @param _deposit The amount each participant deposits. The default is set to 0.02 Ether. The amount cannot be changed once deployed.
     * @param _limitOfParticipants The number of participant. The default is set to 20. The number can be changed by the owner of the event.
     * @param _coolingPeriod The period participants should withdraw their deposit after the event ends. After the cooling period, the event owner can claim the remining deposits.
     * @param _owner Who the owner of this contract should be
     */
    constructor (
        string memory _name,
        uint256 _deposit,
        uint256 _limitOfParticipants,
        uint256 _coolingPeriod,
        address payable _owner
    ) public {
        if (_owner != address(0)) {
            owner = _owner;
        }

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
    }

    /**
     * @dev Register for the event
     */
    function register() external payable onlyActive{
        require(msg.value == deposit, 'must send exact deposit amount');
        require(registered < limitOfParticipants, 'participant limit reached');
        require(!isRegistered(msg.sender), 'already registered');

        registered++;
        participantsIndex[registered] = msg.sender;
        participants[msg.sender] = Participant(registered, msg.sender, false);

        emit RegisterEvent(msg.sender, registered);
    }


    /**
     * @dev Withdraws deposit after the event is over.
     */
    function withdraw() external onlyEnded{
        require(payoutAmount > 0, 'payout is 0');
        Participant storage participant = participants[msg.sender];
        require(participant.addr == msg.sender, 'forbidden access');
        require(cancelled || isAttended(msg.sender), 'event still active or you did not attend');
        require(participant.paid == false, 'already withdrawn');

        participant.paid = true;
        participant.addr.transfer(payoutAmount);
        emit WithdrawEvent(msg.sender, payoutAmount);
    }

    /* Constants */
    /**
     * @dev Returns total balance of the contract. This function can be deprecated when refactroing front end code.
     * @return The total balance of the contract.
     */
    function totalBalance() public view returns (uint256){
        return address(this).balance;
    }

    /**
     * @dev Returns true if the given user is registered.
     * @param _addr The address of a participant.
     * @return True if the address exists in the pariticipant list.
     */
    function isRegistered(address _addr) public view returns (bool){
        return participants[_addr].addr != address(0);
    }

    /**
     * @dev Returns true if the given user is attended.
     * @param _addr The address of a participant.
     * @return True if the user is marked as attended by admin.
     */
    function isAttended(address _addr) public view returns (bool){
        if (!isRegistered(_addr) || !ended) {
            return false;
        }
        // check the attendance maps
        else {
            Participant storage p = participants[_addr];
            uint256 pIndex = p.index - 1;
            uint256 map = attendanceMaps[uint256(pIndex / 256)];
            return (0 < (map & (2 ** (pIndex % 256))));
        }
    }


    /**
     * @dev Returns true if the given user has withdrawn his/her deposit.
     * @param _addr The address of a participant.
     * @return True if the attendee has withdrawn his/her deposit.
     */
    function isPaid(address _addr) public view returns (bool){
        return isRegistered(_addr) && participants[_addr].paid;
    }

    /* Admin only functions */

    /**
     * @dev Cancels the event by owner. When the event is canceled each participant can withdraw their deposit back.
     */
    function cancel() external onlyOwner onlyActive{
        payoutAmount = deposit;
        cancelled = true;
        ended = true;
        endedAt = now;
        emit CancelEvent(endedAt);
    }

    /**
    * @dev The event owner transfer the outstanding deposits  if there are any unclaimed deposits after cooling period
    */
    function clear() external onlyOwner onlyEnded{
        require(now > endedAt + coolingPeriod, 'still in cooling period');
        uint256 leftOver = totalBalance();
        owner.transfer(leftOver);
        emit ClearEvent(owner, leftOver);
    }

    /**
     * @dev Change the capacity of the event. The owner can change it until event is over.
     * @param _limitOfParticipants the number of the capacity of the event.
     */
    function setLimitOfParticipants(uint256 _limitOfParticipants) external onlyOwner onlyActive{
        limitOfParticipants = _limitOfParticipants;

        emit UpdateParticipantLimit(limitOfParticipants);
    }

    /**
     * @dev Change the name of the event. The owner can change it as long as no one has registered yet.
     * @param _name the name of the event.
     */
    function changeName(string calldata _name) external onlyOwner noOneRegistered{
        name = _name;
    }

    /**
     * @dev Mark participants as attended and enable payouts. The attendance cannot be undone.
     * @param _maps The attendance status of participants represented by uint256 values.
     */
    function finalize(uint256[] calldata _maps) external onlyAdmin onlyActive {
        uint256 totalBits = _maps.length * 256;
        require(totalBits >= registered && totalBits - registered < 256, 'incorrect no. of bitmaps provided');
        attendanceMaps = _maps;
        ended = true;
        endedAt = now;
        uint256 _totalAttended = 0;
        // calculate total attended
        for (uint256 i = 0; i < attendanceMaps.length; i++) {
            uint256 map = attendanceMaps[i];
            // brian kerninghan bit-counting method - O(log(n))
            while (map != 0) {
                map &= (map - 1);
                _totalAttended++;
            }
        }
        // since maps can contain more bits than there are registrants, we cap the value!
        totalAttended = _totalAttended < registered ? _totalAttended : registered;

        if (totalAttended > 0) {
            payoutAmount = uint256(totalBalance()) / totalAttended;
        }

        emit FinalizeEvent(attendanceMaps, payoutAmount, endedAt);
    }
}
