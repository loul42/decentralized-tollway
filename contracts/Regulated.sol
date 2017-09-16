pragma solidity ^0.4.13;

import "./interfaces/RegulatedI.sol";
import "./interfaces/RegulatorI.sol";

contract Regulated is RegulatedI {

    address internal regulatorOwner;

    /**
     * Constructor
     * @param _regulator the initial regulator, which cannot be 0.
     */
    function Regulated(address _regulator)
    {
        require(_regulator != address(0));
        regulatorOwner = _regulator;
    }

    /**
     * Sets the new regulator for this contract.
     *     It should roll back if any address other than the current regulator of this contract
     *       calls this function.
     *     It should roll back if the new regulator address is 0.
     *     It should roll back if the new regulator is the same as the current regulator.
     * @param newRegulator The new desired regulator of the contract.
     * @return Whether the action was successful.
     * Emits LogRegulatorSet.
     */
    function setRegulator(address newRegulator)
        public
        returns(bool success)
    {
        require(msg.sender == regulatorOwner);
        require(newRegulator != address(0));
        require(newRegulator != regulatorOwner);
        LogRegulatorSet(regulatorOwner, newRegulator);
        regulatorOwner = newRegulator;
        return true;
    }

    /**
     * @return The current regulator.
     */
    function getRegulator()
        constant
        public
        returns(RegulatorI _regulator)
    {
        return RegulatorI(regulatorOwner);
        //TODO check regulator type... RegulatorI ?
    }

     // TODO? (B9 TODO) Ensure that regulator has proper interface.
}