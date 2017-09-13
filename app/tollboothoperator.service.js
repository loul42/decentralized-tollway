var truffleContract = require("truffle-contract");
const TollBoothOperatorJson = require("../build/contracts/TollBoothOperator.json");
var TollBoothOperator = truffleContract(TollBoothOperatorJson);
var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', function ($rootScope, $timeout) {
    TollBoothOperator.setProvider(web3.currentProvider);

    return {
        getContract:function(){return TollBoothOperator;},
        getOwner:function(instance){
            return instance.owner().then((_owner) => {
                return _owner;
            })
        }
    };
}];