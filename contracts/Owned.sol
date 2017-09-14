pragma solidity ^0.4.13;

contract Owned is OwnedI {
    
    address public owner;
    
    function Owned()
    {
        owner = msg.sender;
    }

    modifier fromOwner {
        require(msg.sender == owner);
        _;
    }

    /**
     * Sets the new owner for this contract.
     *   - only the current owner can call this function
     *   - only a new address can be accepted
     *   - only a non-0 address can be accepted
     * @param newOwner The new owner of the contract
     * @return Whether the action was successful.
     * Emits LogOwnerSet.
     */
    function setOwner(address newOwner) 
        fromOwner
        public
        returns(bool success)
    {
        require(newOwner != 0x0);
        require(newOwner != owner);
        LogOwnerSet(owner, newOwner);
        owner = newOwner;
        return true;
    }

    /**
     * @return The owner of this contract.
     */
    function getOwner() 
        constant
        public
        returns(address owner)
    {
        return owner;
    }

}