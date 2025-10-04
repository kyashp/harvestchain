// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MockAIOracle {
    mapping(bytes32 => uint256) public floor;
    mapping(bytes32 => uint256) public conf;
    mapping(bytes32 => uint256) public ts;

    function set(bytes32 marketKey, uint256 pricePerUnit, uint256 confidence) external {
        floor[marketKey] = pricePerUnit;
        conf[marketKey]  = confidence;
        ts[marketKey] = block.timestamp;
    }

    function getFloorPrice(bytes32 marketKey) external view returns (uint256, uint256, uint256) {
        return (floor[marketKey], conf[marketKey], ts[marketKey]);
    }
}
