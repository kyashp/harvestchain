// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SSIRegistry {
    address public verifier; // backend verifier
    mapping(address => mapping(bytes32 => uint64)) public authorizedUntil;
    event Authorized(address indexed user, bytes32 indexed role, uint64 until);
    modifier onlyVerifier(){ require(msg.sender==verifier,"not verifier"); _; }
    constructor(address _verifier){ verifier=_verifier; }
    function setAuthorized(address user, bytes32 role, uint64 until) external onlyVerifier {
        require(until > block.timestamp, "bad expiry");
        authorizedUntil[user][role] = until;
        emit Authorized(user, role, until);
    }
    function isAuthorized(address user, bytes32 role) external view returns (bool) {
        return authorizedUntil[user][role] >= block.timestamp;
    }
}
