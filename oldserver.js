var express = require('express')
var app = express()
var bp = require('body-parser')

app.use(express.static('client'))
app.use(bp.urlencoded({extended:true}));
app.use(bp.json())



var APIs = require(__dirname + '/APIs/APIcall.js')

app.get('/',function(req,res){
	res.sendFile('index.html',{"root": __dirname});
})

app.get('/data',function(req,res){
	var city = 'San Francisco'; //City name as string
	var interests = req.body.interests; //Interests as array of strings
	if(city!=="San Francisco"){
		res.end("We currently only support San Francisco");
	} else {
		APIs.getNeighborhoodsandListings("San Francisco",['mexican']).then(function(data){res.end(JSON.stringify(data))});
	}
})

//APIs.getNeighborhoodsandListings("San Francisco",['gluten-free']).then(function(data){console.log(JSON.stringify(data))});


app.listen('3000');
console.log('Listening on 30000')