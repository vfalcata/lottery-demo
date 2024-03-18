pragma solidity ^0.4.17; 

contract Lottery{ 
   address public manager; //the person who activate the choosing of winners, the contract is still the one that picks the winner
   address[] public players; //dynamic array, fixed array has number inbetwee square brackets

    //instead of asking au ser to pass in their address, we want the person who deploys it to be the manager
    function Lottery() public{
        manager=msg.sender; //the constructor is called on creation of the contract and the sender is the one that would be creating it
    }

   // we expect this function to receive some amount of ether 
   function enter() public payable { //payable allows us to receive some amount of ether
       require(msg.value > .01 ether); //used for validation, if false the entire function immediately exits, and no changes are made to the contract
       //msg.value is the amount of ether the sender has
       //ether keyword automatically converts .01 to Wei
       players.push(msg.sender); //transaction would be made when function is called, and the sender is the person who calls it
   }

    //this function is just for example purposes and should not be used in any serious way as it can be exploited
   function random() private view returns(uint){
       return uint(sha3(block.difficulty, now, players)); //global function, keccak256 is the same thing, sha3 is an instance of keccak256
        //block is a global
        //now, is the current time
        //pass hash to uint to covert to integer
   }


   function pickWinner() public restricted{
        //only manager can call this.
       uint index = random() % players.length; //use modulo and PRNG to stay within bounds
       players[index].transfer(this.balance); //recall address type is an object and has properties associated with it
        //'this.' is the reference to the specific contract, and balance is the amount of money the current contract has available to it

        //empty out players array resets the state of the game
        players = new address[](0); //the parenthesis says we want the initial size of 0
        //if we put a length of 5, we would get 5 zero addresses '0x0000...'

   }

    //custom modifier that you can add to functions
    //helps to reuse require statements 
   modifier restricted(){
       require(manager == msg.sender);
       _; //the '_' is where the code from the function that uses this modifier would go
   }

   function getPlayers() public view returns (address[]){
       return players;
   }
}