(function () {
	"use strict";

 angular.module('TollBoothApp')
 .controller('tollboothoperatorController', tollboothoperatorController);

 tollboothoperatorController.$inject = ['$rootScope', '$scope','tollboothoperator'];

 function tollboothoperatorController($rootScope, $scope, tollboothoperator) {
    // get tollboothoperator
    if ($rootScope.tollBoothOperatorInstance != undefined && $rootScope.tollBoothOperator != undefined){
     	//$rootScope.tollboothoperatorAddress =
     	$scope.owner  =  $rootScope.tollBoothOperator.owner + ""; 
     	$scope.contractAddress = $rootScope.tollBoothOperator.contractAddress;
     }
    var newTollBooth = {};
    var newRoutePrice = {};


     $scope.newTollBooth = function() {
       if(tollboothoperator.getInstance()== undefined) {alert("Please create a tollboothoperator first."); return;}
       if($rootScope.account != undefined ) {
        tollboothoperator.getInstance().addTollBooth($scope.new.tollBoothAddress, {from: $rootScope.account, gas: 4500000})
        .then(function(txn) {
          $scope.new.tollBoothAddress = "";
          console.log(txn);
        });
      } else {
        alert('Please select an account first');
      }
    }

    var newTollBoothListener = $rootScope.$on("LogTollBoothAdded", (event, args , txHash) => {
      console.log("tollBoothOperator added");
      console.log(event,args,txHash);
      console.log("tollBoothOperator end");

      newTollBooth = {
        creator : args.sender,
        tollBoothAddress : args.tollBooth
      };

      $rootScope.tollBoothAddedLog.push(newTollBooth);  

    });


    $scope.setRoutePrice = function() {
      if(parseInt($scope.new.priceWeis) < 0) { alert("Please set a positive price"); return;}
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
     } 
   }

   var newRoutePriceListener = $rootScope.$on("LogRoutePriceSet", (event, args) => {
    console.log("ROUTE PREICE SET EVENT");
    
    newRoutePrice = {
      creator : args.sender,
      entryBooth : args.entryBooth,
      exitBooth : args.exitBooth,
      priceWeis : args.priceWeis
    };

    $rootScope.routePriceSetLog.push(newRoutePrice);  

  });

   $scope.$on("destroy", () => {
    newRoutePriceListener();
    newTollBoothListener();
  })

 }

}());
