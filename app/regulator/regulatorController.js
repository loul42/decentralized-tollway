(function () {
	"use strict";

 angular.module('TollBoothApp')
 .controller('regulatorController', regulatorController);

 regulatorController.$inject = ['$rootScope','$scope','regulator','tollboothoperator'];

 function regulatorController($rootScope, $scope, regulator, tollboothoperator) {

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

 var newOperatorListener = $rootScope.$on("LogTollBoothOperatorCreated", (event, args) => {

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

  });

 

 var newVehicleSetListener = $rootScope.$on("LogVehicleTypeSet", (event, args) => {


  newVehicleTypeSet = {
    sender : args.sender,
    vehicle : args.vehicle,
    vehicleType: regulator.getVehicleTypeMatch(parseInt(args.vehicleType))
  };

    //push in a tab
    $rootScope.vehicleTypeSetLogs.push(newVehicleTypeSet);         

  });

 $scope.$on("destroy", () => {
  newVehicleSetListener();
  newOperatorListener();
})

}

}());