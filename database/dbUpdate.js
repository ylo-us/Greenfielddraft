//get the data for SF and load it into the database

var CLmodel = require('./config.js');

var CL = require('./Craigslist.js');

CL.getLinkswithSigWord('sfbay','roo',0).then(function(data){
	var record = new CLmodel({cityandsearchkey:'sfbayroo',listings:JSON.stringify(data)})
	record.save();
	console.log('saved')
})

