pragma solidity ^0.4.13;

import "./interfaces/OwnedI.sol";
import "./interfaces/MultiplierHolderI.sol";

contract MultiplierHolder is OwnedI, MultiplierHolderI {

    address public multiplierHolderOwner;
    
    function MultiplierHolder()
    {
        multiplierHolderOwner = msg.sender;
    }

    //TODO remove event
    /**
     * Event emitted when a new multiplier has been set.
     * @param sender The account that ran the action.
     * @param vehicleType The type of vehicle for which the multiplier was set.
     * @param multiplier The actual multiplier set.
     */
    event LogMultiplierSet(
        address indexed sender,
        uint indexed vehicleType,
        uint multiplier);

    /**
     * Called by the owner of the TollBoothOperator.
     *   Can be used to update a value.
     *   It should roll back if the vehicle type is 0.
     *   Setting the multiplier to 0 is equivalent to removing it.
     * @param vehicleType The type of the vehicle being set.
     * @param multiplier The multiplier to use.
     * @return Whether the action was successful.
     * Emits LogMultiplierSet.
     */
    function setMultiplier(uint vehicleType, uint multiplier)
        public
        returns(bool success)
    {

    }

    /**
     * @param vehicleType The type of vehicle whose multiplier we want
     *     It should accept a vehicle type equal to 0.
     * @return The multiplier for this vehicle type.
     *     A 0 value indicates a non-existent multiplier.
     */
    function getMultiplier(uint vehicleType)
        constant
        public
        returns(uint multiplier)
    {
        
    }

    /*
     * You need to create:
     *
     * - a contract named `MultiplierHolder` that:
     *     - is `OwnedI` and `MultiplierHolderI`.
     *     - has a constructor that takes no parameter.
     */

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
        require(msg.sender == multiplierHolderOwner);
        require(newOwner != 0x0);
        require(newOwner != multiplierHolderOwner);
        LogOwnerSet(multiplierHolderOwner, newOwner);
        multiplierHolderOwner = newOwner;
        return true;
    }

    /**
     * @return The owner of this contract.
     */
    function getOwner() 
        constant
        public
        returns(address multiplierHolderOwner)
    {
        return multiplierHolderOwner;
    }
}