
const path = require("node:path");
const fs = require("node:fs");
const NodeHelper = require("node_helper");
const axios = require("axios");
const Log = require("logger");

module.exports = NodeHelper.create({
	accessTokenData: {},

	start () {
		console.log(`Starting node_helper for: ${this.name}`);
	},

	async getAccessToken (payload) {
		try {
			let url = `${payload.tokenUrl}client_id=${payload.clientId}&client_secret=${payload.clientSecret}&refresh_token=${payload.refreshToken}&grant_type=refresh_token`;
			await axios
				.post(url)
				.then((response) => {
					try {
						const filePath = path.join(__dirname, "..", "strava_access_token.json");
						fs.writeFileSync(filePath, JSON.stringify(response.data));
					} catch (error) {
						this.xsendSocketNotification("LOG", `"MMM-StravaWeekInBike - Error writing to file strava_access_token.json: ${error}`);
					}
					this.accessTokenData = response.data;
				});
		} catch (error) {
			this.sendSocketNotification("LOG", `"MMM-StravaWeekInBike - GetAccessToken error: ${error}`);
			this.sendSocketNotification("ACCESS_TOKEN_ERROR", error);
		}
	},

	processData (data) {
		let totalDistance = 0;
		let totalElevation = 0;
		let totalMinutes = 0;
		let numberOfRides = 0;
		data.forEach((activity) => {
			if (activity.type === "Ride") {
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

	async getStravaStats (payload) {
		const filePath = path.join(__dirname, "..", "strava_access_token.json");
		let localAccessTokenData = {};
		try {
			if (fs.existsSync(filePath)) {
				let localAccessTokenFileData = await fs.promises.readFile(filePath);
				try {
					localAccessTokenData = JSON.parse(localAccessTokenFileData);
					if (localAccessTokenData.access_token && localAccessTokenData.expires_at < Math.floor(Date.now() / 1000)) {
						this.accessTokenData = localAccessTokenData;
					} else {
						await this.getAccessToken({ ...payload, refreshToken: localAccessTokenData.refresh_token });
					}
				} catch (parseError) {
					await this.getAccessToken(payload);
				}
			} else {
				await this.getAccessToken(payload);
			}

			let url
        = `${payload.url}athlete/activities?before=${payload.before}&after=${payload.after}`;

			await axios
				.get(url, {
					headers: {
						Authorization: `Bearer ${this.accessTokenData.access_token}`
					}
				})
				.then((response) => {
					const processedData = this.processData(response.data);
					return processedData;
				})
				.then((data) => {
					this.sendSocketNotification("STRAVA_STATS_RESULT", data);
				});
		} catch (error) {
			this.sendSocketNotification("LOG", `"MMM-StravaWeekInBike - Node helper getStravaStats - Error fetching data from API: ${error}`);
			return null;
		}
	},

	socketNotificationReceived (notification, payload) {
		if (notification === "GET_STRAVA_STATS") {
			this.getStravaStats(payload);
		}
	}
});
