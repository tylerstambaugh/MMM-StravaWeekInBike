/* MagicMirror²
 * Module: MMM-StravaWeekInBike
 *
 * By Tyler Stambaugh
 */
Module.register("MMM-StravaWeekInBike", {
  baseUrl: "https://www.strava.com/api/v3/",
  tokenUrl: "https://www.strava.com/oauth/token",
  accessTokenData: {},

  // Module config defaults.
  defaults: {
    clientSecret: "",
    clientId: "",
    refreshToken: "",
    header: "Loading Strava Stats!",
    maxWidth: "250px",
    animationSpeed: 3000, // fade in and out speed
    initialLoadDelay: 4250,
    retryDelay: 2500,
    updateInterval: 60 * 60 * 1000
  },

  init: function () {
    Log.log(this.name + " is in init!");
  },

  getStyles: function () {
    return ["MMM-StravaWeekInBike.css"];
  },

  getHeader: function () {
    return this.data.header + " Foo Bar";
  },

  start: function () {
    Log.info("Starting module: " + this.name);
    requiresVersion: "2.1.0", (this.stravaStats = []);
  },

  getDom: function () {
    var wrapper = document.createElement("div");
    wrapper.className = "title";
    wrapper.innerHTML = "Strava Week in Bike";
    return wrapper;
  },

  // this tells module when to update
  scheduleUpdate: function () {
    setInterval(() => {
      this.getUFO();
    }, this.config.updateInterval);
    this.getUFO(this.config.initialLoadDelay);
    var self = this;
  },

  notificationReceived: function () {},

  getRefreshToken: function () {
    payload = {
      url: this.tokenUrl,
      clientId: this.config.clientId,
      clientSecret: this.config.clientSecret,
      refreshToken: this.config.refreshToken
    };
    this.sendSocketNotification("GET_REFRESH_TOKEN", payload);
  },

  getStravaStats: function () {
    payload = {
      url: this.baseUrl,
      accessToken: this.accessTokenData.access_token,
      startTime: Date.now() - 604800000,
      endTime: Date.now()
    };
    this.sendSocketNotification("GET_STRAVA_STATS", payload);
  },

  // this gets data from node_helper
  socketNotificationReceived: function (notification, payload) {
    if (notification === "ACCESS_TOKEN_RESULT") {
      this.accessTokenData(payload);
    }
    if (notification === "STRAVA_STATS_RESULT") {
      this.stravaStats = payload;
    }
  }

  // getTemplate () {
  // 	return "stravaWeekInBike.njk";
  // },

  // getTemplateData () {
  // 	return this.config;
  // }
});
