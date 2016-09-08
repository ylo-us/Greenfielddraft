var db = require('./dbController');

//get all listings for major cities

db.clearCityData('sfbay')

db.saveCityData('sfbay');