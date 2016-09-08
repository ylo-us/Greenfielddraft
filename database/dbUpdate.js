//get the data for SF and load it into the database

var CLmodel = require('./config.js');

var CL = require('./Craigslist.js');

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

function saveCityData(city){
	downloadAllfromCity(city).then(function(data){
		var record = new CLmodel({cityandsearchkey:city,listings:JSON.stringify(data)});
		record.save();
	})
}

saveCityData('sfbay');

