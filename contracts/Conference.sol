import "ConvertLib.sol";

// This is just a simple example of a coin-like contract.
// It is not standards compatible and cannot be expected to talk to other
// coin/token contracts. If you want to create a standards-compliant
// token, see: https://github.com/ConsenSys/Tokens. Cheers!

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

	function sendCoin(address receiver, uint amount) returns(bool sufficient) {
		if (balances[msg.sender] < amount) return false;
		balances[msg.sender] -= amount;
		balances[receiver] += amount;
		return true;
	}
	function getBalanceInEth(address addr) returns(uint){
		return ConvertLib.convert(getBalance(addr),2);
	}
  	function getBalance(address addr) returns(uint) {
    	return balances[addr];
  	}
}
