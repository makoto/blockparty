contract Conference {
	string public name;
	uint256 public balance;
	uint256 public deposit;
	uint256 public pot;
	int public capacity;
	int public registered;
	int public attended;
	mapping (address => Participant) public participants;

	struct Participant {
		address addr;
		bool attended;
	}

	event Register(uint256 value, uint256 deposit);

	function Conference() {
		name = 'CodeUp';
		deposit = 1000000000000000000;		// 1 ETH = 10**18 wai
		balance = 0;
		registered = 0;
		attended = 0;
	}

	function register(){
		Register(msg.value, deposit);
		if (msg.value != deposit) throw;

		participants[msg.sender] = Participant(msg.sender, false);
		balance = balance + (deposit * 1);
		registered++;
	}

	function attend(){
		if (isRegistered() != true) throw;

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
		pot = balance / attended;
		Participant _participant;

		for (uint i=0; i<registered.length; i++){
				_participant = registered[i];
				if(_participant.attended){
					_participant.send(pot);
				}
		}
	}
}
