pragma solidity ^0.4.13;

import "./interfaces/OwnedI.sol";
import "./interfaces/PausableI.sol";

contract Pausable is OwnedI, PausableI {
    
    bool public pausedState;
    address public pausableOwner;

    function Pausable(bool newPausedState)
    {
        pausableOwner = msg.sender;
        pausedState = newPausedState;
    }

    /**
     * Modifier that rolls back the transaction if the contract is in the `false` paused state.
    */
    modifier whenPaused
    {
        require(pausedState);
        _;
    }

    /**
     * Modifier that rolls back the transaction if the contract is in the `true` paused state.
    */
    modifier whenNotPaused
    {
        require(!pausedState);
        _;
    }

    /**
     * Sets the new paused state for this contract.
     *   - only the current owner of this contract can call this function.
     *   - only a state different from the current one can be passed.
     * @param newState The new desired "paused" state of the contract.
     * @return Whether the action was successful.
     * Emits LogPausedSet.
     */
    function setPaused(bool newState) 
        public
        returns(bool success)
    {
        //TODO : check !
        require(msg.sender == pausableOwner);
        require(pausedState != newState);
        pausedState = newState;
        LogPausedSet(msg.sender, newState);
        return true;
    }

    /**
     * @return Whether the contract is indeed paused.
     */
    function isPaused()
        constant 
        returns(bool isIndeed)
    {
        return pausedState;
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
        require(msg.sender == pausableOwner);
        require(newOwner != 0x0);
        require(newOwner != pausableOwner);
        LogOwnerSet(pausableOwner, newOwner);
        pausableOwner = newOwner;
        return true;
    }

    /**
     * @return The owner of this contract.
     */
    function getOwner() 
        constant
        public
        returns(address pausableOwner)
    {
        return pausableOwner;
    }
    
}