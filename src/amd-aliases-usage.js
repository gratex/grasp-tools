/*jshint node:true*/
/**
* Output (in un-escaped-markdown table format) aliases usage (and their counts) for every AMD module/package
* Usage: [<path>]*
*     where every <path> is path of file or directory (for recursive search)
* Sample: ./grasp.js ./amd-aliases-usage.js ../test
*/

var aliasUsage = {}; // map module/package to its aliases
var rql = require("rql/js-array");

require('./grasp')('Output usage aliases (and their counts) for every dojo module', function(ast) { // process AST of file
	"use strict";
	ast.query('call[callee=(#require, #define)]').forEach(function(rd) { // process every AMD
		// <require|define>(   [<packages>]   ,   function(<aliases>) { ... }  )

		var mids = rd.query('call.args:matches(arr).elements').map(function(mid) {
			return mid.value;
		});
		var aliasesFn = rd.query('call.args:last:matches(func-exp)'); // aliases, needs body and params

		if (aliasesFn.length) {
			var aliasFn = aliasesFn[0];
			var astQueryEngine = _createAstQueryEngine(aliasFn.body);

			aliasFn.params.forEach(function(alias, index) { // process aliases
				aliasUsage[ast.file + " | " + mids[index] + " | " + alias.name] = astQueryEngine(alias.name);
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

console.log("| File | MID | Alias | Used Count |");
console.log("| ---- | --- | ----- | ---------- |");

Object.keys(aliasUsage).forEach(function(alias) {
	"use strict";
	console.log("|", alias, "|", aliasUsage[alias], "|");
});
