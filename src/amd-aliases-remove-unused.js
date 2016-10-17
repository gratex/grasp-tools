/*jshint node:true*/
var fs = require('fs');
var astQueryEngine = require("./lib/queryEngine/ast").requireOrDefine;
var rqlQueryEngine = require("./lib/queryEngine/rql");
var aqueryWalker = require("./lib/ast-query");
var options = require("./lib/options")(__filename);

var args = options.parse(process.argv);
//console.log(args);
//process.exit(1);

if (args.help || (!args.file && !args._.length)) {
	console.log(options.generateHelp());
	process.exit(1);
}

var files = args._ || [];
args.file && files.push(args.file);

aqueryWalker(files, removeUnusedModules);

function removeUnusedModules(ast, code) { // process AST of file
	"use strict";
	// <require|define>(   [<packages>]   ,   function(<aliases>) { ... }  )
	astQueryEngine.call(ast).forEach(function(rd) {
		var mids = astQueryEngine.args(rd).map(function(mid/*, a, x*/) {
			return {
				ast : mid,
				// ignore parameters of plugins
				name : (mid.value || "[DYNAMIC]").split('!')[0]
			};
		});
		var aliasesFn = astQueryEngine.aliases(rd); // aliases, needs body and params
		var c = 0, min = code.length, max = 0, processOutput = false;

		if (aliasesFn.length) {
			var aliasFn = aliasesFn[0];
			var usageQueryEngine = rqlQueryEngine.queryByIdentifier(aliasFn.body); // create query engine on AST

			aliasFn.params.forEach(function(alias, index) { // process MID before aliases
				if (!usageQueryEngine(alias.name)) {
					_removePartOfCode(mids[index].ast);
					processOutput = true;
				}
			});

			aliasFn.params.forEach(function(alias) { // process aliases
				if (!usageQueryEngine(alias.name)) {
					_removePartOfCode(alias);
					processOutput = true;
				}
			});

			if (processOutput) {
				if (args.inPlace) {
					fs.writeFileSync(ast.file, code);
				} else {
					console.log(code);
				}
			}
		}

		function _removePartOfCode(astNode) {
			var start = astNode.start - c, end = astNode.end - c;
			var commaRemoved = false;

			while(code[start - 1] === ","
				|| code[start - 1] === " "
				|| code[start - 1] === "\t"
				|| code[start - 1].match(/^$/m)) { // trim left
				start--;
				commaRemoved = code[start] === ",";
			}
			if (!commaRemoved) {
					while(code[end] === ","
						|| code[end] === " ") { // trim right
						end++;
					}
			}
			if (min > start) {
				min = start;
			}
			if (max < end) {
				max = end;
			}
			code = code.substring(0, start) + code.substring(end);
			c += end - start;
		}
	});
}