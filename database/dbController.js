//get the data for SF and load it into the database

var CLmodel = require('./config.js');

var CL = require('./Craigslist.js');
var neighbourhoodCodes = require('./nhcodes.js')
var Promise = require('../APIs/node_modules/bluebird')
// CL.getLinkswithSigWord('sfbay','roo',0).then(function(data){
// 	var record = new CLmodel({cityandsearchkey:'sfbayroo',listings:JSON.stringify(data)})
// 	record.save();
// 	console.log('saved')
// })

//DOWNLOADS FIRST 1100 LISTINGS FROM GIVEN CITY
//NEED TO UPDATE SO IT GETS ALL LISTINGS BASED ON THE TOTALCOUNT PROPERTY IN CRAIGSLIST

function downloadAllfromCity(city){
	return new Promise(function(resolve,reject){

		var tasks = [];

		for(var i =0;i<1100; i+=100){
			tasks.push(CL.getLinkswithSigWord.bind(null,city,'roo',i));
		}
		console.log(tasks.length);

		// tasks[1]().then(function(data){
		// 	console.log(data);
		// })

		function Download(){
			var listings = [];
			var internal = function(j){
				console.log('Finished ',j)
				tasks[j]().then(function(data){
					listings = listings.concat(data);
					if(j<tasks.length-1){
						internal(j+1);
					}
					if(j === tasks.length-1){
						resolve(listings);
					}
				})
			}

			internal(0);
		}

		Download()
	})
}

module.exports.saveCityData = function(city){
	downloadAllfromCity(city).then(function(data){
		var record = new CLmodel({cityandsearchkey:city,listings:JSON.stringify(data)});
		record.save();
	})
}

function returnCityData(city){
	return new Promise(function(resolve,reject){
		CLmodel.find({cityandsearchkey:city},'listings',function(err,data){
			resolve(JSON.parse(data[0].listings));
		})
	});
}

// saveCityData('sfbay');

// returnCityData('sfbay').then(function(data){
// 	console.log(data[0]['nh']);
// })

function getnhCodefromUrl(url){
	var num = url.split('nh=')[1];
	num = num.split('max_price=')[0]
	return Number(num.replace("&",""));

}

var testurl = 'http://sfbay.craigslist.org/search/sfc/roo?nh=3&max_price=200'

function getcityfromUrl(url){
	return url.split('://')[1].split('.')[0].replace(" ","")
}



function getNeighborhoodsfromUrl(num){
	var results = [];
	for(var nh in neighbourhoodCodes){
		if(neighbourhoodCodes[nh] === num){
			results.push(nh);
		}
	}
	return results;
};

function getmaxPricefromUrl(url){
	return Number(url.split('max_price=')[1]);
};


//NEED TO MAKE NEIGHBORHOOD MATCHING BETTER
module.exports.getdatafromDBbyUrl = function(url){
	if(url.indexOf('max_price') === -1){
		url = url + "&max_price=1000000"
	}
	return new Promise(function(resolve,reject){
		var city = getcityfromUrl(url);
		var nh = getnhCodefromUrl(url);
		var maxprice = getmaxPricefromUrl(url);
		var nhs = getNeighborhoodsfromUrl(nh);

		returnCityData(city).then(function(data){
			data = filterByPriceandNeighborhood(data,nh,nhs,maxprice)
			resolve(data);
		})
	})

}

function filterByPriceandNeighborhood(data,nh,nhs,maxprice){
	return data.filter(function(obj){
		if(obj['nh'] === null){obj['nh'] = "null"}
		var neighborhood = obj.nh.replace('(',"").replace(')',"").slice(1);
		if(obj.price === null){obj.price = "$0"}
		var price = Number(obj.price.replace("$",""))
		return (nhs.indexOf(neighborhood)!== -1 && price<=maxprice)
	})
}

// module.exports.getdatafromDBbyUrl('http://sfbay.craigslist.org/search/sfc/roo?nh=18').then(function(data){
// 	console.log(data);
// })