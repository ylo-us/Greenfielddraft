angular.module('housing.service', [])
.factory('Service', function($http) {
	// var sendSearch = function(location, term, budget) {
	// 	// term and budget are optional
	// 	var searchLocation = location || 'sf';
	// 	var searchTerm = term || '';
	// 	var searchBudget = budget || '';
	// 	return $http({
	// 		method: 'POST',
	// 		url: '/data', // send to server where takes care of API request
	// 		data: {
	// 			location: searchLocation,
	// 			term: searchTerm,
	// 			budget: searchBudget
	// 		}
	// 	});
	// };
	var getResult = function(location, term, budget) {
		var searchLocation = location || 'sf';
		var searchTerm = term || '';
		var searchBudget = budget || '';
		return $http({
			method: 'GET',
			url: '/data:params',
			params: {
				location: searchLocation,
				term: searchTerm,
				budget: searchBudget				
			}
		}).then(function(res) {
			console.log('data from request: ', res.data);
			return res.data;
		});
	};
	return {
		// sendSearch: sendSearch,
		getResult: getResult
	};
})