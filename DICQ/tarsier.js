;
/*!
 * Tarsier JavaScript Library v1.0.1
 * http://github.com/moky/Tarsier/
 *
 * Copyright 2013 moKy at slanissue.com
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2013-12-11 T10:43Z
 */

/**
 *
 *  Base
 *
 *  Author: moKy @ Dec. 11, 2013
 *
 */

if (typeof(window.tarsier) !== "object") {
	window.tarsier = {
		version: "1.1.0"
	};
}

// base functions
!function(tarsier) {
	
	var alert = function(message) {
		message = "[Tarsier] base.js > " + message;
		if (typeof(tarsier.log) === "function") {
			tarsier.log(message);
		} else {
			window.alert(message);
		}
	};
	
	//--------------------------------------------------------------------- Task
	
	/**
	 *  class: Task
	 */
	var Task = function(args) {
		this.url = args.url;
		this.type = args.type;
		this.callback = args.callback;
		return this;
	};
	
	// finished current task
	var finished = function() {
		tarsier.base.importings.shift(); // remove current task
		if (tarsier.base.importings.length > 0) {
			tarsier.base.importings[0].run(); // run next task
		} else {
			tarsier.events.onload(); // all tasks finished
		}
		return this;
	};
	
	// import js
	var taskJS = function() {
		var task = this;
		var doc = task.document || window.document;
		
		var script = doc.createElement("script");
		if (script) {
			script.type = "text/javascript";
			script.src = task.url;
			script.async = task.async;
			script.charset = task.charset || "UTF-8";
			
			// callback
			script.onload = function() {
				try {
					if (task.callback) task.callback();
				} catch(e) {
					alert("callback error: " + e);
				}
				task.finished();
			};
			script.onreadystatechange = function() { // IE
				if (this.readyState === "complete") {
					script.onload();
				}
			};
			
			// load
			var head = doc.getElementsByTagName("head")[0] || doc.documentElement;
			if (head) {
				head.appendChild(script);
			}
		}
		return this;
	};
	
	// import css
	var taskCSS = function() {
		var task = this;
		var doc = task.document || window.document;
		
		var link = doc.createElement("link");
		if (link) {
			link.rel = "stylesheet";
			link.type = "text/css";
			link.href = task.url;
			
			// load
			var head = doc.getElementsByTagName("head")[0] || doc.documentElement;
			if (head) {
				head.appendChild(link);
			}
		}
		
		task.finished();
		return this;
	};
	
	// run a task
	var run = function() {
		if (this.type === "text/javascript") {
			this.js();
		} else if (this.type === "text/css") {
			this.css();
		} else {
			alert("task run: could not happen");
		}
		return this;
	};
	
	// check duplicated
	var isDuplicated = function() {
		for (var i = 0; i < tarsier.base.importings.length; ++i) {
			if (tarsier.base.importings[i].url === this.url) return true;
		}
		return false;
	};
	
	//------------------------------------------------------------------- events
	
	// window loaded & importing finished?
	var isReady = function() {
		return this.isWindowLoaded && tarsier.base.importings.length == 0;
	};
	
	// add handler for event name
	var addEvent = function(name, handler) {
		if (!name || !handler) return;
		if (name === "load" || name === "onload" || name === "ready") {
			this.handlers.onload[this.handlers.onload.length] = handler;
		} else {
			alert("unknown event: " + name + " handler: " + handler);
		}
		return this;
	};
	
	var onload = function() {
		if (this.isReady()) {
			var handler = null;
			while (handler = this.handlers.onload.shift()) {
				handler();
			}
		}
		return this;
	};
	
	//------------------------------------------------------------------ imports
	
	//
	// import something
	//
	var imports = function(args) {
		var task;
		var type = args.type;
		if (type === "text/javascript") {
			task = new this.Task({url: args.src,
								 type: "text/javascript",
								 charset: args.charset,
								 async: args.async,
								 callback: args.callback});
		} else if (type === "text/css") {
			task = new this.Task({url: args.href,
								 type: "text/css"});
		} else {
			alert("unknown import type: " + type);
			return this;
		}
		
		if (task.isDuplicated()) {
			alert("duplicated url: " + task.url);
			return this;
		}
		
		this.importings[this.importings.length] = task;
		if (this.importings.length == 1) {
			task.run();
		}
		return this;
	};
	
	/**
	 *  import javascript file
	 */
	var importJS = function(url, callback) {
		this.base.import({
						 src: url,
						 type: "text/javascript",
						 callback: callback
		});
		return this;
	};
	/**
	 *  import style sheet
	 */
	var importCSS = function(url) {
		this.base.import({
						 href: url,
						 type: "text/css"
		});
		return this;
	};
	
	/**
	 *  adding handler for 'onload' event
	 */
	var ready = function(func) {
		this.events.add("onload", func);
		return this;
	};
	
	//--------------------------------------------------------------------------
	
	//
	//  namespace: base
	//
	tarsier.base = {
		// importing tasks
		importings: [],
		
		import: imports,
	};
	
	tarsier.base.Task = Task;
	
	tarsier.base.Task.prototype.finished = finished;
	tarsier.base.Task.prototype.js = taskJS;
	tarsier.base.Task.prototype.css = taskCSS;
	tarsier.base.Task.prototype.run = run;
	tarsier.base.Task.prototype.isDuplicated = isDuplicated;
	
	//
	//  namespace: events
	//
	tarsier.events = {
		isWindowLoaded: false,
		handlers: {
			onload: [],
		},
		
		isReady: isReady,
		add: addEvent,
		onload: onload,
	};
	
	//
	//  others
	//
	tarsier.importJS = importJS;
	tarsier.importCSS = importCSS;
	tarsier.ready = ready;
	
	//
	//  onload
	//
	var window_onload = window.onload; // save old handler
	window.onload = function() {
		tarsier.events.isWindowLoaded = true;
		tarsier.events.onload();
		if (typeof(window_onload) === "function") {
			window_onload(); // call old handler
		}
	};
	
}(tarsier);
