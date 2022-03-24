/* Magic Mirror
 * Module: MMM-NOAA3
 * By Cowboysdude special Thanks to JimL from php help forum!
 */
var NodeHelper = require("node_helper");
var moment = require('moment');
var request = require('request');
const fs = require('fs');

module.exports = NodeHelper.create({

    config: {
		updateInterval:  5 * 1000,
        initialLoadDelay: 400000
    },
    provider: null,
    providers: {
        darksky: 'ds',
        openweather: 'ow',
        wunderground: 'wg',
        apixu: 'ax',
        weatherbit: 'wb',
        weatherunlocked: 'wu',
        accuweather: 'aw',
		msn: 'ms',
    },

    start: function() {
        var self = this;
        setTimeout(function() {
        });
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "MMM-NOAA3") {
			this.sendSocketNotification('MMM-NOAA3');
            this.path = "modules/MMM-NOAA3/latlon.json";
            this.provider = this.getProviderFromConfig(payload);
            this.provider.addModuleConfiguration(payload);
			this.config = payload;
            this.getData();
            this.getSRSS();
            this.getAIR(); 
			this.getMoonData();
			if (this.providers[config.provider] == 'ds'){
				console.log(this.providers[config.provider]);
				 this.getALERT()
		    };
        }
        this.scheduleUpdate(this.config.updateInterval);
    },

    scheduleUpdate: function() {
        var self = this;
        self.updateInterval = setInterval(() => {
            console.log('NOAA3 weather updated.. next update in 1 hour');
            self.getData();
            self.getSRSS();
            self.getAIR(); 
			self.getALERT(); 
			//console.log(this.providers[this.config.provider]);
			if (self.providers[config.provider] == 'ds'){self.getALERT()};
        }, self.config.updateInterval);
    },
	
	getMoonData: function() {
        var self = this;
		var date = moment().unix();
		console.log(date);
		//var date = moment().format('M/D/YYYY');
        request({ 
			  url: "http://api.farmsense.net/v1/moonphases/?d="+date,
			//url: "https://mykle.herokuapp.com/moon",
            method: 'GET'
        }, (error, response, body) => {
            if (self.provider) {
                var moons = JSON.parse(body);  
				//console.log(moons);
                var moon = moons[0]['Phase']; 
                //console.log(moon);
				}; 
				 self.sendSocketNotification("MOON_RESULT", moon ? moon : 'NO_MOON_DATA');
                    });
           // }
       // });
    },

    getData: function() {
        var self = this;
        self.provider.getData(function(response) {
            self.sendSocketNotification("WEATHER_RESULT", response ? response : 'NO_WEATHER_RESULT'); 
        });
    },

    getSRSS: function() {
        var self = this;
        self.provider.getSRSS(function(response) {
            self.sendSocketNotification("SRSS_RESULT", response ? response : 'NO_SRSS_DATA');
        });
    },

    getForecast: function() {
        var self = this;
        self.provider.getForecast(function(response) {
            self.sendSocketNotification("FORECAST_RESULT", response ? response : 'NO_FORECAST_DATA');
        });
    },

    getAIR: function() {
        var self = this;
        self.provider.getAIR(function(response) {
            self.sendSocketNotification("AIR_RESULT", response ? response : 'NO_AIR_DATA');
        });
    },

   getALERT: function() {
        var self = this;
        self.provider.getALERT(function(response) {
            self.sendSocketNotification("ALERT_RESULT", response ? response : 'NO_ALERT_DATA');
        });
    },

    getProviderFromConfig: function(config) {
        if (!this.providers[config.provider]) {
            throw new Error('Invalid config No provider selected');
        }
		console.log(this.providers[config.provider]);
        return require('./providers/' + this.providers[config.provider] + '.js');
    }
});