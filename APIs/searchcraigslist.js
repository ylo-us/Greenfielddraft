var request = require('../node_modules/request');
var cheerio = require('../node_modules/cheerio');
var _ = require("../node_modules/underscore");
var Promise = require('../node_modules/bluebird');
var db = require('../database/dbController.js')

//promisifies  http request method to make code clearer
var request = Promise.promisify(request)

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

//cl neighborhood codes for SF
var neighborhoodCodes = {
  'soma': 1,
  'south beach': 1,
  'USF': 2,
  'panhandle': 2,
  'bernal heights': 3,
  'castro': 4,
  'upper market': 4,
  'cole valley': 5,
  'ashbury heights': 5,
  'downtown': 6,
  'civic': 6,
  'van ness': 6,
  'exelsior': 7,
  'outer mission': 7,
  'financial district': 8,
  'glen park': 9,
  'lower haight': 10,
  'haight-ashbury': 11,
  'haight ashbury': 11,
  'hayes valley': 12,
  'ingleside': 13,
  'sfsu': 13,
  'ccsf': 13,
  'inner richmond': 14,
  'inner sunset': 15,
  'ucsf': 15,
  'laurel heights': 16,
  'presidio': 16,
  'marina': 17,
  'cow hollow': 17,
  'marina/cow hollow':17,
  'marina / cow hollow':17,
  'mission': 18,
  'mission district': 18,
  'nob hill': 19,
  'lower nob hill': 20,
  'noe valley': 21,
  'north beach': 22,
  'telegraph hill': 22,
  'pacific heights': 23,
  'lower pac heights': 24,
  'potrero hill': 25,
  'richmond': 26,
  'seacliff': 26,
  'russian hill': 27,
  'sunset': 28,
  'parkside': 28,
  'twin peaks': 29,
  'diamond heights': 29,
  'western addition': 30,
  'bayview': 110,
  'west portal': 114,
  'forest hill': 114,
  'visitacion valley': 118,
  'alamo square': 149,
  'nopa': 149,
  'tenderloin': 156,
  'treasure island': 157,
  'portola district': 164,
};

//helper function that scrapes CL for listings
module.exports.getLinks = function(url){
  console.log('URLinside is',url);
	return new Promise(function(resolve, reject){
    db.getdatafromDBbyUrl(url).then(function(data){
     console.log('data length is',data.length);
      if(data.length > 1){
        resolve(new Promise(function(resolve,reject){resolve(data)}))
      } else {
        console.log('COULDNT FIND IN DB, LOADING FROM API')
  	//constructs search url based on city, apartment type
  		var listinglinks = []; //array to hold links to listings returned from search
  		var requestbodies = [];	//array to hold request bodies
  		var results = [];	///array to hold final results (listings plus request bodies)

  		request(url).then(function(req){
  			var $ = cheerio.load(req.body); //cheerio is a library that parses an html string to return a manipulable DOM
  			$('.hdrlnk').each(function(index,link) {
  		 		listinglinks.push('http://sfbay.craigslist.org' + link.attribs.href)
  		  })
  		})

  		.then(function(){
  			  listinglinks.forEach(function(link, index){
  			  	requestbodies[index] = request(link)
  			  })

  			Promise.all(requestbodies).then(function(){
  				requestbodies.forEach(function(promise,index){
  					promise.then(function(req){
  						$ = cheerio.load(req.body);
              var postbodytext = $('#postingbody').html();
  						//var postbodytext = decodeURIComponent($('#postingbody').html());
  						var posttitle = $('#titletextonly').html();
  						var postprice = $('.price').html()
  						var map = $('#map')
  						var postlatitude = map.attr('data-latitude');
  						var postlongitude = map.attr('data-longitude');
  						results[index] = {link:listinglinks[index],title:posttitle,price:postprice,lat:postlatitude,lon:postlongitude,text: postbodytext}
  					})
  				})

  				return Promise.all(results).then(function(){
  					getSignificantWords(results);
  					resolve(results);
  				})
  			})

  		})
  	}
      })
    })
}


