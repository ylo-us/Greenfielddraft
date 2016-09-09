var Yelp = require('./yelp-results.js')
var CL = require('./searchcraigslist');
var Promise = require('../node_modules/bluebird');
var fs = require('fs');

var sortListings = function(data) {
	var finalData = {};
  finalData.neighborhoods = data.neighborhoods;
	finalData.listings = {};

	for(var neighborhood in data.listings) {
	  finalData.listings[neighborhood] = [];
	  var i=0;
	  var counter=0

	  while(counter < 5 && i < data.listings[neighborhood].length) {
	        if (data.listings[neighborhood][i].lat !== undefined) {
	      finalData.listings[neighborhood].push(data.listings[neighborhood][i]);
	      counter+=1
	      }
	    i+=1;
	  }
	}
	return finalData;
};

//currently only works
module.exports.getNeighborhoodsandListings = function(city,terms){
  return new Promise(function(resolve,reject){
    Yelp.getRecommendedNeighborhoods(city,terms).then(function(data){
      //data = data.map(function(obj){return obj.neighborhood});
      CL.returnCraigsListlistingsByNeighborhood(data).then(function(data){
        resolve(sortListings(data));
      })
    })
  })
}

//module.exports.getNeighborhoodsandListings("San Francisco",['gluten-free']).then(function(data){
//  return data;
//  console.log('xxxxxxx', data);
//});
