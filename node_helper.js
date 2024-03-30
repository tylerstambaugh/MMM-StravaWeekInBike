//needs to get access token from refresh token
//needs to call and get ride stats for time period

const NodeHelper = require("node_helper");
const request = require("request");

module.exports = NodeHelper.create({
  start: function () {
    console.log("Starting node_helper for: " + this.name);
  },

  getAccessToken: function (payload) {
    // var query = $"client_id={_config.ClientId}&client_secret={_config.ClientSecret}&refresh_token={_config.RefreshToken}&grant_type=refresh_token";
    request(
      {
        url: payload.url,
        method: "GET"
      },
      (error, response, body) => {
        if (!error && response.statusCode == 200) {
          var result = JSON.parse(body);
          console.log(response.statusCode + result); // uncomment to see in terminal
          this.sendSocketNotification("ACCESS_TOKEN_RESULT", result);
        }
      }
    );
  },

  getStravaStats: function (payload) {
    //$ http GET "https://www.strava.com/api/v3/athlete/activities?before=&after=&page=&per_page=" "Authorization: Bearer [[token]]"

    request(
      {
        url:
          payload.url +
          "/athlete/activities?before=" +
          payload.endTime +
          "&after=" +
          payload.startTime,
        method: "GET"
      },
      (error, response, body) => {
        if (!error && response.statusCode == 200) {
          var result = JSON.parse(body);
          this.sendSocketNotification("STRAVA_STATS_RESULT", result);
        }
      }
    );
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "GET_ACCESS_TOKEN") {
      this.getAccessToken(payload);
    } else if (notification === "GET_STRAVA_STATS") {
      this.getStravaStats(payload);
    }
  }
});
