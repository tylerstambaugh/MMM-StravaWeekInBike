/* MagicMirror²
 * Module: MMM-StravaWeekInBike
 *
 * By Tyler Stambaugh
 */
Module.register("MMM-StravaWeekInBike", {
	
defaults: {
	foo: "Breaker breaker 1-9, this is the MMM-StravaWeekInBike module!"
},
  start: function () {},
  getDom: function() {
	var element = document.createElement("div")
	element.className = "title"
	element.innerHTML = "Strava Week in Bike" + this.config.foo
	return element
  },
  notificationReceived: function() {},
  socketNotificationReceived: function() {},

	// getTemplate () {
	// 	return "stravaWeekInBike.njk";
	// },

	// getTemplateData () {
	// 	return this.config;
	// }
});
