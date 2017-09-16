pragma solidity ^0.4.13;

import "./Owned.sol";
import "./Pausable.sol";
import "./DepositHolder.sol";
import "./TollBoothHolder.sol";
import "./MultiplierHolder.sol";
import "./RoutePriceHolder.sol";
import "./Regulated.sol";
import "./interfaces/TollBoothOperatorI.sol";
import "./Regulator.sol";


contract TollBoothOperator is Owned, Pausable, DepositHolder, TollBoothHolder, MultiplierHolder, RoutePriceHolder, Regulated, TollBoothOperatorI {

    mapping(bytes32 => VehicleEntry) vehiclesEntries;
    mapping(bytes32 => bool) knownHashes;
    mapping(address => mapping(address => PendingPayment)) pendingPayments;

    uint collectedFees;
    Regulator regulator;

    struct VehicleEntry {
        address vehicleAddress;
        address entryBoothAddress;
        uint deposit;
    }

    struct PendingPayment {
        uint count;
        bytes32 hashedSecret;
    }

    function TollBoothOperator(bool initialPausedState, uint initialDeposit, address initialRegulator)
        Pausable(initialPausedState)
        DepositHolder(initialDeposit)
        Regulated(initialRegulator)
    {
        owner = initialRegulator;
        regulator = Regulator(msg.sender);
    }

    /**
     * This provides a single source of truth for the encoding algorithm.
     * @param secret The secret to be hashed.
     * @return the hashed secret.
     */
    function hashSecret(bytes32 secret)
        constant
        public
        returns(bytes32 hashed)
    {
        return keccak256(secret);
    }


    /**
     * Called by the vehicle entering a road system.
     * Off-chain, the entry toll booth will open its gate up successful deposit and confirmation
     * of the vehicle identity.

     *     It should roll back if `entryBooth` is not a tollBooth.
     *     It should roll back if less than deposit * multiplier was sent alongside.
     *     It should be possible for a vehicle to enter "again" before it has exited from the 
     *       previous entry.
     * @param entryBooth The declared entry booth by which the vehicle will enter the system.
     * @param exitSecretHashed A hashed secret that when solved allows the operator to pay itself.
     *   A previously used exitSecretHashed cannot be used ever again.
     * @return Whether the action was successful.
     * Emits LogRoadEntered.
     */
    function enterRoad(
            address entryBooth,
            bytes32 exitSecretHashed)
        public
        whenNotPaused
        payable
        returns (bool success)
    {
        //@log ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ
        require(isTollBooth(entryBooth));
        uint vehicleType = regulator.getVehicleType(msg.sender);
        require(vehicleType != 0);
        uint multiplier = getMultiplier(vehicleType);
        // If a vehicle type has no multiplier, then the road system is closed to this vehicle type.
        require(multiplier != 0);
        uint minAmount = getDeposit() * multiplier;
        require(msg.value >= minAmount);
        // A vehicle can entry again but can't use the same hash
        require(knownHashes[exitSecretHashed] == false);

        VehicleEntry memory vehicleEntry = VehicleEntry({
            vehicleAddress: msg.sender,
            entryBoothAddress: entryBooth, 
            deposit: msg.value
        });
        knownHashes[exitSecretHashed] = true;
        vehiclesEntries[exitSecretHashed] = vehicleEntry;
        LogRoadEntered(msg.sender, entryBooth, exitSecretHashed, msg.value);
        return true;
        
    }

    /**
     * @param exitSecretHashed The hashed secret used by the vehicle when entering the road.
     * @return The information pertaining to the entry of the vehicle.
     *     vehicle: the address of the vehicle that entered the system.
     *     entryBooth: the address of the booth the vehicle entered at.
     *     depositedWeis: how much the vehicle deposited when entering.
     * After the vehicle has exited, `depositedWeis` should be returned as `0`.
     * If no vehicles had ever entered with this hash, all values should be returned as `0`.
     */
    function getVehicleEntry(bytes32 exitSecretHashed)
        constant
        public
        returns(
            address vehicle,
            address entryBooth,
            uint depositedWeis)
    {
        VehicleEntry memory vehicleEntry = vehiclesEntries[exitSecretHashed];
        return (vehicleEntry.vehicleAddress,
                vehicleEntry.entryBoothAddress,
                vehicleEntry.deposit);
    }

    /**
     * Called by the exit booth.
     *     It should roll back when the contract is in the `true` paused state.
     *     It should roll back when the sender is not a toll booth.
     *     It should roll back if the exit is same as the entry.
     *     It should roll back if the secret does not match a hashed one.
     * @param exitSecretClear The secret given by the vehicle as it passed by the exit booth.
     * @return status:
     *   1: success, -> emits LogRoadExited
     *   2: pending oracle -> emits LogPendingPayment
     */
    function reportExitRoad(bytes32 exitSecretClear)
        public
        whenNotPaused
        returns (uint status)
    {
        require(isTollBooth(msg.sender));

        bytes32 exitSecretHashed = hashSecret(exitSecretClear);
        address entryBooth = vehiclesEntries[exitSecretHashed].entryBoothAddress;
        address exitBooth = msg.sender;

        require(exitBooth != entryBooth);
        require(knownHashes[exitSecretHashed] == true);

        address vehicleAddress = vehiclesEntries[exitSecretHashed].vehicleAddress;

        uint vehicleType = regulator.getVehicleType(vehicleAddress);
        uint deposit = vehiclesEntries[exitSecretHashed].deposit;
        uint routePrice = getRoutePrice(entryBooth, exitBooth);

        uint fee = routePrice * getMultiplier(vehicleType);
        uint refundWeis = deposit - fee;

        // Route price not known yet
        if(fee == 0){
            pendingPayments[entryBooth][exitBooth].hashedSecret = exitSecretHashed;
            pendingPayments[entryBooth][exitBooth].count += 1;
            LogPendingPayment(exitSecretHashed, entryBooth, exitBooth);
            return 2;
        } else if (fee < deposit){
            collectedFees += fee;
            vehiclesEntries[exitSecretHashed].deposit = 0;
            LogRoadExited(exitBooth, exitSecretHashed, fee, refundWeis);
            vehicleAddress.transfer(refundWeis);
            return 1;
        }
        else if (fee >= deposit) {
            collectedFees += fee;
            vehiclesEntries[exitSecretHashed].deposit = 0;
            LogRoadExited(exitBooth, exitSecretHashed, fee, refundWeis);
            return 1;
        } 

    }

    /**
     * @param entryBooth the entry booth that has pending payments.
     * @param exitBooth the exit booth that has pending payments.
     * @return the number of payments that are pending because the price for the
     * entry-exit pair was unknown.
     */
    function getPendingPaymentCount(address entryBooth, address exitBooth)
        constant
        public
        returns (uint count)
        {
            //hash id?
            return pendingPayments[entryBooth][exitBooth].count;
        }

    /**
     * Can be called by anyone. In case more than 1 payment was pending when the oracle gave a price.
     *     It should roll back when the contract is in `true` paused state.
     *     It should roll back if booths are not really booths.
     *     It should roll back if there are fewer than `count` pending payment that are solvable.
     *     It should roll back if `count` is `0`.
     * @param entryBooth the entry booth that has pending payments.
     * @param exitBooth the exit booth that has pending payments.
     * @param count the number of pending payments to clear for the exit booth.
     * @return Whether the action was successful.
     * Emits LogRoadExited as many times as count.
     */
    function clearSomePendingPayments(
            address entryBooth,
            address exitBooth,
            uint count)
        public
        whenNotPaused
        returns (bool success)
    {
        require(isTollBooth(entryBooth) && isTollBooth(exitBooth));
        require(count > 0);
        require(pendingPayments[entryBooth][exitBooth].count >= count );

        // fail  while count > 0 = > comment acceder au different hash ? par address
        bytes32 exitSecretHashed = pendingPayments[entryBooth][exitBooth].hashedSecret;
        address vehicleAddress = vehiclesEntries[exitSecretHashed].vehicleAddress;

        uint vehicleType = regulator.getVehicleType(vehicleAddress);
        uint deposit = vehiclesEntries[exitSecretHashed].deposit;
        uint routePrice = getRoutePrice(entryBooth, exitBooth);

        uint fee = routePrice * getMultiplier(vehicleType);
        uint refundWeis = deposit - fee;

        if (fee < deposit){
            collectedFees += fee;
            vehiclesEntries[exitSecretHashed].deposit = 0;
            pendingPayments[entryBooth][exitBooth].count -= 1; // check
            LogRoadExited(exitBooth, exitSecretHashed, fee, refundWeis);
            vehicleAddress.transfer(refundWeis);
        }
        else if (fee >= deposit) {
            collectedFees += fee;
            vehiclesEntries[exitSecretHashed].deposit = 0;
            pendingPayments[entryBooth][exitBooth].count -= 1;
            LogRoadExited(exitBooth, exitSecretHashed, fee, refundWeis);
        } 


        return true;
    }

    /**
     * @return The amount that has been collected so far through successful payments.
     */
    function getCollectedFeesAmount()
        constant
        public
        returns(uint amount)
    {
        return collectedFees;
    }


    /**
     * Called by the owner of the contract to withdraw all collected fees (not deposits) to date.
     *     It should roll back if any other address is calling this function.
     *     It should roll back if there is no fee to collect.
     *     It should roll back if the transfer failed.
     * @return success Whether the operation was successful.
     * Emits LogFeesCollected.
     */
    function withdrawCollectedFees()
        public
        fromOwner
        returns(bool success)
    {
        require(collectedFees != 0);
        uint amount = collectedFees;
        collectedFees = 0;
        msg.sender.transfer(collectedFees);
        LogFeesCollected(msg.sender, amount);
        return true;
    }

    
    function()
        payable 
    {
        revert();
    }

}