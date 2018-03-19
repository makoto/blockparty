pragma solidity ^0.4.19;
import './zeppelin/ownership/Ownable.sol';

/**
 * @title GroupAdmin
 * @dev The contract allows multiple addresses to perform as admin.
 */
contract GroupAdmin is Ownable {
  event AdminGranted(address indexed grantee);
  event AdminRevoked(address indexed grantee);
  mapping(address=>bool) internal admins;

  modifier onlyAdmin() {
    require(admins[msg.sender] || msg.sender == owner);
    _;
  }

  function grant(address newAdmin) public onlyOwner{
    admins[newAdmin] = true;
    AdminGranted(newAdmin);
  }

  function revoke(address oldAdmin) public onlyOwner{
    admins[oldAdmin] = false;
    AdminRevoked(oldAdmin);
  }

  function isAdmin(address admin) public view returns(bool){
    return(admins[admin] || admin == owner);
  }
}
