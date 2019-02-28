pragma solidity ^0.4.25;

import "./rbac/RBACWithAdmin.sol";

interface StorageInterface {
  function getAddresses(address _addr, bytes32 _key) external view returns (address[]);
  function setAddresses(address _addr, bytes32 _key, address[] _value, uint256 _len) external;

  function getString(address _addr, bytes32 _key) external view returns (string);
  function setString(address _addr, bytes32 _key, string _value) external;

  function getBytes32(address _addr, bytes32 _key) external view returns (bytes32);
  function setBytes32(address _addr, bytes32 _key, bytes32 _value) external;

  function getUint(address _addr, bytes32 _key) external view returns (uint);
  function setUint(address _addr, bytes32 _key, uint _value) external;
}

contract Storage is RBACWithAdmin, StorageInterface {
  bytes32 public constant ROLE_WRITER = keccak256("writer");

  struct Data {
    mapping(bytes32 => address[]) addresses;
    mapping(bytes32 => string) strings;
    mapping(bytes32 => bytes32) bytes32s;
    mapping(bytes32 => uint) uints;
  }

  mapping(address => Data) data;

  modifier isAuthorized (address _addr) {
    require(hasRole(msg.sender, ROLE_ADMIN) || hasRole(msg.sender, ROLE_WRITER));
    _;
  }

  function getAddresses(address _addr, bytes32 _key) external view returns (address[]) {
    return data[_addr].addresses[_key];
  }

  function getString(address _addr, bytes32 _key) external view returns (string) {
    return data[_addr].strings[_key];
  }

  function getUint(address _addr, bytes32 _key) external view returns (uint) {
    return data[_addr].uints[_key];
  }

  function getBytes32(address _addr, bytes32 _key) external view returns (bytes32) {
    return data[_addr].bytes32s[_key];
  }

  function setBytes32(address _addr, bytes32 _key, bytes32 _value) external isAuthorized(_addr) {
    data[_addr].bytes32s[_key] = _value;
  }

  function setString(address _addr, bytes32 _key, string _value) external isAuthorized(_addr) {
    data[_addr].strings[_key] = _value;
  }

  function setUint(address _addr, bytes32 _key, uint _value) external isAuthorized(_addr) {
    data[_addr].uints[_key] = _value;
  }

  function setAddresses(address _addr, bytes32 _key, address[] _value, uint256 _len) external isAuthorized(_addr) {
    data[_addr].addresses[_key] = _value;
    data[_addr].addresses[_key].length = _len;
  }

  function () external {
      revert('no fallback function');
  }  
}
