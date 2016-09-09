var Yelp = require('./yelp-results.js')
var CL = require('./searchcraigslist');
var Promise = require('../node_modules/bluebird');

var sortListings = function(data) {
	var finalData = {};
	finalData.neighbourhoods = data.neighbourhoods;
	finalData.listings = {};

	for(var neighbourhood in data.listings) {
	  finalData.listings[neighbourhood] = [];
	  var i=0;
	  var counter=0

	  while(counter < 5 && i < data.listings[neighbourhood].length) {
	        if (data.listings[neighbourhood][i].lat !== undefined) {
	      finalData.listings[neighbourhood].push(data.listings[neighbourhood][i]);
	      counter+=1
	      }
	    i+=1;
	  }
	}
 // console.log('xxxxx', finalData);
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
  //console.log(JSON.stringify(data))
//  });
