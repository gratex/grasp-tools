/*jshint node:true*/
var astQueryEngine = require("./lib/queryEngine/ast").requireOrDefine;
var rqlQueryEngine = require("./lib/queryEngine/rql");
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

var printer = output[args.json ? "jsonPrinter" : "tabularPrinter"]();
printer.header(args.names ? [
	"File",
	"Mid",
	"Alias",
	"Used Count"
] : [
	"File",
	"Alias",
	"Used Count"
]);

var files = args._ || [];
args.file && files.push(args.file);

aqueryWalker(files, findUnusedModules);

printer.flush();

function findUnusedModules(ast) { // process AST of file
	"use strict";
	// <require|define>(   [<packages>]   ,   function(<aliases>) { ... }  )
	astQueryEngine.call(ast).forEach(function(rd) {
		var mids = (args.names || args.grep) && astQueryEngine.args(rd).map(function(mid/*, a, x*/) {
			return {
				ast : mid,
				// ignore parameters of plugins
				name : (mid.value || "[DYNAMIC]").split('!')[0]
			};
		});
		var aliasesFn = astQueryEngine.aliases(rd); // aliases, needs body and params

		if (aliasesFn.length) {
			var cnt, aliasFn = aliasesFn[0];
			var usageQueryEngine = rqlQueryEngine.queryByIdentifier(aliasFn.body); // create query engine on AST

			aliasFn.params.forEach(function(alias, index) { // process aliases
				if (args.grep && !~mids[index].name.indexOf(args.grep)) { // TODO: move to astQueryEngine.args() query directly as parameter
					return;
				}
				cnt = usageQueryEngine(alias.name);
				if (args.unused && cnt) {
					return;
				}
				printer.append(args.names ? [
					ast.file,
					mids[index].name,
					alias.name,
					cnt
				] : [
					ast.file,
					alias.name,
					cnt
				]);
			});
		}
	});
}