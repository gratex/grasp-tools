/*jshint node:true*/
var optionator = require("optionator");
var path = require("path");
module.exports = function(filename) {
	var scriptName = path.basename(filename).split(".")[0]; // file.js -> file
	return {
		"amd-aliases" : optionator({
			prepend : "Usage: grasp-amd-aliases [option]... [file]...",
			append : [
				"Examples",
				"",
				"  # basic usage example",
				"  grasp-amd-aliases test/",
				"",
				"  # unformatting tabular format",
				"  grasp-amd-aliases test/ | sed \"s;| \\(.*\\) | \\(.*\\) |;\\1\\t\\2;\" | tail -n +3"
			].join("\n"),
			options : [
				{
					heading : "Options"
				},
				{
					option : "help",
					alias : "h",
					type : "Boolean",
					description : "Display this help and exit"
				},
				{
					option : "file",
					alias : "f",
					type : "file::String",
					description : "File or directory (for recursive searching). Everything after this option will be taken to be a file or directory.",
					restPositional : true
				}
			]
		}),
		"amd-aliases-nc" : optionator({
			prepend : "Usage: grasp-amd-aliases-nc [option]... [file]...\n\nExample: grasp-amd-aliases-nc --config ./samples/amd-aliases-nc.config.js test/",
			append : 'Version {{version}}',
			options : [
				{
					heading : "Options"
				},
				{
					option : "help",
					alias : "h",
					type : "Boolean",
					description : "Display this help and exit"
				},
				{
					option : "debug",
					type : "Boolean",
					description : "Display debug information"
				},
				{
					option : "config",
					alias : "c",
					type : "file::String",
					description : "Configuration file for naming convention checker",
					example : "grasp-amd-aliases-nc --config ./samples/amd-aliases-nc.config.js TEST_DIR/"
				},
				{
					option : "file",
					alias : "f",
					type : "file::String",
					description : "File or directory (for recursive searching)",
					restPositional : true,
					example : "grasp-amd-aliases-nc --config CONFIG_FILE test/"
				}
			]
		}),
		"amd-aliases-usage" : optionator({
			prepend : "Usage: grasp-amd-aliases-usage [option]... [file]...",
			append : [
				"Examples",
				"",
				"  # basic usage example",
				"  grasp-amd-aliases-usage test/",
				"",
				"  # output unused modules",
				"  grasp-amd-aliases-usage -u test/",
				"",
				"  # unformatting tabular format",
				"  grasp-amd-aliases-usage test/ | sed \"s;| \\(.*\\) | \\(.*\\) | \\(.*\\) |;\\1\\t\\2\\t\\3;\" | tail -n +3",
				"  grasp-amd-aliases-usage -n test/ | sed \"s;| \\(.*\\) | \\(.*\\) | \\(.*\\) | \\(.*\\) |;\\1\\t\\2\\t\\3\\t\\4;\" | tail -n +3",
				"",
				"  # count of module import globally (not per file)",
				"  grasp-amd-aliases-usage -n test/ | tail -n +3 | cut -d\"|\" -f3 | trim | cnt | clmn-swap",
				"",
				"  # count of module usage globally (not per file)",
				"  grasp-amd-aliases-usage -jn test/ | jsonRql \"aggregate(mid,sum(usedCount))\" | jsontool -d \"\\t\" -a mid 0",
				"",
				"  # comlex summary of alias names usage",
				"  grasp-amd-aliases-usage -jn test/ \\",
				"  	| jsonRql \"aggregate(mid,select(alias))&call(string:0,aggregate(alias,count()))\" \\",
				"  	| jsontool -c 'this[\"0\"].forEach(function(a){ a.label = a.alias+\"(\"+a[\"0\"]+\")\"}); return true' \\",
				"  	| jsonRql \"call(string:0,values(label))&join(string:0,%2C%20)\" \\",
				"  	| jsontool -d \"\\t\" -a mid 0 | clmn"
			].join("\n"),
			options : [
				{
					heading : "Output control"
				},
				{
					option : "json",
					alias : "j",
					type : "Boolean",
					description : "Produce JSON array with results, otherwise tabular format"
				},
				{
					option : "names",
					alias : "n",
					type : "Boolean",
					description : "Include module name for alias"
				},
				{
					heading : "Filtering"
				},
				{
					option : "grep",
					alias : "g",
					type : "String",
					description : "Search only for modules contain provided string"
				},
				{
					option : "unused",
					alias : "u",
					type : "Boolean",
					description : "Print only unused aliases"
				},
				{
					heading : "Options"
				},
				{
					option : "help",
					alias : "h",
					type : "Boolean",
					description : "Display this help and exit"
				},
				{
					option : "file",
					alias : "f",
					type : "file::String",
					description : "File or directory (for recursive searching). Everything after this option will be taken to be a file or directory.",
					restPositional : true
				}
			]
		}),
		"amd-aliases-remove-unused" : optionator({
			prepend : "Usage: grasp-amd-aliases-remove-unused [option]... [file]...\n\nExample: grasp-amd-aliases-remove-unused -i test/",
			options : [
				{
					heading : "Replacement"
				},
				{
					option : "in-place",
					alias : "i",
					type : "Boolean",
					description : "Overwrite input files with replaced output"
				},
				{
					heading : "Options"
				},
				{
					option : "help",
					alias : "h",
					type : "Boolean",
					description : "Display this help and exit"
				},
				{
					option : "file",
					alias : "f",
					type : "file::String",
					description : "File or directory (for recursive searching). Everything after this option will be taken to be a file or directory.",
					restPositional : true
				}
			]
		})
	}[scriptName];
};
