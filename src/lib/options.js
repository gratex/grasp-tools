var optionator = require("optionator");
var path = require("path");
module.exports = function(filename) {
	var scriptName = path.basename(filename).split(".")[0]; // file.js -> file
	return {
		"amd-aliases" : optionator({
			prepend : "Usage: grasp-amd-aliases [option]... [file]...\n\nExample: grasp-amd-aliases test/",
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
					description : "File or directory (for recursive searching)",
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
			prepend : "Usage: grasp-amd-aliases-usage [option]... [file]...\n\nExample: grasp-amd-aliases-usage -un test/",
			options : [
				{
					heading : "Pretty-printing"
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
					description : "File or directory (for recursive searching)",
					restPositional : true
				}
			]
		})
	}[scriptName];
};
