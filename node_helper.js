
const path = require("node:path");
const fs = require("node:fs");
const NodeHelper = require("node_helper");
const axios = require("axios");

module.exports = NodeHelper.create({
	accessTokenData: {},

	start () {
		console.log(`Starting node_helper for: ${this.name}`);
	},

    async getAccessToken(payload) {
        try {
            const url = `${payload.tokenUrl}client_id=${payload.clientId}&client_secret=${payload.clientSecret}&refresh_token=${payload.refreshToken}&grant_type=refresh_token`;
            const response = await axios.post(url);
            const filePath = path.join(__dirname, "..", "strava_access_token.json");

            try {
                fs.writeFileSync(filePath, JSON.stringify(response.data));
            } catch (error) {
                this.sendSocketNotification(
                    "LOG",
                    `Error writing access token file: ${error}`
                );
            }

            this.accessTokenData = response.data;
        } catch (error) {
            this.sendSocketNotification(
                "LOG",
                `Error fetching access token from API: ${error}`
            );
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

async getStravaStats(payload, retry = true) {
    const filePath = path.join(__dirname, "..", "strava_access_token.json");

    try {
        // Load local token if exists
        if (fs.existsSync(filePath)) {
            const localAccessTokenFileData = await fs.promises.readFile(filePath);
            const localAccessTokenData = JSON.parse(localAccessTokenFileData);

            if (
                localAccessTokenData.access_token &&
                localAccessTokenData.expires_at > Math.floor(Date.now() / 1000)
            ) {
                this.accessTokenData = localAccessTokenData;
            } else {
                await this.getAccessToken({
                    ...payload,
                    refreshToken: localAccessTokenData.refresh_token
                });
            }
        } else {
            await this.getAccessToken(payload);
        }

        // Fetch Strava activities
        const url = `${payload.url}athlete/activities?before=${payload.before}&after=${payload.after}`;
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${this.accessTokenData.access_token}`
            }
        });

        const processedData = this.processData(response.data);
        this.sendSocketNotification("STRAVA_STATS_RESULT", processedData);
    } catch (error) {
        if (error.response && error.response.status === 401) {
            if (retry) {
                // Only retry once
                this.sendSocketNotification(
                    "LOG",
                    "Access token expired, fetching new token..."
                );
                await this.getAccessToken(payload);
                await this.getStravaData(payload, false); // retry = false
            } else {
                this.sendSocketNotification(
                    "LOG",
                    "Access token invalid after refresh, giving up."
                );
                this.sendSocketNotification("ACCESS_TOKEN_ERROR", error);
            }
        } else {
            this.sendSocketNotification(
                "LOG",
                `Error fetching data from Strava API: ${error}`
            );
        }
    }
},

	socketNotificationReceived (notification, payload) {
		if (notification === "GET_STRAVA_STATS") {
			this.getStravaStats(payload);
		}
	}
});
