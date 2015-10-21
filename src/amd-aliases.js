/*jshint node:true*/
/**
* Output (in un-escaped-markdown table format) aliases (and their counts) for every AMD module/package
* Usage: [<path>]*
*     where every <path> is path of file or directory (for recursive search)
* Sample: ./grasp.js ./amd-aliases.js ../test
*/

var pckg2aliasCount = {}; // map module/package to its aliases

var exceptions = /^(\.|app\/[^_])/; // ignore prefixes of local packages, i.e.: '.' and 'app/' except 'app/_'

require('./grasp')('Output aliases (and their counts) for every dojo module', function(ast) { // process AST of file
	"use strict";
	ast.query('call[callee=(#require, #define)]').forEach(function(amd) { // process every AMD
		// <require|define>(   [<packages>]   ,   function(<aliases>) { ... }  )

		// packages/modules of given AMD
		var packages = amd["arguments"][0]; // first argument of AMD: array of packages
		packages && (packages = packages.elements); // get elements of array

		// aliases of packages of given AMD:
		var aliases = amd["arguments"][1]; // second argument of AMD: callback (func-exp)
		aliases && (aliases = aliases.params); // get params of func-exp

		aliases && packages && packages.forEach(function(pckg, i) { // process packages
			if ((i < aliases.length) && !exceptions.test(pckg.value)) { // module has alias
				pckg = pckg.value.split('!')[0]; // ignore parameters of plugins
				var alias = aliases[i].name; // alias corresponding to package `pckg`
				var aliasCount = pckg2aliasCount[pckg] || (pckg2aliasCount[pckg] = {}); // take map of aliases->counts of given `pckg`
				aliasCount[alias] = (aliasCount[alias] || 0) + 1; // increase count of aliases
				console.error(pckg + '\t' + alias + '\t' + ast.file); // log <module> <alias> <file> to stderr
			}
		});

	});
});

console.log("| Dependency | Aliases |");
console.log("| ---------- | ------- |");

Object.keys(pckg2aliasCount).sort().forEach(function(pckg) {
	"use strict";

	var aliasCount = pckg2aliasCount[pckg];

	var list = Object.keys(aliasCount).sort().map(function(alias) {
		return alias + " (" + aliasCount[alias] + ")";
	}).join(', ');

	console.log("|", pckg, "|", list, "|");

});
