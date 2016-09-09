angular.module('housing.result', [])
.controller('ResultController', function($scope, Service, GoogleMap, $location) {
	// experiment with the function of connecting listing to neighborhood
	// var mock = [ { neighborhood: 'SoMa',
 //   value: 4,
 //   blurb: 'SoMa is a good match for you. It has a highly rated result for boba and a highly rated result for gym.',
 //   img: 'https://s3-media4.fl.yelpcdn.com/bphoto/QKY1aq9KUw5WzBambvxwlg/o.jpg',
 //   },
 // { neighborhood: 'Mission',
 //   value: 4,
 //   blurb: 'Mission is a good match for you. It has a highly rated result for boba and a highly rated result for indian%20food and a highly rated result for gym.', 
 //   img: 'https://s3-media3.fl.yelpcdn.com/bphoto/PuiC1WJFsI_Sq2pfNOUxvg/o.jpg',
 // },
 // { neighborhood: 'Tenderloin',
 //   value: 2,
 //   blurb: 'Hayes Valley is a good match for you. It has a highly rated result for boba and a highly rated result for gym.',
 //   img: 'https://s3-media2.fl.yelpcdn.com/bphoto/y9M92f_aKHsv8WzFt-m-3A/o.jpg',
 // } ];

	if (window.data.listings !== undefined && window.data.neighborhoods.length > 0) {
		// window.data.neighborhoods = mock;
		$scope.craigslist = [];
		for (var i = 0; i < window.data.neighborhoods.length; i++) {
			var temp = window.data.neighborhoods[i];
			// console.log(temp);
			temp['listings'] = window.data.listings[temp.neighborhood];
			$scope.craigslist.push(temp);
		}
		var resultInit = function() {
			GoogleMap.googleMapsInitialize(window.data.listings, $scope.craigslist[0].neighborhood);
		};
		resultInit();
		$scope.selectNeighborhood = function(neighborhood) {
			GoogleMap.googleMapsInitialize(window.data.listings, neighborhood);
		};
	} else if (window.data.neighborhoods.length === 0) {
		alert('Sorry... no result was found. Let\'s search again!');
		$location.path('/search');
	} else {
		alert('oops... Something went wrong. Let\'s search again!');
		$location.path('/search');
	}
	
})


