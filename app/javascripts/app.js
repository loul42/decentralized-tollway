const Web3 = require("web3");
const Promise = require("bluebird");
const truffleContract = require("truffle-contract");
const RegulatorJson = require("../../build/contracts/Regulator.json");
const TollBoothOperatorJson = require("../../build/contracts/TollBoothOperator.json");

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

var tollBoothApp = angular.module('tollBoothApp', ['ngRoute']);

tollBoothApp.config(function ($locationProvider) {
    $locationProvider.html5Mode(false);
});

  // configure our routes
  tollBoothApp.config(function($routeProvider) {
    $routeProvider

      // route for the home page
      .when('/', {
        templateUrl : 'pages/home.html',
        controller  : 'mainController'
      })

      // route for the about page
      .when('/regulator', {
        templateUrl : 'pages/regulator.html',
        controller  : 'regulatorController'
      })

      // route for the contact page
      .when('/tollboothoperator', {
        templateUrl : 'pages/tollBoothOperator.html',
        controller  : 'tollboothoperatorController'
      });
  });

  // create the controller and inject Angular's $scope
  tollBoothApp.controller('mainController', function($scope) {
    // create a message to display in our view
    $scope.message = 'Everyone come and see how good I look!';

   web3.eth.getAccountsPromise()
      .then(accounts => {
          if (accounts.length > 0) {
              $scope.accounts = accounts[0];
              $scope.$apply();
          }
      }).catch(console.error);

 /*   $scope.setAccount = function() {
      $scope.account = $scope.accountSelected;
      $scope.balance = web3.eth.getBalance($scope.account).toString(10);
      console.log('Using account',$scope.account);
    }*/

  });

  tollBoothApp.controller('regulatorController', function($scope) {
    $scope.message = 'Look! I am an about page.';
  });

  tollBoothApp.controller('tollboothoperatorController', function($scope) {
    $scope.message = 'Hello tollboothoperator';
  });