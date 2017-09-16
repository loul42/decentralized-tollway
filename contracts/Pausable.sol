pragma solidity ^0.4.13;

import "./Owned.sol";
import "./interfaces/PausableI.sol";

contract Pausable is Owned, PausableI {
    
    bool public pausedState;

    function Pausable(bool newPausedState)
    {
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
        fromOwner
        public
        returns(bool success)
    {
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

}