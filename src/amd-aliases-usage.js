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
	ast.query('call[callee=(#require, #define)].args:last:matches(func-exp)').forEach(function(fncExp) { // process every AMD
		// <require|define>(   [<packages>]   ,   function(<aliases>) { ... }  )

		// aliases of packages of given AMD:
		var aliases = fncExp.params;

		var an, astQueryEngine = _createAstQueryEngine(fncExp.body);
		aliases && aliases.forEach(function(alias) { // process packages
			an = alias.name;
			aliasUsage[ast.file + " | " + an] = astQueryEngine(an);
		});
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

console.log("| File | Alias | Used Count |");
console.log("| ---- | ----- | ---- |");

Object.keys(aliasUsage).forEach(function(alias) {
	"use strict";
	console.log("|", alias, "|", aliasUsage[alias], "|");

});
