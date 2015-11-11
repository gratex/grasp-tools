/*jshint node:true*/
/**
* @author stakac 2014/08/05
  usage example:

		require('./grasp')(function(ast, log){
			// simplest version:
			ast.query('return').forEach(log);
			// or custon callback:
			ast.query('return').forEach(function(ast) {
				if (ast.qurey('func-exp').length) ast.log("func-exp in return");
			});
		});
*/
var acorn = require("acorn");
var squery = require('grasp-squery');
// var equery = require('grasp-equery');
var clc = require('cli-color');
var fs = require('fs');
var path = require('path');

module.exports = function(description, cb) {
	"use strict";

	if (typeof description !== 'string') {
		cb = description;
		description = null;
	}

	var args = process.argv.slice(2);
	var paths = args.filter(function(a) {
		return a[0] != "-";
	});

	if (!paths.length) {
		description && console.error(description);
		console.error("Usage: [<path>]+");
		console.error("   where every <path> is either file or directory (for recursive searching)");
		console.error("Sample: ./grasp.js");
		console.error("Sample: . ../test");
		process.exit(1);
	}

	paths.forEach(walker);

	function walker(p) {
		var code, ast;
		if (fs.lstatSync(p).isDirectory()) {
			fs.readdirSync(p).forEach(function(name) {
				walker(path.join(p, name));
			});
		} else if (/\.js$/.test(p)) {

			try {
				// get code without shebang
				code = fs.readFileSync(p).toString().replace(/^#!.*/, '');
				// parse code to ast object
				ast = acorn.parse(code);
				// process ast
				cb(set(ast), logOne);

			} catch (err) {
				// log error msg and name of file where error occured
				console.error(clc.red('ERROR:'), clc.magenta(p), err.stack);
			}

		}

		function logOne(ast, msg) { // write colored: filename:start-end:(count)
			if (!ast || (typeof ast !== 'object')) {
				/*jshint validthis:true */
				msg = ast;
				ast = this;
			}
			var start = code.substr(0, ast.start).split('\n');
			// select part of code from `start` to `end`
			var selectedPart = code.substring(ast.start, ast.end);
			var end = start.length + selectedPart.split('\n').length - 1;
			console.log(clc.magenta(p) + clc.cyan(":") + clc.green(start.length + "-" + end) + clc.cyan(":(multiline):")); //(msg ? "(" + msg + ")" : ""))
			// write selected part of code in red bold
			console.log(start.pop() + clc.red.bold(selectedPart) + code.substring(ast.end).split(/[\r\n]/)[0]);
		}

		function logArray(cb) {
			var result;
			/*jshint validthis:true */
			this.forEach(function(item){
				result = cb(item);
				if (result) {
					logOne(typeof result === 'object' ? result : item);
				}
			});
		}

		function query(selector) {
			/*jshint validthis:true */
			var list = squery.query(selector, this).map(set);
			list.log = logArray;
			return list;
		}

		function set(x) {
			x.log = logOne;
			x.query = query;
			x.file = p;
			return x;
		}

	}

};
