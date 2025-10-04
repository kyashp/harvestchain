// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
interface IAIPriceOracle {
    function getFloorPrice(bytes32 marketKey) external view returns (uint256 pricePerUnit, uint256 confidence, uint256 updatedAt);
}
