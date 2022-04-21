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
			 updateInterval: 60  * 1000
        },
   imageArray: {
            "Blizzard.gif": "snow",
            "Clear.gif": "clear",
            "Overcast.gif": "overcast",
            "partly-cloudy-night": "mostlycloudy",
            "Cloudy.gif": "cloudy",
			"CloudRainThunder.gif":"tstorms",
            "CloudSleetSnowThunder.gif": "tstorms",
            "snow": "chancesnow",
            "Fog.gif": "fog",
			"FreezingFog.gif":"fog",
			"FreezingDrizzle.gif":"chancesleet",
			"FreezingRain.gif":"chancesleet",
			"HeavyRain.gif":"rain",
			"HeavyRainSwrsDay.gif":"rain",
			"HeavyRainSwrsNight.gif":"rain",
			"HeavySleet.gif":"chancesleet",
			"HeavySleetSwrsDay.gif":"sleet",
			"HeavySleetSwrsDay.gif":"sleet",
			"HeavySnow.gif":"snow",
			"HeavySnowSwrsDay.gif":"snow",
			"HeavySnowSwrsNight.gif":"snow",
			"IsoRainSwrsDay.gif":"rain",
			"IsoRainSwrsNight.gif":"rain",
			"IsoSleetSwrsDay.gif":"sleet",
			"IsoSleetSwrsNight.gif":"sleet",
			"IsoSnowSwrsDay.gif":"snow",
			"IsoSnowSwrsNight.gif":"snow",
			"Mist.gif":"hazy",
			"ModRain.gif":"rain",
			"ModRainSwrsDay.gif":"rain",
			"ModSleet.gif":"sleet",
			"ModSleetSwrsDay.gif":"sleet",
			"ModSleetSwrsNight.gif":"sleet",
			"ModSnow.gif":"snow",
			"ModSnowSwrsDay.gif":"snow",
			"ModSnowSwrsNight.gif":"snow",
			"OccLightRain.gif":"chancerain",
			"OccLightSleet.gif":"chancesleet",
			"OccLightSnow.gif":"chancesnow",
			"PartCloudRainThunderDay.gif":"",
			"PartCloudRainThunderNight.gif":"",
			"PartCloudSleetSnowThunderDay.gif":"",
			"PartCloudSleetSnowThunderNight.gif":"",
			"PartlyCloudyDay.gif":"partlycloudy",
			"PartlyCloudyNight.gif":"partlycloudy",
			"Sunny.gif":"sunny",
			"Clear.gif":"clear"
        },
	
           addModuleConfiguration: function(moduleConfig) {
               if(!moduleConfig.apiKey) {
                   throw new Error('Invalid config');
            } 
			
           this.config.apiKey = moduleConfig.apiKey;
		   this.config.appID = moduleConfig.appID;
 		   this.config.airKey = moduleConfig.airKey;
		    this.config.userlat = moduleConfig.userlat;
		   this.config.userlon = moduleConfig.userlon;
		   this.config.lang = moduleConfig.language;
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
		url = "http://api.weatherunlocked.com/api/forecast/"+this.config.userlat+","+this.config.userlon+"?lang="+config.language+"&app_id="+this.config.appID+"&app_key="+this.config.apiKey;
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

    parseResponse: function(response) {
        var result = JSON.parse(response);
        var current = {current:{
        	weather: result.Days[0].Timeframes[1].wx_desc,
            temp_c: Math.round(result.Days[0].temp_max_c),
            temp_f: Math.round(result.Days[0].temp_max_f),
            icon: this.imageArray[result.Days[0].Timeframes[0].wx_icon],
            relative_humidity: result.Days[0].humid_max_pct+"%",
            pressure_in: Math.round(result.Days[0].slp_min_in),
            pressure_mb: result.Days[0].slp_min_mb,
            UV: "NA",
            wind_mph: result.Days[0].windspd_max_mph,
            wind_kph: result.Days[0].windspd_max_kmh,
           visibility_mi: "10",
           visibility_km: "10",
		   forecast:{
    "0": {fcttext:result.Days[0].Timeframes[0].wx_desc},
    "1": {fcttext:result.Days[0].Timeframes[0].wx_desc}
               }  
		}
		};
		var forecast = [];
         for (var i = 0; i < result.Days.length; i++) {
             forecast[i] = result.Days[i];
		var now = forecast[i].date;
		
		var myString = now;
        var splits = myString.split('/');
		var rightNow = splits[1]+"/"+splits[0];
		
             var newDay = {
                 date: {
                     weekday_short: rightNow
                 }
             };
			
             forecast[i] = Object.assign(forecast[i], newDay);
             var highF = Math.round(forecast[i].temp_max_f);
             var lowF = Math.round(forecast[i].temp_min_f);
             var highC = Math.round(forecast[i].temp_max_c);
             var lowC = Math.round(forecast[i].temp_min_c);
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
			 
			 let icony = { icon:this.imageArray[forecast[i].Timeframes[0].wx_icon] };
            
             forecast[i] = Object.assign(forecast[i], high);
             forecast[i] = Object.assign(forecast[i], low);
             forecast[i] = Object.assign(forecast[i], icony);
			 
			 var desc = forecast[i].Timeframes[0].wx_desc;
			 var description = { 
			                    desc: {
									   desc
									   }
									   };
			 forecast[i] = Object.assign(forecast[i], description);
			 
			forecast.push(forecast[i]);
            
		 };
		 forecast = forecast.slice(0, 4);
       
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

if (typeof module !== "undefined") {module.exports = provider;}