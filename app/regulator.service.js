var truffleContract = require("truffle-contract");
const RegulatorJson = require("../build/contracts/Regulator.json");
var Regulator = truffleContract(RegulatorJson);
var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', function ($rootScope, $timeout) {
    Regulator.setProvider(web3.currentProvider);


    function getVehicleTypeMatch(_enum) {
        if(_enum == 0) return "Vehicle don't exist";
        if(_enum == 1) return "Motorbike";
        if(_enum == 2) return "Car";
        if(_enum == 3) return "Lorrie";
    }

    return {
        getContract:function(){return Regulator;},
        getInstance:function(){return $rootScope.regulatorInstance;},
        getOwner:function(instance){
            return instance.getOwner().then((_owner) => {
                return _owner;
            })
        },
        getVehicleType:function(instance, addressVehicle){
            return instance.getVehicleType(addressVehicle,{from: $rootScope.account}).then((_vehicleType) => {
                return getVehicleTypeMatch(_vehicleType);
            })
        },
        getVehicleTypeMatch:function(_enum) {
            if(_enum == 0) return "Vehicle don't exist";
            if(_enum == 1) return "Motorbike";
            if(_enum == 2) return "Car";
            if(_enum == 3) return "Lorrie";
        },
        getVehicleTypeMatchStr: function(_str) {
            if(_str == "Motorbike") return 1;
            if(_str == "Car") return 2;
            if(_str == "Lorrie") return 3; 
        }
    };
}];