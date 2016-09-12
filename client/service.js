angular.module('housing.service', [])
.factory('Service', function($http) {
	
	var savePrefs = function(name, location, term, budget) {
		var searchLocation = location || 'sf';
		var searchTerm = term || '';
		var searchBudget = budget || '';
		console.log(name, 'HERE AGAIN');
		return $http({
			method: 'POST',
			url: '/api/users/savePreferences',
			params: {
				username: name,
				location: searchLocation,
				term: searchTerm,
				budget: searchBudget				
			}
		}).then(function(res){
			return res.data;
		});
	};

	var getPrefs = function(name) {
		return $http({
			method: 'GET',
			url: '/api/users/getPreferences',
			params: {
				username: name		
			}
		}).then(function(res) {
			return res.data;
		});
	};

	var getResult = function(location, term, budget, options) {
		var searchLocation = location || 'San Francisco';
		var searchTerm = term || '';
		var searchBudget = budget || '';
		var searchOptions = options || {};
		return $http({
			method: 'GET',
			url: '/data:params',
			params: {
				location: searchLocation,
				term: searchTerm,
				budget: searchBudget,
				options: searchOptions
			}
		}).then(function(res) {
			console.log('data from request: ', res.data);
			return res.data;
		});
	};

	return {
		getPrefs: getPrefs,
		savePrefs: savePrefs,
		getResult: getResult
	};
})