/*jshint node:true*/
var acorn = require("acorn");
var squery = require('grasp-squery');
// var equery = require('grasp-equery');
var clc = require('cli-color');
var fs = require('fs');
var path = require('path');

var astquery = function(p, cb) {
	"use strict";
	var code, ast;
	if (fs.lstatSync(p).isDirectory()) {
		fs.readdirSync(p).forEach(function(name) {
			astquery(path.join(p, name), cb);
		});
	} else if (/\.js$/.test(p)) {
		try {
			// get code without shebang
			code = fs.readFileSync(p).toString().replace(/^#!.*/, '');
			// parse code to ast object
			ast = acorn.parse(code);
			// process ast
			cb(set(ast), code);
		} catch (err) {
			// log error msg and name of file where error occured
			console.error(clc.red('ERROR:'), clc.magenta(p), err.stack);
		}
	}

	function query(selector) {
		/*jshint validthis:true */
		return squery.query(selector, this).map(set);
	}

	function set(x) {
		x.query = query;
		x.file = p;
		return x;
	}
};

module.exports = function(paths, cb) {
	if (typeof paths == "string") {
		astquery(paths, cb);
	} else {
		paths.forEach(function(p) {
			astquery(p, cb);
		});
	}
};
