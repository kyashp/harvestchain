// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MockDeliveryOracle {
    mapping(uint256 => bool) public delivered;
    function setDelivered(uint256 id, bool v) external { delivered[id] = v; }
    function isDelivered(uint256 id) external view returns (bool) { return delivered[id]; }
}
