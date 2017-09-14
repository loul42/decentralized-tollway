(function () {
  "use strict";

  angular.module('TollBoothApp')
  .controller('vehicleController', vehicleController);

  vehicleController.$inject = ['$scope','$rootScope', 'regulator', 'tollboothoperator'];

  function vehicleController($scope, $rootScope, regulator, tollboothoperator) {

    if ($rootScope.tollBoothOperatorInstance != undefined && $rootScope.tollBoothOperator != undefined){
      watchForNewEnterRoad();
    }

    regulator.getInstance().getVehicleType.call($rootScope.account.toString())
    .then((isVehicle) => {$rootScope.isVehicle = isVehicle.valueOf(); $rootScope.$apply();});

    var newEnterRoad = {};
    var newHashForVehicle = {};

    var changeAccountListener = $rootScope.$on("AccountChanged", () => {
      watchForNewEnterRoad();
      regulator.getInstance().getVehicleType.call($rootScope.account.toString())
      .then((isVehicle) => {
        $rootScope.isVehicle = isVehicle.valueOf();
        $rootScope.$apply();});
    });

    $scope.enterRoad = function() {
     if(parseInt($scope.new.priceWeis) < 0) { alert("Please set a positive price"); return;}
     if($scope.new.entryBoothSelected == undefined || $scope.new.exitSecretHashed == undefined || $scope.new.priceWeis == undefined) {alert("Please fill all the fields.");return;}
     if(tollboothoperator.getInstance() == undefined) {alert("Please create a tollboothoperator first."); return;}

     if($rootScope.account != undefined ) {
      console.log($scope.new.entryBoothSelected, $scope.new.exitSecretHashed, $scope.new.priceWeis);
      tollboothoperator.getInstance().enterRoad($scope.new.entryBoothSelected, $scope.new.exitSecretHashed, {from: $rootScope.account, value: $scope.new.priceWeis, gas:4500000})
      .then(function(txn){
       console.log(txn);
       $scope.new.entryBoothSelected = "";
       $scope.new.exitSecretHashed = "";
       $scope.new.priceWeis = "";
     });

    } else {

      alert("Please select an Account before trying to set a route price");
    }
  }

  function watchForNewEnterRoad() {

   tollboothoperator.getInstance().LogRoadEntered({vehicle: $rootScope.account.toString()}, {fromBlock: 0})
   .watch(function(err, _roadEntered) {
    if(err) 
    {
     console.error("LogRoadEntered Error:",err);
   } else {

     newEnterRoad = {
      vehicle : _roadEntered.args.vehicle,
      entryBooth : _roadEntered.args.entryBooth,
      exitSecretHashed : _roadEntered.args.exitSecretHashed,
      depositedWeis : _roadEntered.args.depositedWeis.valueOf()
    };
        // only if non-repetitive (testRPC)
        if(typeof(txn[_roadEntered.transactionHash])=='undefined')
        {

         $rootScope.roadEnteredLogs.push(newEnterRoad);         
         txn[_roadEntered.transactionHash]=true;
        }
        $rootScope.$apply();
      }
    })
 };

}


}());