var truffleContract = require("truffle-contract");
const RegulatorJson = require("../build/contracts/Regulator.json");
var Regulator = truffleContract(RegulatorJson);
const TollBoothOperatorJson = require("../build/contracts/TollBoothOperator.json");
var TollBoothOperator = truffleContract(TollBoothOperatorJson);
var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', 'regulator', 'tollboothoperator', function ($rootScope, $timeout, regulator, tollboothoperator) {
    TollBoothOperator.setProvider(web3.currentProvider);
    Regulator.setProvider(web3.currentProvider);

    
    function watchForPendingPayment() {
        tollboothoperator.getInstance().LogPendingPayment( {}, {fromBlock: 0})
        .watch(function(err, _pendingPayment) {
            if(err) 
            {
                console.error("_pendingPayment Error:",err);
            } else {
                var newPendingPayment = {};
                newPendingPayment = {
                    exitSecretHashed : _pendingPayment.args.exitSecretHashed,
                    entryBooth : _pendingPayment.args.entryBooth,
                    exitBooth : _pendingPayment.args.exitBooth
                };


        // only if non-repetitive (testRPC)
        if(typeof(txn[_pendingPayment.transactionHash])=='undefined')
        {
            $rootScope.pendingPaymentLogs.push(newPendingPayment);         
            txn[_pendingPayment.transactionHash]=true;
          //upsertCampaign(newCampaign.args.campaign);
      }
      $rootScope.$apply();
  }
})
    }


    function watchForNewVehicleExit() {
        console.log(tollboothoperator.getInstance());
        tollboothoperator.getInstance().LogRoadExited( {}, {fromBlock: 0})
        .watch(function(err, _vehicleExit) {
            if(err) 
            {
                console.error("_vehicleExit Error:",err);
            } else {
                var newRoadExited = {};
                newRoadExited = {
                    exitBooth : _vehicleExit.args.exitBooth,
                    exitSecretHashed : _vehicleExit.args.exitSecretHashed,
                    finalFee : _vehicleExit.args.finalFee.valueOf(),
                    refundWeis : _vehicleExit.args.refundWeis.valueOf()
                };


        // only if non-repetitive (testRPC)
        if(typeof(txn[_vehicleExit.transactionHash])=='undefined')
        {   
            checkIfExitWasPending(newRoadExited.exitSecretHashed);
            $rootScope.roadExitedLog.push(newRoadExited);         
            txn[_vehicleExit.transactionHash]=true;
          //upsertCampaign(newCampaign.args.campaign);
      }
      $rootScope.$apply();
  }
})
    }


        function checkIfExitWasPending(_exitSecretHashed) {
            var exitSecretHashed = _exitSecretHashed;

            console.log($rootScope.pendingPaymentLogs);
            angular.forEach($rootScope.pendingPaymentLogs, function(value, key){
               if(_exitSecretHashed == value.exitSecretHashed){
            
               // we add it in refunded
               $rootScope.pendingPaymentClearedLogs.push(value);
                // exit was pending ! We remove it from pending
               $rootScope.pendingPaymentLogs.splice(key,1);
               }
            });
           
        }


    return {
        watchForNewOperator:function(){
            regulator.getInstance().LogTollBoothOperatorCreated( {}, {fromBlock: 0}).watch(function(err, _tollBoothOperator) {
                if(err) 
                {
                    console.error("tollboothoperator Error:",err);
                } else {
                    var newTollBoothOperator = {};
                    newTollBoothOperator = {
                        creator : _tollBoothOperator.args.sender,
                        contractAddress : _tollBoothOperator.args.newOperator,
                        owner: _tollBoothOperator.args.owner,
                        minDeposit: _tollBoothOperator.args.depositWeis.toString(10)
                    };

                    $rootScope.tollBoothOperator = newTollBoothOperator;

                // only if non-repetitive (testRPC)
                if(typeof(txn[_tollBoothOperator.transactionHash])=='undefined')
                {     
                  $rootScope.tollBoothOperatorInstance = tollboothoperator.getContract().at(newTollBoothOperator.contractAddress);
                  watchForPendingPayment();
                  watchForNewVehicleExit();
                  $rootScope.$broadcast("LogTollBoothOperatorCreated");
                  $rootScope.tollBoothOperatorInstance.isPaused.call()
                  .then((isPaused) => {
                      if(isPaused) $rootScope.tollBoothOperatorInstance.setPaused(false, { from: newTollBoothOperator.owner });
                  });

                  txn[_tollBoothOperator.transactionHash]=true;
                  $rootScope.regulatorAlreadyCreated = true;
              }

              $rootScope.$apply();

          }})},
            watchForNewVehicleSet: function() {
                regulator.getInstance().LogVehicleTypeSet( {}, {fromBlock: 0})
                .watch(function(err, _vehicleTypeSet) {
                  if(err) 
                  {
                    console.error("Vehicle Set Error:",err);
                } else {
                   var newVehicleTypeSet = {};
                   newVehicleTypeSet = {
                      sender : _vehicleTypeSet.args.sender,
                      vehicle : _vehicleTypeSet.args.vehicle,
                      vehicleType: regulator.getVehicleTypeMatch(parseInt(_vehicleTypeSet.args.vehicleType))
                  };

                // only if non-repetitive (testRPC)
                if(typeof(txn[_vehicleTypeSet.transactionHash])=='undefined')
                {
                   $rootScope.vehicleTypeSetLogs.push(newVehicleTypeSet);         
                   txn[_vehicleTypeSet.transactionHash]=true;
                  //upsertCampaign(newCampaign.args.campaign);
              }
              $rootScope.$apply();
          }
      })
            }

        };


    }];   