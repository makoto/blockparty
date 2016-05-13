contract Conference {
	string public name;
	uint256 public balance;
	uint256 public deposit;
	int public capacity;
	int public registered;
	int public attended;
	mapping (address => Participant) public participants;

	struct Participant {
		address addr;
		bool attended;
	}

	event Register(uint256 value, uint256 deposit, uint256 balance);

	function Conference() {
		name = 'CodeUp';
		deposit = 1000000000000000000;		// 1 ETH = 10**18 wai
		balance = 0;
		registered = 0;
		attended = 0;
	}

	function register(){
		if (msg.value != deposit) throw;

		participants[msg.sender] = Participant(msg.sender, false);
		balance = balance + (deposit * 1);
		registered++;
		Register(msg.value, deposit, balance);
	}

	/*function attend(){
		if (isRegistered() != true) throw;

		participants[msg.sender].attended = true;
		attended++;
	}

	function isRegistered() returns (bool){
		if (participants[msg.sender] == true){
			return true;
		} else {
			return false;
		}
	}

	function isAttended() returns (bool){
		if (isRegistered() && participants[msg.sender].attended){
			return true;
		} else {
			return false;
		}
	}*/
}
