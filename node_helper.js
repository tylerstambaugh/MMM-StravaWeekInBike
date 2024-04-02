//needs to get access token from refresh token
//needs to call and get ride stats for time period

const NodeHelper = require("node_helper");
const axios = require("axios");
const Log = require("logger");

module.exports = NodeHelper.create({
  accessTokenData: {},

  start: function () {
    console.log("Starting node_helper for: " + this.name);
  },

  getAccessToken: async function (payload) {
    try {
      url =
        payload.tokenUrl +
        "client_id=" +
        payload.clientId +
        "&client_secret=" +
        payload.clientSecret +
        "&refresh_token=" +
        payload.refreshToken +
        "&grant_type=refresh_token";
      await axios
        .post(url)
        .then((response) => {
          Log.info("Access token data: " + JSON.stringify(response.data));
          accessTokenData = response.data;
        });
    } catch (error) {
      console.error("Access token Error fetching data from API:", error);
      this.sendSocketNotification("ACCESS_TOKEN_ERROR", error);
    }
  },

  processData: function (data) {   
    let totalDistance = 0;
    let totalElevation = 0;
    let totalMinutes = 0;
    let numberOfRides = 0;
    data.forEach((activity) => {
      if(activity.type === "Ride") {
      totalDistance += Math.floor(activity.distance * 0.000621371);
      totalElevation += Math.floor(activity.total_elevation_gain * 3.28084);  
      totalMinutes += Math.floor((activity.moving_time / 60));
      numberOfRides++;
      }
    });
    return {
      totalDistance: totalDistance,
      totalElevation: totalElevation,
      minutes: totalMinutes % 60,
      hours: Math.floor(totalMinutes / 60),
      totalMinutes: totalMinutes,
      numberOfRides: numberOfRides
    };
  },

  getStravaStats: async function (payload) {
    try {
      await this.getAccessToken(payload);      
      url =
        payload.url +
        "athlete/activities?before=" +
        payload.before +
        "&after=" +
        payload.after;
      Log.info("node helper about to call for activities, url: " + url);
      await axios
        .get(url, {
          headers: {
            Authorization: `Bearer ${accessTokenData.access_token}`
          }
        })
        .then((response) => {
          Log.info("node helper calling to filter data. Data:", response.data);
          const processedData = this.processData(response.data);
          return processedData;
        })
        .then((data) => {
          Log.info("node helper sending data to module. Data:", data);
          this.sendSocketNotification("STRAVA_STATS_RESULT", data);
        });
    } catch (error) {
      console.error(
        "node helper getStravaStats - Error fetching data from API:",
        error
      );
      return null;
    }
  },

  socketNotificationReceived: function (notification, payload) {
    Log.info(
      "node helper received a socket notification: " +
        notification +
        " - Payload: " +
        payload
    );
     if (notification === "GET_STRAVA_STATS") {
      this.getStravaStats(payload);
    }
  }
});
