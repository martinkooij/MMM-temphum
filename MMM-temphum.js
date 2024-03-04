
/*********************************

  Magic Mirror Module: 
  MMM-temphum

  MIT Licensed
 
*********************************/

Module.register('MMM-temphum', {

  defaults: {
    
  },

  // Define required scripts.
  getScripts: function() {
    return [this.file("node_modules/canvas-gauges/gauge.min.js")];
  },
  
  // Define required styles.
 // getStyles: function () {
 //   return ["MMM-MyCommute.css", "font-awesome.css"];
 // },

 

  start: function() {

    Log.info('Starting module: ' + this.name);

    this.loading = true;
    this.inWindow = true;
    this.isHidden = false;

    //start data poll
 //   this.getData();
 //   var self = this;
 //   setInterval(function() {
 //     self.getData();
  //  }, this.config.pollFrequency);
   	this.sendSocketNotification('START', "Hello World");
      
  },

  /*
    function isInWindow()

    @param start
      STRING display start time in 24 hour format e.g.: 06:00

    @param end
      STRING display end time in 24 hour format e.g.: 10:00

    @param hideDays
      ARRAY of numbers representing days of the week during which
      this tested item shall not be displayed.  Sun = 0, Sat = 6
      e.g.: [3,4] to hide the module on Wed & Thurs

    returns TRUE if current time is within start and end AND
    today is not in the list of days to hide.

  */
 
/* isInWindow: function(start, end, hideDays) {

    var now = moment();
    var startTimeSplit = start.split(":");
    var endTimeSplit = end.split(":");
    var startTime = moment().hour(startTimeSplit[0]).minute(startTimeSplit[1]);
    var endTime = moment().hour(endTimeSplit[0]).minute(endTimeSplit[1]);

    if ( now.isBefore(startTime) || now.isAfter(endTime) ) {
      return false;
    } else if ( hideDays.indexOf( now.day() ) != -1) {
      return false;
    }

    return true;
  },

  getData: function() {

    //only poll if in window
    if ( this.isInWindow( this.config.startTime, this.config.endTime, this.config.hideDays ) ) {
      //build URLs
      var destinations = new Array();
      for(var i = 0; i < this.config.destinations.length; i++) {

        var d = this.config.destinations[i];

        var destStartTime = d.startTime || '00:00';
        var destEndTime = d.endTime || '23:59';
        var destHideDays = d.hideDays || [];

        if ( this.isInWindow( destStartTime, destEndTime, destHideDays ) ) {
          var url = 'https://maps.googleapis.com/maps/api/directions/json' + this.getParams(d);
          destinations.push({ url:url, config: d});
          console.log(url);          
        }

      }
      this.inWindow = true;

      if (destinations.length > 0) {        
        this.sendSocketNotification("GOOGLE_TRAFFIC_GET", {destinations: destinations, instanceId: this.identifier});
      } else {
        this.hide(1000, {lockString: this.identifier});
		this.sendNotification('SET_LCD_BACKLIGHT', {command: -1}  ); // remove module backlighting		
        this.inWindow = false;
        this.isHidden = true;
      }

    } else {

      this.hide(1000, {lockString: this.identifier});
	  this.sendNotification('SET_LCD_BACKLIGHT', {command: -1}  ); // remove module backlighting		
      this.inWindow = false;
      this.isHidden = true;
    }

  },

  getParams: function(dest) {

    var params = '?';
    params += 'origin=' + encodeURIComponent(this.config.origin);
    params += '&destination=' + encodeURIComponent(dest.destination);
    params += '&key=' + this.config.apikey;

    //travel mode
    var mode = 'driving';
    if (dest.mode && this.travelModes.indexOf(dest.mode) != -1) {
      mode = dest.mode;
    } 
    params += '&mode=' + mode;

    //transit mode if travelMode = 'transit'
    if (mode == 'transit' && dest.transitMode) {
      var tModes = dest.transitMode.split("|");
      var sanitizedTransitModes = '';
      for (var i = 0; i < tModes.length; i++) {
        if (this.transitModes.indexOf(tModes[i]) != -1) {
          sanitizedTransitModes += (sanitizedTransitModes == '' ? tModes[i] : "|" + tModes[i]);
        }
      }
      if (sanitizedTransitModes.length > 0) {
        params += '&transit_mode=' + sanitizedTransitModes;
      }
    } 
    if (dest.alternatives == true) {
      params += '&alternatives=true';
    }

    if (dest.waypoints) {
      var waypoints = dest.waypoints.split("|");
      for (var i = 0; i < waypoints.length; i++) {
        waypoints[i] = "via:" + encodeURIComponent(waypoints[i]);
      }
      params += '&waypoints=' + waypoints.join("|");
    } 

    //avoid
    if (dest.avoid) {
      var a = dest.avoid.split("|");
      var sanitizedAvoidOptions = '';
      for (var i = 0; i < a.length; i++) {
        if (this.avoidOptions.indexOf(a[i]) != -1) {
          sanitizedAvoidOptions += (sanitizedAvoidOptions == '' ? a[i] : "|" + a[i]);
        }
      }
      if (sanitizedAvoidOptions.length > 0) {
        params += '&avoid=' + sanitizedAvoidOptions;
      }

    }

    params += '&departure_time=now'; //needed for time based on traffic conditions

    return params;

  },  

  svgIconFactory: function(glyph) {

    var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttributeNS(null, "class", "transit-mode-icon");
    var use = document.createElementNS('http://www.w3.org/2000/svg', "use");
    use.setAttributeNS("http://www.w3.org/1999/xlink", "href", "modules/MMM-MyCommute/icon_sprite.svg#" + glyph);
    svg.appendChild(use);
    
    return(svg);
  },

  formatTime: function(time, timeInTraffic) {

    var timeEl = document.createElement("span");
	var trafficStatus = 0 ; //0 = good, 1 = moderate, 2 = poor
    timeEl.classList.add("travel-time");
    if (timeInTraffic != null) {
      timeEl.innerHTML = moment.duration(Number(timeInTraffic), "seconds").format(this.config.travelTimeFormat, {trim: this.config.travelTimeFormatTrim});

      var variance = timeInTraffic / time;
      if (variance > this.config.poorTimeThreshold) {
          if (this.config.colorCodeTravelTime) { timeEl.classList.add("status-poor");};
		  trafficStatus = 2;
      } else if (variance > this.config.moderateTimeThreshold) {
          if (this.config.colorCodeTravelTime) {timeEl.classList.add("status-moderate");};
		  trafficStatus = 1 ;
      } else {
          timeEl.classList.add("status-good");
		  trafficStatus = 0 ;
      }
   

    } else {
      timeEl.innerHTML = moment.duration(Number(time), "seconds").format(this.config.travelTimeFormat, {trim: this.config.travelTimeFormatTrim});
      timeEl.classList.add("status-good");
	  trafficStatus = 0 ;
    }

    return [timeEl,trafficStatus];

  },

  getTransitIcon: function(dest, route) {

    var transitIcon;

    if (dest.transitMode) {
      var transitIcon = dest.transitMode.split("|")[0];
      if (this.symbols[transitIcon] != null) {
        transitIcon = this.symbols[transitIcon];
      } else {
        transitIcon = this.symbols[route.transitInfo[0].vehicle.toLowerCase()];
      }
    } else {
      transitIcon = this.symbols[route.transitInfo[0].vehicle.toLowerCase()];
    }

    return transitIcon;

  },

  buildTransitSummary: function(transitInfo, summaryContainer) {

    for (var i = 0; i < transitInfo.length; i++) {    

      var transitLeg = document.createElement("span");
        transitLeg.classList.add('transit-leg');
        transitLeg.appendChild(this.svgIconFactory(this.symbols[transitInfo[i].vehicle.toLowerCase()]));

      var routeNumber = document.createElement("span");
        routeNumber.innerHTML = transitInfo[i].routeLabel;

      if (transitInfo[i].arrivalTime) {
        routeNumber.innerHTML = routeNumber.innerHTML + " (" + moment(transitInfo[i].arrivalTime).format(this.config.nextTransitVehicleDepartureFormat) + ")";
      }

      transitLeg.appendChild(routeNumber);
      summaryContainer.appendChild(transitLeg);
    }

  },
*/

  getDom: function() {

    var wrapper = document.createElement("div");
    
   /* if (this.loading) {
      var loading = document.createElement("div");
        loading.innerHTML = this.translate("LOADING");
        loading.className = "dimmed light small";
        wrapper.appendChild(loading);
      return wrapper
    }
     */
	 
	var dial = `
	<canvas data-type="radial-gauge" 
        data-width="400"  
        data-height="400" 
        data-units="Km/h" 
        data-title="false"
        data-value="0"
        data-min-value="0"
        data-max-value="220"
        data-major-ticks="0,20,40,60,80,100,120,140,160,180,200,220"
        data-minor-ticks="2"
        data-stroke-ticks="false"
        data-highlights='[
            { "from": 0, "to": 50, "color": "rgba(0,255,0,.15)" },
            { "from": 50, "to": 100, "color": "rgba(255,255,0,.15)" },
            { "from": 100, "to": 150, "color": "rgba(255,30,0,.25)" },
            { "from": 150, "to": 200, "color": "rgba(255,0,225,.25)" },
            { "from": 200, "to": 220, "color": "rgba(0,0,255,.25)" }
        ]'
        data-color-plate="#222"
        data-color-major-ticks="#f5f5f5"
        data-color-minor-ticks="#ddd"
        data-color-title="#fff"
        data-color-units="#ccc"
        data-color-numbers="#eee"
        data-color-needle-start="rgba(240, 128, 128, 1)"
        data-color-needle-end="rgba(255, 160, 122, .9)"
        data-value-box="true"
        data-animation-rule="bounce"
        data-animation-duration="500"
        data-font-value="Led"
        data-animated-value="true"
></canvas>
	`
	    var temphumshow = document.createElement("div");
        loading.innerHTML = dial
        wrapper.appendChild(loading);
	
    return wrapper;
  },
  
  socketNotificationReceived: function(notification, payload) {
        this.updateDom();
  },

});