contract Conference {
	string public name;
	uint256 public balance;
	uint256 public deposit;
	uint public capacity;
	uint public registered;
	uint public attended;
	address public owner;

	mapping (address => Participant) public participants;
	mapping (uint => address) public participantsIndex;
	bool paid;
	uint256 _payout;

	struct Participant {
		string participantName;
		address addr;
		bool attended;
	}

	event Register(string participantName, address addr, uint256 balance, uint256 value);
	event Attend(address addr, uint256 balance);
	event Payback(address addr, uint256 _payout, uint256 balance, bool paid);
	event Cancel(address addr, uint256 balance);

	function Conference() {
		name = 'CodeUp';
		deposit = 1000000000000000000;		// 1 ETH = 10**18 wai
		balance = 0;
		registered = 0;
		attended = 0;
		owner = msg.sender;
	}

	function register(string _participant){
		Register(_participant, msg.sender, msg.sender.balance, msg.value);
		if (msg.value != deposit) throw;
		if (isRegistered()) throw;
		registered++;
		participantsIndex[registered] = msg.sender;
		participants[msg.sender] = Participant(_participant, msg.sender, false);
		balance = balance + (deposit * 1);
	}

	function attend(){
		if (isRegistered() != true) throw;
		if (isAttended()) throw;
		Attend(msg.sender, msg.sender.balance);
		participants[msg.sender].attended = true;
		attended++;
	}

	function isRegistered() returns (bool){
		return participants[msg.sender].addr != 0x0;
	}

	function isAttended() returns (bool){
		return isRegistered() && participants[msg.sender].attended;
	}

	function payout() returns(uint256){
		return balance / uint(attended);
	}

	function payback(){
		for(uint i=1;i<=registered;i++)
		{
			if(participants[participantsIndex[i]].attended){
				Payback(participantsIndex[i], payout(), participantsIndex[i].balance,  true);
				participantsIndex[i].send(payout());
			}else{
				Payback(participantsIndex[i], payout(), participantsIndex[i].balance, false);
			}
		}
		balance = 0;
	}

	function cancel(){
		Cancel(owner, balance);
		for(uint i=1;i<=registered;i++)
		{
			if(balance > 0){
				participantsIndex[i].send(deposit);
			}
			delete participants[participantsIndex[i]];
			delete participantsIndex[i];
		}
		balance = 0;
		registered = 0;
		attended = 0;
	}
}
