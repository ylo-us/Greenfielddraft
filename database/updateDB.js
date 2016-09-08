var db = require('./dbController');

//get all listings for major cities

function update(){
	db.clearCityData('sfbay')
	db.saveCityData('sfbay');
}


update();

setInterval(update,1000*60*60);