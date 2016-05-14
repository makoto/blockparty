contract Conference {
	string public name;
	uint256 public balance;
	uint256 public deposit;
	uint256 public pot;
	uint public capacity;
	uint public registered;
	uint public attended;
	mapping (address => Participant) public participants;
	mapping (uint => address) participantsIndex;
	bool paid;

	struct Participant {
		address addr;
		bool attended;
	}

	event Register(address addr, uint256 balance, uint256 value);
	event Attend(address addr, uint256 balance);
	event Payback(address addr, uint256 pot, uint256 balance, bool paid);

	function Conference() {
		name = 'CodeUp';
		deposit = 1000000000000000000;		// 1 ETH = 10**18 wai
		balance = 0;
		registered = 0;
		attended = 0;
	}

	function register(){
		Register(msg.sender, msg.sender.balance, msg.value);
		if (msg.value != deposit) throw;
		/*if (isRegistered()) throw;*/
		registered++;
		participantsIndex[registered] = msg.sender;
		participants[msg.sender] = Participant(msg.sender, false);
		balance = balance + (deposit * 1);
	}

	function attend(){
		if (isRegistered() != true) throw;
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

	function payback(){
		pot = balance / uint(attended);
		for(uint i=1;i<=registered;i++)
		{
				if(participants[participantsIndex[i]].attended){
					Payback(participantsIndex[i], pot, participantsIndex[i].balance,  true);
					participantsIndex[i].send(pot);
				}else{
					Payback(participantsIndex[i], pot, participantsIndex[i].balance, false);
				}
		}
	}
}
