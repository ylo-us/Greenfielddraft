angular.module('housing.search', [])
.controller('SearchController', function($scope, $location, Service) {
	$scope.search = function() {
		$location.path('/loading');
		Service.getResult($scope.location, $scope.term, $scope.budget).then(function(data) {
			// console.log('Data: ', data);
			window.data = data;
			if (typeof data === 'object' && data.neighbourhoods.length > 0) {
				$location.path('/result');
			} else {
				alert(data);
				$location.path('/search');
			}
		});
	}

})