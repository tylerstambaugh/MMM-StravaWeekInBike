/* MagicMirror²
 * Module: MMM-StravaWeekInBike
 *
 * By Tyler Stambaugh
 */
Module.register("MMM-StravaWeekInBike", {
  baseUrl: "https://www.strava.com/api/v3/",
  tokenUrl: "https://www.strava.com/oauth/token?",
  accessTokenError: {},
  stravaStats: {
    numberOfRides: 0,
    totalDistance: 0,    
    totalMinutes: 0,
    totalElevation: 0
  },

  // Module config defaults.
  defaults: {
    clientId: "",
    clientSecret: "",
    refreshToken: "",
    header: "Strava Week in Bike",
    numberOfDaysToQuery: 7,
    maxWidth: "250px",
    initialLoadDelay: 4250,
    retryDelay: 2500,
    updateInterval: 60 * 15 * 1000
  },

  init: function () {
    Log.log(this.name + " is in init!");
  },

  getHeader: function () {
    return this.config.header;
  },

  start: function () {
    Log.info("Starting module: " + this.name);
    requiresVersion: "2.1.0", (this.stravaStats = []), this.scheduleUpdate();
  },

  scheduleUpdate: function () {
    setInterval(() => {
      this.getStravaStats();
    }, this.config.updateInterval);
    this.getStravaStats(this.config.initialLoadDelay);
    var self = this;
  },

  notificationReceived: function () {},

  getStravaStats: function () {
    Log.info(
      "Getting Strava stats: clientId:" +
        this.config.clientId +
        " clientSecret: " +
        this.config.clientSecret +
        " refreshToken: " +
        this.config.refreshToken
    );
    payload = {
      url: this.baseUrl,
      tokenUrl: this.tokenUrl,
      clientId: this.config.clientId,
      clientSecret: this.config.clientSecret,
      refreshToken: this.config.refreshToken,
      numberOfDaysToQuery: this.config.numberOfDaysToQuery,
      after: Math.floor(
        new Date(Date.now() - this.config.numberOfDaysToQuery * 24 * 60 * 60 * 1000).getTime() / 1000
      ),
      before: Math.floor(
        new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).getTime() / 1000
      )
    };
    this.sendSocketNotification("GET_STRAVA_STATS", payload);
  },

  // this gets data from node_helper
  socketNotificationReceived: function (notification, payload) {
    if (notification === "ACCESS_TOKEN_ERROR") {
      this.accessTokenData(payload);
    }
    if (notification === "STRAVA_STATS_RESULT") {
      this.stravaStats = payload;
      this.updateDom();
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
      numberOfDaysToQuery: this.config.numberOfDaysToQuery,
      numberOfRides: this.stravaStats.numberOfRides,
      distance: this.stravaStats.totalDistance,
      totalTime: `${Math.floor(this.stravaStats.totalMinutes / 60)} hours ${this.stravaStats.totalMinutes % 60} minutes`,
      elevation: this.stravaStats.totalElevation,
      accessTokenError: this.accessTokenError
    };
  }
});
