import './zeppelin/Rejector.sol';

contract Conference is Rejector {
	string public name;
	uint256 public totalBalance;
	uint256 public deposit;
	uint public limitOfParticipants;
	uint public registered;
	uint public attended;
	address public owner;
	bool public ended;
	mapping (address => Participant) public participants;
	mapping (uint => address) public participantsIndex;
	bool paid;
	uint256 _payout;

	struct Participant {
		string participantName;
		address addr;
		bool attended;
		int payout;
	}

	event Register(string participantName, address addr, uint256 balance, uint256 value);
	event Attend(address addr, uint256 balance);
	event Payback(address addr, uint256 _payout, uint256 balance, bool paid);
	event Cancel(address addr, uint256 balance);

	function Conference() {
		name = 'CodeUp';
		deposit = 1000000000000000000;		// 1 ETH = 10**18 wai
		totalBalance = 0;
		registered = 0;
		attended = 0;
		limitOfParticipants = 10;
		owner = msg.sender;
		ended = false;
	}

	modifier sentDepositOrReturn {
		if (msg.value == deposit) {
			_
		}else{
			msg.sender.send(msg.value);
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
			msg.sender.send(msg.value);
		}
	}

	modifier withinLimitOrReturn {
		if (registered < limitOfParticipants ) {
			_
		}else{
			msg.sender.send(msg.value);
		}
	}

	function register(string _participant) sentDepositOrReturn withinLimitOrReturn onlyActiveOrReturn{
		Register(_participant, msg.sender, msg.sender.balance, msg.value);
		if (isRegistered(msg.sender)) throw;
		registered++;
		participantsIndex[registered] = msg.sender;
		participants[msg.sender] = Participant(_participant, msg.sender, false, 0);
		totalBalance = totalBalance + (deposit * 1);
	}

	function setLimitOfParticipants(uint _limitOfParticipants) {
		limitOfParticipants = _limitOfParticipants;
	}

	modifier onlyByOwner {
		if (msg.sender == owner) _
	}

	function attend(address _addr) onlyByOwner{
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

	function payout() returns(uint256){
		return totalBalance / uint(attended);
	}

	function payback() onlyByOwner{
		for(uint i=1;i<=registered;i++)
		{
			if(participants[participantsIndex[i]].attended){
				Payback(participantsIndex[i], payout(), participantsIndex[i].balance,  true);
				participants[participantsIndex[i]].payout = int(payout() - deposit);
				participantsIndex[i].send(payout());
			}else{
				participants[participantsIndex[i]].payout = int(deposit - (deposit * 2));
				Payback(participantsIndex[i], payout(), participantsIndex[i].balance, false);
			}
		}
		totalBalance = 0;
		ended = true;
	}

	function cancel() onlyByOwner onlyActive{
		Cancel(owner, totalBalance);
		for(uint i=1;i<=registered;i++)
		{
			if(totalBalance > 0){
				participantsIndex[i].send(deposit);
			}
			delete participants[participantsIndex[i]];
			delete participantsIndex[i];
		}
		totalBalance = 0;
		registered = 0;
		attended = 0;
		ended = true;
	}
}
