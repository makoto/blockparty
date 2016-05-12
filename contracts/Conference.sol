contract Conference {
	mapping (address => uint) balances;
	string public name;
	int public balance;
	int public registered;
	int public attended;
	int public deposit;

	function Conference() {
		balances[tx.origin] = 10000;
		name = 'CodeUp';
		deposit = 1;
		balance = 0;
		registered = 0;
		attended = 0;
	}

	function register(){
		balance= balance + (deposit * 1);
		registered++;
	}
}
