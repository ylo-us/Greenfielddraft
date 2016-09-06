var express = require('express')
var app = express()
var bp = require('body-parser')

app.use(express.static('client'))
app.use(bp.urlencoded({extended:true}));
app.use(bp.json())



var APIs = require(__dirname + '/APIs/API.js')

app.get('/',function(req,res){
	res.sendFile('index.html',{"root": __dirname});
})

app.get('/data',function(req,res){
	var city = req.body.city; //City name as string
	var interests = req.body.interests; //Interests as array of strings

	APIs.call(city,interests,function(data){
		res.end(JSON.stringify(data));
	})
})

app.listen('3000');