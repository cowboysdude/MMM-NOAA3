/* Magic Mirror
 * Module: MMM-NOAA3
 * By cowboysdude 
 */
var request = require('request');
const moment = require('moment');
const fs = require('fs');
const parser = require('xml2js').parseString;
var lat, lon, zip, UV; 
var current;
     
 var provider = {
        config: {
			
        },
    imageArray: {
            "3":	"tstorms",
			"4":	"tstorms",
			"5":	"chancesleet",
			"6":	"chancesleet",
			"7":	"chancesleet",
			"8":	"sleet",
			"9":	"drizzle",
			"10":	"sleet",
			"11":	"rain",
			"12":	"rain",
			"13":	"flurries",
			"14":	"snow",
			"15":	"snow",
			"16":	"snow",
			"17":	"NA",
			"18":	"sleet",
			"19":	"hazy",
			"20":	"fog",
			"21":	"hazy",
			"22":	"hazy",
			"23":	"wind",
			"24":	"wind",
			"25":	"NA",
			"26":	"cloudy",
			"27":	"partlycloudy",
			"28":	"partlycloudy",
			"29":	"partlycloudy",
			"30":	"partlycloudy",
			"31":	"clear",
			"32":	"clear",
			"33":	"clear",
			"34":	"clear",
			"35":	"chancesleet",
			"36":	"clear",
			"37":	"tstorms",
			"38":	"tstorms",
			"39":	"tstorms",
			"40":	"rain",
			"41":	"snow",
			"42":	"snow",
			"43":	"snow",
			"44":	"partlycloudy",
			"45":	"tstorms",
			"46":	"snow",
			"47":	"tstorms"
        }, 
	
           addModuleConfiguration: function(moduleConfig) {
               if(!moduleConfig.airKey) {
                   throw new Error('Invalid config');
            }
           this.config.apiKey = moduleConfig.apiKey;
 		   this.config.airKey = moduleConfig.airKey;
		   this.config.userlat = moduleConfig.userlat;
		   this.config.userlon = moduleConfig.userlon;
		   this.config.lang = moduleConfig.language;  
        },
		
    getData: function(callback) { 
		convert = {
            "imperial": "F",
            "metric": "C"
        } 
        var self = this; 
		url = "http://weather.service.msn.com/find.aspx?src=outlook&weadegreetype="+convert[config.units]+"+&culture="+config.language+"&weasearchstr="+this.config.userlat+","+this.config.userlon;
       
		request(url, function(error, response, body) { 
			if (error) {
                console.log("Error: " + err.message);
                callback(null);
            }
            callback(self.parseResponse(body));
        });
    },

    getSRSS: function(callback) {
         var self = this; 
          url = "https://api.sunrise-sunset.org/json?lat="+this.config.userlat+"&lng="+this.config.userlon+"&formatted=0";
		
         request(url, function(error, response, body) {
             if (error) {
                 console.log("Error: " + err.message);
                 callback(null);
             }
             callback(self.parseSRSS(body));
         });
     },

    getAIR: function(callback) {
        var self = this;
        url = "http://api.airvisual.com/v2/nearest_city?lat=" + this.config.userlat + "&lon=" + this.config.userlon + "&rad=100&key="+this.config.airKey
        request(url, function(error, response, body) { 
            if (error) {
                console.log("Error: " + err.message);
                callback(null);
            }
            callback(self.parseAIR(body));
        });
    }, 
	
    parseResponse: function(response) {
	  
		  parser(response, (err, result)=> {
		var result = JSON.parse(JSON.stringify(result));
		var weather = result.weatherdata.weather;
			
		for (var w = 0; w < weather.length; w++) {
          var weather = weather[w]; 
		
		forecast =  weather.forecast;
		
		  var d = new Date();
        var weekday = new Array(7);
        weekday[0] = "Sun";
        weekday[1] = "Mon";
        weekday[2] = "Tue";
        weekday[3] = "Wed";
        weekday[4] = "Thu";
        weekday[5] = "Fri";
        weekday[6] = "Sat";

        var n = weekday[d.getDay() -1]; 
	     
		 for (var i = 0; i < forecast.length; i++) {
             forecast[i] = forecast[i];
			 var yesterday = forecast[i].$.shortday;
       if (yesterday !== n){
		   
	 var newDay = {
                 date: {
                     weekday_short: forecast[i].$.shortday
                 }
             };
             forecast[i] = Object.assign(forecast[i], newDay);
		 
		 } 
             var highF = forecast[i].$.high;
             var lowF = forecast[i].$.low;
 
             function toCelsius(f) {
                 return (5 / 9) * (f - 32);
             }
             var highC = toCelsius(forecast[i].$.high);
             var lowC = toCelsius(forecast[i].$.low);
             var high = {
                 high: {
                     fahrenheit: highF,
                     celsius: Math.round(highC)
                 }
             };
             var low = {
                 low: {
                     fahrenheit: lowF,
                     celsius: Math.round(lowC)
                 }
             };
			 forecast[i] = Object.assign(forecast[i], high,low);
			 
			 var desc = forecast[i].$.skytextday;
			 var description = { 
			                    desc: {
									   desc
									   }
									   };
			 forecast[i] = Object.assign(forecast[i], description);
			
			 let icony = { icon:this.imageArray[forecast[i].$.skycodeday]};

			 forecast[i] = Object.assign(forecast[i], icony);
			 forecast[i] = Object.assign(forecast[i], high);
             forecast[i] = Object.assign(forecast[i], low); 
			forecastyy = forecast[i];
         	};   
			
			forecast.push(forecastyy);
            forecast = forecast.slice(1,5);
 		}	
	 
	currentweather = weather.current;
	var obj = currentweather.reduce(function(acc, cur, i) {
     acc[i] = cur;
     return acc;
     }, {}); 
	
	currently = obj[0].$; 
	
	   
	  
	myString = currently.windspeed.replace(/\D/g,'');
     current = {
			 current: {
			     weather: currently.skytext,
                 temp_f: currently.temperature,
				 temp_c: "NA",
                 icon: this.imageArray[currently.skycode],
                 relative_humidity: currently.humidity+"%",
                 pressure_in: "1",
                 pressure_mb: "1",				 
                 UV: "2",
                 visibility_mi: "1",
				 visibility_km: "1",
                 wind_mph: myString,
				 wind_kph: "1",
	             forecast:{
    "0": {fcttext:currently.skytext},
    "1": {fcttext:currently.skytext}
               }
			   },
        }; 
		 
  	});
	
	 current = {
             current,
             forecast
         };
         return current;
 		
    },

    parseAIR: function(response) {
        var air = JSON.parse(response);
        airdata = {
            air: air.data.current.pollution
        }
        return airdata;
    },

     parseSRSS: function(response) {
         var srss = JSON.parse(response);
         sun = {
             sunrise: srss.results.sunrise,
             sunset: srss.results.sunset,
             day: srss.results.day_length
         }
         return sun;
     },
};

if (typeof module !== "undefined") {
    module.exports = provider;
}