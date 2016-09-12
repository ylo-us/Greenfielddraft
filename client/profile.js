angular.module('housing.profile', [])

.controller('profileController', function ($scope, $window, $location, Service, Auth) {
  if (Auth.isAuth()) {
    var token = window.localStorage.getItem('com.shortly');
    var payload = JSON.parse(window.atob(token.split('.')[1])); 
  
    Service.getPrefs(payload.username).then(function(data) {
  	 $scope.preferences = data.preferences;
    });
  } else {
    alert('Please signup before trying to view a profile page');
    $location.path('/search');
  }

  $scope.search = function(index) {
  	var currPref = $scope.preferences[index];

  	Service.getResult(currPref.location, currPref.yelpPrefs, currPref.maxBudget).then(function(data) {
  		console.log('Data: ', data);
  		window.data = data;
  		$location.path('/result');
  	});
  };
    
});
