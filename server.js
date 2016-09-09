var express = require('express')
var app = express()
var bp = require('body-parser')
var dbUpdate = require('./database/updateDB.js')

app.use(express.static('client'))
app.use(bp.urlencoded({extended:true}));
app.use(bp.json())



var APIs = require(__dirname + '/APIs/APIcall.js')

app.get('/',function(req,res){
	res.sendFile('/client/index.html');
})

app.get('/data:params',function(req,res){
	// console.log('req.query: ', req.query);
	var city = req.query.location; //City name as string
	var interests = req.query.term; //Interests as array of strings
	interests = interests.split(',')
	if(city!=="San Francisco"){
		res.end("We currently only support San Francisco");
	} else {
		console.log('INTERESTS',interests.length);
		APIs.getNeighborhoodsandListings(city,interests).then(function(data){
				console.log('data from server: ', data);
			res.end(JSON.stringify(data))});
	}
})

//APIs.getNeighborhoodsandListings("San Francisco",['gluten-free']).then(function(data){console.log(JSON.stringify(data))});


app.listen('3000');
console.log('Listening on 30000')