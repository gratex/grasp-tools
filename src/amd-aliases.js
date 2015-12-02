/*jshint node:true*/
/**
* Output (in un-escaped-markdown table format) aliases (and their counts) for every AMD module/package
* Usage: [<path>]*
*     where every <path> is path of file or directory (for recursive search)
* Sample: ./lib/grasp.js ./amd-aliases.js ../test
*/
var astQueryEngine = require("./lib/queryEngine/ast").requireOrDefine;
var aqueryWalker = require("./lib/ast-query");
var output = require("./lib/output");
var options = require("./lib/options")(__filename);

var args = options.parse(process.argv);
//console.log(args);
//process.exit(1);

if (args.help || (!args.file && !args._.length)) {
	console.log(options.generateHelp());
	process.exit(1);
}

var printer = output.tabularPrinter();

var pckg2aliasCount = {}; // map module/package to its aliases
var exceptions = /^(\.|app\/[^_])/; // ignore prefixes of local packages, i.e.: '.' and 'app/' except 'app/_'

printer.header([
	"Dependency",
	"Aliases"
]);

aqueryWalker(args.file || args._, function(ast) { // process AST of file
	"use strict";
	astQueryEngine.call(ast).forEach(function(amd) { // process every AMD
		// <require|define>(   [<packages>]   ,   function(<aliases>) { ... }  )

		// packages/modules of given AMD
		var packages = astQueryEngine.args(amd); // first argument of AMD: array of packages

		// aliases of packages of given AMD:
		var aliases = astQueryEngine.aliases(amd); // second argument of AMD: callback (func-exp)
		aliases.length && (aliases = aliases[0].params); // get params of func-exp

		aliases && packages && packages.forEach(function(pckg, i) { // process packages
			if ((i < aliases.length) && !exceptions.test(pckg.value)) { // module has alias
				pckg = (pckg.value || "[DYNAMIC]").split('!')[0]; // ignore parameters of plugins
				var alias = aliases[i].name; // alias corresponding to package `pckg`
				var aliasCount = pckg2aliasCount[pckg] || (pckg2aliasCount[pckg] = {}); // take map of aliases->counts of given `pckg`
				aliasCount[alias] = (aliasCount[alias] || 0) + 1; // increase count of aliases
				console.error(pckg + '\t' + alias + '\t' + ast.file); // log <module> <alias> <file> to stderr
			}
		});
	});
});

Object.keys(pckg2aliasCount).sort().forEach(function(pckg) {
	"use strict";
	var aliasCount = pckg2aliasCount[pckg];
	printer.append([
		pckg,
		Object.keys(aliasCount).sort().map(function(alias) {
			return alias + " (" + aliasCount[alias] + ")";
		}).join(', ')
	]);
});

printer.flush();
