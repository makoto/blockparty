import './Conference.sol';
import './zeppelin/PullPaymentCapable.sol';

/*
 * Bounty
 * This bounty will pay out if you can cause a Conference's balance
 * to be different from its totalBalance, which would mean that it doesn't
 * have sufficient ether for everyone to withdraw.
 */
contract Bounty is PullPaymentCapable {
  uint public totalBounty;
  bool public claimed;
  mapping(address => address) public researchers;
  event TargetCreation(address createdAddress);
  event Error(string message);
  function contribute() {
    totalBounty = msg.value;
    if (claimed) throw;
  }

  function createTarget() returns(Conference) {
    Conference target = new Conference();
    researchers[target] = msg.sender;
    TargetCreation(target);
    return target;
  }

  modifier hasResearcher(Conference target) {
    address researcher = researchers[target];
    if (researcher != 0){
      _
    }else{
      Error('there are no researcher');
    }
  }

  modifier hasBug(Conference target) {
    if (target.totalBalance() != target.balance){
      _
    }else{
      Error('No security breach');
    }
  }

  function claim(Conference target) hasResearcher(target) hasBug(target){
    address researcher = researchers[target];
    asyncSend(researcher, this.balance);
    totalBounty = 0;
    claimed = true;
  }
}
