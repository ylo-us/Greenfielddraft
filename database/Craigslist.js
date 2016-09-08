var Cl = require('../APIs/searchcraigslist.js');
var request = require('../node_modules/request');
var cheerio = require('../node_modules/cheerio');
var _ = require("../node_modules/underscore");
var Promise = require('../node_modules/bluebird');

//promisifies  http request method to make code clearer
var request = Promise.promisify(request)

//promisifies  http request method to make code clearer
var request = Promise.promisify(request)



module.exports.getLinkswithSigWord = function(city,apartmenttypekey,num){
	return new Promise(function(resolve,reject){
		//constructs search url based on city, apartment type
			var url = 'http://' + city + '.craigslist.org/search/' + apartmenttypekey + '?s=' + num;
			//console.log(cheerio);

			var listinglinks = []; //array to hold links to listings returned from search
			var requestbodies = [];	//array to hold request bodies
			var results = [];	///array to hold final results (listings plus request bodies)

			request(url).then(function(req){

				var $ = cheerio.load(req.body); //cheerio is a library that parses an html string to return a manipulable DOM
				//console.log($.html())
				$('.hdrlnk').each(function(index,link){
			 		listinglinks.push('http://'+city + '.craigslist.org/' + link.attribs.href)
			  	})	
			})
			.then(function(){

				  listinglinks.forEach(function(link,index){
				  	requestbodies[index] = request(link)
				  })

				Promise.all(requestbodies).then(function(){
					requestbodies.forEach(function(promise,index){
						promise.then(function(req){
							$ = cheerio.load(req.body);
							//console.log($.html())
							var postbodytext = $('#postingbody').html();
							var posttitle = $('#titletextonly').html();
							var postprice = $('.price').html()
							var map = $('#map')
							var postlatitude = map.attr('data-latitude');
							var postlongitude =map.attr('data-longitude');
							var postneighborhood = $('small').html()
							results[index] = {link:listinglinks[index],title:posttitle,price:postprice,lat:postlatitude,lon:postlongitude,text: postbodytext,nh:postneighborhood}
						})
					})

					return Promise.all(results).then(function(){
						results.forEach(function(obj){
							var newtext = obj.text.replace(/\n/g,' ').replaceAll("&amp;"," ").replaceAll('<br>'," ").replaceAll('&apos;',"'").replaceAll('.',"").replaceAll(',',"")
							obj.text = newtext;
							obj.wordcount = countWords(obj.text)
						})

						var commonwords = {};
						results.forEach(function(obj){
							var wordcount = obj.wordcount;
							for(var word in wordcount){
								if(word in commonwords){
									commonwords[word] = commonwords[word] + wordcount[word];
								} else {
									commonwords[word] = wordcount[word];
								}
							}
						})



						results.forEach(function(obj){
							var wordcount = obj.wordcount;
							for(var word in wordcount){
								obj['wordcount'][word] = wordcount[word]/commonwords[word];
							}

						})

						results.forEach(function(obj){
							var common = [];
							for(var word in obj.wordcount){
								common.push([word,obj.wordcount[word]]);
							}
							common.sort(function(a,b){
								if(a[1]>b[1]){
									return 1;
								} 
								if(a[1]<b[1]){
									return -1
								}
								return 0;
							})
							obj['common'] = common;
							obj['sig'] = obj['common'].slice(obj['common'].length-20).map(function(obj){return obj[0]})
						})

						console.log('ONE COMPLETE');

						resolve(results);


					})

					
				})

			})
	})
}


function countWords(string){
	var arr = string.split(' ');
	var results = {};
	arr.forEach(function(word){
		if(word in results){
			results[word] = results[word] + 1;
		} else {
			results[word] = 1;
		}
	})

	return results;
}

function removeduplicates(arr){
	var nodupes = [];
	arr.forEach(function(elem){
		if (nodupes.indexOf(elem) === -1){
			nodupes.push(elem);
		}
	})
	return nodupes;
}