(function () {
	"use strict";

	angular.module('TollBoothApp')
	.controller('tollBoothController', tollBoothController);

	tollBoothController.$inject = ['$scope', '$rootScope', 'tollboothoperator'];

	function tollBoothController($scope, $rootScope, tollboothoperator) {

		var newRoadExited = {};

		$rootScope.$on("LogTollBoothOperatorCreated", (event, args) => {
			reload();

		});

		function reload(){
			tollboothoperator.getInstance().isTollBooth.call($rootScope.account.toString())
			.then((isTollBooth) => {
				$rootScope.isTollBooth = isTollBooth.valueOf();
				$rootScope.$apply();});
		}

		if ($rootScope.tollBoothOperatorInstance != undefined ){
			reload();
		}

		$rootScope.$on("AccountChanged", () => {
			tollboothoperator.getInstance().isTollBooth.call($rootScope.account.toString())
			.then((isTollBooth) => {
				$rootScope.isTollBooth = isTollBooth.valueOf();
				$rootScope.$apply();});
		});

		$scope.exitRoad = function() {
			if(tollboothoperator.getInstance()== undefined) {alert("Please create a tollboothoperator first."); return;}
			if($rootScope.account != undefined ) {
				tollboothoperator.getInstance().reportExitRoad($scope.new.secretClear, {from: $rootScope.account, gas: 4500000})
				.then(function(txn) {
					$scope.new.tollBoothAddress = "";
					console.log(txn);
				});
			} else {
				alert('Please select an account first');
			}
		}

	}

}());