/* Magic Mirror
 * Module: MMM-NOAA3
 * By cowboysdude 
 */
var request = require('request');
const moment = require('moment');
const fs = require('fs');
var lat, lon, city, zip;
   
 var provider = {
        config: {
       
        },
         imageArray: {
            "113.png": "clear",
            "116.png": "partlycloudy",
            "119.png": "cloudy",
            "122.png": "cloudy",
			"143.png": "fog",
            "176.png": "rain",
            "179.png": "chancesnow",
            "182.png": "chancesleet",
			"185.png": "chancesleet",
            "200.png": "chancetstorms",
            "230.png": "snow",
            "122.png": "snow",
			"248.png": "fog",
            "260.png": "hazy",
            "263.png": "chancerain",
            "266.png": "chancerain",
			"281.png": "chancesleet",
            "284.png": "sleet",
            "293.png": "chancerain",
            "296.png": "rain",
			"299.png": "chancerain",
            "302.png": "rain",
            "305.png": "rain",
            "308.png": "rain",
			"311.png": "chancesleet",
            "314.png": "chancesleet",
            "317.png": "chancesleet",
            "320.png": "sleet",
			"323.png": "chancesnow",
            "326.png": "snow",
            "329.png": "snow",
            "332.png": "snow",
			"335.png": "snow",
            "338.png": "snow",
            "350.png": "sleet",
            "353.png": "chancerain",
			"356.png": "rain",
            "359.png": "rain",
            "362.png": "chancesleet",
            "365.png": "sleet",
			"368.png": "chancesnow",
            "371.png": "snow",
            "374.png": "chancesleet",
            "377.png": "sleet",
			"386.png": "chancetstorms",
            "389.png": "chancetstorms",
            "392.png": "chancesnow",
            "395.png": "snow"
        }, 
           
		
		  addModuleConfiguration: function(moduleConfig) {
               if(!moduleConfig.apiKey) {
                   throw new Error('Invalid config, No key for Apixu Provider');
         } 
           this.config.apiKey = moduleConfig.apiKey;
 		   this.config.airKey = moduleConfig.airKey;
		   this.config.userlat = moduleConfig.userlat;
		   this.config.userlon = moduleConfig.userlon;
 		   this.config.city = moduleConfig.city;
        }, 

    getData: function(callback) {
        var self = this;
          url = "http://api.apixu.com/v1/forecast.json?key="+this.config.apiKey+"&lang="+config.language+"&q="+this.config.city+"&days=5"
        request(url, function(error, response, body) {
            if (error) {
                console.log("Error: " + err.message);
                callback(null);
            }
            callback(self.parseResponse(body));
        });
    },

    

    getAIR: function(callback) {
        var self = this;
        url = "http://api.airvisual.com/v2/nearest_city?lat="+this.config.userlat+"&lon="+this.config.userlon+"&rad=100&key="+this.config.airKey
        //+this.config.airKey;
        request(url, function(error, response, body) {
            if (error) {
                console.log("Error: " + err.message);
                callback(null);
            }
            callback(self.parseAIR(body));
        });
    },
	
	   parseAIR: function(response) {
        var air = JSON.parse(response);
        airdata = {
            air: air.data.current.pollution
        }
        return airdata;
    },

    getALERT: function(callback) {
        var self = this;
        url = "http://api.wunderground.com/api/a4d00a39e75848da/alerts/q/pws:KPALANCA9.json"
        request(url, function(error, response, body) {
            if (error) {
                console.log("Error: " + err.message);
                callback(null);
            }
            callback(self.parseALERT(body));
        });
    },
	
	getSRSS: function(callback) {
         var self = this;
         url = "https://api.sunrise-sunset.org/json?lat="+this.config.userlat+"&lng="+this.config.userlon+"&formatted=0";
		 console.log(url);
         request(url, function(error, response, body) {
             if (error) {
                 console.log("Error: " + err.message);
                 callback(null);
             }
             callback(self.parseSRSS(body));
         });
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

    parseALERT: function(response) {
        var alert = JSON.parse(response);
        if (this.config.lang == "en" && alert != "undefined" || null) {
            alert = {
                alert: alert
            };
        } else {
            for (var i = 0; i < alert.length; i++) {
                var alerts = alert[i];
                if (alerts != undefined) {
                    if (this.config.lang != 'en') {
                        Promise.all([
                            translate(alerts.description, {
                                from: 'en',
                                to: this.config.lang
                            })
                        ]).then(function(results) {
                            var desc = results[0].text;
                            var level = 2;
                            var level = alerts.level_meteoalarm;
                            alert = {
                                desc,
                                level
                            };
                        })
                    } else {
                        var desc = alerts.description;
                        var level = 2;
                        alert = {
                            desc,
                            level
                        };
                    }

                } else {
                    alert = {
                        desc,
                        level
                    };
                }
            }
        };

        return alert;
    },

    parseResponse: function(response) {
        var result = JSON.parse(response);
  
    var forecast = [];
         for (var i = 0; i < result.forecast.forecastday.length; i++) {
             forecast[i] = result.forecast.forecastday[i];
			 
			 function getDayOfWeek(date) {
             var dayOfWeek = new Date(date).getDay();    
             return isNaN(dayOfWeek) ? null : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek];
             }
			 
			 var now = getDayOfWeek(forecast[i].date);
             var newDay = {
                 date: {
                     weekday_short: now
                 }
             };
             forecast[i] = Object.assign(forecast[i], newDay);
			 
			 
             var highF = Math.round(forecast[i].day.maxtemp_f);
             var lowF = Math.round(forecast[i].day.mintemp_f);

             function toCelsius(f) {
                 return (5 / 9) * (f - 32);
             }
             var highC = Math.round(toCelsius(forecast[i].day.maxtemp_c));
             var lowC = Math.round(toCelsius(forecast[i].day.mintemp_c));
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
			 var desc = forecast[i].day.condition.text;
			 var description = { 
			                    desc: {
									   desc
									   }
									   };
			 forecast[i] = Object.assign(forecast[i], description);
			 var output = forecast[i].day.condition.icon.match(/[\w-]+\.png/g);
			 let icony = { icon:this.imageArray[output]};

			 forecast[i] = Object.assign(forecast[i], icony);
			 forecast[i] = Object.assign(forecast[i], high);
             forecast[i] = Object.assign(forecast[i], low);
			 forecast.push(forecast[i]);
			 
         } 
             forecast = forecast.slice(1, 5);
           		
			var cicon = result.current.condition.icon.match(/[\w-]+\.png/g);
			
	current = {
            current: {
        	weather: result.current.condition.text,
            temp_c: Math.round(result.current.temp_c),
            temp_f: Math.round(result.current.temp_f),
            icon: this.imageArray[cicon],
            relative_humidity: Math.round(result.current.humidity),
            pressure_in: Math.round(result.current.pressure_in),
            pressure_mb: Math.round(result.current.pressure_mb),
            UV: Math.round(result.forecast.forecastday[0].day.uv),
            wind_mph: Math.round(result.current.wind_mph),
            wind_kph: Math.round(result.current.wind_kph),
            visibility_mi: Math.round(result.current.vis_miles),
            visibility_km: Math.round(result.current.vis_km),
			forecast: {
    "0": {fcttext:result.forecast.forecastday[0].day.condition.text,fcttext_metric:result.forecast.forecastday[1].day.condition.text},
    "1": {fcttext:result.forecast.forecastday[0].day.condition.text,fcttext_metric:result.forecast.forecastday[1].day.condition.text}
               }
		}
         }; 
	
       current = {current, forecast};
        return current;
    },
};

if (typeof module !== "undefined") {
    module.exports = provider;
}