/* MagicMirror²
 * Module: MMM-StravaWeekInBike
 *
 * By Tyler Stambaugh
 */
Module.register("MMM-StravaWeekInBike", {
  baseUrl: "https://www.strava.com/api/v3/",
  tokenUrl: "https://www.strava.com/oauth/token",
  // Module config defaults.
  defaults: {
    clientSecret: "", // Your Strava client secret
    clientId: "", // Your Strava client ID
    refreshToken: "", // Your Strava refresh token
    header: "Loading Strava Stats!", // Any text you want
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

  // only called if the module header was configured in module config in config.js
  getHeader: function () {
    return this.data.header + " Foo Bar";
  },

  start: function () {
    Log.info("Starting module: " + this.name);

    requiresVersion: "2.1.0", (this.refreshToken = this.config.refreshToken);
    this.stravaStats = [];
    // this.activeItem = 0;         // <-- starts rotation at item 0 (see Rotation below)
    // this.rotateInterval = null;  // <-- sets rotation time (see below)
    // this.scheduleUpdate();       // <-- When the module updates (see below)
  },

  getDom: function () {
    var element = document.createElement("div");
    element.className = "title";
    element.innerHTML = "Strava Week in Bike" + this.config.foo;
    return element;
  },
  notificationReceived: function () {},
  socketNotificationReceived: function () {},

  // this asks node_helper for data
  getRefreshToken: function () {
    this.sendSocketNotification("GET_REFRESH_TOKEN", this.url);
  }

  // getTemplate () {
  // 	return "stravaWeekInBike.njk";
  // },

  // getTemplateData () {
  // 	return this.config;
  // }
});
