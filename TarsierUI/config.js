;
/*!
 * Tarsier JavaScript Library v1.1.0
 * http://github.com/moky/Tarsier/
 *
 * Copyright 2014 moKy at slanissue.com
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2014-03-11 T11:45Z
 */

var tarsier = tarsier || {};

!function(tarsier) {
	'use strict';
	
	var dir = 'http://moky.github.io/Tarsier/';
	
	/*
	
	// 3rd remote
	var remotes = [
		"http://code.jquery.com/jquery.min.js",
		"http://borismoore.github.io/jquery-tmpl/jquery.tmpl.min.js",
		"http://jquery-xml2json-plugin.googlecode.com/svn/trunk/jquery.xml2json.js",
//		"http://steamdev.com/snippet/js/jquery.snippet.min.js",
//		"http://steamdev.com/snippet/css/jquery.snippet.min.css",
//		"http://jeromeetienne.github.io/jquery-qrcode/jquery.qrcode.min.js",
	];
	// 3rd local
	var libs = [
		"3rd/jquery.min.js",
		"3rd/jquery.tmpl.min.js",
		"3rd/jquery.xml2json.js",
//		"3rd/jquery.snippet.min.js",
//		"3rd/jquery.snippet.min.css",
//		"3rd/jquery.qrcode.min.js",
	];
	 
	 */
	
	// lib files
	var files = [
		"src/base.js",
		"src/log.js",
		"src/object.js",
		"src/number.js",
		"src/integer.js",
		"src/math.js",
		"src/string.js",
		"src/string.utf.js",
		"src/string.gb2312.js",
		"src/string.base64.js",
		"src/xml.js",
		"src/http.js",
		"src/template.js",
		"src/widget.js",
	];
	
	var getFiles = function(files, root) {
		// files
		var files = arguments.length > 0 ? files : this.files;
		if (!files) {
			return [];
		}
		// base dir
		var dir = arguments.length > 0 ? root : this.root;
		if (!dir) {
			return files;
		}
		
		if (dir.charAt(dir.length - 1) != '/') {
			dir += '/';
		}
		// out
		var array = [];
		var len = files.length;
		for (var i = 0; i < len; ++i) {
			array.push(dir + files[i]);
		}
		return array;
	};
	
	tarsier.config = {
		root: dir,
		files: files,
		getFiles: getFiles,
	};
	
}(tarsier);
