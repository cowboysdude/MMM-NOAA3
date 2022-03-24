/* Magic Mirror
 * Module: MMM-NOAA3
 * By cowboysdude 
 */
var request = require('request');
const moment = require('moment');
const fs = require('fs');
var lat, lon, zip, city, current;
var forecast = [];
var provider = {  
    config: {
         
        
    },
	
	  imageArray: {
            "1": "sunny",
            "2": "mostlysunny",
            "3": "mostlysunny",
            "4": "mostlycloudy",
            "5": "hazy",
            "6": "mostlycloudy",
            "7": "cloudy",
            "8": "overcast",
			"11": "fog",
            "12": "rain",
            "13": "chancerain",
            "14": "chancerain",
            "15": "tstorms",
            "16": "tstorms",
            "17": "tstorms",
            "18": "rain",
            "19": "flurries",
            "20": "chanceflurries",
			"21": "chanceflurries",
            "22": "snow",
            "23": "chancesnow",
            "24": "sleet",
            "25": "sleet",
            "26": "sleet",
            "29": "chancesleet",
            "30": "clear",
			"31": "clear",
            "32": "wind",
            "33": "clear",
            "34": "mostlyclear",
            "35": "partlycloudy",
            "36": "partlycloudy",
            "37": "hazy",
            "38": "chancerain",
            "39": "chancerain",
            "40": "chancerain",
			"41": "chancetstorms",
            "42": "chancetstorms",
            "43": "chanceflurries",
            "44": "chancesnow"
        }, 
		
		langarray:{
			"en":"en-us",
			"de":"de-de",
			"it":"it-it",
            "da":"da-dk",
            "es":"es-es",
            "sv":"sv-se",
            "nl":"nl-be",
            "zh_cn":"zh-cn",
            "fr":"fr-fr "	
		},
		
		
		 addModuleConfiguration: function(moduleConfig) {
               if(!moduleConfig.apiKey) {
                   throw new Error('Invalid config, No key for Apixu Provider');
         } 
           this.config.apiKey = moduleConfig.apiKey;
 		   this.config.airKey = moduleConfig.airKey;
		   this.config.userlat = moduleConfig.userlat;
		   this.config.userlon = moduleConfig.userlon;
           this.config.zip = moduleConfig.zip;
		   this.getFore();
        },
		
		
	 getFore: function() {
        var self = this;
        request({
            url: "http://dataservice.accuweather.com/forecasts/v1/daily/5day/"+this.config.zip+"?apikey="+this.config.apiKey+"&language="+this.langarray[config.language]+"&details=true&metric=false",
            method: 'GET'
        }, (error, response, body) => { 
            self.parseForecast(body);
        });
    },	
	

    getData: function(callback) {
        var self = this;
		url =  "http://dataservice.accuweather.com/currentconditions/v1/"+this.config.zip+"?apikey="+this.config.apiKey+"&language="+this.langarray[config.language]+"&details=true";
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
        url = "http://api.airvisual.com/v2/nearest_city?lat=" + this.config.userlat + "&lon=" + this.config.userlon + "&rad=100&key="+this.config.airKey;
        //+this.config.airKey;
        request(url, function(error, response, body) {
            if (error) {
                console.log("Error: " + err.message);
                callback(null);
            }
            callback(self.parseAIR(body));
        });
    },

    getALERT: function(callback) {
        var self = this;
        url = "https://api.weather.gov/alerts?point="+this.config.userlat+","+this.config.userlon
        request(url, function(error, response, body) {
            if (error) {
                console.log("Error: " + err.message);
                callback(null);
            }
            callback(self.parseALERT(body));
        });
    },

	
	parseForecast: function(response) {
		var self = this;
        var results = JSON.parse(response); 
	
         for (var i = 1; i < results.DailyForecasts.length; i++) {
             forecast[i] = results.DailyForecasts[i];
		   
		   var now = moment(forecast[i].Date).format('ddd');
             var newDay = {
                 date: {
                     weekday_short: now
                 }
             };
		 
              forecast[i] = Object.assign(forecast[i], newDay);
			  
		  
			  
			  var highF = Math.round(forecast[i].Temperature.Maximum.Value);
             var lowF = Math.round(forecast[i].Temperature.Minimum.Value);
		
			function toCelsius(f) {
                 return (5 / 9) * (f - 32);
             }
             var highC = Math.round(toCelsius(forecast[i].Temperature.Maximum.Value));
             var lowC = Math.round(toCelsius(forecast[i].Temperature.Minimum.Value));
             var high = {
                 high: {
                     fahrenheit: highF,
                     celsius: highC
                 }
             };
             var low = {
                 low: {
                     fahrenheit: lowF,
                     celsius: lowC
				 }
                 };
			  forecast[i] = Object.assign(forecast[i], high);
             forecast[i] = Object.assign(forecast[i], low); 
			 
			 var desc = forecast[i].Day.ShortPhrase;
			 var description = { 
			                    desc: {
									   desc
									   }
									   };
			 forecast[i] = Object.assign(forecast[i], description);
			 
			 
			 var output = forecast[i].Day.Icon;
			 let icony = { icon:this.imageArray[output]};
			 forecast[i] = Object.assign(forecast[i], icony);
			
			 forecast.push(forecast[i]);
		 };
		  	 
		  forecast = forecast.slice(1,5); 
		 return forecast;
    },

    parseResponse: function(response) {
        var result = JSON.parse(response);
        var current = {current:{
        	weather: result[0].WeatherText,
            temp_c: Math.round(result[0].Temperature.Metric.Value),
            temp_f: Math.round(result[0].Temperature.Imperial.Value),
            icon: this.imageArray[result[0].WeatherIcon],
            relative_humidity: result[0].RelativeHumidity,
            pressure_in: Math.round(result[0].Pressure.Imperial.Value),
            pressure_mb: result[0].Pressure.Metric.Value,
            UV: result[0].UVIndex,
            wind_mph: result[0].Wind.Speed.Imperial.Value,
            wind_kph: result[0].Wind.Speed.Metric.Value,
           visibility_mi: result[0].Visibility.Imperial.Value,
           visibility_km: result[0].Visibility.Metric.Value,
		   forecast:{
    "0": {fcttext:result[0].WeatherText},
    "1": {fcttext:result[0].WeatherText}
               }  
		}
		};
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