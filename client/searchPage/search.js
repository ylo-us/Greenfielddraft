angular.module('housing.search', [])
.controller('SearchController', function($scope, $location, Service) {
	$scope.options = {
		laundryInUnit: false,
		pets: false,
		furnished: false,
		nonSmoking: false
	};
	$scope.search = function() {
		$location.path('/loading');
		Service.getResult($scope.location, $scope.term, $scope.budget, $scope.options).then(function(data) {
			// console.log('Data: ', data);
			window.data = data;
			if (typeof data === 'object' && data.neighbourhoods.length > 0) {
				$location.path('/result');
			} else {
				alert(data);
				$location.path('/search');
			}
		});
	};
	$scope.hideMe = function() {
		var ele = angular.element($('.optionLists'));
		ele.toggleClass('hide');
		console.log('options: ', $scope.options);
	}


})