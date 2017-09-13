(function () {
	"use strict";

 angular.module('TollBoothApp')
		.controller('tollboothoperatorController', tollboothoperatorController);

tollboothoperatorController.$inject = ['$scope'];

 function tollboothoperatorController($scope) {
    // create a message to display in our view
    $scope.message = 'Hello tollboothoperator';
  }

}());
