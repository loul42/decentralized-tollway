pragma solidity ^0.4.13;

import "./interfaces/OwnedI.sol";
import "./interfaces/TollBoothHolderI.sol";

contract TollBoothHolder is OwnedI, TollBoothHolderI {

    address public tollBoothHolderOwner;
    address[] public tollBooths;
    mapping(address => bool) knownTollBooths;


    function TollBoothHolder()
    {
        tollBoothHolderOwner = msg.sender;
    }

    /**
     * Event emitted when a toll booth has been added to the TollBoothOperator.
     * @param sender The account that ran the action.
     * @param tollBooth The toll booth just added.
     */
    event LogTollBoothAdded(
        address indexed sender,
        address indexed tollBooth);

    /**
     * Called by the owner of the TollBoothOperator.
     *     It should not accept to add the same tollbooth again.
     *     It should not accept a 0x address for toll booth.
     *     It should be possible to add toll booth even when the contract is paused.
     * @param tollBooth The address of the toll booth being added.
     * @return Whether the action was successful.
     * Emits LogTollBoothAdded
     */
    function addTollBooth(address tollBooth)
        public
        returns(bool success)
    {
        //TODO !! modify tollBoothHolderOwner
        //require(msg.sender == tollBoothHolderOwner);
        require(tollBooth != address(0));
        require(!isTollBooth(tollBooth));
        //TODO : It should be possible to add toll booth even when the contract is paused.
        // TollBooth newTollBooth = new TollBooth(tollBooth);
        // tollBooths.push(tollBooth);
        // knownTollBooths[tollBooth] = true;
        // LogTollBoothAdded(msg.sender, tollBooth);
        // return true; // TO DO
    }

    /**
     * @param tollBooth The address of the toll booth we enquire about.
     * @return Whether the toll booth is indeed part of the operator.
     */
    function isTollBooth(address tollBooth)
        constant
        public
        returns(bool isIndeed)
    {
        return knownTollBooths[tollBooth];
    }

    /**
     * Event emitted when a toll booth has been removed from the TollBoothOperator.
     * @param sender The account that ran the action.
     * @param tollBooth The toll booth just removed.
     */
    event LogTollBoothRemoved(
        address indexed sender,
        address indexed tollBooth);

    /**
     * Called by the owner of the TollBoothOperator.
     *     It should not accept to remove the same tollbooth again.
     *     It should not accept a 0x address for toll booth.
     *     It should be possible to remove toll booth even when the contract is paused.
     * @param tollBooth The toll booth to remove.
     * @return Whether the action was successful.
     * Emits LogTollBoothRemoved
     */
    function removeTollBooth(address tollBooth)
        public
        returns(bool success)
    {
        //TODO !! modify tollBoothHolderOwner
        //require(msg.sender == tollBoothHolderOwner);
        //TODO It should be possible to remove toll booth even when the contract is paused.
        require(isTollBooth(tollBooth));
        require(tollBooth != address(0));
        // knownTollBooths[tollBooth] = false;
        // LogTollBoothRemoved(msg.sender, tollBooth);
        // return true;
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
        require(msg.sender == tollBoothHolderOwner);
        require(newOwner != 0x0);
        require(newOwner != tollBoothHolderOwner);
        LogOwnerSet(tollBoothHolderOwner, newOwner);
        tollBoothHolderOwner = newOwner;
        return true;
    }

    /**
     * @return The owner of this contract.
     */
    function getOwner() 
        constant
        public
        returns(address tollBoothHolderOwner)
    {
        return tollBoothHolderOwner;
    }
}