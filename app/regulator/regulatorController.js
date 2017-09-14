(function () {
  "use strict";

  angular.module('TollBoothApp')
  .controller('regulatorController', regulatorController);

  regulatorController.$inject = ['$rootScope','$scope','regulator','tollboothoperator','events'];

  function regulatorController($rootScope, $scope, regulator, tollboothoperator, events) {


    var newTollBoothOperator = {};

    var newVehicleTypeSet = {};
    $rootScope.isRegulator =  0;

    if($rootScope.regulatorInstance != undefined){
      $scope.message = 'Regulator contract address is ' + $rootScope.regulatorInstance.address;

    } else{
      $scope.message = "";
    }

    var changeAccountListener = $rootScope.$on("AccountChanged", () => {
     regulator.getOwner($rootScope.regulatorInstance)
      .then((_owner) =>  {
        $rootScope.isRegulator =  0;
        if(_owner == $rootScope.account.toString()) $rootScope.isRegulator = 1;
      
        $rootScope.regulatorOwner=_owner;
        $rootScope.$apply();
      });
    });


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

 }

}());