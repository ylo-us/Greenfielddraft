angular.module('housing.search', [])
.controller('SearchController', function($scope, $location, Service) {
	$scope.search = function() {
		Service.getResult($scope.location, $scope.term, $scope.budget).then(function(data) {
			// console.log('Data: ', data);
			window.data = data;
			$location.path('/result');
		});
	}

})