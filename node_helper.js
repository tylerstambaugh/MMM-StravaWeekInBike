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
      console.log("Node helper getting access token: clientId:" + payload.clientId + " clientSecret: " + payload.clientSecret + " refreshToken: " + payload.refreshToken);
      // var query = $"client_id={_config.ClientId}&client_secret={_config.ClientSecret}&refresh_token={_config.RefreshToken}&grant_type=refresh_token";
      url = payload.tokenUrl + "client_id=" + payload.clientId + "&client_secret=" + payload.clientSecret + "&refresh_token=" + payload.refreshToken + "&grant_type=refresh_token";
      return axios.post(url)
      .then(response => {
        // Handle the response data
        console.log("Access token data: " + response.data);
        accessTokenData = JSON.stringify(response.data);
      })
      .catch(error => {
        // Handle errors
        console.error('Error fetching data from API:', error);
        return null;
      });
    } catch (error) {
      console.error('Error fetching data from API:', error);
      return null;
    }
  },

  getStravaStats: async function (payload) {
    try{

      //$ http GET "https://www.strava.com/api/v3/athlete/activities?before=&after=&page=&per_page=" "Authorization: Bearer [[token]]"
      console.log("Node helper getting Strava stats: clientId:" + payload.clientId + " clientSecret: " + payload.clientSecret + " refreshToken: " + payload.refreshToken);
      await this.getAccessToken(payload).then((response) => {;
      url = payload.url +
      "athlete/activities?before=" +
      payload.endTime +
      "&after=" +
      payload.startTime
      return axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessTokenData.access_token}`
        }
      })
      .then(response => {
        // Handle the response data
        return response.data;
      })
      .catch(error => {
        // Handle errors
        console.error('Error fetching data from API:', error);
        return null;
      });
    });
    } catch (error) {
      console.error('Error fetching data from API:', error);
      return null;
    }
  },



  socketNotificationReceived: function (notification, payload) {
    console.log("node helper received a socket notification: " + notification + " - Payload: " + payload);
    if (notification === "GET_ACCESS_TOKEN") {
      this.getAccessToken(payload);
    } else if (notification === "GET_STRAVA_STATS") {
      this.getStravaStats(payload);
    }
  }
});
