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
		minutes: 0,
		hours: 0,
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
		updateInterval: 60 * 15 * 1000,
		loading: true
	},

	init () {
		this.stravaStats = {};
	},

	getHeader () {
		return this.config.header || "Strava Week In Bike";
	},

	start () {
		Log.info(`Starting module: ${this.name}`);
		this.stravaStats = {};
		this.scheduleUpdate();
	},

	scheduleUpdate () {
		setInterval(() => {
			this.getStravaStats();
		}, this.config.updateInterval);
		this.getStravaStats(this.config.initialLoadDelay);
		var self = this;
	},

	notificationReceived () {},

	getStravaStats () {
		let payload = {
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
				new Date(Date.now() - 1 * 2 * 60 * 60 * 1000).getTime() / 1000
			)
		};
		this.sendSocketNotification("GET_STRAVA_STATS", payload);
	},

	// this gets data from node_helper
	socketNotificationReceived (notification, payload) {
		if (notification === "LOG") {
			Log.info("NodeHelper log:", payload);
		}
		if (notification === "ACCESS_TOKEN_ERROR") {
			this.accessTokenError = payload;
		}
		if (notification === "STRAVA_STATS_RESULT") {
			this.loading = true;
			this.stravaStats = payload;
			this.loading = false;
			this.updateDom();
		}
	},

	getStyles () {
		return ["font-awesome.css", "MMM-StravaWeekInBike.css"];
	},

	getTemplate () {
		return "MMM-StravaWeekInBike.njk";
	},

	getTemplateData () {
		return {
			numberOfDaysToQuery: this.config.numberOfDaysToQuery,
			numberOfRides: this.stravaStats.numberOfRides,
			distance: this.stravaStats.totalDistance,
			totalTime: `${Math.floor(this.stravaStats.totalMinutes / 60)} hours ${this.stravaStats.totalMinutes % 60} minutes`,
			minutes: this.stravaStats.minutes,
			hours: this.stravaStats.hours,
			elevation: this.stravaStats.totalElevation,
			accessTokenError: this.accessTokenError,
			loading: this.loading
		};
	}
});
