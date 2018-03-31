pragma solidity ^0.4.19;

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
	event UnregisterEvent(address addr);
	event AttendEvent(address addr);
	event PaybackEvent(uint256 _payout);
	event WithdrawEvent(address addr, uint256 _payout);
	event CancelEvent();
	event ClearEvent(address addr, uint256 leftOver);
	event Logger(address indexed _sender, bytes32 msg);

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
		RegisterEvent(msg.sender, _participant, _encrypted);
	}

	function register(string _participant) external payable onlyActive{
		Logger(msg.sender, 'Starting register');

		registerInternal(_participant);
		RegisterEvent(msg.sender, _participant, '');
	}

	function unregister() external payable onlyActive{
		Logger(msg.sender, 'Starting unregister');

		unregisterInternal();
		UnregisterEvent(msg.sender);
	}

	function registerInternal(string _participant) internal {
		require(msg.value == deposit);
		require(registered < limitOfParticipants);
		require(!isRegistered(msg.sender));

		registered++;
		participantsIndex[registered] = msg.sender;
		participants[msg.sender] = Participant(_participant, msg.sender, false, false);
	}

	function unregisterInternal() internal {
		// require(msg.value == deposit);
		require(isRegistered(msg.sender));

		for(uint i=0;i<registered;i++){
			delete participants[msg.sender];

			if (participantsIndex[i] == msg.sender) {
				participantsIndex[i] = participantsIndex[registered - 1];
				delete participantsIndex[registered - 1];
				break;
			}
		}

		registered--;

		// TODO: Refund!
	}

	function withdraw() external onlyEnded{
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
		PaybackEvent(payoutAmount);
	}

	function cancel() external onlyOwner onlyActive{
		payoutAmount = deposit;
		cancelled = true;
		ended = true;
		endedAt = now;
		CancelEvent();
	}

	/* return the remaining of balance if there are any unclaimed after cooling period */
	function clear() external onlyOwner onlyEnded{
		require(now > endedAt + coolingPeriod);
		require(ended);
		var leftOver = totalBalance();
		owner.transfer(leftOver);
		ClearEvent(owner, leftOver);
	}

	function setLimitOfParticipants(uint _limitOfParticipants) external onlyOwner onlyActive{
		limitOfParticipants = _limitOfParticipants;
	}

	function attend(address[] _addresses) external onlyAdmin onlyActive{
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
