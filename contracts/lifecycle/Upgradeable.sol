pragma solidity ^0.4.25;

import "./ERC165.sol";

contract Upgradeable is ERC165Interface {
  bytes4 interfaceId;

  constructor (bytes4 _interfaceId) {
    interfaceId = _interfaceId
  }

  function upgrade(address _newContract) external {
    ERC165Interface i = ERC165Interface(_newContract);
    require(i.supportsInterface(interfaceId), 'new contract has different interface');
    selfdestruct(_newContract);
  }

  function supportsInterface(bytes4 _interfaceId) external pure returns (bool) {
    return _interfaceId == interfaceId;
  }

  // fallback needs to be payable in order to allow upgradeability
  function () external payable;
}
