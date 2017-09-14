(function () {
	"use strict";

 angular.module('TollBoothApp')
 .controller('tollboothoperatorController', tollboothoperatorController);

 tollboothoperatorController.$inject = ['$rootScope', '$scope','tollboothoperator', 'regulator'];

 function tollboothoperatorController($rootScope, $scope, tollboothoperator, regulator) {


  //$rootScope.tollBoothOperatorInstance.then(() => console.log("GG LOUL"));

    // get tollboothoperator

    $rootScope.$on("LogTollBoothOperatorCreated", (event, args) => {
      reload();

    });

    if ($rootScope.tollBoothOperatorInstance != undefined && $rootScope.tollBoothOperator != undefined){
     	//$rootScope.tollboothoperatorAddress =
       reload();
     }

     function reload() {

      $scope.owner  =  $rootScope.tollBoothOperator.owner + ""; 
       if($rootScope.account == $scope.owner) $rootScope.isOperator = true;
      $scope.contractAddress = $rootScope.tollBoothOperator.contractAddress;
      watchForNewTollBooth();
      watchForNewRoutePrice();
      watchForNewMultiplier();
      $rootScope.tollBoothOperatorExist=true;
    }

    var newTollBooth = {};
    var newRoutePrice = {};
    var newMultiplier = {};

    var changeAccountListener = $rootScope.$on("AccountChanged", () => {
     if($rootScope.account == $scope.owner) $rootScope.isOperator = true;
   });

    $scope.newTollBooth = function() {
     if(tollboothoperator.getInstance()== undefined) {alert("Please create a tollboothoperator first."); return;}
     console.log($scope.new.tollBoothAddress);
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

  function watchForNewTollBooth() {
    tollboothoperator.getInstance().LogTollBoothAdded( {}, {fromBlock: 0})
    .watch(function(err, _tollBooth) {
      if(err) 
      {
        console.error("Tollbooth Error:",err);
      } else {

        newTollBooth = {
          creator : _tollBooth.args.sender,
          tollBoothAddress : _tollBooth.args.tollBooth
        };

        // only if non-repetitive (testRPC)
        if(typeof(txn[_tollBooth.transactionHash])=='undefined')
        {
         $rootScope.tollBoothAddedLog.push(newTollBooth);         
         txn[_tollBooth.transactionHash]=true;
          //upsertCampaign(newCampaign.args.campaign);
        }
        $rootScope.$apply();
      }
    })
  };


  $scope.setRoutePrice = function() {
    if(parseInt($scope.new.priceWeis) < 0) { alert("Please set a positive price"); return;}
    if(tollboothoperator.getInstance() == undefined) {alert("Please create a tollboothoperator first."); return;}

    if($rootScope.account != undefined ) {

     tollboothoperator.getInstance().setRoutePrice($scope.new.entryBooth, $scope.new.exitBooth, parseInt($scope.new.priceWeis), {from: $rootScope.account, gas: 4500000})
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

 function watchForNewRoutePrice() {
  tollboothoperator.getInstance().LogRoutePriceSet( {}, {fromBlock: 0})
  .watch(function(err, _routePrice) {
    if(err) 
    {
      console.error("Route Price Error:",err);
    } else {
     newRoutePrice = {
      creator : _routePrice.args.sender,
      entryBooth : _routePrice.args.entryBooth,
      exitBooth : _routePrice.args.exitBooth,
      priceWeis : _routePrice.args.priceWeis.valueOf()
    };
      // only if non-repetitive (testRPC)
      if(typeof(txn[_routePrice.transactionHash])=='undefined')
      {
        $rootScope.routePriceSetLog.push(newRoutePrice);           
        txn[_routePrice.transactionHash]=true;
        //upsertCampaign(newCampaign.args.campaign);
      }
      $rootScope.$apply();
    }
  })
};

$scope.setRouteMultiplier = function() {
  var newVehicleType = regulator.getVehicleTypeMatchStr($scope.vehicleTypeSelected);
  if(parseInt($scope.new.multiplier) < 0 || newVehicleType < 0 ) { alert("Please set a positive price / type"); return;}
  if(tollboothoperator.getInstance() == undefined) {alert("Please create a tollboothoperator first."); return;}

  if($rootScope.account != undefined ) {

   tollboothoperator.getInstance().setMultiplier(newVehicleType, $scope.new.multiplier, {from: $rootScope.account})
   .then(function(txn){
    $scope.new.multiplier = "";
    $scope.vehicleTypeSelected = "";
  });

 } else {

   alert("Please select an Account before trying to set a route price");
 } 
}

function watchForNewMultiplier() {
  tollboothoperator.getInstance().LogMultiplierSet( {}, {fromBlock: 0})
  .watch(function(err, _multiplier) {
    if(err) 
    {
      console.error("LogMultiplierSet Error:",err);
    } else {
     newMultiplier = {
      creator : _multiplier.args.sender,
      vehicleType : regulator.getVehicleTypeMatch(parseInt(_multiplier.args.vehicleType)),
      multiplier : _multiplier.args.multiplier.valueOf()
    };
    console.log(newMultiplier);
      // only if non-repetitive (testRPC)
      if(typeof(txn[_multiplier.transactionHash])=='undefined')
      {
        $rootScope.multiplierSetLogs.push(newMultiplier);           
        txn[_multiplier.transactionHash]=true;
      }
      $rootScope.$apply();
    }
  })
};




}

}());
