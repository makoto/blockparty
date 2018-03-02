pragma solidity ^0.4.19;

import './ConfirmationRepository.sol';
import './zeppelin/ownership/Ownable.sol';
import './zeppelin/lifecycle/Destructible.sol';

contract Conference is Destructible {
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
	ConfirmationRepository public confirmationRepository;
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

	function Conference (
		string _name,
		uint256 _deposit,
		uint _limitOfParticipants,
		uint _coolingPeriod,
		address _confirmation_repository_address,
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

		if (_confirmation_repository_address !=0) {
			confirmationRepository = ConfirmationRepository(_confirmation_repository_address);
		}
	}

	function registerWithEncryption(string _participant, string _encrypted) public payable onlyActive{
		registerInternal(_participant);
		RegisterEvent(msg.sender, _participant, _encrypted);
	}

	function register(string _participant) public payable onlyActive{
		registerInternal(_participant);
		RegisterEvent(msg.sender, _participant, '');
	}

	function registerInternal(string _participant) internal {
		require(msg.value == deposit);
		require(registered < limitOfParticipants);
		require(!isRegistered(msg.sender));

		registered++;
		participantsIndex[registered] = msg.sender;
		participants[msg.sender] = Participant(_participant, msg.sender, false, false);
	}

	function attendWithConfirmation(bytes32 _confirmation) public onlyActive{
		require(isRegistered(msg.sender));
		require(!isAttended(msg.sender));
		require(confirmationRepository.claim(_confirmation, msg.sender));

		participants[msg.sender].attended = true;
		attended++;
		AttendEvent(msg.sender);
	}

	function withdraw() public onlyEnded{
		require(payoutAmount > 0);
		Participant participant = participants[msg.sender];
		require(participant.addr == msg.sender);
		require(cancelled || participant.attended);
		require(participant.paid == false);

		participant.paid = true;
		participant.addr.transfer(payoutAmount);
		WithdrawEvent(msg.sender, payoutAmount);
	}

	/* Constants */
	function totalBalance() constant public returns (uint256){
		return this.balance;
	}

	function confirmation() constant public returns (bool){
		return address(confirmationRepository) != address(0);
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

	function payback() public onlyOwner onlyActive{
		payoutAmount = payout();
		ended = true;
		endedAt = now;
		PaybackEvent(payoutAmount);
	}

	function cancel() public onlyOwner onlyActive{
		payoutAmount = deposit;
		cancelled = true;
		ended = true;
		endedAt = now;
		CancelEvent();
	}

	/* return the remaining of balance if there are any unclaimed after cooling period */
	function clear() public onlyOwner onlyEnded{
		require(now > endedAt + coolingPeriod);
		require(ended);
		var leftOver = totalBalance();
		
		owner.transfer(leftOver);
		ClearEvent(owner, leftOver);
	}

	function setLimitOfParticipants(uint _limitOfParticipants) public onlyOwner onlyActive{
		limitOfParticipants = _limitOfParticipants;
	}

	function attend(address[] _addresses) public onlyOwner onlyActive{
		for(uint i=0;i<_addresses.length;i++){
			var _addr = _addresses[i];
			require(isRegistered(_addr));
			require(!isAttended(_addr));
			AttendEvent(_addr);
			participants[_addr].attended = true;
			attended++;
		}
	}
}
