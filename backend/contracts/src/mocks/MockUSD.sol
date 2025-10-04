// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Minimal mock ERC20 with 6 decimals for testing
contract MockUSD {
    string public name = "MockUSD";
    string public symbol = "MUSD";
    uint8 public decimals = 6;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    function mint(address to, uint256 value) external {
        balanceOf[to] += value;
        emit Transfer(address(0), to, value);
    }

    function transfer(address to, uint256 value) external returns (bool) {
        require(balanceOf[msg.sender] >= value, "insufficient");
        unchecked {
            balanceOf[msg.sender] -= value;
            balanceOf[to] += value;
        }
        emit Transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) external returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        require(balanceOf[from] >= value, "balance");
        require(allowance[from][msg.sender] >= value, "allowance");
        unchecked {
            allowance[from][msg.sender] -= value;
            balanceOf[from] -= value;
            balanceOf[to] += value;
        }
        emit Transfer(from, to, value);
        return true;
    }
}

