pragma solidity 0.4.24;

import "../rbac/RBACWithAdmin.sol";

/**
 * @title Destructible
 * @dev Base contract that can be destroyed by owner. All funds in contract will be sent to the owner.
 */
contract Destructible is RBACWithAdmin {

  constructor() public payable { }

  /**
   * @dev Transfers the current balance to the owner and terminates the contract.
   */
  function destroy() onlyAdmin public {
    selfdestruct(owner);
  }
}
