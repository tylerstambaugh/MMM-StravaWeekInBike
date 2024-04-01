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
    
    try{
      url = payload.tokenUrl + "client_id=" + payload.clientId + "&client_secret=" + payload.clientSecret + "&refresh_token=" + payload.refreshToken + "&grant_type=refresh_token";
      await axios.post(url)
      .then(response => {
        // Handle the response data
        Log.info("Access token data: " + JSON.stringify(response.data));
        accessTokenData = response.data;
      })
      .catch(error => {
        // Handle errors
        console.error('access token Error fetching data from API:', error);
        return null;
      });
    } catch (error) {
      console.error('Access token Error fetching data from API:', error);
      return null;
    }
  },

  getStravaStats: async function (payload) {
    //check if access token is expired, refresh if needed:
    try{
      await this.getAccessToken(payload);
      Log.info("node helper about to call for activities, access token: " + accessTokenData.access_token);
      url = payload.url + "athlete/activities?before=" + payload.endTime + "&after=" + payload.startTime;

      await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessTokenData.access_token}`
        }
      
      })
      .then(response => {
        console.info("Node helper get Activities call - Data from API: ", response.data);
        return response.data;
      })
      .catch(error => {
        // Handle errors
        console.error('node helper getStravaStats (stringified) - Error fetching data from API:', JSON.stringify(error));
        return error;
      });
   
    } catch (error) {
      console.error('node helper getStravaStats - Error fetching data from API:', error);
      return null;
    }
  },



  socketNotificationReceived: function (notification, payload) {
    console.error("node helper received a socket notification: " + notification + " - Payload: " + payload);
    if (notification === "GET_ACCESS_TOKEN") {
      this.getAccessToken(payload);
    } else if (notification === "GET_STRAVA_STATS") {
      this.getStravaStats(payload);
    }
  }
});
