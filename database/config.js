var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/greenfield');

var Schema = mongoose.Schema;


var CraigslistSchema = new Schema({cityandsearchkey: 'string',listings: 'string'})

var Craigslist = mongoose.model('craigslist',CraigslistSchema);

var test = new Craigslist({cityandsearchkey:"test",listings:'test'})

test.save()

module.exports = Craigslist;