// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CreditScoreOracle {
    address public updater;
    struct Score { uint16 score; uint64 updatedAt; }
    mapping(address => Score) public scores;
    event ScoreSet(address indexed user, uint16 score, uint64 at);
    modifier onlyUpdater(){ require(msg.sender==updater,"not updater"); _; }
    constructor(address _u){ updater=_u; }
    function setScore(address u, uint16 s) external onlyUpdater {
        require(s<=1000,"max 1000");
        scores[u] = Score(s, uint64(block.timestamp));
        emit ScoreSet(u, s, uint64(block.timestamp));
    }
    function getScore(address u) external view returns(uint16,uint64){
        Score memory x = scores[u]; return (x.score, x.updatedAt);
    }
}
