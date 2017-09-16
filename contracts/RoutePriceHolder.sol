pragma solidity ^0.4.13;

import "./Owned.sol";
import "./TollBoothHolder.sol";
import "./interfaces/RoutePriceHolderI.sol";
import "./TollBoothOperator.sol";

contract RoutePriceHolder is Owned, TollBoothHolder, RoutePriceHolderI  {

    mapping(address => mapping(address => uint)) routePrices;
    TollBoothOperator tollBoothOperator;

    function RoutePriceHolder()
    {
        tollBoothOperator = TollBoothOperator(this);
    }

    /**
     * Called by the owner of the RoutePriceHolder.
     *     It can be used to update the price of a route, including to zero.
     *     It should roll back if one of the booths is not a registered booth.
     *     It should roll back if entry and exit booths are the same.
     *     It should roll back if either booth is zero.
     *     It should roll back if there is no change in price.
     *     If relevant it will release 1 pending payment for this route.
     *     It should not roll back if the relevant pending payment is not solvable, if, for
     *       instance the vehicle has had wrongly set values in the interim.
     *     It should be possible to call it even when the contract is in the `true` paused state.
     * @param entryBooth The address of the entry booth of the route set.
     * @param exitBooth The address of the exit booth of the route set.
     * @param priceWeis The price in weis of the new route.
     * @return Whether the action was successful.
     * Emits LogPriceSet.
     */
    function setRoutePrice(
            address entryBooth,
            address exitBooth,
            uint priceWeis)
        fromOwner
        public
        returns(bool success)
    {
        require(entryBooth != exitBooth);
        require(isTollBooth(entryBooth) && isTollBooth(exitBooth));
        require(entryBooth != address(0) && exitBooth != address(0));
        require(routePrices[entryBooth][exitBooth] != priceWeis);
        
        routePrices[entryBooth][exitBooth] = priceWeis;
        // If pending payments
        // PUT THIS function in TollBoothOperator ?? and override it 
        if(tollBoothOperator.getPendingPaymentCount(entryBooth, exitBooth) > 0){
            //tollBoothOperator.clearSomePendingPayments(entryBooth, exitBooth, 1);
        }
        
        LogRoutePriceSet(msg.sender, entryBooth, exitBooth, priceWeis);
        return true;
        //TODO  If relevant it will release 1 pending payment for this route. ETC
    }

    /**
     * @param entryBooth The address of the entry booth of the route.
     * @param exitBooth The address of the exit booth of the route.
     * @return priceWeis The price in weis of the route.
     *     If the route is not known or if any address is not a booth it should return 0.
     *     If the route is invalid, it should return 0.
     */
    function getRoutePrice(
            address entryBooth,
            address exitBooth)
        constant
        public
        returns(uint priceWeis)
    {
        return routePrices[entryBooth][exitBooth];
    }

}