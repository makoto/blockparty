pragma solidity 0.4.24;
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

    /**
    * @dev Grants admin right to given addresses.
    * @param newAdmins An array of addresses
    */
    function grant(address[] newAdmins) public onlyOwner{
        for(uint i = 0; i < newAdmins.length; i++){
            admins.push(newAdmins[i]);
            emit AdminGranted(newAdmins[i]);
        }
    }

    /**
    * @dev Revoke admin right from given addresses.
    * @param oldAdmins An array of addresses
    */
    function revoke(address[] oldAdmins) public onlyOwner{
        for(uint i = 0; i < oldAdmins.length; i++){
            for (uint j = 0; j < admins.length; ++i) {
                if (admins[j] == oldAdmins[i]) {
                    admins[j] = admins[admins.length - 1];
                    admins.length--;
                    emit AdminRevoked(oldAdmins[i]);
                    break;
                }
            }
        }
    }

    /**
    * @dev Returns admin addresses
    * @return Admin addresses
    */
    function getAdmins() view public returns(address[]){
        // todo: include owner;
        return admins;
    }

    /**
    * @dev Returns number of admings.
    * @return Number of admings.
    */
    function numOfAdmins() view public returns(uint){
        return admins.length;
    }

    /**
    * @dev Returns if the given address is admin or not.
    * @param admin An address.
    * @return True if the given address is admin.
    */
    function isAdmin(address admin) public view returns(bool){
        if (admin == owner) return true;

        for (uint i = 0; i<admins.length; i++){
            if (admins[i] == admin){
                return true;
            }
        }
        return false;
    }
}
