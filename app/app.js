const Web3 = require("web3");
const Promise = require("bluebird");
const truffleContract = require("truffle-contract");
const RegulatorJson = require("../build/contracts/Regulator.json");
const TollBoothOperatorJson = require("../build/contracts/TollBoothOperator.json");

if (typeof web3 !== 'undefined') {
    // Use the Mist/wallet/Metamask provider.
    window.web3 = new Web3(web3.currentProvider);
  } else {
    // Your preferred fallback.
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
  }
  Promise.promisifyAll(web3.eth, { suffix: "Promise" });
  Promise.promisifyAll(web3.version, { suffix: "Promise" });


  const Regulator = truffleContract(RegulatorJson);
  Regulator.setProvider(web3.currentProvider);
  const TollBoothOperator = truffleContract(TollBoothOperatorJson);
  TollBoothOperator.setProvider(web3.currentProvider);

  var app = angular.module('TollBoothApp', ['ngRoute']);


  app.config(function ($locationProvider) {
    $locationProvider.html5Mode(false);
  });


  app.run(['$rootScope', 'regulator', 'tollboothoperator', 'events', function ($rootScope, regulator, tollboothoperator, events) {
      $rootScope.account = "";

    web3.eth.getAccountsPromise()
    .then(accounts => {
      if (accounts.length > 0) {
        $rootScope.accounts = accounts;
        var accountToSet = accounts[0];
        // Only take localStorage if contract hasn't been redeployed (new accounts)
        for(var i=0; i< accounts.length ; i++) {
          if(accounts[i] == localStorage.getItem("account")){
            accountToSet = localStorage.getItem("account"); 
          }
        }
        $rootScope.setAccount(accountToSet);
        $rootScope.$apply();
      } else {
        if (typeof (mist) !== "undefined") {
          mist.requestAccount(function (e, accounts) {
            if (e != null) {
              $rootScope.account = accounts[0];
              $rootScope.setAccount($rootScope.account);
              $rootScope.$apply();
            }
          });
        }
      }
    }).catch(console.error);

    regulator.getContract().deployed().then(_instance => {
      $rootScope.isRegulator = 0;
      console.log("Regulator Contract at "+ _instance.address);
      $rootScope.regulatorInstance = _instance;
      regulator.getOwner($rootScope.regulatorInstance)
      .then((_owner) =>  {
         $rootScope.isRegulator =  0;
        if(_owner == $rootScope.account.toString()) $rootScope.isRegulator = 1;

        $rootScope.regulatorOwner=_owner;
        $rootScope.$apply();
      });
      events.watchForNewOperator();
      events.watchForNewVehicleSet();

    });


  /*
   function watchForNewOperator() {

    regulator.getInstance().LogTollBoothOperatorCreated( {}, {fromBlock: 0})
    .watch(function(err, _tollBoothOperator) {
      if(err) 
      {
        console.error("tollboothoperator Error:",err);
      } else {

       $rootScope.tollBoothOperatorInstance = tollboothoperator.getContract().at(_tollBoothOperator.args.newOperator);
       console.log("we havea tolbooth instance" + $rootScope.tollBoothOperatorInstance );
    
       $rootScope.$apply();

     }
   })
 };*/


 $rootScope.setAccount = function(account) {
  if(account != undefined){
    $rootScope.account = account;
    $rootScope.accountSelected = account;

  }else {
    $rootScope.account = $rootScope.accountSelected;
  }
  var accountSelectedSession = $rootScope.accountSelected;
  localStorage.setItem("account", accountSelectedSession);
  $rootScope.balance = web3.eth.getBalance($rootScope.account).toString(10);
  $rootScope.balanceInEth = web3.fromWei ($rootScope.balance, "ether");
  console.log('Using account',$rootScope.account);
  $rootScope.$broadcast("AccountChanged");

}

$rootScope.copyAddress = function () {

 if ($rootScope.accountSelected == undefined) return;
 var address = $rootScope.accountSelected.toString();
      // Create a dummy input to copy the string array inside it
      var dummy = document.createElement("input");
      // Add it to the document
      document.body.appendChild(dummy);
      // Set its ID
      dummy.setAttribute("id", "dummy_id");
      // Output the array into it  
      document.getElementById("dummy_id").value=address;  
      // Select it
      dummy.select();
      // Copy its contents
      document.execCommand("copy");
      // Remove it as its not needed anymore
      document.body.removeChild(dummy);
    }


    $rootScope.vehicleTypeSetLogs = [];
    $rootScope.tollBoothAddedLog = [];
    $rootScope.routePriceSetLog = [];
    $rootScope.roadEnteredLogs = [];
    $rootScope.multiplierSetLogs = [];
    $rootScope.roadExitedLog = [];
    $rootScope.pendingPaymentLogs = [];
    $rootScope.pendingPaymentClearedLogs = [];
    $rootScope.hashListByVehicle = {};
    txn = {};                // workaround for repetitive event emission (testRPC)
    $rootScope.tollBoothOperatorExist=false;
    $rootScope.isOperator = false;
    $rootScope.vehicleTypes = {
      1 : "Motorbike",
      2 : "Car",
      3 : "Lorrie"
    };


  }]);


  app.service("regulator", require("./regulator.service.js"));
  app.service("tollboothoperator", require("./tollboothoperator.service.js"));
  app.service("events", require("./events.service.js"));

  // configure our routes
  app.config(function($routeProvider) {
    $routeProvider

    .when('/', {
      templateUrl : 'pages/home.html',
      controller  : 'mainController'
    })

    .when('/regulator', {
      templateUrl : 'regulator/regulator.html',
      controller  : 'regulatorController'
    })

    .when('/tollboothoperator', {
      templateUrl : 'tollBoothOperator/tollBoothOperator.html',
      controller  : 'tollboothoperatorController'
    })

    .when('/vehicle', {
      templateUrl : 'vehicle/vehicle.html',
      controller  : 'vehicleController'
    })

    .when('/tollbooth', {
      templateUrl : 'tollbooth/tollbooth.html',
      controller  : 'tollBoothController'
    });


  });

  