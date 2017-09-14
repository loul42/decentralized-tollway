pragma solidity ^0.4.13;

import "./Owned.sol";
import "./interfaces/RegulatorI.sol";
import "./TollBoothOperator.sol";
import "./interfaces/TollBoothOperatorI.sol";

contract Regulator is Owned, RegulatorI  {

    mapping(address => uint) vehicles;

    address[] public operators;
    mapping(address => bool) knownOperators;

    // TO CHECK : Notifiy in readme that I added this line because otherwise the event DepositSet was not present in tx.logs (truffle issue)
    // As Regulator create a TollBoothOperator issue was here : line 73 tollBoothOperator_student.js
    // tx.logs[1].args was undefined but tx.logs[0].args was ok
    event LogDepositSet(address indexed sender, uint depositWeis);

    function Regulator()
    {
    }

    /**
     * Called by the owner of the regulator to register a new vehicle with its VehicleType.
     *     It should not be possible to change it if no change will be effected.
     *     It should not be possible to pass a 0x vehicle address.
     * @param vehicle The address of the vehicle being registered. This may be an externally
     *   owned account or a contract. The regulator does not care.
     * @param vehicleType The VehicleType of the vehicle being registered.
     *    passing 0 is equivalent to unregistering the vehicle.
     * @return Whether the action was successful.
     * Emits LogVehicleTypeSet
     */
    function setVehicleType(address vehicle, uint vehicleType)
        public
        fromOwner
        returns(bool success)
    {
        require(vehicle != address(0));
        require(vehicles[vehicle] != vehicleType);

        vehicles[vehicle] = vehicleType;
        LogVehicleTypeSet(msg.sender, vehicle, vehicleType);
        return true;
    }

    /**
     * @param vehicle The address of the registered vehicle.
     * @return The VehicleType of the vehicle whose address was passed. 0 means it is not
     *   a registered vehicle.
     */
    function getVehicleType(address vehicle)
        constant
        public
        returns(uint vehicleType)
    {
        return vehicles[vehicle];
    }

    /**
     * Called by the owner of the regulator to deploy a new TollBoothOperator onto the network.
     *     It should start the TollBoothOperator in the `true` paused state.
     *     It should not accept as rightful owner the current owner of the regulator.
     * @param owner The rightful owner of the newly deployed TollBoothOperator.
     * @param deposit The initial value of the TollBoothOperator deposit.
     * @return The address of the newly deployed TollBoothOperator.
     * Emits LogTollBoothOperatorCreated.
     */
    function createNewOperator(
            address owner,
            uint deposit)
        fromOwner
        public
        returns(TollBoothOperatorI newOperator)
    {
        
        require(msg.sender == getOwner());
        require(owner != getOwner());
        TollBoothOperator newTbOperator = new TollBoothOperator(true, deposit, this);
        newTbOperator.setOwner(owner);
        operators.push(newTbOperator);
        knownOperators[newTbOperator] = true;
        LogTollBoothOperatorCreated(msg.sender, newTbOperator, owner, deposit);
        return newTbOperator;
    }

    /**
     * Event emitted when a TollBoothOperator has been removed from the list of approved operators.
     * @param sender The account that ran the action.
     * @param operator The removed TollBoothOperator.
     */
    event LogTollBoothOperatorRemoved(
        address indexed sender,
        address indexed operator);

    /**
     * Called by the owner of the regulator to remove a previously deployed TollBoothOperator from
     * the list of approved operators.
     *     It should not accept if the operator is unknown.
     * @param operator The address of the contract to remove.
     * @return Whether the action was successful.
     * Emits LogTollBoothOperatorRemoved.
     */
    function removeOperator(address operator)
        public
        fromOwner
        returns(bool success)
    {
        require(isOperator(operator));
        knownOperators[operator] = false;
        //TODO: maybe implement a struct with id so we can hard delete an operator
        // Also be sure that nothing is possible anymore when operator is delete ie, kill IT ?
        LogTollBoothOperatorRemoved(msg.sender, operator);
        return true;
    }

    /**
     * @param operator The address of the TollBoothOperator to test.
     * @return Whether the TollBoothOperator is indeed approved.
     */
    function isOperator(address operator)
        constant
        public
        returns(bool indeed)
    {
        return knownOperators[operator];
    }

}