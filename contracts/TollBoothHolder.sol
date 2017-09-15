pragma solidity ^0.4.13;

import "./Owned.sol";
import "./interfaces/TollBoothHolderI.sol";

contract TollBoothHolder is Owned, TollBoothHolderI {

    address[] public tollBooths;
    mapping(address => bool) knownTollBooths;


    function TollBoothHolder()
    {
        
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
        fromOwner // TODO CHECK FROM OWNER
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
        fromOwner // TODO CHECK FROM OWNER
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

}