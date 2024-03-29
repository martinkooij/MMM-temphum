'use strict';

/* Magic Mirror
 *
 * MIT Licensed.
 */

const NodeHelper = require('node_helper');


module.exports = NodeHelper.create({

	start: function() {
		this.started = true;
		this.config = null;
	},

	/*
	 * Requests new data from openov.nl.
	 * Calls processBusTimes on succesfull response.
	 */
	getData: function() {
		var self = this;
		
/*		var rainfcUrl = this.config.apiBase + "/" + this.config.rainfcEndpoint + "?lat=" + this.config.lat + "&lon="+ this.config.lon;
//		console.log(self.name + ": loading rain forecast for : " + rainfcUrl);
				
		request({
			url: rainfcUrl,
			method: 'GET',
		}, function (error, response, body) {
        		// This is test data just to see the graph if there is no rain
        		//body=   "077|10:05\n034|10:10\n101|10:15\n087|10:20\n"+
		//		"077|10:25\n020|10:30\n000|10:35\n000|10:40\n"+
		//		"077|10:45\n087|10:50\n087|10:55\n127|11:00\n"+
		//		"137|11:05\n034|11:10\n170|11:15\n000|11:20\n"+
		//		"000|11:25\n000|11:30\n000|11:35\n000|11:40\n"+
		//		"010|11:45\n020|11:50\n030|11:55\n043|12:00\n";
        		// This is test data just to see how the code handles a incomplete reciept
        		//body=   "077|10:05\n034|10:10\n101|10:15\n087|10:20\n"+
	//			"077|10:25\n020|10:30\n000|10:35\n000|10:40\n"+
		//		"077|10:45\n087|10:50\n087|10:55\n127|11:00\n";
			//console.log(self.name + ": rain forecast data: " + body);
			
			if (!error && response.statusCode == 200) {
				if (!body || body=="") console.log(self.name + body + response.headers);
				//self.mayhem--;
				//if (self.mayhem<0 && self.mayhem>-5) { body=null };
				self.sendSocketNotification("DATA", body);
			} else {
				error = "No forecast connection, will retry";
				console.log(self.name + error);
				self.sendSocketNotification("ERROR", error);
			}
		});
		*/
		self.sendSocketNotification("HERE_IT_COMES", "Hello World")
		setTimeout(function() { self.getData(); }, 30000);
	},

	socketNotificationReceived: function(notification, payload) {
		var self = this;
		if (notification === 'START') {
//			self.config = payload;
//			self.sendSocketNotification("STARTED", true);
			self.getData();
//			self.started = true;
//			console.log(self.name + ": configured");
			//self.mayhem=2;
		}
	}
});
