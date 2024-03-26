/* MagicMirror²
 * Module: MMM-StravaWeekInBike
 *
 * By Tyler Stambaugh
 */
Module.register("MMM-StravaWeekInBike", {
	
    // Module config defaults.
    defaults: {
        useHeader: true, // false if you don't want a header
        header: "Loading Strava Stats!", // Any text you want
        maxWidth: "250px",        
        animationSpeed: 3000, // fade in and out speed
        initialLoadDelay: 4250,
        retryDelay: 2500,
        updateInterval: 60 * 60 * 1000,
    },

    getStyles: function() {
        return ["MMM-StravaWeekInBike.css"];
    },
	start: function() {
        Log.info("Starting module: " + this.name);

        requiresVersion: "2.1.0",

        // Set locale.
        this.baseUrl = "https://www.strava.com/api/v3/";
		this.tokenUrl = "https://www.strava.com/api/v3/";
		this.accessToken = ""
		this.refreshToken = ""
        this.stravaStats = [];
        this.activeItem = 0;         // <-- starts rotation at item 0 (see Rotation below)
        this.rotateInterval = null;  // <-- sets rotation time (see below)
        this.scheduleUpdate();       // <-- When the module updates (see below)
    },
  getDom: function() {
	var element = document.createElement("div")
	element.className = "title"
	element.innerHTML = "Strava Week in Bike" + this.config.foo
	return element
  },
  notificationReceived: function() {},
  socketNotificationReceived: function() {},

  	// this asks node_helper for data
	  getRefreshToken: function() { 
        this.sendSocketNotification('GET_REFRESH_TOKEN', this.url);
    },

	// getTemplate () {
	// 	return "stravaWeekInBike.njk";
	// },

	// getTemplateData () {
	// 	return this.config;
	// }
});
