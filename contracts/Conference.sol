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

	event Register(string participantName, address addr, uint256 balance, uint256 value);
	event Attend(address addr, uint256 balance);
	event Payback(address addr, uint256 _payout, uint256 balance, bool paid);

	function Conference(uint _coolingPeriod) {
		name = 'CodeUp';
		deposit = 1 ether;
		totalBalance = 0;
		registered = 0;
		attended = 0;
		limitOfParticipants = 10;
		ended = false;
		if (_coolingPeriod != 0) {
			coolingPeriod = _coolingPeriod;
		} else {
			coolingPeriod = 1 weeks;
		}
	}

	modifier sentDepositOrReturn {
		if (msg.value == deposit) {
			_
		}else{
			if(msg.sender.send(msg.value)){/* not much you can do */}
		}
	}

	modifier onlyActive {
		if (ended == false) {
			_
		}
	}

	modifier onlyActiveOrReturn {
		if (ended == false) {
			_
		}else{
			if(msg.sender.send(msg.value)){/*not much you can do*/}
		}
	}

	modifier withinLimitOrReturn {
		if (registered < limitOfParticipants ) {
			_
		}else{
			if(msg.sender.send(msg.value)){/* not much you can do */}
		}
	}

	function register(string _participant) sentDepositOrReturn withinLimitOrReturn onlyActiveOrReturn{
		Register(_participant, msg.sender, msg.sender.balance, msg.value);
		if (isRegistered(msg.sender)) throw;
		registered++;
		participantsIndex[registered] = msg.sender;
		participants[msg.sender] = Participant(_participant, msg.sender, false, 0, false);
		totalBalance = totalBalance + (deposit * 1);
	}

	function setLimitOfParticipants(uint _limitOfParticipants) {
		limitOfParticipants = _limitOfParticipants;
	}

	function attend(address _addr) onlyOwner{
		if (isRegistered(_addr) != true) throw;
		if (isAttended(_addr)) throw;
		Attend(_addr, msg.sender.balance);
		participants[_addr].attended = true;
		attended++;
	}

	function isRegistered(address _addr) returns (bool){
		return participants[_addr].addr != 0x0;
	}

	function isAttended(address _addr) returns (bool){
		return isRegistered(_addr) && participants[_addr].attended;
	}

	function isPaid(address _addr) returns (bool){
		return isRegistered(_addr) && participants[_addr].paid;
	}

	function payout() returns(uint256){
		return totalBalance / uint(attended);
	}

	function payback() onlyOwner{
		for(uint i=1;i<=registered;i++){
			if(participants[participantsIndex[i]].attended){
				participants[participantsIndex[i]].payout = payout();
			}
		}
		ended = true;
		endedAt = now;
	}

	function cancel() onlyOwner onlyActive{
		for(uint i=1;i<=registered;i++){
			participants[participantsIndex[i]].payout = deposit;
		}
		ended = true;
		endedAt = now;
	}

	modifier onlyPayable {
		Participant participant = participants[msg.sender];
		if (participant.payout > 0){
			_
		}
	}

	modifier notPaid {
		Participant participant = participants[msg.sender];
		if (participant.paid == false){
			_
		}
	}

	function withdraw() onlyPayable notPaid {
		Participant participant = participants[msg.sender];
		if (msg.sender.send(participant.payout)) {
			participant.paid = true;
			totalBalance -= participant.payout;
		}
	}

	modifier isEnded {
		if (ended){
			_
		}
	}

	modifier onlyAfter(uint _time) {
		if (now > _time){
			_
		}
	}

	/* return the remaining of balance if there are any unclaimed after cooling period */
	function clear() onlyOwner isEnded onlyAfter(endedAt + coolingPeriod) {
		if(owner.send(totalBalance)){
			totalBalance = 0;
		}
	}
}