//builds query that queries CL for all listings appearing in neighborhoods in array "neighborhoods"
var composeQuery = function(neighborhoods, maxprice) {
  var neighborhoodUrls = [];
  console.log(neighborhoods);
  neighborhoods.map(function(neighborhood, index) {
    neighbourhood = neighborhood.toLowerCase();
    var neighborhoodCode = neighborhoodCodes[neighbourhood];
    var queryString = [];
    var url = 'http://sfbay.craigslist.org/search/sfc/roo';
    queryString.push('nh=' + neighborhoodCode);
    if (maxprice) {
      queryString.push('max_price=' + maxprice);
    }
    neighborhoodUrls.push(url + '?' + queryString.join('&'));
  })
  console.log(neighborhoodUrls);
  return neighborhoodUrls;
};


//uses query to return an object with listings in each neighborhood
module.exports.returnCraigsListlistingsByNeighborhood = function(neighborhoods, maxprice) {
  var neighborhoodArr = neighborhoods.map(function(item) {
    return item.neighborhood;
  });
	console.log(neighborhoods)
  return new Promise(function(resolve, reject) {
    var results = {};
    results.neighborhoods = neighborhoods;
    neighborhoodUrls = composeQuery(neighborhoodArr, maxprice);
    results.listings = {};
    neighborhoodUrls.map(function(url, index) {
      var neighborhood = neighborhoodArr[index];
      console.log('neighborhood is',neighborhood)
      module.exports.getLinks(url) //getLinks is a helper function in this file that scrapes Craigslist
      .then(function(data) {
       // console.log('URL is',url)
        //console.log('DATA is',data);
        results.listings[neighborhood] = data;
        //console.log(results);
        console.log(Object.keys(results.listings));
        if (Object.keys(results.listings).length === neighborhoodUrls.length) {
          resolve(results);
        }
      });
    });
  });
};







// returnCraigsListListingsByNeighborhood(['tenderloin', 'mission', 'nob hill']).then(function(res) {
//   console.log(res.listings.tenderloin)
// });

var getSignificantWords = function(results){
	console.log('GOT SIGNIFICANT WORDS!');
	results.forEach(function(obj){
		if(!obj.text){
			obj.text = "";
		}
		var newtext = obj.text.replace(/\n/g,' ').replaceAll("&amp;"," ").replaceAll('<br>'," ").replaceAll('&apos;',"'").replaceAll('.',"").replaceAll(',',"").replaceAll(')',"").replaceAll('(',"").toLowerCase()
		obj.text = newtext;
		obj.wordcount = countWords(obj.text)
	})
	//console.log(res);

	var commonwords = {};
	results.forEach(function(obj){
		var wordcount = obj.wordcount;
		for(var word in wordcount){
			if(word in commonwords){
				commonwords[word] = commonwords[word] + wordcount[word];
			} else {
				commonwords[word] = wordcount[word];
			}
		}
	})

	results.forEach(function(obj){
		var wordcount = obj.wordcount;
		for(var word in wordcount){
			obj['wordcount'][word] = wordcount[word]/commonwords[word];
		}

	})

	results.forEach(function(obj){
		var common = [];
		for(var word in obj.wordcount){
			common.push([word,obj.wordcount[word]]);
		}
		common.sort(function(a,b){
			if(a[1]>b[1]){
				return 1;
			} 
			if(a[1]<b[1]){
				return -1
			}
			return 0;
		})
		obj['common'] = common;
		obj['sig'] = obj['common'].slice(-15);
	})
}


//Helper functions for finding significant words in each listing
function countWords(string){
	var count = {};
	var arr = string.split(' ');
	arr.forEach(function(word){
		if (word in count){
			count[word] = count[word] + 1;
		} else {
			count[word] = 1;
		}
	})
	return count;
}

function objFilter(obj,cb){
	var results = {};
	for (var key in obj){
		if (cb(obj[key],key)){
			results[key] = obj[key]
		}
	}
	return results;

}

function getAllSignificantWordsinListings(res){
  var listings = res.listings;
  var sigs = {};
  for(var neighbourhood in listings){
    listings[neighbourhood].forEach(function(listing){
      listing.sig.forEach(function(sig){
        if (sig[0] in sigs){
          sigs[sig[0]] = sigs[sig[0]] + 1;
        } else {
          sigs[sig[0]] = 1;
        }
      })
    })
  }
  return sigs;
}
