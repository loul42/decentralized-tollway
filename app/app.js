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


app.run(['$rootScope', 'regulator', function ($rootScope, regulator) {
    web3.eth.getAccountsPromise()
        .then(accounts => {
            if (accounts.length > 0) {
                $rootScope.accounts = accounts;
                $rootScope.$apply();
            } else {
                if (typeof (mist) !== "undefined") {
                    mist.requestAccount(function (e, accounts) {
                        if (e != null) {
                            $rootScope.account = accounts[0];
                            $rootScope.$apply();
                        }
                    });
                }
            }
        }).catch(console.error);

    regulator.getContract().deployed().then(_instance => {
        console.log("Regulator Contract at "+ _instance.address);
        $rootScope.regulatorInstance = _instance;
        regulator.getOwner($rootScope.regulatorInstance).then((_owner) =>  {$rootScope.regulatorOwner=_owner;$rootScope.$apply();});

        $rootScope.$apply();
        var events = _instance.allEvents((error, log) => {
            if (!error)
                $rootScope.$broadcast(log.event,log.args);
            $rootScope.$apply();
        });
    });

    $rootScope.setAccount = function() {
      $rootScope.account = $rootScope.accountSelected;
      $rootScope.balance = web3.eth.getBalance($rootScope.account).toString(10);
      console.log('Using account',$rootScope.account);
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

}]);


  app.service("regulator", require("./regulator.service.js"));
  app.service("tollboothoperator", require("./tollboothoperator.service.js"));

  // configure our routes
  app.config(function($routeProvider) {
    $routeProvider
      // route for the home page
      .when('/xx', {
        templateUrl : 'pages/home.html',
        controller  : 'mainController'
      })

      // route for the about page
      .when('/', {
        templateUrl : 'regulator/regulator.html',
        controller  : 'regulatorController'
      })

      // route for the contact page
      .when('/tollboothoperator', {
        templateUrl : 'tollBoothOperator/tollBoothOperator.html',
        controller  : 'tollboothoperatorController'
      });
  });

  