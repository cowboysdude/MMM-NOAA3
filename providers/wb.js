/* Magic Mirror
 * Module: MMM-NOAA3
 * By cowboysdude 
 */
var request = require('request');
 const moment = require('moment');
 const fs = require('fs');
var lat, lon, zip, city;
  
 var provider = {
        config: {
       
        },
    
           imageArray: {
            "200": "tstorms",
            "201": "tstorms",
            "202": "tstorms",
            "230": "tstorms",
			"231": "tstorms",
            "232": "tstorms",
            "233": "tstorms",
            "300": "chancerain",
			"301": "chancerain",
            "302": "chancetstorms",
            "500": "rain",
            "501": "rain",
			"502": "rain",
            "511": "sleet",
			"520": "rain",
            "521": "rain",
			"522": "rain",
            "600": "chancesnow",
            "601": "snow",
            "602": "snow",
			"610": "chancesleet",
            "611": "sleet",
            "612": "sleet",
            "621": "snow",
			"622": "snow",
            "623": "chancesnow",
            "700": "fog",
            "711": "hazy",
			"721": "hazy",
            "731": "hazy",
            "741": "fog",
            "751": "fog",
			"800": "clear",
            "801": "partlycloudy",
            "802": "partlycloudy",
            "803": "partlycloudy",
			"804": "overcast",
            "900": "na"
        }, 
		  
		  addModuleConfiguration: function(moduleConfig) {
               if(!moduleConfig.apiKey) {
                   throw new Error('Invalid config, No key for Weatherbit');
         }
           this.config.apiKey = moduleConfig.apiKey;
 		   this.config.airKey = moduleConfig.airKey;
		   this.config.userlat = moduleConfig.userlat;
		   this.config.userlon = moduleConfig.userlon; 
        }, 
	
     getData: function(callback) {
		 var self = this;
		   url = "https://api.weatherbit.io/v2.0/forecast/daily?lat="+this.config.userlat+"&lon="+this.config.userlon+"&days=4&units=I&key="+this.config.apiKey+"&lang="+config.language;
         request(url, function (error, response, body) {
             if (error) {
                 console.log("Error: " + err.message);
                 callback(null);
             }
             callback(self.parseResponse(body));
         });
     },
     
      parseResponse: function(response) {
     	var self = this;
         var result = JSON.parse(response);
          var current = result.data[0];
          current = {
             current: { 
                 weather: result.data[0].weather.description,
                 temp_f: Math.round(current.temp),
				 temp_c: Math.round((current.temp - 32) * 5 / 9),
                 icon: this.imageArray[result.data[0].weather.code],
                 relative_humidity: current.rh + "%",
                 pressure_in: Math.round(current.pres*0.02953),
				 pressure_mb:  Math.round(current.pres),
                 UV: Math.round(current.uv),
                 visibility_mi: current.vis,
                 wind_mph: Math.round(current.wind_spd),
				 wind_kph: Math.round(current.wind_spd),
				 		forecast: {
    "0": {fcttext:result.data[0].weather.description,fcttext_metric:result.data[0].weather.description},
    "1": {fcttext:result.data[0].weather.description,fcttext_metric:result.data[0].weather.description}
               }
                  }
      };
	 
	   var forecast = [];
        for (var i = 0; i < result.data.length; i++) { 
      
             forecast[i] = result.data[i];
             var now = moment(forecast[i].datetime, "YYYY-MM-DD").format('ddd');
             var newDay = {
                 date: {
                     weekday_short: now
                 }
             };
             forecast[i] = Object.assign(forecast[i], newDay);
             var highF = Math.round(forecast[i].app_max_temp);
             var lowF = Math.round(forecast[i].app_min_temp);

             function toCelsius(f) {
                 return (5 / 9) * (f - 32);
             }
             var highC = Math.round(toCelsius(forecast[i].app_max_temp));
             var lowC = Math.round(toCelsius(forecast[i].app_min_temp));
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
			let icony = { icon:this.imageArray[forecast[i].weather.code]};

			 forecast[i] = Object.assign(forecast[i], icony);
             forecast[i] = Object.assign(forecast[i], high);
             forecast[i] = Object.assign(forecast[i], low);
			 
			 var desc = forecast[i].weather.description;
			 var description = { 
			                    desc: {
									   desc
									   }
									   };
			 forecast[i] = Object.assign(forecast[i], description);
        };
	  
         current = {
             current,
             forecast
         };
         return current;
     },
     
     getSRSS: function(callback) {
        var self = this;
        //console.log("working "+this.lat2+" "+this.lon2);
        url = "https://api.sunrise-sunset.org/json?lat="+this.config.userlat+"&lng="+this.config.userlon+"&formatted=0";
        request(url, function(error, response, body) {
            if (error) {
                console.log("Error: " + error.message);
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
     }
 };
 
 if (typeof module !== "undefined") {module.exports = provider;}