pragma solidity ^0.4.13;

import "./Owned.sol";
import "./interfaces/DepositHolderI.sol";

contract DepositHolder is Owned, DepositHolderI {
    
    //mapping(address => uint256) deposits;
    uint public deposit;

    /**
     * Constructor
     * @param depositWeis  the initial deposit wei value, which cannot be 0.
     */
    function DepositHolder(uint depositWeis)
    {
        require(depositWeis > 0);
        //todo
        deposit = depositWeis;
        //setDeposit(depositWeis);
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
        fromOwner
        returns(bool success)
    {
        require(depositWeis > 0);
        //TODO: check "It should not accept the value already set."
        // Can deposit only once ? Or cannot deposit twice the same amount
        //require(deposits[msg.sender] == 0);
        deposit += depositWeis;
        //deposits[msg.sender] += depositWeis;
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
        return deposit;
    }
    
}