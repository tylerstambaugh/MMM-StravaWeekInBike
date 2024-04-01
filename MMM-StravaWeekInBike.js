/* MagicMirror²
 * Module: MMM-StravaWeekInBike
 *
 * By Tyler Stambaugh
 */
Module.register("MMM-StravaWeekInBike", {
  baseUrl: "https://www.strava.com/api/v3/",
  tokenUrl: "https://www.strava.com/oauth/token?",
  accessTokenData: {},

  // Module config defaults.
  defaults: {
    clientId: "",
    clientSecret: "",
    refreshToken: "",
    header: "Strava Week in Bike",
    maxWidth: "250px",
    animationSpeed: 3000, // fade in and out speed
    initialLoadDelay: 4250,
    retryDelay: 2500,
    updateInterval:60 * 15 * 1000
  },

  init: function () {
    Log.log(this.name + " is in init!");
  },

  getHeader: function () {
    return this.config.header;
  },

  start: function () {
    Log.info("Starting module: " + this.name);
    requiresVersion: "2.1.0", (this.stravaStats = []),
    //this.getStravaStats();
    this.scheduleUpdate();
  },

  // this tells module when to update
  scheduleUpdate: function () {
    setInterval(() => {
      this.getStravaStats();
    }, this.config.updateInterval);
    this.getStravaStats(this.config.initialLoadDelay);
    var self = this;
  },

  notificationReceived: function () {},

  // getRefreshToken: function () {
  //   payload = {
  //     url: this.tokenUrl,
  //     clientId: this.config.clientId,
  //     clientSecret: this.config.clientSecret,
  //     refreshToken: this.config.refreshToken
  //   };
  //   this.sendSocketNotification("GET_REFRESH_TOKEN", payload);
  // },

  getStravaStats: function () {
    Log.info("Getting Strava stats: clientId:" + this.config.clientId + " clientSecret: " + this.config.clientSecret + " refreshToken: " + this.config.refreshToken);
    payload = {
      url: this.baseUrl,
      tokenUrl: this.tokenUrl,
      clientId: this.config.clientId,
      clientSecret: this.config.clientSecret,
      refreshToken: this.config.refreshToken,
      startTime: new Date(Date.now() - (8 * 24 * 60 * 60 * 1000)).getTime(),
      endTime: new Date(Date.now() - (1 * 24 * 60 * 60 * 1000)).getTime(),
    };
    this.sendSocketNotification("GET_STRAVA_STATS", payload);
  },

  filterStravaStats: function (data) {
    Log.info("Filtering Strava stats: " + data);
    this.stravaStats = data;    
  },

  // this gets data from node_helper
  socketNotificationReceived: function (notification, payload) {
    if (notification === "ACCESS_TOKEN_RESULT") {
      this.accessTokenData(payload);
    }
    if (notification === "STRAVA_STATS_RESULT") {
      filterStravaStats(payload);
    }
  },


  getStyles: function () {
    return "MMM-StravaWeekInBike.css";
  },

  getTemplate() {
    return "stravaWeekInBike.njk";
  },

  getTemplateData() {
    return {
      numberOfRides: 4,
      distance: 134.7,
      totalTime: "6 hours 34 minutes"
    };
  }
});
