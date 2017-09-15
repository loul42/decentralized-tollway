pragma solidity ^0.4.13;

//TODO check import?
import "./Regulator.sol";
import "./interfaces/RegulatedI.sol";

contract Regulated is RegulatedI {

    address public regulator;

    /**
     * Constructor
     * @param initialRegulator  the initial regulator, which cannot be 0.
     */
    function Regulated(address initialRegulator)
    {
        require(initialRegulator != address(0));
        regulator = initialRegulator;
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
        require(msg.sender == regulator);
        require(newRegulator != address(0));
        require(newRegulator != regulator);
        LogRegulatorSet(regulator, newRegulator);
        regulator = newRegulator;
        return true;
    }

    /**
     * @return The current regulator.
     */
    function getRegulator()
        constant
        public
        returns(RegulatorI regulator)
    {
        return regulator;
        //TODO check regulator type... RegulatorI ?
    }

     // TODO? (B9 TODO) Ensure that regulator has proper interface.
}