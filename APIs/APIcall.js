var Yelp = require('./yelp-results.js')
var CL = require('./searchcraigslist');
var Promise = require('bluebird');

//currently only works
module.exports.getNeighborhoodsandListings = function(city,terms){
  return new Promise(function(resolve,reject){
    Yelp.getRecommendedNeighborhoods(city,terms).then(function(data){
      data = data.map(function(obj){return obj.neighborhood});
      CL.returnCraigsListlistingsByNeighborhood(data).then(function(data){
        resolve(data);
      })
    })
  })
}

// module.exports.getNeighborhoodsandListings("San Francisco",['gluten-free']).then(function(data){console.log(JSON.stringify(data))});
