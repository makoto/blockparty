pragma solidity ^0.4.25;

import "./upgrade/Upgradeable.sol";
import "./rbac/RBACWithAdmin.sol";
import "./Storage.sol";
import "./Event.sol";
import "./Upgradeable.sol";

interface UserPotInterface {
  function deposit(address _event, address _user, uint256 _deposit) external payable;
  function withdraw() external;
  function calculatePayout(address _user) external view returns (uint256);
  function calculateDeposit(address _user) external view returns (uint256);
}

contract UserPot is Upgradeable, RBACWithAdmin, UserPotInterface, UpgradeableInterface {
  bytes32 public constant STORAGE_KEY_EVENTS = keccak256("events");
  bytes32 public constant STORAGE_KEY_LEFTOVER = keccak256("leftover");

  bytes4 INTERFACE_ID = bytes4(keccak256('KickbackUserPot'));

  StorageInterface dataStore;

  constructor (address _dataStore) Upgradeable(INTERFACE_ID) public {
    dataStore = StorageInterface(_dataStore);
  }

  function deposit(address _user) external payable {
    EventInterface _event = EventInterface(msg.sender);
    uint256 _deposit = _event.getDeposit(_user);
    uint256 bal = calculatePayout(_user);
    bal += msg.value;
    require(bal >= _deposit, 'you need to pay more to register for event');
    _updateUserData(_user, msg.sender, bal - _deposit);
  }

  function withdraw() external {
    uint256 bal = calculatePayout(msg.sender);
    msg.sender.transfer(bal);
    _updateUserData(msg.sender, address(0), 0);
  }

  /* Update the data associated with this user in the data storage contract.
   *
   * Note: for each user we constantly keep track of the list of non-ended events they have registered to attend as well as
   * the their current ETH balance, based on their previous contract payouts.
   *
   * @param _user Address of the user to update.
   * @param _newEvent The address of the new event they've registered for. If 0 then they haven't registered for a new event.
   * @param _newBalance The user's new ETH leftover balance.
   */
  function _updateUserData(address _user, address _newEvent, uint256 _newBalance) internal {
    address[] memory events = dataStore.getAddresses(_user, STORAGE_KEY_EVENTS);

    // can only really do fixed-size arrays in memory, so we limit to 10. But we should calculate the gas cost of
    // the various methods (especially this one) and then work out a reasonable limit based on that. That limit will
    // then need to be enforced app-side as well
    address[] memory newEvents = new address[](10);

    uint256 newEventsLen = 0;

    for (uint256 i = 0; i < events.length; i += 1) {
      EventInterface e = EventInterface(events[i]);
      // remove ended events
      if (!e.hasEnded()) {
        newEvents[newEventsLen] = events[i];
        newEventsLen++;
      }
    }
    if (_newEvent != address(0)) {
      newEvents[newEventsLen] = _newEvent;
      newEventsLen++;
    }
    dataStore.setUint(_user, STORAGE_KEY_LEFTOVER, _newBalance);
    dataStore.setAddresses(_user, STORAGE_KEY_EVENTS, newEvents, newEventsLen);
  }

  function calculatePayout(address _user) public view returns (uint256) {
    uint256 bal = dataStore.getUint(_user, STORAGE_KEY_LEFTOVER);
    address[] memory events = dataStore.getAddresses(_user, STORAGE_KEY_EVENTS);
    for (uint256 i = 0; i < events.length; i += 1) {
        EventInterface e = EventInterface(events[i]);
        if (e.hasEnded()) {
            bal += e.getPayout(_user);
        }
    }
    return bal;
  }

  function calculateDeposit(address _user) public view returns (uint256) {
    uint256 bal = 0;
    address[] memory events = dataStore.getAddresses(_user, STORAGE_KEY_EVENTS);
    for (uint256 i = 0; i < events.length; i += 1) {
        EventInterface e = EventInterface(events[i]);
        if (!e.hasEnded()) {
            bal += e.getDeposited(_user);
        }
    }
    return bal;
  }
}
