var apiKey = require('./api-key.js');
var request = require('request');
var Promise = require('bluebird');

module.exports.getRecommendedNeighborhoods = function(city, terms) {
  console.log('called');
  return new Promise(function(resolve, reject) {
    searchYelp(city, terms)
      .then(function(results) {
        return new Promise(function(resolve, reject) {
          getNeighborhoods(results, city)
            .then(function(top3) {
              resolve(top3);
              return top3;
            })
        }).then(function(data) {
          resolve(data);
        })
      })
  });
};


var searchYelp = function(location, terms) {
  var results = {};
  results.categories = [];

  return new Promise(function(resolve, reject) {
    for (var i = 0; i < terms.length; i++) {
      var request_data = {
        method: 'GET',
        url: 'https://api.yelp.com/v2/search?'
      }
      request({
        url: request_data.url,
        method: request_data.method,
        oauth: {
          consumer_key: apiKey.Consumer_Key,
          consumer_secret: apiKey.Consumer_Secret,
          token: apiKey.Token,
          token_secret: apiKey.Token_Secret,
          signature_method: 'HMAC-SHA1',
        },
        qs: {
          location: location,
          term: terms[i],
          limit: 5,
          sort: 2,
        }
      }, function(err, response, body) {
        var term = response.socket._httpMessage.path.split('&')[1].split('=')[1];
        if (err) {
          return console.log('Error: ', err);
        }
        var data = [];
        var categories = {};
        resData = JSON.parse(body);
        for (var x = 0; x < resData.businesses.length; x++) {
          for (var j = 0; j < resData.businesses[x].categories.length; j++) {
            if (!categories[resData.businesses[x].categories[j][1]]) {
              categories[resData.businesses[x].categories[j][1]] = 1;
            } else {
              categories[resData.businesses[x].categories[j][1]]++;
            }
          }
          data.push({
            type: term,
            name: resData.businesses[x].name,
            rating: resData.businesses[x].rating,
            reviewCount: resData.businesses[x].review_count,
            url: resData.businesses[x].url,
            phone: resData.businesses[x].display_phone,
            address: resData.businesses[x].location.display_address,
            neighborhoods: resData.businesses[x].location.neighborhoods
          });
        }
        var catArray = [];
        for (item in categories) {
          catArray.push({category: item, value: categories[item]});
        }
        catArray.sort(function(a, b) {
          b.value - a.value;
        });
        if (results.categories.length === terms.length - 1) {
          if (results.categories.length === 0) {
            results.allData = data;
            results.categories.push(catArray[0].category);
          } else {
            results.allData = results.allData.concat(data);
            results.categories.push(catArray[0].category);
          }
          resolve(results);
        }
        if (results.categories.length === 0) {
          results.allData = data;
          results.categories.push(catArray[0].category);
        } else {
          results.allData = results.allData.concat(data);
          results.categories.push(catArray[0].category);
        }
      });
    };
  });
};

var getNeighborhoodPhoto = function(neighborhood, city) {
  return new Promise(function(resolve, reject) {
    var img;
    var request_data = {
      method: 'GET',
      url: 'https://api.yelp.com/v2/search?'
    }
    try {
      request({
        url: request_data.url,
        method: request_data.method,
        oauth: {
          consumer_key: apiKey.Consumer_Key,
          consumer_secret: apiKey.Consumer_Secret,
          token: apiKey.Token,
          token_secret: apiKey.Token_Secret,
          signature_method: 'HMAC-SHA1',
        },
        qs: {
          term: neighborhood,
          location: city,
          category_filter: 'localflavor',
        }
      }, function(err, response, body) {
        if (err) reject(err);
        resData = JSON.parse(body);
        var result = resData.businesses[0];
        img = result.image_url;
        resolve(img);

      });
    } catch(e) {
      console.log(e);
    }
  });
};

var getNeighborhoods = function(results, city) {
  return new Promise(function(resolve, reject) {
    var neighborhoodCount = {};
    results.allData.map(function(item, index) {
      for (var i = 0; i < item.neighborhoods.length; i++) {
        if (!neighborhoodCount[item.neighborhoods[i]]) {
          neighborhoodCount[item.neighborhoods[i]] = {};
          var n = neighborhoodCount[item.neighborhoods[i]];
          n.count = 1;
          n.types = {};
          n.typeArr = [];
          n.typeArr.push(item.type);
          n.types[item.type] = 1;
        } else {
          neighborhoodCount[item.neighborhoods[i]].count++;
          if (!neighborhoodCount[item.neighborhoods[i]].types[item.type]) {
            neighborhoodCount[item.neighborhoods[i]].types[item.type] = 1;
            neighborhoodCount[item.neighborhoods[i]].typeArr.push(item.type);
          } else {
            neighborhoodCount[item.neighborhoods[i]].types[item.type]++;
          }
        }
      }
    });
    var neighborhoods = [];
    for (neighborhood in neighborhoodCount) {
      neighborhoods.push({neighborhood: neighborhood, value: neighborhoodCount[neighborhood].count});
    }
    sortedNeighborhoods = neighborhoods.sort(function(a, b) { return b.value - a.value; });
    var top3 = sortedNeighborhoods.slice(0, 3);
    var promises = top3.map(function(item, index) {
      var str = 'The ' + item.neighborhood + ' neighborhood' + ' is a good match for you. It has highly rated results for ';
      var n = neighborhoodCount[item.neighborhood];
      for (var i = 0; i < n.typeArr.length; i++) {
        var typeCount = n.types[n.typeArr[i]];
        var type = n.typeArr[i];
        if (i > 0) {
          if (i < n.typeArr.length - 1) {
            str += ',';
          } else {
            str += ' and ';
          }
        }
        if (typeCount > 1) {
          str += type + ' (' + typeCount + ' results)';
        } else if (typeCount === 1) {
          str += type + ' (' + typeCount + ' result)';
        }
      }
      str += '.';
      top3[index].blurb = str;
      return getNeighborhoodPhoto(item.neighborhood, city);
    });

    Promise.all(promises)
    .then(function(arr) {
      arr.forEach(function(item, index) {
        top3[index].img = item;
      });
      resolve(top3);
    })
    .catch(function(err) {
      reject(err);
    });
  });
};
