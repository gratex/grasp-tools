/*jshint node:true*/
var version = "0.0.1";
var astQueryEngine = require("./lib/queryEngine/ast").requireOrDefine;
var aqueryWalker = require("./lib/ast-query");
var output = require("./lib/output");
var options = require("./lib/options")(__filename);

var args = options.parse(process.argv);
if (args.help || (!args.config && !args.file && !args._.length)) {
	console.log(options.generateHelp());
	process.exit(1);
}

if (!args.config) {
	console.error(options.generateHelpForOption("config"));
	process.exit(1);
}

if ((!args.file && !args._.length)) {
	console.error(options.generateHelpForOption("file"));
	process.exit(1);
}

var config = {};
try {
	config = require(args.config);
} catch (ex) {
	console.error("Config file does not exists.");
	throw ex;
}

var nc_module_map = config.map || {};
var nc_validators = createNcValidators(config.checkers || {});

var printer = output.tabularPrinter();
printer.header([
	"File",
	"Mid",
	"Alias"
]);

aqueryWalker(args.file || args._, function(ast) { // process AST of file
	"use strict";
	// <require|define>(   [<packages>]   ,   function(<aliases>) { ... }  )
	astQueryEngine.call(ast).forEach(function(rd) {
		var packages = astQueryEngine.args(rd).map(function(mid) {
			return {
				ast : mid,
				// ignore parameters of plugins
				name : (mid.value || "[DYNAMIC]").split('!')[0]
			};
		});
		var aliases = astQueryEngine.aliases(rd); // aliases, needs body and params
		aliases.length && (aliases = aliases[0].params); // get params of func-exp

		aliases && aliases.forEach(function(alias, index) { // process aliases
			var midName = (packages[index].name || "[DYNAMIC]").split("!")[0];
			var aliasName = alias.name;
			args.debug && console.log("[DEBUG]", "###", "..........", midName, "->", aliasName);
			if (!nc_validators.some(_checkAliasNames.bind(null, midName, aliasName))) {
				args.debug && console.log("[DEBUG]", "[FAIL] not passed by any checker");
				printer.append([
					ast.file,
					midName,
					aliasName
				]);
			}
		});
	});

	function _checkAliasNames(midName, aliasName, isByNc) {
		var result = _check(midName, aliasName, isByNc);
		if (args.debug) {
			if (result.passed) {
				console.log("[DEBUG]", "[OK] passed by", result.name);
			} else {
				console.log("[DEBUG]", "... not passed", result.name);
			}
		}
		return result.passed;
	}

	function _check(midName, aliasName, isByNc) {
		if (midName in nc_module_map) {
			var an = nc_module_map[midName];
			if (an && an instanceof Array) {
				return {
					name : midName,
					passed : ~an.indexOf(aliasName)
				};
			}
			return {
				name : an,
				passed : an === aliasName
			};
		}
		var result = isByNc(midName, midName.split("/"), aliasName);
		return {
			name : isByNc.tmpl,
			passed : result
		};
	}
});

function createNcValidators(checkers) {
	var NC_CHECKERS = [];
	checkers.regexp && checkers.regexp.forEach(function(s) {
		NC_CHECKERS.push(_regexpChecker(s.pattern, s.template));
	});
	checkers.split && checkers.split.forEach(function(s) {
		NC_CHECKERS.push(_splitChecker(s.pattern, s.callback));
	});
	return NC_CHECKERS;

	function _splitChecker(rgx, replaceCallback) {
		var checkCallback = function(midName, midParts, aliasName) {
			return midName.replace(rgx, replaceCallback) === aliasName;
		};
		checkCallback.tmpl = rgx + " -> " + replaceCallback;
		return checkCallback;
	}

	function _regexpChecker(rgx, tmpl) {
		var checkCallback = function(midName, midParts, aliasName) {
			var tmplCopy = tmpl;
			var matches = midName.match(RegExp(rgx));
			if (!matches) {
				return false;
			}
			matches.forEach(function(m, i) {
				tmplCopy = tmplCopy.replace("$" + i, matches[i]);
			});
			return tmplCopy.replace("-", "").toLowerCase() === aliasName.toLowerCase();
		};
		checkCallback.tmpl = rgx + " -> " + tmpl;
		return checkCallback;
	}
}
