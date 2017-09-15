pragma solidity ^0.4.13;

import "./interfaces/OwnedI.sol";
import "./interfaces/DepositHolderI.sol";

contract DepositHolder is OwnedI, DepositHolderI {
    
    mapping(address => uint256) deposits;
    address public depositHolderOwner;

    /**
     * Constructor
     * @param depositWeis  the initial deposit wei value, which cannot be 0.
     */
    function DepositHolder(uint depositWeis)
    {
        require(depositWeis > 0);
        depositHolderOwner = msg.sender;
        setDeposit(depositWeis);
    }

    /**
     * Called by the owner of the DepositHolder.
     *     It should not accept 0 as a value.
     *     It should not accept the value already set.
     * @param depositWeis The value of the deposit being set, measure in weis.
     * @return Whether the action was successful.
     * Emits LogDepositSet.
     */
    function setDeposit(uint depositWeis)
        public
        returns(bool success)
    {
        require(msg.sender == depositHolderOwner);
        require(depositWeis > 0);
        //TODO: check "It should not accept the value already set."
        // Can deposit only once ? Or cannot deposit twice the same amount
        require(deposits[msg.sender] == 0);

        deposits[msg.sender] += depositWeis;
        LogDepositSet(msg.sender, depositWeis);
        return true;
    }

    /**
     * @return The base price, then to be multiplied by the multiplier, a given vehicle
     * needs to deposit to enter the road system.
     */
    function getDeposit()
        constant
        public
        returns(uint weis)
    {
        //TODO: Check if ok 
        return deposits[msg.sender];
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
        public
        returns(bool success)
    {
        require(msg.sender == depositHolderOwner);
        require(newOwner != 0x0);
        require(newOwner != depositHolderOwner);
        LogOwnerSet(depositHolderOwner, newOwner);
        depositHolderOwner = newOwner;
        return true;
    }

    /**
     * @return The owner of this contract.
     */
    function getOwner() 
        constant
        public
        returns(address depositHolderOwner)
    {
        return depositHolderOwner;
    }
      
}