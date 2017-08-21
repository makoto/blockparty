pragma solidity ^0.4.11;

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
	uint256 _payout;

	struct Participant {
		string participantName;
		address addr;
		bool attended;
		bool paid;
	}

	event RegisterEvent(address addr, string participantName, string encryption);
	event AttendEvent(address addr);
	event PaybackEvent(uint256 _payout);
	event WithdrawEvent(address addr, uint256 _payout);
	event CancelEvent();
	event ClearEvent(address addr, uint256 leftOver);

	/* Modifiers */
	modifier sentDepositOrReturn {
		if (msg.value == deposit) {
			_;
		}else{
			assert(msg.sender.send(msg.value));
		}
	}

	modifier onlyActive {
		if (ended == false) {
			_;
		}
	}

	modifier onlyActiveOrReturn {
		if (ended == false) {
			_;
		}else{
			assert(msg.sender.send(msg.value));
		}
	}

	modifier withinLimitOrReturn {
		if (registered < limitOfParticipants ) {
			_;
		}else{
			assert(msg.sender.send(msg.value));
		}
	}

	modifier isEnded {
		if (ended){
			_;
		}
	}

	modifier onlyAfter(uint _time) {
		if (now > _time){
			_;
		}
	}

	modifier onlyPayable {
		Participant participant = participants[msg.sender];
		if (cancelled || (payoutAmount > 0 && participant.attended)){
			_;
		}
	}

	modifier notPaid {
		Participant participant = participants[msg.sender];
		if (participant.paid == false){
			_;
		}
	}

	modifier ifConfirmed(bytes32 _code){
		require(confirmationRepository.claim(_code, msg.sender));
		_;
	}

	/* Public functions */

	function Conference(uint _coolingPeriod, address _confirmation_repository_address, string _encryption) {
		name = 'Test';
		deposit = 0.05 ether;
		limitOfParticipants = 20;
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

	function registerWithEncryption(string _participant, string _encrypted) public payable{
		registerInternal(_participant);
		RegisterEvent(msg.sender, _participant, _encrypted);
	}

	function register(string _participant) public payable{
		registerInternal(_participant);
		RegisterEvent(msg.sender, _participant, '');
	}

	function registerInternal(string _participant) internal sentDepositOrReturn withinLimitOrReturn onlyActiveOrReturn {
		require(!isRegistered(msg.sender));
		registered++;
		participantsIndex[registered] = msg.sender;
		participants[msg.sender] = Participant(_participant, msg.sender, false, false);
	}

	function attendWithConfirmation(bytes32 _confirmation) public ifConfirmed(_confirmation){
		require(isRegistered(msg.sender));
		require(!isAttended(msg.sender));
		participants[msg.sender].attended = true;
		attended++;
		AttendEvent(msg.sender);
	}

	function withdraw() public onlyPayable notPaid {
		Participant participant = participants[msg.sender];
		participant.paid = true;
		assert(msg.sender.send(payoutAmount));
		WithdrawEvent(msg.sender, payoutAmount);
	}

	/* Constants */
	function totalBalance() constant returns (uint256){
		return this.balance;
	}

	function confirmation() constant returns (bool){
		confirmationRepository != address(0);
	}

	function isRegistered(address _addr) constant returns (bool){
		return participants[_addr].addr != address(0);
	}

	function isAttended(address _addr) constant returns (bool){
		return isRegistered(_addr) && participants[_addr].attended;
	}

	function isPaid(address _addr) constant returns (bool){
		return isRegistered(_addr) && participants[_addr].paid;
	}

	function payout() constant returns(uint256){
		if (attended == 0) return 0;
		return uint(totalBalance()) / uint(attended);
	}

	/* Admin only functions */

	function payback() onlyOwner{
		payoutAmount = payout();
		ended = true;
		endedAt = now;
		PaybackEvent(payoutAmount);
	}

	function cancel() onlyOwner onlyActive{
		payoutAmount = deposit;
		cancelled = true;
		ended = true;
		endedAt = now;
		CancelEvent();
	}

	/* return the remaining of balance if there are any unclaimed after cooling period */
	function clear() public onlyOwner isEnded onlyAfter(endedAt + coolingPeriod) {
		var leftOver = totalBalance();
		ClearEvent(owner, leftOver);
		assert(owner.send(leftOver));
	}

	function setLimitOfParticipants(uint _limitOfParticipants) public onlyOwner{
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
