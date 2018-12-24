pragma solidity ^0.4.24;

contract STChannel {
    address public user1;
    address public user2;
    
    event Error(string message);
    
    function join() public {
        if (user1 == 0) {
            user1 = msg.sender;
        } else {
            user2 = msg.sender;
        }
    }
    
    function exit(address user, bytes32 hash, uint8 v, bytes32 r, bytes32 s) public {
        if (user == user1) {
            require(verifyHash(hash, v, r, s) == user1);
        } else {
            require(verifyHash(hash, v, r, s) == user2);
        }
    }
    
    function verifyHash(bytes32 hash, uint8 v, bytes32 r, bytes32 s) private pure
                 returns (address signer) {

        bytes32 messageDigest = keccak256("\x19Ethereum Signed Message:\n32", hash);

        return ecrecover(messageDigest, v, r, s);
    }
}