angular.module('housing.searchFromProfile', [])
.controller('SearchFromProfileController', function($scope, $location, Service, Auth) {
	$scope.options = {
		laundryInUnit: false,
		pets: false,
		furnished: false,
		nonSmoking: false
	};

	$scope.signout = function() {
		Auth.signout();
	}

	$scope.search = function() {
		$location.path('/loading');
		Service.getResult($scope.location, $scope.term, $scope.budget, $scope.options).then(function(data) {
			// console.log('Data: ', data);
			window.data = data;
			if (typeof data === 'object' && data.neighborhoods.length > 0) {
				$location.path('/result');

				if (Auth.isAuth()) {
					var token = window.localStorage.getItem('com.shortly')
					var payload = JSON.parse(window.atob(token.split('.')[1])); 
					$scope.username = payload.username;

					Service.savePrefs($scope.username, $scope.location, $scope.term, $scope.budget).then(function(data) {
						// console.log(data);
					});
				}
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