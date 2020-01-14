pragma solidity >=0.5.0 <0.7.0;

contract Blocpic {
  string blocpicHash;

  function set(string memory _blocpicHash) public {
    blocpicHash = _blocpicHash;
  }

  function get() public view returns (string memory) {
    return blocpicHash;
  }
}