(function () {
	"use strict";

 angular.module('TollBoothApp')
		.controller('mainController', mainController);

mainController.$inject = ['$scope'];

 function mainController($scope) {
     // create a message to display in our view
    $scope.message = 'Welcome ! Please create a TollBoothOperator first :)';
  }

}());