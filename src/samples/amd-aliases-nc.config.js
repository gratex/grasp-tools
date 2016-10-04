/*jshint node:true*/
module.exports = { // SAMPLE config
	map : { // exact names, this have highest priority
		"dojox/lang/functional" : "df"
	},
	checkers : {
		split : [
			{
				// dojo/string -> dojoString
				pattern : /\/([a-z])/g,
				callback : function(str, s) {
					return s.toUpperCase();
				}
			}
		],
		regexp : [
			{
				// dojo/aspect -> aspect
				pattern : "^(?:dojo|dijit|dojox|gjax)/([a-zA-Z]+)$",
				template : "$1"
			},
			{
				// dojo/number -> dnumber
				pattern : "^dojo/([a-z]+)$",
				template : "d$1"
			},
			{
				// dojo/_base/declare -> declare
				pattern : "^(?:dojo|dijit|dojox|gjax)/[^/]+/([a-zA-Z]+)$",
				template : "$1"
			},
			{
				// dojo/_base/lang -> dlang
				// dojo/date/stamp -> dstamp
				pattern : "^dojo/[^/]+/([a-z]+)$",
				template : "d$1"
			}
		]
	}
};