/* Magic Mirror
 * Module: MMM-NOAA3
 * By cowboysdude 
 */
var request = require('request');
 const moment = require('moment');
  const fs = require('fs');
 var lat, lon, city, zip, current, UV, url, units;
var forecast = [];
 
var provider = { 
    config: {
    },
	
	  imageArray: {
		    "01n": "clear",
            "01d": "clear",
            "02d": "mostlycloudy",
            "03d": "mostlycloudy",
            "04d": "mostlycloudy",
            "09d": "rain",
            "10d": "rain",
			"11d": "tstorms",
            "13d": "snow",
            "50d": "chancerain",
			"03n": "mostlycloudy",
			"800": "overcast",
			"04n": "overcast",
        }, 
		
		   addModuleConfiguration: function(moduleConfig) {
               if(!moduleConfig.apiKey) {
                   throw new Error('Invalid config, No key for OpenWeather');
         }
           this.config.apiKey = moduleConfig.apiKey;
 		   this.config.airKey = moduleConfig.airKey;
		   this.config.units = moduleConfig.units;
		   this.config.userlat = moduleConfig.userlat;
		   this.config.userlon = moduleConfig.userlon;
		   this.getForecast();
		   this.getUV(); 
        },
		
		getForecast: function() {
        var self = this;
url = "http://api.openweathermap.org/data/2.5/forecast/daily?lat="+this.config.userlat+"&lon="+this.config.userlon+"&units="+this.config.units+"&appid="+this.config.apiKey;
        request({
		    url: url,
            method: 'GET'
        }, (error, response, body) => {
           self.parseForecast(body);
        });
    },	
		
	getUV: function() {
        var self = this;
	 
			url = "http://api.openweathermap.org/data/2.5/uvi?appid="+this.config.apiKey+"&lat="+this.config.userlat+"&lon="+this.config.userlon;
		 
        request({
			url:  url,
            method: 'GET'
        }, (error, response, body) => {
           self.parseUV(body);
        });
    },
	
	parseUV: function(response) {
    var result = JSON.parse(response);
	UV = (Math.round(result.value));
    },

    getData: function(callback) {
        var self = this;
		
			url =  "http://api.openweathermap.org/data/2.5/weather?lat="+this.config.userlat+"&lon="+this.config.userlon+"&units="+config.units+"&appid="+this.config.apiKey+"&lang="+config.language;
			
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
        url = "http://api.wunderground.com/api/a4d00a39e75848da/alerts/q/pws:KPALANCA9.json"
        request(url, function(error, response, body) {
            if (error) {
                console.log("Error: " + err.message);
                callback(null);
            }
            callback(self.parseALERT(body));
        });
    },

    parseALERT: function(response) {
        var alert = JSON.parse(response);
       // console.log(alert.alerts);
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

	
	parseForecast: function(response) {
        var result = JSON.parse(response);
	   forecast = []; 
         for (var i = 0; i < result.list.length; i++) {
             forecast[i] = result.list[i];
	
			var day = moment.unix(forecast[i].dt).utc().format('ddd');
			
			var newDay = {
                 date: {
                     weekday_short: day
                 }
             };
			forecast[i] = Object.assign(forecast[i], newDay);
			
			
             var highF = Math.round(forecast[i].temp.day);
             var lowF = Math.round(forecast[i].temp.night);
             var highC = Math.round(forecast[i].temp.day);
             var lowC = Math.round(forecast[i].temp.night);
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
			 
			 var desc = forecast[i].weather[0].description;
			 var description = { 
			                    desc: {
									   desc
									   }
									   };
			 forecast[i] = Object.assign(forecast[i], description);
			 
		 	 var output = forecast[i].weather[0].icon;
			 let icony = {icon:this.imageArray[output]};  
			 forecast[i] = Object.assign(forecast[i], icony);
			 forecast.push(forecast[i]);
			 forecast = forecast.slice(0, 4);
			 };
			
			
		return forecast;
		
    },
	
	
    parseResponse: function(response) {
        var result = JSON.parse(response);
      
         current = {current:{
        	weather: result.weather[0].main,
			weather_f: result.weather[0].description,
            temp_c: Math.round(result.main.temp),
            temp_f: Math.round(result.main.temp),
            icon: this.imageArray[result.weather[0].icon],
            relative_humidity: result.main.humidity,
            pressure_in: Math.round(result.main.pressure*0.02953),
            pressure_mb: result.main.pressure,
            UV: UV,
            wind_mph: result.wind.speed,
            wind_kph: result.wind.speed,
           visibility_mi: Math.round(result.visibility* 0.00062137),
           visibility_km: result.visibility,
		   forecast:{
    "0": {fcttext:result.weather[0].description},
    "1": {fcttext:result.weather[0].description}
               }  
		}
		};
		console.log(result);
		current = {current, forecast}; 
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