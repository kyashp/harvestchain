// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
interface IDeliveryOracle {
    function isDelivered(uint256 orderId) external view returns (bool);
}
