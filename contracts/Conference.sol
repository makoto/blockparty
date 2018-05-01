pragma solidity ^0.4.23;

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
	bool paid;

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

	modifier onlyEnded {
		require(ended);
		_;
	}

	/* Public functions */

	constructor (
		string _name,
		uint256 _deposit,
		uint _limitOfParticipants,
		uint _coolingPeriod,
		string _encryption
	) public {
		if(bytes(_name).length != 0){
			name = _name;
		}else{
			name = 'Test';
		}

		if(_deposit != 0){
			deposit = _deposit;
		}else{
			deposit = 0.02 ether;
		}

		if(_limitOfParticipants !=0){
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

	function registerWithEncryption(string _participant, string _encrypted) external payable onlyActive{
		registerInternal(_participant);
		emit RegisterEvent(msg.sender, _participant, _encrypted);
	}

	function register(string _participant) external payable onlyActive{
		registerInternal(_participant);
		emit RegisterEvent(msg.sender, _participant, '');
	}

	function registerInternal(string _participant) internal {
		require(msg.value == deposit);
		require(registered < limitOfParticipants);
		require(!isRegistered(msg.sender));

		registered++;
		participantsIndex[registered] = msg.sender;
		participants[msg.sender] = Participant(_participant, msg.sender, false, false);
	}

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
	function totalBalance() constant public returns (uint256){
		return address(this).balance;
	}

	function isRegistered(address _addr) constant public returns (bool){
		return participants[_addr].addr != address(0);
	}

	function isAttended(address _addr) constant public returns (bool){
		return isRegistered(_addr) && participants[_addr].attended;
	}

	function isPaid(address _addr) constant public returns (bool){
		return isRegistered(_addr) && participants[_addr].paid;
	}

	function payout() constant public returns(uint256){
		if (attended == 0) return 0;
		return uint(totalBalance()) / uint(attended);
	}

	/* Admin only functions */

	function payback() external onlyOwner onlyActive{
		payoutAmount = payout();
		ended = true;
		endedAt = now;
		emit PaybackEvent(payoutAmount);
	}

	function cancel() external onlyOwner onlyActive{
		payoutAmount = deposit;
		cancelled = true;
		ended = true;
		endedAt = now;
		emit CancelEvent();
	}

	/* return the remaining of balance if there are any unclaimed after cooling period */
	function clear() external onlyOwner onlyEnded{
		require(now > endedAt + coolingPeriod);
<<<<<<< HEAD
		var leftOver = totalBalance();
=======
		require(ended);
		uint leftOver = totalBalance();
>>>>>>> Upgrade truffle to  4.1.7 and solc to 0.4.23
		owner.transfer(leftOver);
		emit ClearEvent(owner, leftOver);
	}

	function setLimitOfParticipants(uint _limitOfParticipants) external onlyOwner onlyActive{
		limitOfParticipants = _limitOfParticipants;
	}

	function attend(address[] _addresses) external onlyAdmin onlyActive{
		for(uint i=0;i<_addresses.length;i++){
			address _addr = _addresses[i];
			require(isRegistered(_addr));
			require(!isAttended(_addr));
			emit AttendEvent(_addr);
			participants[_addr].attended = true;
			attended++;
		}
	}
}
