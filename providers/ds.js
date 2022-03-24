/* Magic Mirror
 * Module: MMM-NOAA3
 * By cowboysdude
 */
 var request = require('request');
 const moment = require('moment');
 const fs = require('fs');
 var lat, lon, city, zip, alerts, sun;

 var provider = {
        config: {

        },

           imageArray: {
            "clear-day": "clear",
            "clear-night": "clear",
            "partly-cloudy-day": "mostlycloudy",
            "partly-cloudy-night": "mostlycloudy",
            "cloudy": "cloudy",
            "rain": "rain",
            "sleet": "sleet",
            "snow": "chancesnow",
            "wind": "na",
            "fog": "fog",
			"overcast":"overcast",
			"Breezy and Overcast":"overcast"
        },

		  		  addModuleConfiguration: function(moduleConfig) {
               if(!moduleConfig.apiKey) {
                   throw new Error('Invalid config, No key for DarkSky');
         }
           this.config.apiKey = moduleConfig.apiKey;
 		   this.config.airKey = moduleConfig.airKey;
		   this.config.userlat = moduleConfig.userlat;
		   this.config.userlon = moduleConfig.userlon;
        },


		getSRSS: function(callback) {
         var self = this;
         url = "http://api.sunrise-sunset.org/json?lat="+this.config.userlat+"&lng="+this.config.userlon+"&formatted=0";
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



      getData: function(callback) {
		 var self = this;
		 if (config.language != 'gr') {
		 url = "https://api.darksky.net/forecast/"+this.config.apiKey+"/"+this.config.userlat+","+this.config.userlon+"?lang="+config.language;
	     } else {
		 url = "https://api.darksky.net/forecast/"+this.config.apiKey+"/"+this.config.userlat+","+this.config.userlon+"?lang=el";
		 }
		 request(url, function (error, response, body) {

			 if (error) {

                 console.log("Error: " + err.message);
                 callback(null);
             }

             callback(self.parseResponse(body));
         });
     },

     parseResponse: function(response) {

         var result = JSON.parse(response);

         var forecast = [];
         for (var i = 0; i < result.daily.data.length; i++) {
             forecast[i] = result.daily.data[i];
             var now = moment.unix(forecast[i].time).format('ddd');
             var newDay = {
                 date: {
                     weekday_short: now
                 }
             };
             forecast[i] = Object.assign(forecast[i], newDay);
             var highF = Math.round(forecast[i].temperatureHigh);
             var lowF = Math.round(forecast[i].temperatureLow);

             function toCelsius(f) {
                 return (5 / 9) * (f - 32);
             }
             var highC = Math.round(toCelsius(forecast[i].temperatureHigh));
             var lowC = Math.round(toCelsius(forecast[i].temperatureLow));
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

			 let icony = { icon:this.imageArray[forecast[i].icon]};

              var forecasty = { forecast:{
    "0": {fcttext:result.hourly.summary,fcttext_metric:result.hourly.summary},
    "1": {fcttext:result.hourly.summary,fcttext_metric:result.hourly.summary}
               }   };
            // console.log(forecasty);
             forecast[i] = Object.assign(forecast[i], high);
             forecast[i] = Object.assign(forecast[i], low);
			 forecast[i] = Object.assign(forecast[i], icony);
			 forecast[i] = Object.assign(forecast[i], forecasty);
			  var desc = forecast[i].summary;
			 var description = {
			                    desc: {
									   desc
									   }
									   };
			 forecast[i] = Object.assign(forecast[i], description);

             forecast = forecast.slice(0, 4);
         };


         current = {
             current: {
                 ss: moment(sun.sunset).format('HH'),
				 weather: result.currently.summary,
                 temp_f: Math.round(result.currently.temperature),
				 temp_c: Math.round((result.currently.temperature - 32) * 5 / 9),
                 icon: this.imageArray[result.currently.icon],
                 relative_humidity: result.currently.humidity.toString().replace(/^[0.]+/, "") + "%",
                 pressure_in: Math.round(result.currently.pressure*0.02953),
                 pressure_mb: Math.round(result.currently.pressure),
                 UV: result.currently.uvIndex,
                 visibility_mi: result.currently.visibility,
                 wind_mph: result.currently.windSpeed,
				 wind_kph: result.currently.windSpeed,
                 forecast: {
    "0": {fcttext:result.hourly.summary,fcttext_metric:result.hourly.summary},
    "1": {fcttext:result.hourly.summary,fcttext_metric:result.hourly.summary}
               }
				 }
         }
		 if (typeof result.alerts == 'object') {
		 alerts = { alerts: result.alerts }
		 }

         if (typeof alerts == 'object') {
         current = {
             current,
             forecast,
		 alerts }
         } else {
			current = {
             current,
             forecast  }

	 };
         return current;
     },



     getAIR: function(callback) {
         var self = this;
         url = "http://api.airvisual.com/v2/nearest_city?lat=" + this.config.userlat + "&lon=" + this.config.userlon + "&rad=100&key="+this.config.airKey;
         request(url, function(error, response, body) {
			     if (error) {
                 console.log("Error: " + error.message);
                 callback(null);
             }
             callback(self.parseAIR(body));
         });
     },

	 getALERT: function(callback) {
        var self = this;
        url = "https://api.darksky.net/forecast/"+this.config.apiKey+"/"+this.config.userlat+","+this.config.userlon+"?lang="+config.language;
        request(url, function(error, response, body) {

            if (error) {
                console.log("Error: " + error.message);

                callback(null);
            }
            callback(self.parseALERT(body));

        });
    },


    parseAIR: function(response) {
        var air = JSON.parse(response);
        airdata = {
            air: air.data.current.pollution
        }
        return airdata;
    },


	  parseALERT: function(response) {
        var issue = JSON.parse(response);
		if (typeof issue != 'undefined'){
		alerts = {alerts: issue.alerts};
		return alerts;
		} else {
		console.log("No Alerts");
		}
    },

 };

 if (typeof module !== "undefined") {
     module.exports = provider;
 }
