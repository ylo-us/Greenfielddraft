angular.module('housing.service', [])
.factory('Service', function($http) {
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
		getResult: getResult
	};
})