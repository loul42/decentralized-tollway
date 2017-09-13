(function () {
  "use strict";

  angular.module('TollBoothApp')
  .controller('regulatorController', regulatorController);

  regulatorController.$inject = ['$rootScope','$scope','regulator','tollboothoperator'];

  function regulatorController($rootScope, $scope, regulator, tollboothoperator) {

  //To be able to watch
  regulator.getContract().deployed().then(_instance => {
    watchForNewVehicleSet();
    watchForNewOperator();
  });

  var newTollBoothOperator = {};
  $scope.vehicleTypes = {
    1 : "Motorbike",
    2 : "Car",
    3 : "Lorrie"
  };
  var newVehicleTypeSet = {};

  if($rootScope.regulatorInstance != undefined){
    $scope.message = 'Regulator contract address is ' + $rootScope.regulatorInstance.address;

  } else{
    $scope.message = "";
  }
  
  $scope.newTollBoothOperator = function() {
    if(parseInt($scope.new.minDeposit) > 0 && $rootScope.account != undefined) {
      regulator.getInstance().createNewOperator($scope.new.addressOperatorOwner, $scope.new.minDeposit, {from: $rootScope.account, gas: 4500000})
      .then(function(txn) {
        $scope.new.addressOperatorOwner = "";
        $scope.new.minDeposit = "";
      });
    } else {
      alert('Integers over Zero, please');
    }
  }

  $scope.setVehicleType = function() {

    if($scope.vehicleTypeSelected == undefined ) { alert("Please chose a  vehicle Type"); return;}
    var newVehicleType = regulator.getVehicleTypeMatchStr($scope.vehicleTypeSelected);
    var vehicleAddress = $scope.new.vehicleAddress.toString();
    newVehicleType= web3.toBigNumber(newVehicleType)

    if(regulator.getInstance() != undefined && $rootScope.account != undefined ){

     regulator.getInstance().setVehicleType(vehicleAddress, parseInt(newVehicleType), {from: $rootScope.account})
     .then(function(txn){

     });

   } else {

     alert(" Select an Account before trying to set a vehicleType");
   } 
 }

 /*var newOperatorListener = $rootScope.$on("LogTollBoothOperatorCreated", (event, args) => {

  newTollBoothOperator = {
    creator : args.sender,
    contractAddress : args.newOperator,
    owner: args.owner,
    minDeposit: args.depositWeis.toString(10)
  };

    //Instantiate the instance operator
    // maybe put in a tab not via event,
    $rootScope.tollBoothOperatorInstance = tollboothoperator.getContract().at(newTollBoothOperator.contractAddress);

    var events = $rootScope.tollBoothOperatorInstance.allEvents((error, log) => {
      if (!error)
        $rootScope.$broadcast(log.event,log.args);
      $rootScope.$apply();
    });

    $rootScope.tollBoothOperator = newTollBoothOperator;
    $rootScope.regulatorAlreadyCreated = true;
    $rootScope.$apply();

  });*/

  function watchForNewOperator() {
    regulator.getInstance().LogTollBoothOperatorCreated( {}, {fromBlock: 0})
    .watch(function(err, _tollBoothOperator) {
      if(err) 
      {
        console.error("tollboothoperator Error:",err);
      } else {

        // normalizing data for output purposes

        
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
         console.log("TollBoothOperator only once please ok");
         $rootScope.tollBoothOperatorInstance = tollboothoperator.getContract().at(newTollBoothOperator.contractAddress);      
         txn[_tollBoothOperator.transactionHash]=true;
         $rootScope.regulatorAlreadyCreated = true;
       }
       $rootScope.$apply();

     }
   })
  };



  function watchForNewVehicleSet() {
    regulator.getInstance().LogVehicleTypeSet( {}, {fromBlock: 0})
    .watch(function(err, _vehicleTypeSet) {
      if(err) 
      {
        console.error("Vehicle Set Error:",err);
      } else {

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
  };

}

}());