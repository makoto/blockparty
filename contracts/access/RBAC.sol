pragma solidity ^0.4.25;

import "./Roles.sol";


/**
 * @title RBAC (Role-Based Access Control)
 * @author Matt Condon (@Shrugs)
 * @dev Stores and provides setters and getters for roles and addresses.
 * @dev Supports unlimited numbers of roles and addresses.
 * @dev See //contracts/mocks/RBACMock.sol for an example of usage.
 * This RBAC method uses bytes32s to key roles.
 * It's recommended that you define constants in the contract, like ROLE_ADMIN below, to avoid typos.
 */
contract RBAC {
  using Roles for Roles.Role;

  mapping (bytes32 => Roles.Role) private roles;

  event RoleAdded(address addr, bytes32 roleName);
  event RoleRemoved(address addr, bytes32 roleName);

  /**
   * @dev reverts if addr does not have role
   * @param addr address
   * @param roleName the name of the role
   * // reverts
   */
  function checkRole(address addr, bytes32 roleName)
    view
    public
  {
    roles[roleName].check(addr);
  }

  /**
   * @dev determine if addr has role
   * @param addr address
   * @param roleName the name of the role
   * @return bool
   */
  function hasRole(address addr, bytes32 roleName)
    view
    public
    returns (bool)
  {
    return roles[roleName].has(addr);
  }

  function hasAnyRole(address addr, bytes32[] roleNames)
    view
    public
    returns (bool)
  {
    bool _hasAnyRole = false;
    for (uint8 i = 0; i < roleNames.length; i++) {
      if (hasRole(addr, roleNames[i])) {
        _hasAnyRole = true;
        break;
      }
    }
    return _hasAnyRole;
  }

  /**
   * @dev add a role to an address
   * @param addr address
   * @param roleName the name of the role
   */
  function addRole(address addr, bytes32 roleName)
    internal
  {
    roles[roleName].add(addr);
    emit RoleAdded(addr, roleName);
  }

  /**
   * @dev remove a role from an address
   * @param addr address
   * @param roleName the name of the role
   */
  function removeRole(address addr, bytes32 roleName)
    internal
  {
    roles[roleName].remove(addr);
    emit RoleRemoved(addr, roleName);
  }

  /**
   * @dev modifier to scope access to a single role (uses msg.sender as addr)
   * @param roleName the name of the role
   * // reverts
   */
  modifier onlyRole(bytes32 roleName) {
    checkRole(msg.sender, roleName);
    _;
  }

  /**
   * @dev modifier to scope access to a set of roles (uses msg.sender as addr)
   * @param roleNames the names of the roles to scope access to
   */
  modifier onlyRoles(bytes32[] roleNames) {
    require(hasAnyRole(msg.sender, roleNames));
    _;
  }
}
