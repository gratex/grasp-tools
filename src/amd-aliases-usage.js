/*jshint node:true*/
/**
* Output (in un-escaped-markdown table format) aliases usage (and their counts) for every AMD module/package
* Usage: [<path>]*
*     where every <path> is path of file or directory (for recursive search)
* Sample: ./grasp.js ./amd-aliases-usage.js ../test
*/

var rql = require("rql/js-array");
var args = process.argv.slice(2);

// parse args
var displayUnusedOnly = false;
var displayMidNames = false;
var DELIM = "|";

args.forEach(function(a) {
	if (a == "--unused" || a == "-u") {
		displayUnusedOnly = true;
	} else if (a == "--names" || a == "-n") {
		displayMidNames = true;
	} else if (a[0] == "-") {
		console.error("Unknow option:", a);
		console.error("Usage: [--unused|-u] [--names|-n] [<path>]+");
		console.error("   --unused|-u - print only unused aliases");
		console.error("   --names|-a - print module name for alias");
		console.error("   where every <path> is either file or directory (for recursive searching)");
		process.exit(1);
		return;
	}
});

var paths = args.filter(function(a) {
	return a[0] != "-";
});

if (paths.length) {
	if (displayMidNames) {
		console.log(DELIM, "File", DELIM, "MID", DELIM, "Alias", DELIM, "Used Count", DELIM);
		console.log(DELIM, "----", DELIM, "---", DELIM, "-----", DELIM, "----------", DELIM);
	} else {
		console.log(DELIM, "File", DELIM, "Alias", DELIM, "Used Count", DELIM);
		console.log(DELIM, "----", DELIM, "-----", DELIM, "----------", DELIM);
	}
}

require('./grasp')('Output usage aliases (and their counts) for every dojo module', function(ast) { // process AST of file
	"use strict";
	// <require|define>(   [<packages>]   ,   function(<aliases>) { ... }  )
	ast.query('call[callee=(#require, #define)]').forEach(function(rd) {
		var mids = displayMidNames && rd.query('call.args:matches(arr).elements').map(function(mid) {
			return mid.value;
		});
		var aliasesFn = rd.query('call.args:last:matches(func-exp)'); // aliases, needs body and params

		if (aliasesFn.length) {
			var cnt, aliasFn = aliasesFn[0];
			var astQueryEngine = _createAstQueryEngine(aliasFn.body);

			aliasFn.params.forEach(function(alias, index) { // process aliases
				cnt = astQueryEngine(alias.name);
				if (displayUnusedOnly && cnt) {
					return;
				}

				// build output
				var parts = [
					ast.file
				];
				if (displayMidNames) {
					parts.push(mids[index]);
				}
				parts.push(alias.name, cnt);

				console.log(DELIM, parts.join(" " + DELIM + " "), DELIM);
			});
		}
	});
});

function _createAstQueryEngine(astBody) {
	"use strict";
	return function(aliasName) {
		// TODO: create this functions as custom operators for rql engine
		return rql.query("recurse()&eq(type,Identifier)&eq(name,$1)&distinct()", {
			parameters : [
				aliasName
			]
		}, astBody).length;
	};
}
