pragma solidity ^0.4.8;
import './InvitationRepository.sol';
import './ConfirmationRepository.sol';
import './zeppelin/Rejector.sol';
import './zeppelin/Ownable.sol';
import './zeppelin/Killable.sol';

contract Conference is Rejector, Killable {
	string public name;
	uint256 public totalBalance;
	uint256 public deposit;
	uint public limitOfParticipants;
	uint public registered;
	uint public attended;
	bool public ended;
	uint public endedAt;
	uint public coolingPeriod;
	bool public invitation;
	bool public confirmation;
	InvitationRepository public invitationRepository;
	ConfirmationRepository public confirmationRepository;

	mapping (address => Participant) public participants;
	mapping (uint => address) public participantsIndex;
	bool paid;
	uint256 _payout;

	struct Participant {
		string participantName;
		address addr;
		bool attended;
		uint256 payout;
		bool paid;
	}

	event RegisterEvent(address addr, string participantName);
	event AttendEvent(address addr);
	event PaybackEvent(address addr, uint256 _payout);
	event WithdrawEvent(address addr, uint256 _payout);
	event CancelEvent(address addr, uint256 _payout);
	event ClearEvent(address addr, uint256 leftOver);

	/* Modifiers */
	modifier sentDepositOrReturn {
		if (msg.value == deposit) {
			_;
		}else{
			if(!msg.sender.send(msg.value)) throw;
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
			if(!msg.sender.send(msg.value)) throw;
		}
	}

	modifier withinLimitOrReturn {
		if (registered < limitOfParticipants ) {
			_;
		}else{
			if(!msg.sender.send(msg.value)) throw;
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
		if (participant.payout > 0){
			_;
		}
	}

	modifier notPaid {
		Participant participant = participants[msg.sender];
		if (participant.paid == false){
			_;
		}
	}

	modifier ifInvited(bytes32 invitation_code){
		if(invitation && !invitationRepository.claim(invitation_code, msg.sender)) throw;
		_;
	}

	modifier ifConfirmed(bytes32 _code){
		if(confirmation && !confirmationRepository.claim(_code, msg.sender)) throw;
		_;
	}

	/* Public functions */

	function Conference(uint _coolingPeriod, address _invitation_repository_address, address _confirmation_repository_address) {
		name = 'Test';
		deposit = 1 ether;
		totalBalance = 0;
		registered = 0;
		attended = 0;
		limitOfParticipants = 10;
		ended = false;
		invitation = false;
		confirmation = false;
		if (_coolingPeriod != 0) {
			coolingPeriod = _coolingPeriod;
		} else {
			coolingPeriod = 1 weeks;
		}

		if (_invitation_repository_address !=0) {
			invitation = true;
			invitationRepository = InvitationRepository(_invitation_repository_address);
		}

		if (_confirmation_repository_address !=0) {
			confirmation = true;
			confirmationRepository = ConfirmationRepository(_confirmation_repository_address);
		}
	}

	function registerWithInvitation(string _participant, bytes32 _invitation_code) public sentDepositOrReturn withinLimitOrReturn onlyActiveOrReturn ifInvited(_invitation_code) payable{
		register(_participant);
	}

	function register(string _participant) public sentDepositOrReturn withinLimitOrReturn onlyActiveOrReturn payable{
		RegisterEvent(msg.sender, _participant);
		if (isRegistered(msg.sender)) throw;
		registered++;
		participantsIndex[registered] = msg.sender;
		participants[msg.sender] = Participant(_participant, msg.sender, false, 0, false);
		totalBalance = totalBalance + (deposit * 1);
	}

	function attendWithConfirmation(bytes32 _confirmation) public ifConfirmed(_confirmation){
		if (isRegistered(msg.sender) != true) throw;
		if (isAttended(msg.sender)) throw;
		AttendEvent(msg.sender);
		participants[msg.sender].attended = true;
		attended++;
	}

	function withdraw() public onlyPayable notPaid {
		WithdrawEvent(msg.sender, participant.payout);
		Participant participant = participants[msg.sender];
		participant.paid = true;
		totalBalance -= participant.payout;
		if (!msg.sender.send(participant.payout)) {
			throw;
		}
	}

	/* Constants */
	function isRegistered(address _addr) constant returns (bool){
		return participants[_addr].addr != 0x0;
	}

	function isAttended(address _addr) constant returns (bool){
		return isRegistered(_addr) && participants[_addr].attended;
	}

	function isPaid(address _addr) constant returns (bool){
		return isRegistered(_addr) && participants[_addr].paid;
	}

	function payout() constant returns(uint256){
		if (attended == 0) return 0;
		return uint(totalBalance) / uint(attended);
	}

	/* Admin only functions */

	function payback() onlyOwner{
		for(uint i=1;i<=registered;i++){
			if(participants[participantsIndex[i]].attended){
				participants[participantsIndex[i]].payout = payout();
				PaybackEvent(participantsIndex[i], payout());
			}
		}
		ended = true;
		endedAt = now;
	}

	function cancel() onlyOwner onlyActive{
		for(uint i=1;i<=registered;i++){
			participants[participantsIndex[i]].payout = deposit;
			CancelEvent(participantsIndex[i], deposit);
		}
		ended = true;
		endedAt = now;
	}

	/* return the remaining of balance if there are any unclaimed after cooling period */
	function clear() public onlyOwner isEnded onlyAfter(endedAt + coolingPeriod) {
		var leftOver = totalBalance;
		totalBalance = 0;
		ClearEvent(owner, leftOver);
		if(!owner.send(leftOver)) throw;
	}

	function setLimitOfParticipants(uint _limitOfParticipants) public onlyOwner{
		limitOfParticipants = _limitOfParticipants;
	}

	function attend(address[] _addresses) public onlyOwner{
		for(uint i=0;i<_addresses.length;i++){
			var _addr = _addresses[i];
			if (isRegistered(_addr) != true) throw;
			if (isAttended(_addr)) throw;
			AttendEvent(_addr);
			participants[_addr].attended = true;
			attended++;
		}
	}
}
