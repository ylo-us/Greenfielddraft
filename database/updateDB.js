var db = require('./dbController');

//get all listings for major cities

function update(){
	console.log('Initializing data...server will be ready when the count is done')
	db.clearCityData('sfbay')
	db.saveCityData('sfbay');
}


update();

setInterval(update,1000*60*60);