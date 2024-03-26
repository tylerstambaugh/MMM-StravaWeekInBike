

//needs to refresh token on interval

//needs to call and get ride stats for time period

const NodeHelper = require('node_helper');
const request = require('request');

module.exports = NodeHelper.create({

    start: function() {
        console.log("Starting node_helper for: " + this.name);
    },

    getRefreshToken: function(url) {
        request({
            url: url,
            method: 'GET'
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                var result = JSON.parse(body);
				console.log(response.statusCode + result); // uncomment to see in terminal
                   this.sendSocketNotification('REFRESH_TOKEN_RESULT', result);		
            }
        });
    },

    getStravaStats: function(url) {
        request({
            url: url,
            method: 'GET'
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                var result = JSON.parse(body).sightings; // sightings is from JSON data
		//		console.log(response.statusCode + result); // uncomment to see in terminal
                    this.sendSocketNotification('STRAVA_STATS_RESULT', result);
		
            }
        });
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === 'GET_REFESH_TOKEN') {
            this.getRefreshToken(payload);
        } else if (notification === 'GET_STRAVA_STATS') {
            this.getStravaStats(payload);
        }
    }
});