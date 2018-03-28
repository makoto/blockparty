pragma solidity ^0.4.19;
import './zeppelin/ownership/Ownable.sol';

/**
 * @title GroupAdmin
 * @dev The contract allows multiple addresses to perform as admin.
 */
contract GroupAdmin is Ownable {
  event AdminGranted(address indexed grantee);
  event AdminRevoked(address indexed grantee);
  address[] public admins;

  modifier onlyAdmin() {
    require(isAdmin(msg.sender));
    _;
  }

  function grant(address[] newAdmins) public onlyOwner{
    for(uint i=0;i<newAdmins.length;i++){
      admins.push(newAdmins[i]);
      AdminGranted(newAdmins[i]);
    }
  }

  function revoke(address[] oldAdmins) public onlyOwner{
    for(uint i=0;i<oldAdmins.length;i++){
        for (uint j = 0; j < admins.length; ++i) {
            if (admins[j] == oldAdmins[i]) {
                admins[j] = admins[admins.length - 1];
                admins.length--;
                AdminRevoked(oldAdmins[i]);
                break;
            }
        }
    }
  }

  function getAdmins() view public returns(address[]){
    // todo: include owner;
    return admins;
  }

  function numOfAdmins() view public returns(uint){
      return admins.length;
  }


  function isAdmin(address admin) public view returns(bool){
    if (admin == owner) return true;
    for(uint i=0;i<admins.length;i++){
      if(admins[i] == admin){
        return true;
      }
    }
    return false;
  }
}
