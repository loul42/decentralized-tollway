(function () {
	"use strict";

	angular.module('TollBoothApp')
	.controller('vehicleController', vehicleController);

	vehicleController.$inject = ['$scope','$rootScope', 'regulator', 'tollboothoperator'];

	function vehicleController($scope, $rootScope, regulator, tollboothoperator) {
     // create a message to display in our view
     var changeAccountListener = $rootScope.$on("AccountChanged", () => {
     	regulator.getInstance().getVehicleType.call($rootScope.account.toString())
     	.then((isVehicle) => $rootScope.isVehicle = isVehicle);
     });


     $scope.enterRoad = function() {
     /*	if(parseInt($scope.new.priceWeis) < 0) { alert("Please set a positive price"); return;}
     	if(tollboothoperator.getInstance() == undefined) {alert("Please create a tollboothoperator first."); return;}

     	if($rootScope.account != undefined ) {

     		tollboothoperator.getInstance().setRoutePrice($scope.new.entryBooth, $scope.new.exitBooth, parseInt($scope.new.priceWeis), {from: $rootScope.account})
     		.then(function(txn){
     			console.log(txn);
     			$scope.new.entryBooth = "";
     			$scope.new.exitBooth = "";
     			$scope.new.priceWeis = "";
     		});

     	} else {

     		alert("Please select an Account before trying to set a route price");
     	} */
     }
 }


}());