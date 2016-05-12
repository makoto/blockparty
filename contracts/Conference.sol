contract Conference {
	string public name;
	uint256 public balance;
	uint256 public deposit;
	int public registered;
	int public attended;

	event Register(uint256 value, uint256 deposit);

	function Conference() {
		name = 'CodeUp';
		// 1 ETH = 10**18 wai
		deposit = 1000000000000000000;
		balance = 0;
		registered = 0;
		attended = 0;
	}

	function register(){
		Register(msg.value, deposit);
		if (msg.value != deposit) throw;

		balance = balance + (deposit * 1);
		registered++;
	}
}
