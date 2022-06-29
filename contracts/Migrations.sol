// for Solidity best practice
// SPDX-License-Identifier: MIT

// compiler compatibility
pragma solidity >= 0.5.16;

/**
* registers history of other Smart Contracts' evolution
*/
contract Migrations {
  address public owner = msg.sender;
  uint public last_completed_migration;

  /**
  * require and set an owner of the interactions
  */
  modifier restricted() {
    require(
      msg.sender == owner,
      "This function is restricted to the contract's owner"
    );
    _;
  }

  /**
  * set the number of the latest migration
  * 
  * @param completed number of the latest migration
  */
  function setCompleted(uint completed) public restricted {
    last_completed_migration = completed;
  }
}