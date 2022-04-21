/* Magic Mirror
 * Module: MMM-NOAA3
 * By cowboysdude 
 */
var request = require('request');
const moment = require('moment');
const fs = require('fs');
var lat, lon, zip, city;
var current;
 

     
 var provider = {
        config: {
        },
    // add more configs here as needed
	
           addModuleConfiguration: function(moduleConfig) {
               if(!moduleConfig.apiKey) {
                   throw new Error('Invalid config');
            }
           this.config.apiKey = moduleConfig.apiKey;
 		   this.config.airKey = moduleConfig.airKey;
		   this.config.userlat = moduleConfig.userlat;
		   this.config.userlon = moduleConfig.userlon;
		   this.config.lang = moduleConfig.language;
		   this.config.pws = moduleConfig.pws;
 		/*   var text = fs.readFileSync('modules/MMM-NOAA3/latlon.json','utf8')
           var info = JSON.parse(text);
		   lat = info.lat;
		   lon = info.lon;
		   zip = info.zip;
		   city = info.city;
		   */
        },
		
    getData: function(callback) {
        var self = this;
		url = "http://api.wunderground.com/api/"+this.config.apiKey+"/forecast/lang:"+this.config.lang+"/conditions/q/pws:"+this.config.pws+".json";
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
		
		forecast =  result.forecast.simpleforecast.forecastday
		
        current = {
			 current: {
			     weather: result.current_observation.weather,
                 temp_f: result.current_observation.temp_f,
				 temp_c: result.current_observation.temp_c,
                 icon: result.current_observation.icon,
                 relative_humidity: result.current_observation.relative_humidity,
                 pressure_in: result.current_observation.pressure_in,
                 pressure_mb: result.current_observation.pressure_mb,				 
                 UV: result.current_observation.UV,
                 visibility_mi: result.current_observation.visibility_mi,
				 visibility_km: result.current_observation.visibility_km,
                 wind_mph: result.current_observation.wind_mph,
				 wind_kph: result.current_observation.wind_kph,
			      forecast: {
    "0": {fcttext:result.forecast.txt_forecast.forecastday[0].fcttext,fcttext_metric:result.forecast.txt_forecast.forecastday[0].fcttext_metric},
    "1": {fcttext:result.forecast.txt_forecast.forecastday[1].fcttext,fcttext_metric:result.forecast.txt_forecast.forecastday[1].fcttext_metric}
				  }
			   },
        };
      
		

        return {
            current,
            forecast
        };
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