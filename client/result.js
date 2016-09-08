angular.module('housing.result', [])
.controller('ResultController', function($scope, Service, GoogleMap) {

	$scope.craigslist = data.listings;
	var resultInit = function() {
		GoogleMap.googleMapsInitialize($scope.craigslist, Object.keys($scope.craigslist)[0]);
	};
	resultInit();
	$scope.selectNeighborhood = function(neighborhood) {
		GoogleMap.googleMapsInitialize($scope.craigslist, neighborhood);
	};
	// var pageInit = function() {
	// 	console.log('data here: ', data);
	// };
	// pageInit();
})


